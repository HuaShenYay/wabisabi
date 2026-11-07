<script lang="ts">
	import { page } from '$app/state';
	import { getLocale, translator, categoryLabel } from '$lib/i18n';
	const locale = $derived(getLocale(page.data.locale));
	const t = $derived(translator(locale));

	import { categoryOrder, categoryMeta, groupByCategory } from '$lib/domain/projects.js';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	const grouped = $derived(groupByCategory(data.projects));
</script>

<section class="project-index site-shell" class:english={locale === 'en'} aria-labelledby="works-heading">
	<header class="index-heading">
		<div><h1 id="works-heading" class="woodblock-art">{t('作品', 'Works')}</h1>{#if locale === 'zh'}<p>Selected works</p>{/if}</div>
		<span class="index-count">{t(`共 ${data.projects.length} 件`, `${data.projects.length} works`)}</span>
	</header>
	<nav class="category-entries" aria-label={t('选择作品分类', 'Choose a category')}>
		{#each categoryOrder as category}
			{@const meta = categoryMeta[category]}
			{@const count = grouped[category].length}
			<a class="category-entry" href="/projects/{meta.slug}" data-sveltekit-preload-data="hover">
				<span class="ink-rule" aria-hidden="true"></span>
				<div class="entry-content"><h2>{categoryLabel(locale, category)}</h2>{#if locale === 'zh'}<span class="entry-en">{meta.en}</span>{/if}</div>
				<span class="entry-count">{count ? t(`${count} 件`, `${count} ${count === 1 ? 'work' : 'works'}`) : t('待续', 'Coming soon')}</span><span class="entry-arrow" aria-hidden="true">↗</span>
			</a>
		{/each}
		<span class="ink-rule" aria-hidden="true"></span>
	</nav>
</section>

<style>
	/* §20 作品目录 · 三段折页信息流。
	   五个分类不再是等权竖向清单，而是按 2 / 1 / 2 折页排布的短册；
	   中文与英文始终上下叠，不并排。DOM、内容、字体字号、断口笔触资源一律未动。 */

	.project-index { padding-block: var(--space-6) var(--space-8); }
	.english .index-count { grid-column: 1; margin-left: 0; margin-top: var(--space-2); }
	.english .index-heading h1 { letter-spacing: .02em; }
	.english .category-entries { row-gap: var(--space-5); }
	.english h2 { letter-spacing: .015em; line-height: 1.35; text-wrap: balance; }

	/* 题头：display: contents 让 h1 / 英文 / 件数直接成为 grid item，纯 CSS、零 JS 测量 */
	.index-heading {
		display: grid;
		grid-template-columns: max-content auto 1fr;
		grid-template-rows: auto auto;
		align-items: baseline;
		justify-content: start;
		padding-left: clamp(0px, 1.6vw, 22px);
		margin-bottom: var(--space-6);
	}
	.index-heading > div { display: contents; }
	.index-heading h1 { grid-column: 1; grid-row: 1; font: clamp(2.8rem, 5vw, 4rem)/1.4 var(--font-heading); letter-spacing: .12em; }
	.index-heading p { grid-column: 1; grid-row: 2; margin-top: var(--space-2); font: italic var(--text-xl)/1.5 var(--font-display-latin); color: var(--color-text-muted); }
	.index-count, .entry-count { font: var(--text-xs)/1.5 var(--font-body); color: var(--color-text-muted); white-space: nowrap; }
	.index-count { grid-column: 2; grid-row: 2; margin-left: 2.6rem; align-self: baseline; }

	/* 反规整六条：不等分列 / 起跑线各异 / 块宽各异 / 块内呼吸各异 /
	   不共用顶边 / 墨线不守行顶。全程不加边框、底色、序号与卡片。 */
	.category-entries {
		display: grid;
		grid-template-columns: 47% 53%;
		grid-template-rows: auto auto auto auto;
		align-items: start;
		row-gap: 0; column-gap: 0;
	}
	.category-entry {
		position: relative;
		display: flex; flex-wrap: wrap;
		align-content: flex-start; align-items: baseline;
		gap: 0;
		--mt: var(--space-3);
	}
	.category-entry > .ink-rule { position: static; flex: 0 0 auto; height: 6px; margin-bottom: var(--space-4); }
	.entry-content { flex: 0 0 100%; min-width: 0; overflow-wrap: anywhere; }
	.entry-en { display: block; margin-top: var(--space-1); font: italic var(--text-base)/1.5 var(--font-display-latin); color: var(--color-text-muted); text-wrap: balance; }
	.entry-count { margin-top: var(--mt); }
	.entry-arrow { margin-left: var(--space-2); margin-top: var(--mt); font-size: var(--text-lg); }
	.entry-count, .entry-arrow { color: var(--color-text-muted); font-variant-numeric: tabular-nums; }
	.entry-arrow { line-height: 1; transition: color var(--duration-base) var(--ease-organic); }
	.category-entry > .ink-rule { transition: opacity var(--duration-base) var(--ease-organic); }
	.category-entry:is(:hover, :focus-visible) > .ink-rule { opacity: .8; }
	.category-entry:is(:hover, :focus-visible) .entry-arrow { color: var(--color-link-hover); }
	h2 { font: var(--text-2xl)/1.5 var(--font-heading); letter-spacing: .08em; }

	/* 块内呼吸逐行不同：中英间距、件数上距、墨线长度与起笔全部错开 */
	.category-entry:nth-of-type(1) { --mt: 8px; }
	.category-entry:nth-of-type(2) { --mt: 16px; }
	.category-entry:nth-of-type(3) { --mt: 5px; }
	.category-entry:nth-of-type(4) { --mt: 20px; }
	.category-entry:nth-of-type(5) { --mt: 10px; }
	.category-entry:nth-of-type(1) .entry-en { margin-top: 3px; }
	.category-entry:nth-of-type(2) .entry-en { margin-top: 9px; }
	.category-entry:nth-of-type(3) .entry-en { margin-top: 4px; }
	.category-entry:nth-of-type(4) .entry-en { margin-top: 11px; }
	.category-entry:nth-of-type(5) .entry-en { margin-top: 6px; }
	.category-entry:nth-of-type(1) > .ink-rule { width: 74%; margin-bottom: 14px; }
	.category-entry:nth-of-type(2) > .ink-rule { width: 58%; margin-left: 18%; margin-bottom: 24px; }
	.category-entry:nth-of-type(3) > .ink-rule { width: 92%; margin-left: 4%; margin-bottom: 18px; }
	.category-entry:nth-of-type(4) > .ink-rule { width: 66%; margin-left: 10%; margin-bottom: 28px; }
	.category-entry:nth-of-type(5) > .ink-rule { width: 80%; margin-bottom: 16px; }

	/* 三段折页 2 + 1 + 2：上排并置、中块横跨、下排并置；
	   组间留白 55 / 34 / 13 不等，收尾留一整片余白 */
	.category-entry:nth-of-type(1) { grid-column: 1; grid-row: 1; width: 86%; margin: 0 0 55px 0; }
	.category-entry:nth-of-type(2) { grid-column: 2; grid-row: 1; width: 74%; margin: 21px 0 0 12%; }
	.category-entry:nth-of-type(3) { grid-column: 1 / span 2; grid-row: 2; width: 58%; margin: 0 0 34px 9%; }
	.category-entry:nth-of-type(4) { grid-column: 1; grid-row: 3; width: 82%; margin: 13px 0 0 4%; }
	.category-entry:nth-of-type(5) { grid-column: 2; grid-row: 3; width: 70%; margin: 0 0 0 20%; }
	.category-entries > .ink-rule { grid-column: 1 / span 2; grid-row: 4; width: 42%; margin: 55px 0 0 6%; }

	/* §19.7 断口交替：DOM 顺序 1 / 5 / 1 / 4 / 1 / 5 / 1 不变。
	   三段折页的视觉顺序与 DOM 顺序一致，无需重定义「上一条」。 */
	.category-entry:nth-of-type(odd) > .ink-rule { background-image: var(--rule-sparse-a); }
	.category-entry:nth-of-type(even) > .ink-rule { background-image: var(--rule-dense-a); }
	.category-entry:nth-of-type(3) > .ink-rule { background-image: var(--rule-sparse-b); }
	.category-entry:nth-of-type(4) > .ink-rule { background-image: var(--rule-dense-b); }
	.category-entries > .ink-rule { background-image: var(--rule-dense-a); }

	@media (max-width: 600px) {
		/* 窄屏退回单栏，但保留分组、起跑线错落与疏密节奏；件数回行右端 */
		.project-index { padding-block: var(--space-5) var(--space-7); }
		.index-heading { display: block; margin-bottom: var(--space-5); }
		.index-heading > div { display: block; }
		.index-heading h1, .index-heading p { grid-column: auto; grid-row: auto; }
		.index-count { display: block; margin: var(--space-2) 0 0 0; padding-top: 0; grid-column: auto; grid-row: auto; }
		.category-entries { display: block; }
		.category-entry:nth-of-type(n) {
			grid-column: auto; grid-row: auto;
			width: 100%; margin: 0;
			display: grid;
			grid-template-columns: 1fr auto auto;
			grid-template-areas: "rule rule rule" "content count arrow";
			column-gap: var(--space-2);
			align-items: end;
		}
		.category-entry:nth-of-type(1) { padding: 14px 0 18px 0; }
		.category-entry:nth-of-type(2) { padding: 26px 0 22px 12px; }
		.category-entry:nth-of-type(3) { padding: 16px 0 18px 4px; }
		.category-entry:nth-of-type(4) { padding: 32px 0 20px 18px; }
		.category-entry:nth-of-type(5) { padding: 20px 0 26px 8px; }
		.category-entry:nth-of-type(n) > .ink-rule {
			grid-area: rule; flex: none;
			width: 78%; margin: 0 0 14px 0;
		}
		.entry-content { grid-area: content; flex: none; padding-left: 0; }
		.entry-en { white-space: normal; font-size: var(--text-sm); }
		.entry-count { grid-area: count; margin: 0; }
		.entry-arrow { grid-area: arrow; margin: 0; }
		.category-entries > .ink-rule { width: 64%; margin: var(--space-6) 0 0 0; }
		/* 窄屏墨线同样不等长、起笔错落，不退回一条等宽横线 */
		.category-entry:nth-of-type(1) > .ink-rule { width: 66%; margin-left: 0; }
		.category-entry:nth-of-type(2) > .ink-rule { width: 84%; margin-left: 4%; }
		.category-entry:nth-of-type(3) > .ink-rule { width: 58%; margin-left: 0; }
		.category-entry:nth-of-type(4) > .ink-rule { width: 76%; margin-left: 8%; }
		.category-entry:nth-of-type(5) > .ink-rule { width: 70%; margin-left: 0; }
		h2 { font-size: var(--text-xl); }
	}
</style>
