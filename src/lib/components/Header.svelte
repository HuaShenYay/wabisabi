<script>
	import { page } from '$app/state';
	import { getLocale, translator, languageHref } from '$lib/i18n';
	const locale = $derived(getLocale(page.data.locale));
	const t = $derived(translator(locale));
	import { profile as defaultProfile } from '$lib/domain/profile.js';
	const profile = $derived(page.data.profile ?? defaultProfile);
	/* §21 站点名回首页，About 成为独立页面，三者各有所指。 */
	const isAbout = $derived(page.url.pathname === '/about');
	const isProjects = $derived(page.url.pathname.startsWith('/projects'));
</script>

<header class="site-header site-shell">
	<a class="site-name" href="/" aria-label={t(`${profile.name}，首页`, `${profile.nameEn}, home`)}>
		<span>{profile.name}</span><span class="name-en">{profile.nameEn}</span>
	</a>
	<div class="header-tools">
	<nav aria-label={t('主导航', 'Main navigation')}>
		<a class="nav-link" href="/projects" aria-current={isProjects ? 'page' : undefined} data-sveltekit-preload-data="hover">Project</a>
		<a class="nav-link" href="/about" aria-current={isAbout ? 'page' : undefined} data-sveltekit-preload-data="hover">About</a>
	</nav>
	<div class="language-switch" role="group" aria-label="语言 / Language">
		<a class="language-link" href={languageHref(page.url, 'zh')} lang="zh-CN" aria-label="切换为中文" title="中文" aria-current={locale === 'zh' ? 'true' : undefined} data-sveltekit-reload><span aria-hidden="true">🇨🇳</span></a>
		<a class="language-link" href={languageHref(page.url, 'en')} lang="en" aria-label="Switch to English" title="English" aria-current={locale === 'en' ? 'true' : undefined} data-sveltekit-reload><span aria-hidden="true">🇬🇧</span></a>
	</div>
	</div>
</header>

<style>
	.site-header { display: flex; justify-content: space-between; align-items: center; gap: var(--space-4); min-height: var(--header-height); }
	.site-name { display: flex; align-items: baseline; gap: var(--space-3); min-height: 44px; padding-block: var(--space-3); font: var(--text-lg)/1.3 var(--font-heading); }
	.name-en { font: italic var(--text-sm)/1.3 var(--font-display-latin); color: var(--color-text-muted); }
	:global(html:lang(en)) .site-name > span:first-child { font-family: var(--font-heading-reading); }
	.header-tools { display: flex; align-items: center; gap: var(--space-5); }
	.language-switch { display: flex; align-items: center; }
	.language-link { position: relative; display: inline-flex; align-items: center; justify-content: center; width: var(--touch-target); height: var(--touch-target); font: var(--text-lg)/1 var(--font-ui); }
	.language-link::after { content: ''; position: absolute; bottom: var(--space-1); width: var(--space-4); height: 1px; background: currentColor; opacity: 0; transition: opacity var(--duration-base) var(--ease-organic); }
	.language-link[aria-current]::after, .language-link:is(:hover, :focus-visible)::after { opacity: .65; }
	nav { display: flex; align-items: center; gap: var(--space-5); font: var(--text-sm)/1.4 var(--font-machine); letter-spacing: .03em; }
	.nav-link { display: flex; align-items: center; position: relative; min-height: 44px; }
	.nav-link::after { content: ''; position: absolute; inset: auto 0 var(--space-1); height: 1px; background: currentColor; opacity: 0; transition: opacity var(--duration-base) var(--ease-organic); }
	.nav-link[aria-current='page']::after, .nav-link:is(:hover, :focus-visible)::after { opacity: .65; }
	@media (max-width: 600px) { .name-en { display: none; } .site-header, .header-tools, nav { gap: var(--space-2); } }
</style>
