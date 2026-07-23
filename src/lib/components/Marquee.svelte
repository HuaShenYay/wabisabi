<script>
	import { onMount } from 'svelte';

	let desktopMarquee;
	let mobileMarquee;

	onMount(() => {
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduce) return;

		function updateMarquee() {
			const scrollY = window.scrollY;
			const baseOffset = window.innerWidth * 0.06;
			const x = baseOffset - scrollY * 0.06;

			if (desktopMarquee) {
				desktopMarquee.style.transform = `translate3d(${x}px, 0, 0)`;
			}

			if (mobileMarquee) {
				mobileMarquee.style.transform = `translate3d(${x}px, 0, 0)`;
			}
		}

		let ticking = false;

		function handleScroll() {
			if (!ticking) {
				requestAnimationFrame(() => {
					updateMarquee();
					ticking = false;
				});
				ticking = true;
			}
		}

		window.addEventListener('scroll', handleScroll, { passive: true });
		updateMarquee();

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});
</script>

<section class="marquee-section mobileOnly">
	<h2>
		<span bind:this={mobileMarquee} class="marquee-wrap" style="--indent: -5em">
			<span class="marquee-text">Song Zijie</span>
		</span>
	</h2>
</section>

<section class="marquee-section desktopOnly">
	<h2>
		<span bind:this={desktopMarquee} class="marquee-wrap" style="--indent: -1em">
			<span class="marquee-text">Song Zijie</span>
		</span>
	</h2>
</section>
