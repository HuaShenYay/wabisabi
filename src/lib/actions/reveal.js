/**
 * Yūgen (幽玄) scroll reveal action.
 * Uses IntersectionObserver - no banned window scroll listeners.
 * Elements fade upward from a dimmed, blurred state as they enter viewport.
 * Honors prefers-reduced-motion: content is visible instantly if reduced.
 */
export function reveal(node, options = {}) {
	const {
		threshold = 0.15,
		rootMargin = '0px 0px -8% 0px',
		once = true
	} = options;

	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	if (reduce) {
		node.classList.add('reveal-visible');
		return {};
	}

	node.classList.add('reveal-hidden');

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					node.classList.remove('reveal-hidden');
					node.classList.add('reveal-visible');
					if (once) observer.unobserve(node);
				} else if (!once) {
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
