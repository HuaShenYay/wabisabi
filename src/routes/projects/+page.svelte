<script lang="ts">
	import { categoryOrder, categoryMeta, groupByCategory } from '$lib/domain/projects.js';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	const grouped = $derived(groupByCategory(data.projects));
</script>

<section class="project-index site-shell" aria-labelledby="works-heading">
	<header class="index-heading">
		<div><h1 id="works-heading" class="woodblock-art">作品</h1><p>Selected works</p></div>
		<span class="index-count">共 {data.projects.length} 件</span>
	</header>
	<nav class="category-entries" aria-label="选择作品分类">
		{#each categoryOrder as category}
			{@const meta = categoryMeta[category]}
			{@const count = grouped[category].length}
			<a class="category-entry" href="/projects/{meta.slug}" data-sveltekit-preload-data="hover">
				<span class="ink-rule" aria-hidden="true"></span>
				<div class="entry-content"><h2>{category}</h2><span class="entry-en">{meta.en}</span></div>
				<span class="entry-count">{count ? `${count} 件` : '待续'}</span><span class="entry-arrow" aria-hidden="true">↗</span>
			</a>
		{/each}
		<span class="ink-rule" aria-hidden="true"></span>
	</nav>
</section>

<style>
	.project-index { padding-block: var(--space-6) var(--space-7); }
	.index-heading { display: flex; justify-content: space-between; align-items: end; gap: var(--space-4); margin-bottom: var(--space-6); }
	h1 { font: clamp(2.8rem, 5vw, 4rem)/1.4 var(--font-heading); letter-spacing: .12em; }
	.index-heading p { margin-top: var(--space-2); font: italic var(--text-xl)/1.5 var(--font-display-latin); color: var(--color-text-muted); }
	.index-count, .entry-count { font: var(--text-xs)/1.5 var(--font-body); color: var(--color-text-muted); white-space: nowrap; }
	.category-entry { position: relative; display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: var(--space-5); padding-block: var(--space-5); }
	.category-entry > .ink-rule { position: absolute; top: 0; }
	h2 { font: var(--text-2xl)/1.5 var(--font-heading); letter-spacing: .08em; }
	.entry-en { display: block; margin-top: var(--space-1); font: italic var(--text-base)/1.5 var(--font-display-latin); color: var(--color-text-muted); }
	.entry-arrow { color: var(--color-text-muted); font-size: var(--text-lg); }
	@media (max-width: 600px) { .project-index { padding-block: var(--space-5) var(--space-6); } .index-heading { margin-bottom: var(--space-5); } .category-entry { gap: var(--space-4); padding-block: var(--space-4); } h2 { font-size: var(--text-xl); } .entry-en { font-size: var(--text-sm); } }
</style>
