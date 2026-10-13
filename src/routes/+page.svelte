<script>
	import Header from '$lib/components/Header.svelte';
	import HeroIntro from '$lib/components/HeroIntro.svelte';
	import AboutSection from '$lib/components/AboutSection.svelte';
	import Marquee from '$lib/components/Marquee.svelte';
	import LinksSection from '$lib/components/LinksSection.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { data } = $props();
</script>

<!--
	Unified Hero-to-About Spatial Continuum (一卷到底 · 枯山水空间手卷)
	Hero and About share a single unbroken 3D Karesansui & Mono-ha field
	([data-scene-scroll]), linked by a continuous vertical dry-ink spine.
-->
<div class="wabi-continuum" data-scene-scroll>
	<span class="continuum-spine" aria-hidden="true"></span>
	<div class="hero-stage">
		<Header />
		<HeroIntro profile={data?.profile} />
	</div>
	<div class="about-stage">
		<AboutSection {data} />
	</div>
</div>

<div class="colophon-tail">
	<Marquee />
	<LinksSection {data} />
	<div class="spacer" style="--size: 1"></div>
	<Footer />
</div>

<style>
	.wabi-continuum {
		position: relative;
		width: 100%;
		color: var(--color-text);
	}

	/* Unbroken vertical dry-ink registration axis linking Hero directly through About */
	.continuum-spine {
		position: absolute;
		top: calc(var(--header-height) + var(--space-4));
		bottom: var(--space-8);
		left: var(--grid-margin);
		width: 1px;
		background: linear-gradient(
			180deg,
			var(--color-text) 0%,
			rgba(42, 41, 36, 0.28) 18%,
			rgba(42, 41, 36, 0.18) 72%,
			rgba(233, 226, 210, 0.26) 92%,
			transparent 100%
		);
		filter: url(#wabi-rough);
		pointer-events: none;
		z-index: 2;
	}

	.hero-stage {
		position: relative;
		min-height: 100svh;
		width: 100%;
	}

	/* About emerges directly out of the lower Hero horizon without any opaque card wall */
	.about-stage {
		position: relative;
		z-index: 2;
	}

	.colophon-tail {
		position: relative;
		z-index: 2;
		background: color-mix(in srgb, var(--color-bg) 92%, transparent);
		backdrop-filter: blur(3px);
	}

	@media (max-width: 600px) {
		.continuum-spine {
			display: none;
		}
	}
</style>
