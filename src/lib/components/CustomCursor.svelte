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
			ring.classList.remove('active');
			dot.classList.remove('active');
			document.documentElement.classList.remove('has-custom-cursor');
		}
		function animate() {
			ringX += (x - ringX) * .12;
			ringY += (y - ringY) * .12;
			ring.style.setProperty('--ring-x', `${ringX}px`);
			ring.style.setProperty('--ring-y', `${ringY}px`);
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
			dot.style.transform = `translate(${x}px, ${y}px)`;
			if (!frame) animate();
		}
		document.addEventListener('pointermove', move);
		document.documentElement.addEventListener('pointerleave', hide);
		window.addEventListener('blur', hide);
		preference.addEventListener('change', hide);
		return () => {
			hide();
			document.removeEventListener('pointermove', move);
			document.documentElement.removeEventListener('pointerleave', hide);
			window.removeEventListener('blur', hide);
			preference.removeEventListener('change', hide);
		};
	});
</script>

<div bind:this={ring} class="cursor-ring" aria-hidden="true"></div>
<div bind:this={dot} class="cursor-dot" aria-hidden="true"></div>
