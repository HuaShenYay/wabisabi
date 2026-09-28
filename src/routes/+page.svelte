<script>
	import Header from '$lib/components/Header.svelte';
	import HeroIntro from '$lib/components/HeroIntro.svelte';
	import AboutSection from '$lib/components/AboutSection.svelte';
	import Marquee from '$lib/components/Marquee.svelte';
	import LinksSection from '$lib/components/LinksSection.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { data } = $props();
</script>

<div class="hero-3d-wrapper">
	<div class="hero-editorial">
		<HeroIntro profile={data?.profile} />
	</div>
	<Header />
</div>

<div class="about-manuscript">
	<AboutSection {data} />
	<Marquee />
	<LinksSection {data} />
	<div class="spacer" style="--size: 1"></div>
	<Footer />
</div>

<style>
	.hero-3d-wrapper {
		position: relative;
		width: 100%;
		/* Keep the navigation legible without turning it into a competing UI layer. */
		color: var(--color-bg);
		height: var(--hero-height);
	}
	.hero-editorial { position: sticky; top: 0; height: 100svh; }
	.about-manuscript {
		position: relative;
		margin-top: calc(-1 * var(--hero-handoff));
		padding-top: var(--hero-handoff);
		/* A translucent paper edge borrows the live water beneath it. */
		background: linear-gradient(180deg,
			transparent 0,
			color-mix(in srgb, var(--color-bg) 8%, transparent) calc(var(--hero-handoff) * .18),
			color-mix(in srgb, var(--color-bg) 56%, transparent) calc(var(--hero-handoff) * .5),
			color-mix(in srgb, var(--color-bg) 94%, transparent) calc(var(--hero-handoff) * .82),
			var(--color-bg) var(--hero-handoff));
	}
	:global(.page-root:has(.scene-unavailable)) .hero-3d-wrapper { height: 100svh; }
	:global(.page-root:has(.scene-unavailable)) .about-manuscript { margin-top: 0; padding-top: 0; background: var(--color-bg); }
	@media (prefers-reduced-motion: reduce) {
		.hero-3d-wrapper { height: 100svh; }
		.about-manuscript { margin-top: 0; padding-top: 0; background: var(--color-bg); }
	}
</style>
