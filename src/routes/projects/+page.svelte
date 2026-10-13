<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import { categoryOrder, categoryMeta, groupByCategory } from '$lib/domain/projects.js';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const grouped = $derived(groupByCategory(data.projects));
</script>

<!--
	v2「作品目录 · 五卷」(Volumes I–V)
	Monumental volume numerals, museum accession metadata, and ink-bleed transitions.
-->
<section class="project-portal" aria-labelledby="works-heading">
	<Header />
	<a class="portal-signature machine" href="/" data-sveltekit-preload-data="hover">
		<span class="seal" aria-hidden="true"></span>
		<span>{data.profile.nameEn}</span>
		<span class="sig-rule" aria-hidden="true"></span>
		<span>ARCHIVE / 2026</span>
	</a>

	<div class="portal-body">
		<div class="portal-intro">
			<span class="portal-badge machine">
				<span class="badge-rule" aria-hidden="true"></span>
				INDEX · 五卷目录
			</span>
			<h1 id="works-heading">作品</h1>
			<p class="portal-en">Selected works &amp; research</p>
			<p class="portal-note">一些文字、影像，与代码留下的痕迹。<br />在不完满的数字介质中，寻找旧物的呼吸。</p>
		</div>

		<nav class="category-entries" aria-label="选择作品分类">
			{#each categoryOrder as category, index}
				{@const meta = categoryMeta[category]}
				{@const count = grouped[category].length}
				<a class="category-entry" href="/projects/{meta.slug}" data-sveltekit-preload-data="hover" style:--entry-index={index}>
					<span class="entry-numeral-bg" aria-hidden="true">{meta.numeral}</span>
					<div class="entry-content">
						<span class="entry-top">
							<span class="entry-volume machine">VOL. 0{index + 1} — {meta.numeral}</span>
							<span class="entry-count machine">{count ? `${String(count).padStart(2, '0')} WORKS` : 'PENDING'}</span>
						</span>
						<h2>{category}</h2>
						<span class="entry-bottom">
							<span class="entry-subtag">{meta.subtag}</span>
							<span class="entry-en machine">{meta.en}</span>
							<span class="entry-arrow" aria-hidden="true">↗</span>
						</span>
					</div>
				</a>
			{/each}
		</nav>
	</div>

	<footer class="portal-footer machine">
		<span>选择一卷，顺流展阅</span>
		<span>{String(data.projects.length).padStart(2, '0')} WORKS IN PERMANENT RECORD</span>
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
		color: var(--color-on-night);
		text-shadow: 0 1px 16px rgba(27, 26, 23, 0.7);
	}
	.project-portal::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		pointer-events: none;
		background:
			linear-gradient(90deg, rgba(27, 26, 23, 0.45) 0%, transparent 60%),
			linear-gradient(0deg, rgba(27, 26, 23, 0.55) 0%, transparent 65%);
	}

	.portal-signature {
		position: absolute;
		top: calc(var(--header-height) * 0.5 - 0.8em);
		left: var(--grid-margin);
		display: flex;
		align-items: center;
		gap: var(--space-3);
		color: var(--color-on-night);
	}
	.sig-rule { width: var(--space-6); height: 1px; background: currentColor; opacity: .4; }

	.portal-body {
		flex: 1;
		display: grid;
		grid-template-columns: 36fr 64fr;
		gap: var(--space-8);
		align-items: start;
		padding-block: clamp(var(--space-7), 16svh, var(--space-9)) var(--space-6);
	}

	.portal-intro {
		padding-top: var(--space-5);
		animation: bleed var(--duration-bleed) var(--ease-organic) both;
	}
	.portal-badge {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
		opacity: .85;
	}
	.badge-rule { width: var(--space-5); height: 1px; background: currentColor; opacity: .6; }

	h1 {
		font: 400 var(--text-4xl)/1 var(--font-heading);
		letter-spacing: var(--tracking-crush);
	}
	.portal-en {
		font: italic var(--text-base)/var(--leading-base) var(--font-latin);
		color: var(--color-on-night-muted);
		margin-top: var(--space-2);
	}
	.portal-note {
		margin-top: var(--space-6);
		font-size: var(--text-sm);
		line-height: var(--leading-loose);
		color: var(--color-on-night-muted);
		max-width: 24em;
	}

	.category-entries {
		display: grid;
		grid-template-columns: 1fr 1fr;
		column-gap: var(--space-6);
		row-gap: var(--space-6);
	}

	.category-entry {
		position: relative;
		display: flex;
		flex-direction: column;
		padding: var(--space-5);
		border: 1px solid color-mix(in srgb, var(--color-on-night) 22%, transparent);
		background: color-mix(in srgb, var(--color-night) 32%, transparent);
		backdrop-filter: blur(2px);
		overflow: hidden;
		animation: bleed var(--duration-bleed) var(--ease-organic) calc(180ms + 90ms * var(--entry-index)) both;
		transition:
			border-color var(--duration-echo) var(--ease-organic),
			background-color var(--duration-echo) var(--ease-organic),
			transform var(--duration-echo) var(--ease-organic);
	}
	.category-entry:hover {
		border-color: var(--color-on-night);
		background: color-mix(in srgb, var(--color-night) 65%, transparent);
		transform: translateY(-2px);
	}

	/* 巨物: monumental watermark numeral inside card */
	.entry-numeral-bg {
		position: absolute;
		right: -0.1em;
		bottom: -0.22em;
		font-family: var(--font-heading);
		font-size: 7.5rem;
		line-height: 1;
		color: transparent;
		-webkit-text-stroke: 1px color-mix(in srgb, var(--color-on-night) 14%, transparent);
		pointer-events: none;
		user-select: none;
		transition: transform var(--duration-slow) var(--ease-organic), opacity var(--duration-slow) var(--ease-organic);
	}
	.category-entry:hover .entry-numeral-bg {
		transform: scale(1.08) translate(-4px, -4px);
		-webkit-text-stroke-color: color-mix(in srgb, var(--color-on-night) 28%, transparent);
	}

	.entry-content {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.entry-top, .entry-bottom {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: var(--space-3);
	}
	.entry-volume { font-size: var(--text-micro); opacity: .75; }
	.entry-count { font-size: var(--text-micro); color: var(--color-on-night-muted); }

	h2 {
		margin-block: var(--space-4) var(--space-4);
		font: 400 var(--text-2xl)/var(--leading-tight) var(--font-heading);
		letter-spacing: var(--tracking-heading);
		color: var(--color-on-night);
		transition: color var(--duration-base) var(--ease-organic);
	}
	.category-entry:hover h2 {
		color: var(--color-bg);
	}

	.entry-subtag {
		font-family: var(--font-heading);
		font-size: var(--text-xs);
		letter-spacing: .24em;
		opacity: .85;
	}
	.entry-en {
		font-size: var(--text-micro);
		opacity: .65;
		margin-right: auto;
		margin-left: var(--space-3);
	}
	.entry-arrow {
		font-size: var(--text-base);
		opacity: .6;
		transition: transform var(--duration-echo) var(--ease-organic), opacity var(--duration-echo) var(--ease-organic);
	}
	.category-entry:hover .entry-arrow {
		opacity: 1;
		transform: translate(3px, -3px);
	}

	.portal-footer {
		display: flex;
		justify-content: space-between;
		gap: var(--space-5);
		margin-top: var(--space-6);
		padding-top: var(--space-4);
		border-top: 1px solid color-mix(in srgb, var(--color-on-night) 20%, transparent);
		color: var(--color-on-night-muted);
		font-size: var(--text-micro);
	}

	@keyframes bleed {
		from { opacity: 0; filter: blur(12px); transform: translateY(12px); }
		to { opacity: 1; filter: none; transform: none; }
	}

	@media (max-width: 900px) {
		.portal-body { grid-template-columns: 1fr; gap: var(--space-6); padding-top: calc(var(--header-height) + var(--space-4)); }
		.portal-intro { padding-top: 0; }
		.category-entries { grid-template-columns: 1fr; }
	}
	@media (prefers-reduced-motion: reduce) {
		.portal-intro, .category-entry { animation: none; }
	}
</style>
