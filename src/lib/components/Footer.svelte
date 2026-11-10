<script>
	import { getLocale, translator } from '$lib/i18n';
	const locale = $derived(getLocale(page.data.locale));
	const t = $derived(translator(locale));

	import { profile as defaultProfile } from '$lib/domain/profile.js';
	import { page } from '$app/state';
	const profile = $derived(page.data.profile ?? defaultProfile);
	const year = new Date().getFullYear();
</script>

<footer class="site-footer site-shell">
	<div><p>© {year} {t(profile.name, profile.nameEn)}</p><a href="/copyright">{t('版权声明', 'Copyright')}</a></div>
</footer>

<style>
	.site-footer > div { display: flex; position: relative; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3); padding-block: var(--space-4); color: var(--color-text-muted); font: var(--text-xs)/1.6 var(--font-ui); }
	a { display: flex; align-items: center; min-height: 44px; }
</style>
