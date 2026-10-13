<script lang="ts">
	import { onMount } from 'svelte';
	let ring: HTMLDivElement;
	let dot: HTMLDivElement;

	onMount(() => {
		const preference = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
		let frame = 0;
		let active = false;
		let x = 0, y = 0, ringX = 0, ringY = 0;
		function hide() {
			active = false;
			cancelAnimationFrame(frame);
			frame = 0;
			ring.classList.remove('active', 'is-hover', 'is-press');
			dot.classList.remove('active');
			document.documentElement.classList.remove('has-custom-cursor');
		}
		function animate() {
			ringX += (x - ringX) * .12;
			ringY += (y - ringY) * .12;
			ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
			frame = Math.abs(x - ringX) + Math.abs(y - ringY) > .1 ? requestAnimationFrame(animate) : 0;
		}
		function move(event: PointerEvent) {
			if (!preference.matches || event.pointerType !== 'mouse') { hide(); return; }
			x = event.clientX; y = event.clientY;
			if (!active) {
				ringX = x; ringY = y; active = true;
				ring.classList.add('active'); dot.classList.add('active');
				document.documentElement.classList.add('has-custom-cursor');
			}
			dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
			if (!frame) animate();
		}
		// v2 墨点: swell into a reading lens over anything interactive; the
		// width/height transition leaves a short 残响 (echo) when leaving.
		const interactive = 'a, button, [role="button"], summary, label, input, select, textarea';
		function over(event: PointerEvent) {
			const target = event.target instanceof Element ? event.target.closest(interactive) : null;
			ring.classList.toggle('is-hover', Boolean(target));
		}
		function press() { if (active) ring.classList.add('is-press'); }
		function release() { ring.classList.remove('is-press'); }
		document.addEventListener('pointerover', over, { passive: true });
		document.addEventListener('pointerdown', press, { passive: true });
		document.addEventListener('pointerup', release, { passive: true });
		document.addEventListener('pointermove', move, { passive: true });
		document.documentElement.addEventListener('pointerleave', hide);
		window.addEventListener('blur', hide);
		preference.addEventListener('change', hide);
		return () => {
			hide();
			document.removeEventListener('pointermove', move);
			document.removeEventListener('pointerover', over);
			document.removeEventListener('pointerdown', press);
			document.removeEventListener('pointerup', release);
			document.documentElement.removeEventListener('pointerleave', hide);
			window.removeEventListener('blur', hide);
			preference.removeEventListener('change', hide);
		};
	});
</script>

<div bind:this={ring} class="cursor-ring" aria-hidden="true"></div>
<div bind:this={dot} class="cursor-dot" aria-hidden="true"></div>
