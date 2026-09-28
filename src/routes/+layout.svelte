<script>
	import { onMount, untrack } from 'svelte';
	import { page } from '$app/stores';
	import { expoOut, cubicIn } from 'svelte/easing';
	import '../app.css';
	import CustomCursor from '$lib/components/CustomCursor.svelte';
	import WabiScene from '$lib/components/WabiScene.svelte';
	import { siteConfig as defaultSettings } from '$lib/config/site.js';
	import { profile as defaultProfile } from '$lib/domain/profile.js';
	import { generatePersonJsonLd, generateWebsiteJsonLd, serializeJsonLd } from '$lib/services/seo.js';

	let { children } = $props();

	const siteConfig = $derived($page.data.settings ?? defaultSettings);
	const profile = $derived($page.data.profile ?? defaultProfile);
	const article = $derived($page.data.article);
	const pageTitle = $derived(article ? `${article.title} - ${profile.name}` : $page.data.category ? `${$page.data.category} · ${profile.name}` : $page.url.pathname === '/projects' ? `作品 · ${profile.name}` : siteConfig.title);
	const pageDescription = $derived(article?.summary || $page.data.meta?.intro || siteConfig.description);
	const canonical = $derived(new URL($page.url.pathname, siteConfig.url).href);
	const ogImage = $derived(new URL(article?.cover || siteConfig.ogImage, siteConfig.url).href);
	const personJsonLd = $derived(serializeJsonLd(generatePersonJsonLd(profile, $page.data.socialLinks, siteConfig)));
	const websiteJsonLd = $derived(serializeJsonLd(generateWebsiteJsonLd(siteConfig)));
	const isHome = $derived($page.url.pathname === '/');
	const isWorldPage = $derived(isHome || $page.url.pathname === '/projects');
	// The world lives outside the keyed page content, so route changes retain
	// its renderer, water reflection, loaded models and current camera position.
	let worldMounted = $state(untrack(() => isWorldPage));
	let worldView = $state(untrack(() => isHome ? 'home' : 'projects'));
	let heroScroll = $state(0);
	$effect(() => {
		if (isWorldPage) {
			worldMounted = true;
			worldView = isHome ? 'home' : 'projects';
		}
	});

	/* Opacity preserves fixed/sticky descendants' viewport containing block. */
	const CROSS_MS = 620;

	function prefersReducedMotion() {
		return (
			typeof window !== 'undefined' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches
		);
	}

	/** @param {HTMLElement} node */
	function pageOut(node) {
		if (prefersReducedMotion()) return { duration: 0 };
		return {
			duration: CROSS_MS,
			easing: cubicIn,
			/* t: 1 -> 0. Hold full opacity until the last quarter so the
			   old page keeps painting beneath the incoming one. */
			/** @param {number} t */
			css: (t) => `opacity: ${Math.min(1, t * 4)}; pointer-events: none;`
		};
	}

	/** @param {HTMLElement} node */
	function pageIn(node) {
		if (prefersReducedMotion()) return { duration: 0 };
		return {
			duration: CROSS_MS,
			easing: expoOut,
			/* Stacked above the outgoing page while transitioning */
			/** @param {number} t */
			css: (t) => `position: relative; z-index: 1; opacity: ${t};`
		};
	}

	onMount(() => {
		function updateViewportHeight() {
			document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
		}

		updateViewportHeight();
		window.addEventListener('resize', updateViewportHeight);

		return () => {
			window.removeEventListener('resize', updateViewportHeight);
		};
	});
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<meta name="keywords" content={siteConfig.keywords.join(', ')} />
	<meta name="author" content={siteConfig.author} />
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href={canonical} />

	<!-- Open Graph -->
	<meta property="og:type" content={article ? 'article' : 'website'} />
	<meta property="og:site_name" content={siteConfig.name} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:locale" content={siteConfig.locale} />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={pageDescription} />
	<meta name="twitter:image" content={ogImage} />

	<!-- Structured Data: Person -->
	{@html `<script type="application/ld+json">${personJsonLd}</script>`}

	<!-- Structured Data: WebSite -->
	{@html `<script type="application/ld+json">${websiteJsonLd}</script>`}
</svelte:head>

<CustomCursor />
<a class="skip-link" href="#main-content">跳至内容</a>

<div class="page-root" style:--hero-intro-opacity={Math.max(0, 1 - heroScroll * 4)} style:--hero-intro-drift={`${-heroScroll * 36}px`} style:--hero-intro-visibility={heroScroll > .24 ? 'hidden' : 'visible'}>
	<div class="page-background"></div>
	{#if worldMounted}
		<div class="world-backdrop" class:world-home={isHome} hidden={!isWorldPage}>
			<WabiScene view={worldView === 'home' ? 'home' : 'projects'} onProgress={(value) => heroScroll = value} />
		</div>
	{/if}
	{#key $page.url.pathname}
		<main id="main-content" tabindex="-1" class="page-content" in:pageIn out:pageOut>
			{@render children()}
		</main>
	{/key}
</div>

<style>
	.skip-link { position: fixed; top: var(--space-3); left: var(--grid-margin); z-index: 10000; padding: var(--space-3) var(--space-4); background: var(--color-bg); color: var(--color-text); transform: translateY(-200%); }
	.skip-link:focus { transform: none; }
	.page-root {
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		justify-content: normal;
		min-height: 100vh;
		overflow-x: clip;
	}
	.page-background {
		position: fixed;
		inset: 0;
		z-index: -1;
	}
	.world-backdrop {
		position: absolute;
		inset: 0 0 auto;
		height: 100svh;
		pointer-events: none;
	}
	/* Keep the real world pinned until the paper has covered the viewport. */
	.world-home { height: calc(var(--hero-height) + 100svh); }
	.world-home:has(:global(.scene-unavailable)) { height: 100svh; }
	.world-backdrop:not(.world-home) { position: fixed; }
	.world-backdrop[hidden] { display: none; }
	/* Outgoing and incoming pages share the same grid cell so the
	   crossfade never stacks them vertically (no layout jump). */
	.page-content {
		grid-area: 1 / 1;
		position: relative;
		min-width: 0;
		min-height: 100vh;
	}

	@media (prefers-reduced-motion: reduce) {
		.world-home { height: 100svh; }
		.page-content {
			animation: none !important;
			transition: none !important;
		}
	}
</style>
