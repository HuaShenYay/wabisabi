<script>
	import { onMount } from 'svelte';
	import '../app.css';
	import CustomCursor from '$lib/components/CustomCursor.svelte';
	import { siteConfig } from '$lib/config/site.js';
	import { generatePersonJsonLd, generateWebsiteJsonLd } from '$lib/services/seo.js';

	let { children } = $props();

	const personJsonLd = JSON.stringify(generatePersonJsonLd());
	const websiteJsonLd = JSON.stringify(generateWebsiteJsonLd());

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
	<title>{siteConfig.title}</title>
	<meta name="description" content={siteConfig.description} />
	<meta name="keywords" content={siteConfig.keywords.join(', ')} />
	<meta name="author" content={siteConfig.author} />
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href={siteConfig.url} />

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={siteConfig.name} />
	<meta property="og:title" content={siteConfig.title} />
	<meta property="og:description" content={siteConfig.description} />
	<meta property="og:url" content={siteConfig.url} />
	<meta property="og:image" content={siteConfig.url + siteConfig.ogImage} />
	<meta property="og:locale" content={siteConfig.locale} />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={siteConfig.title} />
	<meta name="twitter:description" content={siteConfig.description} />
	<meta name="twitter:image" content={siteConfig.url + siteConfig.ogImage} />

	<!-- Structured Data: Person -->
	<script type="application/ld+json">{personJsonLd}</script>

	<!-- Structured Data: WebSite -->
	<script type="application/ld+json">{websiteJsonLd}</script>
</svelte:head>

<CustomCursor />

<div class="page-root">
	<div class="page-background"></div>
	{@render children()}
</div>
