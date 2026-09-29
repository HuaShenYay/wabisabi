/**
 * Yūgen (幽玄) scroll reveal action.
 * Uses IntersectionObserver - no banned window scroll listeners.
 * Elements fade upward from a dimmed, blurred state as they enter viewport.
 * Honors prefers-reduced-motion: content is visible instantly if reduced.
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
						const el = /** @type {HTMLElement} */ (entry.target);
						el.classList.remove('reveal-hidden');
						el.classList.add('reveal-visible');
						obs.unobserve(el);
					}
				}
			},
			{ threshold, rootMargin }
		);
		sharedObservers.set(key, observer);
	}
	return observer;
}

/** @param {HTMLElement} node @param {{threshold?: number, rootMargin?: string, once?: boolean}} options */
export function reveal(node, options = {}) {
	const {
		threshold = 0,
		rootMargin = '0px 0px -8% 0px',
		once = true
	} = options;

	reducedMotionQuery ??= window.matchMedia('(prefers-reduced-motion: reduce)');

	if (reducedMotionQuery.matches) {
		node.classList.add('reveal-visible');
		return {};
	}

	node.classList.add('reveal-hidden');

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
					node.classList.remove('reveal-hidden');
					node.classList.add('reveal-visible');
				} else {
					node.classList.remove('reveal-visible');
					node.classList.add('reveal-hidden');
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
