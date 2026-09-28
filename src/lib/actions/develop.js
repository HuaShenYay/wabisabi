/**
 * Still-Water develop action (显影).
 * The container itself never moves; its direct children surface out of fog
 * one after another with a viscous, staggered delay, like lines of ink
 * developing on wet paper. Pairs with the .is-developing / .is-developed
 * rules in app.css. Honors prefers-reduced-motion.
 *
 * @param {HTMLElement} node
 * @param {{ threshold?: number, rootMargin?: string, once?: boolean }} [options]
 */
export function develop(node, options = {}) {
	const { threshold = 0, rootMargin = '0px 0px -8% 0px', once = true } = options;

	// Seed each child with its sequence index so CSS can stagger the delay.
	Array.from(node.children).forEach((el, i) => {
		/** @type {HTMLElement} */ (el).style.setProperty('--i', String(i));
	});

	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (reduce) {
		node.classList.add('is-developed');
		return {};
	}

	node.classList.add('is-developing');

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					node.classList.add('is-developed');
					if (once) observer.unobserve(node);
				} else if (!once) {
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
