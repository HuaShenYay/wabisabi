/**
 * Magnetic hover action.
 * On pointer move within the element, the node drifts slightly toward the
 * cursor with a viscous ease, then settles back on leave. Uses direct DOM
 * writes throttled by requestAnimationFrame (no reactive state churn).
 * Disabled for touch and prefers-reduced-motion.
 *
 * @param {HTMLElement} node
 * @param {{ strength?: number, max?: number }} [options]
 */
export function magnetic(node, options = {}) {
	const { strength = 0.32, max = 12 } = options;

	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
	if (reduce || !fine) return {};

	let raf = 0;
	let tx = 0;
	let ty = 0;
	const clamp = (/** @type {number} */ v) => Math.max(-max, Math.min(max, v));

	function apply() {
		cancelAnimationFrame(raf);
		raf = requestAnimationFrame(() => {
			node.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px)`;
		});
	}

	/** @param {PointerEvent} e */
	function move(e) {
		const r = node.getBoundingClientRect();
		tx = clamp((e.clientX - (r.left + r.width / 2)) * strength);
		ty = clamp((e.clientY - (r.top + r.height / 2)) * strength);
		apply();
	}

	function enter() {
		node.style.transition = 'transform 0.4s var(--ease-organic)';
	}

	function leave() {
		tx = 0;
		ty = 0;
		cancelAnimationFrame(raf);
		node.style.transform = '';
	}

	node.addEventListener('pointerenter', enter);
	node.addEventListener('pointermove', move);
	node.addEventListener('pointerleave', leave);

	return {
		destroy() {
			cancelAnimationFrame(raf);
			node.removeEventListener('pointerenter', enter);
			node.removeEventListener('pointermove', move);
			node.removeEventListener('pointerleave', leave);
		}
	};
}
