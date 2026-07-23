<script>
	import { onMount } from 'svelte';

	let ring;
	let dot;
	let mouseX = 0;
	let mouseY = 0;
	let ringX = 0;
	let ringY = 0;
	let cursorActive = false;
	let animationId;

	onMount(() => {
		// Touch devices: CSS already hides the cursor; skip global listeners.
		if (window.matchMedia('(hover: none)').matches) return {};

		function handleMouseMove(e) {
			mouseX = e.clientX;
			mouseY = e.clientY;

			if (dot) {
				dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
			}

			if (!cursorActive) {
				cursorActive = true;
				ring?.classList.add('active');
				dot?.classList.add('active');
			}
		}

		function animateRing() {
			ringX += (mouseX - ringX) * 0.12;
			ringY += (mouseY - ringY) * 0.12;

			if (ring) {
				ring.style.setProperty('--ring-x', `${ringX}px`);
				ring.style.setProperty('--ring-y', `${ringY}px`);
			}

			animationId = requestAnimationFrame(animateRing);
		}

		document.addEventListener('mousemove', handleMouseMove);
		animationId = requestAnimationFrame(animateRing);

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			cancelAnimationFrame(animationId);
		};
	});
</script>

<div bind:this={ring} class="cursor-ring" aria-hidden="true"></div>
<div bind:this={dot} class="cursor-dot" aria-hidden="true"></div>
