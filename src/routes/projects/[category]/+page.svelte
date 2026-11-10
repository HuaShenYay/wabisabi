<script>
	import { page } from '$app/state';
	import { getLocale, translator, categoryLabel } from '$lib/i18n';
	const locale = $derived(getLocale(page.data.locale));
	const t = $derived(translator(locale));

	import Artwork from '$lib/components/Artwork.svelte';
	import { categoryOrder, categoryMeta } from '$lib/domain/projects.js';
	let { data } = $props();
	const meta = $derived(data.meta);
	const items = $derived(data.items);
</script>

<div class="volume-page site-shell">
	<header class="volume-heading">
		<a class="back-link" href="/projects">← {t('全部作品', 'All works')}</a>
		<h1 id="volume-heading" class="woodblock-art">{categoryLabel(locale, data.category)}</h1>
		<p class="volume-en"><span>{t(`${items.length} 件`, `${items.length} ${items.length === 1 ? 'work' : 'works'}`)}</span></p>
		<p class="volume-intro">{t(meta.intro, meta.introEn)}</p>
	</header>
	<nav class="volume-switcher" aria-label={t('切换作品分类', 'Work categories')}>
		{#each categoryOrder as category}
			<a href="/projects/{categoryMeta[category].slug}" aria-current={category === data.category ? 'page' : undefined} data-sveltekit-preload-data="hover">{categoryLabel(locale, category)}</a>
		{/each}
	</nav>
	<section class="vol-content" aria-label={categoryLabel(locale, data.category)}>
		{#if items.length === 0}
			<div class="volume-empty ink-frame"><h2>{t('此卷尚待落笔。', 'A page yet to be written.')}</h2><p>{t('内容正在整理中。', 'New work is on its way.')}</p><a class="link-underline" href="/projects">{t('展阅其他作品', 'Explore other works')}</a></div>
		{:else if meta.layout === 'catalog'}
			<ol class="catalog-list">
				{#each items as p (p.slug)}
					<li class="catalog-row">
						<span class="ink-rule" aria-hidden="true"></span>
						<a class="catalog-link" href="/projects/{meta.slug}/{p.slug}">
							<div class="catalog-main"><h2>{p.title}</h2><p class="work-summary">{p.summary}</p></div>
							<span class="catalog-year">{p.year}</span><span class="work-arrow" aria-hidden="true">↗</span>
						</a>
					</li>
				{/each}
			</ol>
		{:else}
			<div class="work-grid">
				{#each items as p, i (p.slug)}
					<article class="work-card">
						<a href="/projects/{meta.slug}/{p.slug}">
							{#if p.cover}<div class="work-image ink-frame"><Artwork src={p.cover} alt={p.title} aspect={p.aspect} eager={i < 2} /></div>{/if}
							<div class="work-caption"><h2>{p.title}</h2><span class="catalog-year">{p.year}</span></div>
							<p class="work-summary">{p.summary}</p>
						</a>
						{#if p.externalUrl}<a class="external-link link-underline" href={p.externalUrl} target="_blank" rel="noopener noreferrer">{t('访问网站', 'Visit website')} ↗</a>{/if}
					</article>
				{/each}
			</div>
		{/if}
	</section>
	<nav class="vol-nav" aria-label={t('分卷导航', 'Category navigation')}>
		<span class="ink-rule" aria-hidden="true"></span>
		{#if data.prev}<a href="/projects/{data.prev.slug}">← {categoryLabel(locale, data.prev.title)}</a>{:else}<span></span>{/if}
		<a href="/projects">{t('全卷目录', 'All works')}</a>
		{#if data.next}<a href="/projects/{data.next.slug}">{categoryLabel(locale, data.next.title)} →</a>{:else}<span></span>{/if}
	</nav>
</div>

<style>
	.volume-page { padding-block: var(--space-6) var(--space-8); }
	.back-link { display: inline-flex; align-items: center; min-height: 44px; color: var(--color-text-muted); font-size: var(--text-xs); margin-bottom: var(--space-5); }
	h1 { font: clamp(2.2rem, 4.2vw, 3.4rem)/1.5 var(--font-heading); letter-spacing: .1em; padding-left: clamp(0px, 1.4vw, 18px); }
	.volume-en { display: flex; flex-wrap: wrap; align-items: baseline; gap: var(--space-2) var(--space-4); margin-top: var(--space-2); padding-left: clamp(0px, 1.4vw, 18px); font: italic var(--text-xl)/1.6 var(--font-display-latin); color: var(--color-text-muted); }
	.volume-en span { font: var(--text-xs)/1.5 var(--font-body); color: var(--color-text-muted); white-space: nowrap; font-variant-numeric: tabular-nums; }
	.volume-intro { max-width: 34em; margin-top: var(--space-4); font-size: var(--text-sm); line-height: 1.9; color: var(--color-text-muted); text-wrap: pretty; }
	.volume-switcher { display: flex; flex-wrap: wrap; gap: var(--space-2) var(--space-5); margin-block: var(--space-6) var(--space-5); }
	.volume-switcher a { min-height: 44px; display: flex; align-items: center; position: relative; font-size: var(--text-sm); color: var(--color-text-muted); }
	.volume-switcher a[aria-current='page'] { color: var(--color-text); }
	.volume-switcher a::after { content: ''; position: absolute; inset: auto 0 var(--space-1); height: 1px; background: currentColor; opacity: 0; transition: opacity var(--duration-base) var(--ease-organic); }
	.volume-switcher a:is(:hover, :focus-visible) { color: var(--color-link-hover); }
	.volume-switcher a[aria-current='page']::after, .volume-switcher a:is(:hover, :focus-visible)::after { opacity: .65; }
	.catalog-row { position: relative; }
	.catalog-row > .ink-rule { position: absolute; top: 0; left: 0; }
	.catalog-link { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; align-items: start; gap: var(--space-5); }
	/* 目录行距按三拍交替，墨线长短与形态逐行变化。 */
	.catalog-row:nth-child(3n+1) .catalog-link { padding-block: calc(var(--space-5) + 6px) var(--space-5); }
	.catalog-row:nth-child(3n+2) .catalog-link { padding-block: var(--space-5) calc(var(--space-5) + 12px); }
	.catalog-row:nth-child(3n) .catalog-link { padding-block: calc(var(--space-5) + 10px) calc(var(--space-5) + 4px); }
	.catalog-row:nth-child(3n+1) > .ink-rule { width: 78%; }
	.catalog-row:nth-child(3n+2) > .ink-rule { width: 94%; left: 6%; opacity: .5; }
	.catalog-row:nth-child(3n) > .ink-rule { width: 64%; left: 2%; opacity: .44; }
	/* §19.7 断口按行号严格交替：5 / 1 / 4 / 1 / 5 / 1 …，与长度的三拍节奏互不干扰。
	   末行阵营决定 vol-nav 线（见 app.css 的 :has 兜底），内容增减时规则仍成立。 */
	.catalog-row:nth-child(odd) > .ink-rule { background-image: var(--rule-dense-a); }
	.catalog-row:nth-child(even) > .ink-rule { background-image: var(--rule-sparse-a); }
	.catalog-row:nth-child(4n+3) > .ink-rule { background-image: var(--rule-dense-b); }
	.catalog-row:nth-child(4n+4) > .ink-rule { background-image: var(--rule-sparse-b); }
	.catalog-row:nth-child(even) .catalog-main { padding-left: clamp(0px, 1.6vw, 22px); }
	h2 { font: var(--text-xl)/1.6 var(--font-heading); overflow-wrap: anywhere; }
	.work-summary { max-width: 40em; margin-top: var(--space-3); font-size: var(--text-sm); line-height: 1.9; color: var(--color-text-muted); overflow-wrap: anywhere; }
	.catalog-year { font-size: var(--text-xs); color: var(--color-text-muted); white-space: nowrap; padding-top: var(--space-2); font-variant-numeric: tabular-nums; }
	.work-arrow { padding-top: var(--space-2); color: var(--color-text-muted); transition: color var(--duration-base) var(--ease-organic); }
	.catalog-link:is(:hover, :focus-visible) .work-arrow { color: var(--color-link-hover); }
	.work-grid { display: grid; grid-template-columns: 1.08fr .92fr; gap: var(--space-6) var(--space-5); padding-top: var(--space-3); }
	.work-card { min-width: 0; }
	.work-card:nth-child(even) { margin-top: var(--space-6); }
	.work-image { padding: var(--space-3); margin-bottom: var(--space-4); }
	.work-caption { display: flex; justify-content: space-between; gap: var(--space-3); }
	.external-link { display: inline-flex; align-items: center; min-height: var(--touch-target); margin-top: var(--space-3); font-size: var(--text-xs); }
	.volume-empty { padding: var(--space-6); margin-top: var(--space-3); }
	.volume-empty p { margin-block: var(--space-3) var(--space-5); color: var(--color-text-muted); }
	.volume-empty a { display: inline-flex; align-items: center; min-height: 44px; font-size: var(--text-sm); }
	.vol-nav { position: relative; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: var(--space-4); margin-top: var(--space-7); padding-top: var(--space-4); }
	.vol-nav > .ink-rule { position: absolute; top: 0; left: 0; width: 68%; opacity: .38; }
	.vol-nav a { display: inline-flex; align-items: center; min-height: 44px; font-size: var(--text-sm); }
	.vol-nav a:last-child { justify-self: end; text-align: right; }
	@media (max-width: 600px) {
		.volume-page { padding-block: var(--space-4) var(--space-7); }
		h1, .volume-en { padding-left: 0; }
		.volume-switcher { gap: var(--space-1) var(--space-4); margin-top: var(--space-5); }
		.catalog-link { grid-template-columns: minmax(0, 1fr) auto; gap: var(--space-3); padding-block: var(--space-4); }
		.catalog-row > .ink-rule { width: 78%; left: 0; }
		.catalog-row:nth-child(even) .catalog-main { padding-left: 0; }
		.work-arrow { display: none; }
		.work-grid { grid-template-columns: 1fr; gap: var(--space-6); }
		.work-card:nth-child(even) { margin-top: 0; }
		.volume-empty { padding: var(--space-5); }
		.vol-nav { grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-top: var(--space-6); }
		.vol-nav > a[href='/projects'] { grid-column: 1 / -1; grid-row: 2; justify-self: center; }
	}
</style>
