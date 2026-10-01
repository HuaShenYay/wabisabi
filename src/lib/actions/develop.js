/**
 * Still-Water & Showcase develop action (显影).
 * Supports both direct children and nested `[data-reveal-item]` showcase elements,
 * surfacing them with staggered timing and releasing GPU filter layers once settled.
 * Honors prefers-reduced-motion.
 */
/** @type {Map<string, IntersectionObserver>} */
const sharedObservers = new Map();
/** @type {MediaQueryList | undefined} */
let reducedMotionQuery;

/**
 * @param {number} threshold
 * @param {string} rootMargin
 */
function getSharedObserver(threshold, rootMargin) {
	const key = `${threshold}|${rootMargin}`;
	let observer = sharedObservers.get(key);
	if (!observer) {
		observer = new IntersectionObserver(
			(entries, obs) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						entry.target.classList.add('is-developed');
						obs.unobserve(entry.target);
					}
				}
			},
			{ threshold, rootMargin }
		);
		sharedObservers.set(key, observer);
	}
	return observer;
}

/**
 * @param {HTMLElement} node
 * @param {{ threshold?: number, rootMargin?: string, once?: boolean }} [options]
 */
export function develop(node, options = {}) {
	const { threshold = 0.08, rootMargin = '0px 0px -6% 0px', once = true } = options;

	const revealItems = node.querySelectorAll('[data-reveal-item]');
	const targets = revealItems.length > 0 ? Array.from(revealItems) : Array.from(node.children);

	for (let i = 0; i < targets.length; i++) {
		/** @type {HTMLElement} */ (targets[i]).style.setProperty('--i', String(i));
	}

	reducedMotionQuery ??= window.matchMedia('(prefers-reduced-motion: reduce)');
	if (reducedMotionQuery.matches) {
		node.classList.add('is-developed');
		return {};
	}

	node.classList.add('is-developing');

	if (once) {
		const observer = getSharedObserver(threshold, rootMargin);
		observer.observe(node);
		return {
			destroy() {
				observer.unobserve(node);
			}
		};
	}

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					node.classList.add('is-developed');
				} else {
					node.classList.remove('is-developed');
				}
			});
		},
		{ threshold, rootMargin }
	);

	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		}
	};
}

