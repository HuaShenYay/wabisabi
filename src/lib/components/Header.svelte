<script>
	import { page } from '$app/state';

	const isHome = $derived(page.url.pathname === '/');
	const isProjects = $derived(page.url.pathname.startsWith('/projects'));
</script>

<header class="site-header">
	<nav>
		<a href="/" class="nav-link" aria-current={isHome ? 'page' : undefined} data-sveltekit-preload-data="hover">
			<span class:nav-current={isHome}>About</span>
		</a>
		<span class="nav-separator" aria-hidden="true">
			<svg width="2" height="2" viewBox="0 0 2 2" xmlns="http://www.w3.org/2000/svg">
				<circle cx="1" cy="1" r="1" fill="currentColor" />
			</svg>
		</span>
		<a href="/projects" class="nav-link" aria-current={isProjects ? 'page' : undefined} data-sveltekit-preload-data="hover">
			<span class:nav-current={isProjects}>Project</span>
		</a>
	</nav>
</header>
