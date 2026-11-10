<script>
	import { page } from '$app/state';
	import { getLocale, translator, categoryLabel } from '$lib/i18n';
	const locale = $derived(getLocale(page.data.locale));
	const t = $derived(translator(locale));
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { siteConfig as defaultSettings } from '$lib/config/site.js';
	import { profile as defaultProfile } from '$lib/domain/profile.js';
	import { generatePersonJsonLd, generateWebsiteJsonLd, serializeJsonLd } from '$lib/services/seo.js';
	let { children } = $props();

	const siteConfig = $derived(page.data.settings ?? defaultSettings);
	const profile = $derived(page.data.profile ?? defaultProfile);
	const article = $derived(page.data.article);
	const displayName = $derived(t(profile.name, profile.nameEn));
	const pageTitle = $derived(article ? `${article.title} - ${displayName}` : page.data.category ? `${categoryLabel(locale, page.data.category)} · ${displayName}` : page.url.pathname === '/projects' ? `${t('作品', 'Works')} · ${displayName}` : page.url.pathname === '/about' ? `${t('关于', 'About')} · ${displayName}` : siteConfig.title);
	const pageDescription = $derived(article?.summary || t(page.data.meta?.intro ?? '', page.data.meta?.introEn ?? '') || (page.url.pathname === '/about' ? profile.bio : '') || siteConfig.description);
	const canonical = $derived(new URL(page.url.pathname, siteConfig.url).href);
	const ogImage = $derived(new URL(article?.cover || siteConfig.ogImage, siteConfig.url).href);
	const personJsonLd = $derived(serializeJsonLd(generatePersonJsonLd(profile, page.data.socialLinks, siteConfig, displayName)));
	const websiteJsonLd = $derived(serializeJsonLd(generateWebsiteJsonLd(siteConfig)));
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<meta name="keywords" content={siteConfig.keywords.join(', ')} />
	<meta name="author" content={siteConfig.author} />
	<meta name="robots" content="index, follow" />
	<link rel="manifest" href={t('/manifest.json', '/manifest.en.json')} />
	<link rel="canonical" href={canonical} />

	<!-- Open Graph -->
	<meta property="og:type" content={article ? 'article' : 'website'} />
	<meta property="og:site_name" content={siteConfig.name} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:locale" content={t('zh_CN', 'en_GB')} />

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

<!-- Global SVG Filter Bank: Woodblock erosion, dry-brush飛白 (feibai), and torn ink edges -->
<svg class="wabi-svg-filters" width="0" height="0" aria-hidden="true" focusable="false">
	<defs>
		<!-- Subtle rough ink edge for headings, rules, and seals -->
		<filter id="wabi-rough" x="-5%" y="-5%" width="110%" height="110%">
			<feTurbulence type="fractalNoise" baseFrequency="0.04 0.12" numOctaves="2" seed="11" result="warp" />
			<feDisplacementMap in="SourceGraphic" in2="warp" scale="2.4" xChannelSelector="R" yChannelSelector="G" />
		</filter>
		<!-- Heavy woodblock / stone-rubbing erosion strictly masked to glyph alpha (zero halo) -->
		<filter id="wabi-erosion" x="-10%" y="-10%" width="120%" height="120%">
			<feTurbulence type="turbulence" baseFrequency="0.028 0.08" numOctaves="3" seed="23" result="disp" />
			<feDisplacementMap in="SourceGraphic" in2="disp" scale="3.8" xChannelSelector="R" yChannelSelector="G" result="warped" />
		</filter>
	</defs>
</svg>

<a class="skip-link" href="#main-content">{t('跳至内容', 'Skip to content')}</a>
<div class="page-root">
	<Header />
	<main id="main-content" tabindex="-1">{@render children()}</main>
	<Footer />
</div>

<style>
	.wabi-svg-filters { position: absolute; width: 0; height: 0; overflow: hidden; pointer-events: none; }
	.page-root { min-height: 100svh; display: flex; flex-direction: column; }
	main { flex: 1; min-width: 0; }
	.skip-link { position: fixed; top: var(--space-3); left: var(--space-4); z-index: 100; padding: var(--space-3); background: var(--color-bg); transform: translateY(-200%); }
	.skip-link:focus { transform: none; }
</style>
