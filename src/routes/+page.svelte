<script>
	import Header from '$lib/components/Header.svelte';
	import WabiScene from '$lib/components/WabiScene.svelte';
	import AboutSection from '$lib/components/AboutSection.svelte';
	import Marquee from '$lib/components/Marquee.svelte';
	import LinksSection from '$lib/components/LinksSection.svelte';
	import Footer from '$lib/components/Footer.svelte';
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
	}
</style>
