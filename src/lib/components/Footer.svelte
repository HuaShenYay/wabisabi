<script>
	import { profile as defaultProfile } from '$lib/domain/profile.js';
	import { page } from '$app/state';
	const profile = $derived(page.data.profile ?? defaultProfile);
	const year = new Date().getFullYear();
</script>

<footer class="site-footer site-shell">
	<div><span class="ink-rule" aria-hidden="true"></span><p>© {year} {profile.name}</p><a href="/copyright">版权声明</a></div>
</footer>

<style>
	.site-footer > div { display: flex; position: relative; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3); padding-block: var(--space-4); color: var(--color-text-muted); font: var(--text-xs)/1.6 var(--font-ui); }
	.ink-rule { position: absolute; top: 0; opacity: .23; }
	a { display: flex; align-items: center; min-height: 44px; }
</style>
