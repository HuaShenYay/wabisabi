/**
 * Still-Water develop action (显影).
 * The container itself never moves; its direct children surface out of fog
 * one after another with a viscous, staggered delay, like lines of ink
 * developing on wet paper. Pairs with the .is-developing / .is-developed
 * rules in app.css. Honors prefers-reduced-motion.
 *
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
	const { threshold = 0, rootMargin = '0px 0px -8% 0px', once = true } = options;

	// Seed each child with its sequence index so CSS can stagger the delay.
	const children = node.children;
	for (let i = 0; i < children.length; i++) {
		/** @type {HTMLElement} */ (children[i]).style.setProperty('--i', String(i));
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
