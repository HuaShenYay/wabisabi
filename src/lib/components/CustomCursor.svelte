<script lang="ts">
	import { onMount } from 'svelte';
	let ring: HTMLDivElement;
	let dot: HTMLDivElement;

	onMount(() => {
		const preference = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
		let frame = 0;
		let active = false;
		let x = 0, y = 0, ringX = 0, ringY = 0;
		let lastTime = 0;
		function hide() {
			active = false;
			cancelAnimationFrame(frame);
			frame = 0;
			ring.classList.remove('active', 'is-hover', 'is-press');
			dot.classList.remove('active');
			document.documentElement.classList.remove('has-custom-cursor');
		}
		function animate(time: number) {
			const elapsed = lastTime ? Math.min(64, time - lastTime) : 16.67;
			lastTime = time;
			// The same ink lag at 60/120Hz, with one pointer write per frame.
			const follow = 1 - Math.pow(.88, elapsed / 16.67);
			ringX += (x - ringX) * follow;
			ringY += (y - ringY) * follow;
			dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
			ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
			frame = Math.abs(x - ringX) + Math.abs(y - ringY) > .1 ? requestAnimationFrame(animate) : 0;
		}
		function move(event: PointerEvent) {
			if (!preference.matches || event.pointerType !== 'mouse' || document.hidden) { hide(); return; }
			x = event.clientX; y = event.clientY;
			if (!active) {
				ringX = x; ringY = y; active = true; lastTime = 0;
				ring.classList.add('active'); dot.classList.add('active');
				document.documentElement.classList.add('has-custom-cursor');
			}
			if (!frame) { lastTime = 0; frame = requestAnimationFrame(animate); }
		}
		// Scale the ink lens, keeping its 残响 without animating layout dimensions.
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
		document.addEventListener('visibilitychange', hide);
		preference.addEventListener('change', hide);
		return () => {
			hide();
			document.removeEventListener('pointermove', move);
			document.removeEventListener('pointerover', over);
			document.removeEventListener('pointerdown', press);
			document.removeEventListener('pointerup', release);
			document.documentElement.removeEventListener('pointerleave', hide);
			window.removeEventListener('blur', hide);
			document.removeEventListener('visibilitychange', hide);
			preference.removeEventListener('change', hide);
		};
	});
</script>

<div bind:this={ring} class="cursor-ring" aria-hidden="true"></div>
<div bind:this={dot} class="cursor-dot" aria-hidden="true"></div>
