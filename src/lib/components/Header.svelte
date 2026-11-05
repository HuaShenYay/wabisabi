<script>
	import { page } from '$app/state';
	import { profile as defaultProfile } from '$lib/domain/profile.js';
	const profile = $derived(page.data.profile ?? defaultProfile);
	const isHome = $derived(page.url.pathname === '/');
	const isProjects = $derived(page.url.pathname.startsWith('/projects'));
</script>

<header class="site-header site-shell">
	<a class="site-name" href="/" aria-label={`${profile.name}，首页`}>
		<span>{profile.name}</span><span class="name-en">{profile.nameEn}</span>
	</a>
	<nav aria-label="主导航">
		<a class="nav-link" href="/" aria-current={isHome ? 'page' : undefined} data-sveltekit-preload-data="hover">About</a>
		<a class="nav-link" href="/projects" aria-current={isProjects ? 'page' : undefined} data-sveltekit-preload-data="hover">Project</a>
	</nav>
</header>

<style>
	.site-header { display: flex; justify-content: space-between; align-items: center; gap: var(--space-4); min-height: var(--header-height); }
	.site-name { display: flex; align-items: baseline; gap: var(--space-3); min-height: 44px; padding-block: var(--space-3); font: var(--text-lg)/1.3 var(--font-heading); }
	.name-en { font: italic var(--text-sm)/1.3 var(--font-display-latin); color: var(--color-text-muted); }
	nav { display: flex; align-items: center; gap: var(--space-5); font: var(--text-sm)/1.4 var(--font-machine); letter-spacing: .03em; }
	.nav-link { display: flex; align-items: center; position: relative; min-height: 44px; }
	.nav-link::after { content: ''; position: absolute; inset: auto 0 5px; height: 1px; background: currentColor; opacity: 0; transition: opacity 180ms ease; }
	.nav-link[aria-current='page']::after, .nav-link:hover::after { opacity: .55; }
	@media (max-width: 600px) { .name-en { display: none; } nav { gap: var(--space-4); } }
</style>
