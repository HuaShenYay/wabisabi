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
	/** @type {HTMLDetailsElement | undefined} */
	let languageMenu;
</script>

<svelte:window
	onclick={(event) => {
		if (languageMenu?.open && event.target instanceof Node && !languageMenu.contains(event.target)) languageMenu.open = false;
	}}
	onkeydown={(event) => {
		if (event.key === 'Escape' && languageMenu?.open) {
			languageMenu.open = false;
			languageMenu.querySelector('summary')?.focus();
		}
	}}
/>

<header class="site-header site-shell">
	<a class="site-name" href="/" aria-label={t(`${profile.name}，首页`, `${profile.nameEn}, home`)}>
		<span>{profile.name}</span><span class="name-en">{profile.nameEn}</span>
	</a>
	<div class="header-tools">
	<nav aria-label={t('主导航', 'Main navigation')}>
		<a class="nav-link" href="/projects" aria-current={isProjects ? 'page' : undefined} data-sveltekit-preload-data="hover">Project</a>
		<a class="nav-link" href="/about" aria-current={isAbout ? 'page' : undefined} data-sveltekit-preload-data="hover">About</a>
	</nav>
	<details class="language-switch" bind:this={languageMenu}>
		<summary aria-label={t('选择语言，当前中文', 'Choose language, currently English')}><span aria-hidden="true">{locale === 'zh' ? '🇨🇳' : '🇬🇧'}</span><span class="language-chevron" aria-hidden="true"></span></summary>
		<div class="language-menu" role="group" aria-label="语言 / Language">
			<a class="language-link" href={languageHref(page.url, 'zh')} lang="zh-CN" aria-label="切换为中文" aria-current={locale === 'zh' ? 'true' : undefined} data-sveltekit-reload><span aria-hidden="true">🇨🇳</span><span>中文</span></a>
			<a class="language-link" href={languageHref(page.url, 'en')} lang="en" aria-label="Switch to English" aria-current={locale === 'en' ? 'true' : undefined} data-sveltekit-reload><span aria-hidden="true">🇬🇧</span><span>English</span></a>
		</div>
	</details>
	</div>
</header>

<style>
	.site-header { display: flex; justify-content: space-between; align-items: center; gap: var(--space-4); min-height: var(--header-height); }
	.site-name { display: flex; align-items: baseline; gap: var(--space-3); min-height: 44px; padding-block: var(--space-3); font: var(--text-lg)/1.3 var(--font-heading); }
	.name-en { font: italic var(--text-sm)/1.3 var(--font-display-latin); color: var(--color-text-muted); }
	:global(html:lang(en)) .site-name > span:first-child { font-family: var(--font-heading-reading); }
	.header-tools { display: flex; align-items: center; gap: var(--space-5); }
	.language-switch { position: relative; }
	summary { display: flex; align-items: center; justify-content: center; gap: 7px; min-width: var(--touch-target); min-height: var(--touch-target); cursor: pointer; list-style: none; font: var(--text-lg)/1 var(--font-ui); }
	summary::-webkit-details-marker { display: none; }
	.language-chevron { width: 6px; height: 6px; border-right: 1px solid currentColor; border-bottom: 1px solid currentColor; transform: translateY(-2px) rotate(45deg); opacity: .55; transition: transform var(--duration-base) var(--ease-organic); }
	[open] .language-chevron { transform: translateY(1px) rotate(225deg); }
	.language-menu { position: absolute; z-index: 5; top: calc(100% + 4px); right: 0; min-width: 132px; padding: 5px; background: var(--color-bg); border: 1px solid var(--color-border); box-shadow: 0 8px 24px rgba(80, 68, 50, .1); }
	.language-link { display: flex; align-items: center; gap: 10px; min-height: var(--touch-target); padding: 0 10px; white-space: nowrap; font: var(--text-sm)/1.4 var(--font-ui); }
	.language-link span:first-child { font-size: var(--text-lg); }
	.language-link[aria-current], .language-link:is(:hover, :focus-visible) { background: rgba(118, 100, 72, .08); }
	nav { display: flex; align-items: center; gap: var(--space-5); font: var(--text-sm)/1.4 var(--font-machine); letter-spacing: .03em; }
	.nav-link { display: flex; align-items: center; position: relative; min-height: 44px; }
	.nav-link::after { content: ''; position: absolute; inset: auto 0 var(--space-1); height: 1px; background: currentColor; opacity: 0; transition: opacity var(--duration-base) var(--ease-organic); }
	.nav-link[aria-current='page']::after, .nav-link:is(:hover, :focus-visible)::after { opacity: .65; }
	@media (max-width: 600px) { .name-en { display: none; } .site-header, .header-tools, nav { gap: var(--space-2); } }
</style>
