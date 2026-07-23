<script>
	import { onMount } from 'svelte';
	import Header from '$lib/components/Header.svelte';
	import WabiScene from '$lib/components/WabiScene.svelte';
	import AboutSection from '$lib/components/AboutSection.svelte';
	import Marquee from '$lib/components/Marquee.svelte';
	import LinksSection from '$lib/components/LinksSection.svelte';
	import Footer from '$lib/components/Footer.svelte';

	// Fukinsei: each content block drifts to a random horizontal position per session.
	// Label + paired list share the same offset so a block stays internally coherent.
	// Range is bounded to keep content within the viewport edges.
	onMount(() => {
		const drift = () => `${(Math.random() * 16 - 8).toFixed(2)}vw`;
		document.querySelectorAll('section.grid-section').forEach((section) => {
			const intro = section.querySelector('.section-paragraph.intro');
			if (intro) intro.style.setProperty('--offset-x', drift());

			const labels = section.querySelectorAll('.section-label:not(.intro)');
			const lists = section.querySelectorAll('.section-list');
			labels.forEach((label, i) => {
				const v = drift();
				label.style.setProperty('--offset-x', v);
				if (lists[i]) lists[i].style.setProperty('--offset-x', v);
			});
		});
	});
</script>

<div class="hero-3d-wrapper">
	<WabiScene />
	<Header />
</div>

<div class="spacer" style="--size: 1"></div>

<AboutSection />

<div class="spacer" style="--size: 0.5"></div>

<Marquee />

<div class="spacer" style="--size: 1"></div>

<LinksSection />

<div class="spacer" style="--size: 0.5"></div>

<Footer />

<style>
	.hero-3d-wrapper {
		position: relative;
		width: 100%;
		/* Keep the navigation legible without turning it into a competing UI layer. */
		color: rgba(255, 237, 202, 0.86);
		text-shadow: 0 1px 12px rgba(29, 27, 20, 0.42);
	}
</style>
