<script>
	import { page } from '$app/state';

	const isHome = $derived(page.url.pathname === '/');
</script>

<header class="site-header">
	<nav>
		<a href="/" class="nav-link" aria-current={isHome ? 'page' : undefined}>
			<span class:nav-current={isHome}>About</span>
		</a>
		<span class="nav-separator" aria-hidden="true">
			<svg width="2" height="2" viewBox="0 0 2 2" xmlns="http://www.w3.org/2000/svg">
				<circle cx="1" cy="1" r="1" fill="currentColor" />
			</svg>
		</span>
		<a href="/#links" class="nav-link">Project</a>
	</nav>
</header>
