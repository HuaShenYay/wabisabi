<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import { categoryOrder, categoryMeta, groupByCategory } from '$lib/domain/projects.js';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const grouped = $derived(groupByCategory(data.projects));
</script>

<section class="project-portal" aria-labelledby="works-heading">
	<Header />
	<a class="portal-signature" href="/" data-sveltekit-preload-data="hover">
		<span>{data.profile.name}</span><span class="signature-en">{data.profile.nameEn}</span>
	</a>

	<div class="portal-body">
		<div class="portal-intro">
			<p class="portal-eyebrow">Selected works</p>
			<h1 id="works-heading">作品</h1>
			<p class="portal-note">一些文字、影像，<br />与代码留下的痕迹。</p>
		</div>

		<nav class="category-entries" aria-label="选择作品分类">
			{#each categoryOrder as category, index}
				{@const meta = categoryMeta[category]}
				{@const count = grouped[category].length}
				<a class="category-entry" href="/projects/{meta.slug}" data-sveltekit-preload-data="hover" style:--entry-index={index}>
					<span class="entry-top"><span class="entry-volume">{meta.numeral}</span><span class="entry-count">{count ? `${String(count).padStart(2, '0')} 件作品` : '整理中'}</span></span>
					<h2>{category}</h2>
					<span class="entry-bottom"><span class="entry-en">{meta.en}</span><span class="entry-arrow" aria-hidden="true">↗</span></span>
				</a>
			{/each}
		</nav>
	</div>

	<footer class="portal-footer">
		<p>选择一卷，慢慢翻阅。</p>
		<span>{String(data.projects.length).padStart(2, '0')} 件作品 · 持续记录</span>
	</footer>
</section>

<style>
	.project-portal {
		position: relative;
		isolation: isolate;
		min-height: 100svh;
		display: flex;
		flex-direction: column;
		padding: var(--space-5) var(--grid-margin);
		color: var(--color-bg);
		text-shadow: 0 1px var(--space-3) var(--color-text);
	}
	.project-portal::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		pointer-events: none;
		background: linear-gradient(90deg, color-mix(in srgb, var(--color-text) 24%, transparent), transparent 45%), linear-gradient(0deg, color-mix(in srgb, var(--color-text) 28%, transparent), transparent 55%);
	}
	.portal-signature { position: absolute; top: var(--space-5); left: var(--grid-margin); display: flex; align-items: baseline; gap: var(--space-3); font-size: var(--text-sm); letter-spacing: .22em; }
	.signature-en { font: italic var(--text-base) var(--font-latin); letter-spacing: var(--tracking-base); }
	.portal-body { flex: 1; display: grid; grid-template-columns: 40fr 60fr; gap: var(--space-6); align-items: start; padding-block: clamp(var(--space-7), 20svh, var(--space-9)) var(--space-5); }
	.portal-intro { padding-top: var(--space-5); animation: arrive var(--duration-slow) var(--ease-organic) var(--duration-base) both; }
	.portal-eyebrow { font: italic var(--text-base) var(--font-latin); letter-spacing: var(--tracking-heading); }
	h1 { margin-top: var(--space-4); font: 400 var(--text-3xl)/var(--leading-tight) var(--font-heading); letter-spacing: .2em; }
	.portal-note { margin-top: var(--space-5); font-size: var(--text-sm); line-height: var(--leading-loose); letter-spacing: var(--tracking-heading); }
	.category-entries { display: grid; grid-template-columns: 1fr 1fr; column-gap: var(--space-6); row-gap: var(--space-7); }
	.category-entry { display: flex; flex-direction: column; padding-top: var(--space-4); border-top: 1px solid color-mix(in srgb, var(--color-bg) 38%, transparent); animation: arrive var(--duration-slow) var(--ease-organic) calc(var(--duration-base) + var(--duration-fast) * var(--entry-index)) both; transition: border-color var(--duration-slow) var(--ease-organic), color var(--duration-slow) var(--ease-organic); }
	.category-entry:nth-child(2) { margin-top: var(--space-7); }
	.category-entry:nth-child(3) { margin-left: var(--space-5); }
	.category-entry:nth-child(4) { margin-top: var(--space-4); }
	.entry-top, .entry-bottom { display: flex; justify-content: space-between; align-items: baseline; gap: var(--space-3); }
	.entry-volume { font: var(--text-sm) var(--font-heading); }
	.entry-count { font: var(--text-xs) var(--font-ui); letter-spacing: var(--tracking-heading); }
	h2 { margin-block: var(--space-4) var(--space-2); font: 400 var(--text-xl)/var(--leading-tight) var(--font-heading); letter-spacing: var(--tracking-heading); }
	.entry-en { font: italic var(--text-base)/var(--leading-base) var(--font-latin); }
	.entry-arrow { font-size: var(--text-base); opacity: .65; transition: opacity var(--duration-slow); }
	.category-entry:hover { border-color: var(--color-bg); color: var(--color-bg-alt); }
	.category-entry:hover .entry-arrow { opacity: 1; }
	.category-entry:focus-visible, .portal-signature:focus-visible { outline: 2px solid var(--color-bg); outline-offset: var(--space-2); }
	.portal-footer { display: flex; justify-content: space-between; gap: var(--space-5); margin-top: var(--space-6); font-size: var(--text-xs); line-height: var(--leading-base); letter-spacing: var(--tracking-heading); animation: arrive var(--duration-slow) var(--ease-organic) var(--duration-slow) both; }
	.portal-footer span { font-family: var(--font-ui); }
	@keyframes arrive { from { opacity: 0; transform: translateY(var(--space-3)); } to { opacity: 1; transform: none; } }
	@media (max-width: 760px) {
		.signature-en { display: none; }
		.portal-body { grid-template-columns: 1fr; gap: var(--space-6); padding-top: calc(var(--header-height) + var(--space-4)); }
		.portal-intro { padding-top: 0; }
		.portal-eyebrow { font-size: var(--text-sm); }
		h1 { font-size: var(--text-2xl); margin-top: var(--space-3); }
		.portal-note { margin-top: var(--space-4); }
		.category-entries { column-gap: var(--space-4); row-gap: var(--space-5); }
		.category-entry:nth-child(2) { margin-top: var(--space-5); }
		.category-entry:nth-child(3) { margin-left: 0; }
		.category-entry:nth-child(4) { margin-top: var(--space-3); }
		.entry-top { gap: var(--space-2); }
		.entry-en { font-size: var(--text-sm); }
		.portal-footer { margin-top: var(--space-5); }
	}
	@media (max-height: 560px) and (min-width: 761px) {
		.portal-body { padding-top: var(--header-height); }
		.category-entries { row-gap: var(--space-5); }
		.category-entry:nth-child(2) { margin-top: var(--space-5); }
		.portal-footer { margin-top: var(--space-4); }
	}
	@media (prefers-reduced-motion: reduce) {
		.portal-intro, .category-entry, .portal-footer { animation: none; }
	}
</style>
