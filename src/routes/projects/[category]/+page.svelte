<script>
	import Artwork from '$lib/components/Artwork.svelte';
	import { categoryOrder, categoryMeta } from '$lib/domain/projects.js';
	let { data } = $props();
	const meta = $derived(data.meta);
	const items = $derived(data.items);
</script>

<div class="volume-page site-shell">
	<header class="volume-heading">
		<a class="back-link" href="/projects">← 全部作品</a>
		<h1 id="volume-heading" class="woodblock-art">{data.category}</h1>
		<p class="volume-en">{meta.en}<span>{items.length} 件</span></p>
		<p class="volume-intro">{meta.intro}</p>
	</header>
	<nav class="volume-switcher" aria-label="切换作品分类">
		{#each categoryOrder as category}
			<a href="/projects/{categoryMeta[category].slug}" aria-current={category === data.category ? 'page' : undefined} data-sveltekit-preload-data="hover">{category}</a>
		{/each}
	</nav>
	<section class="vol-content" aria-label="{data.category}作品">
		{#if items.length === 0}
			<div class="volume-empty ink-frame"><h2>此卷尚待落笔。</h2><p>内容正在整理中。</p><a class="link-underline" href="/projects">展阅其他作品</a></div>
		{:else if meta.layout === 'catalog'}
			<ol class="catalog-list">
				{#each items as p (p.slug)}
					<li class="catalog-row">
						<span class="ink-rule" aria-hidden="true"></span>
						<a class="catalog-link" href="/projects/{meta.slug}/{p.slug}">
							<div class="catalog-main"><h2>{p.title}</h2>{#if p.titleEn}<p class="title-en">{p.titleEn}</p>{/if}<p class="work-summary">{p.summary}</p></div>
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
							{#if p.titleEn}<p class="title-en">{p.titleEn}</p>{/if}<p class="work-summary">{p.summary}</p>
						</a>
						{#if p.externalUrl}<a class="external-link link-underline" href={p.externalUrl} target="_blank" rel="noopener noreferrer">访问网站 ↗</a>{/if}
					</article>
				{/each}
			</div>
		{/if}
	</section>
	<nav class="vol-nav" aria-label="分卷导航">
		<span class="ink-rule" aria-hidden="true"></span>
		{#if data.prev}<a href="/projects/{data.prev.slug}">← {data.prev.title}</a>{:else}<span></span>{/if}
		<a href="/projects">全卷目录</a>
		{#if data.next}<a href="/projects/{data.next.slug}">{data.next.title} →</a>{:else}<span></span>{/if}
	</nav>
</div>

<style>
	.volume-page { padding-block: var(--space-6) var(--space-7); }
	.back-link { display: inline-flex; align-items: center; min-height: 44px; color: var(--color-text-muted); font-size: var(--text-xs); margin-bottom: var(--space-5); }
	h1 { font: clamp(2.2rem, 4.2vw, 3.4rem)/1.5 var(--font-heading); letter-spacing: .1em; }
	.volume-en { display: flex; align-items: baseline; gap: var(--space-4); margin-top: var(--space-2); font: italic var(--text-xl)/1.6 var(--font-display-latin); color: var(--color-text-muted); }
	.volume-en span { font: var(--text-xs)/1.5 var(--font-body); }
	.volume-intro { max-width: 34em; margin-top: var(--space-4); font-size: var(--text-sm); line-height: 1.9; color: var(--color-text-muted); }
	.volume-switcher { display: flex; flex-wrap: wrap; gap: var(--space-2) var(--space-5); margin-block: var(--space-6) var(--space-5); }
	.volume-switcher a { min-height: 44px; display: flex; align-items: center; position: relative; font-size: var(--text-sm); color: var(--color-text-muted); }
	.volume-switcher a[aria-current='page'] { color: var(--color-text); }
	.volume-switcher a[aria-current='page']::after { content: ''; position: absolute; inset: auto 0 5px; height: 1px; background: currentColor; opacity: .5; }
	.catalog-row { position: relative; }
	.catalog-row > .ink-rule { position: absolute; top: 0; }
	.catalog-link { display: grid; grid-template-columns: 1fr auto auto; align-items: start; gap: var(--space-5); padding-block: var(--space-5); }
	h2 { font: var(--text-xl)/1.6 var(--font-heading); overflow-wrap: anywhere; }
	.title-en { margin-top: var(--space-1); font: italic var(--text-base)/1.6 var(--font-display-latin); color: var(--color-text-muted); }
	.work-summary { max-width: 40em; margin-top: var(--space-3); font-size: var(--text-sm); line-height: 1.9; color: var(--color-text-muted); overflow-wrap: anywhere; }
	.catalog-year { font-size: var(--text-xs); color: var(--color-text-muted); white-space: nowrap; padding-top: var(--space-2); }
	.work-arrow { padding-top: var(--space-2); color: var(--color-text-muted); }
	.work-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-6) var(--space-5); padding-top: var(--space-3); }
	.work-card { min-width: 0; }
	.work-image { padding: var(--space-3); margin-bottom: var(--space-4); }
	.work-caption { display: flex; justify-content: space-between; gap: var(--space-3); }
	.external-link { display: inline-block; margin-top: var(--space-3); font-size: var(--text-xs); }
	.volume-empty { padding: var(--space-6); margin-top: var(--space-3); }
	.volume-empty p { margin-block: var(--space-3) var(--space-5); color: var(--color-text-muted); }
	.volume-empty a { display: inline-flex; align-items: center; min-height: 44px; font-size: var(--text-sm); }
	.vol-nav { position: relative; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: var(--space-4); margin-top: var(--space-7); padding-top: var(--space-4); }
	.vol-nav > .ink-rule { position: absolute; top: 0; }
	.vol-nav a { display: inline-flex; align-items: center; min-height: 44px; font-size: var(--text-sm); }
	.vol-nav a:last-child { justify-self: end; text-align: right; }
	@media (max-width: 600px) {
		.volume-page { padding-block: var(--space-4) var(--space-6); }
		.volume-switcher { gap: var(--space-1) var(--space-4); margin-top: var(--space-5); }
		.catalog-link { grid-template-columns: 1fr auto; gap: var(--space-3); }
		.work-arrow { display: none; }
		.work-grid { grid-template-columns: 1fr; gap: var(--space-6); }
		.volume-empty { padding: var(--space-5); }
		.vol-nav { grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-top: var(--space-6); }
		.vol-nav > a[href='/projects'] { grid-column: 1 / -1; grid-row: 2; justify-self: center; }
	}
</style>
