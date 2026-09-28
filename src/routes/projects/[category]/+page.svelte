<script>
	import Artwork from '$lib/components/Artwork.svelte';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { reveal } from '$lib/actions/reveal.js';

	let { data } = $props();

	// Same component instance is reused when navigating between volumes,
	// so everything derived from `data` must be reactive ($derived).
	const meta = $derived(data.meta);
	const items = $derived(data.items);
	const count = $derived(String(data.items.length).padStart(2, '0'));

	// Chinese figure numerals for the research-plate layout (图一, 图二 ...)
	const figNumerals = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];

	/** @param {string} url */
	function stripUrl(url) {
		return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
	}
</script>

<svelte:head>
	<title>{data.category} · 作品分卷 - {data.profile.name}</title>
	<meta name="description" content="{meta.intro} {data.profile.name}的{data.category}作品分卷。" />
</svelte:head>

<Header />

<div class="spacer" style="--size: 0.55"></div>

<!-- 卷首 Volume lead -->
<section class="grid vol-lead" use:reveal>
	<div class="vol-lead-mark" aria-hidden="true"></div>
	<span class="vol-numeral" aria-hidden="true" style="--stamp-tilt: -0.6deg">{meta.numeral}</span>
	<div class="vol-lead-body">
		<p class="vol-breadcrumb">
			<a class="link-underline" href="/projects">作品</a>
			<span class="vol-breadcrumb-sep" aria-hidden="true">/</span>
			<span>第{meta.numeral}卷</span>
		</p>
		<h1 class="vol-title deboss-text">{data.category}</h1>
		<p class="vol-subtag">{meta.subtag}</p>
		<p class="vol-en">{meta.en} <span class="vol-count">{count}</span></p>
		<p class="vol-colophon">{meta.intro}</p>
	</div>
</section>

<div class="spacer" style="--size: 0.4"></div>

<!-- Works: sticky volume colophon left, layout-specific content right -->
<section class="grid vol-works">
	<aside class="vol-side" aria-hidden="true">
		<span class="vol-side-numeral">{meta.numeral}</span>
		<span class="vol-side-count">{count} 件</span>
	</aside>

	<div class="vol-content">
		{#if items.length === 0}
			<div class="volume-empty">
				<h2>此卷尚待落笔。</h2>
				<p>新的作品正在整理，先去别卷走走。</p>
				<a class="link-underline" href="/projects">返回全卷目录</a>
			</div>
		{:else if meta.layout === 'catalog'}
			<!-- Layout I: 手写目录 typography-only -->
			<ol class="catalog-list">
				{#each items as p (p.slug)}
					<li class="catalog-row" use:reveal>
						<a class="catalog-link" href="/projects/{meta.slug}/{p.slug}">
							<span class="catalog-index">{p.index}</span>
							<span class="catalog-main">
								<span class="catalog-title-cn">{p.title}</span>
								<span class="catalog-title-en">{p.titleEn}</span>
								<span class="catalog-summary">{p.summary}</span>
							</span>
							<span class="catalog-meta">
								<span class="catalog-year">{p.year}</span>
								<span class="catalog-role">{p.role}</span>
							</span>
						</a>
					</li>
				{/each}
			</ol>
		{:else if meta.layout === 'stills'}
			<!-- Layout II: 装裱剧照 stacked mounted stills -->
			<div class="stills-stack">
				{#each items as p (p.slug)}
					<article class="stills-item" use:reveal>
						<a class="stills-link" href="/projects/{meta.slug}/{p.slug}">
							<div class="mounted-frame">
								<Artwork src={p.cover} alt={p.title} aspect={p.aspect} />
							</div>
							<div class="stills-caption">
								<span class="stills-index">{p.index}</span>
								<h2 class="mounted-title">{p.title}</h2>
								<span class="stills-year">{p.year}</span>
								<p class="stills-summary">{p.summary}</p>
							</div>
						</a>
					</article>
				{/each}
			</div>
		{:else if meta.layout === 'draft'}
			<!-- Layout III: 图稿研究 meta left, mounted image right -->
			<div class="draft-stack">
				{#each items as p (p.slug)}
					<article class="draft-item" use:reveal>
						<div class="draft-meta">
							<span class="draft-index">{p.index}</span>
							<h2 class="draft-title">
								<a class="draft-title-link" href="/projects/{meta.slug}/{p.slug}">{p.title}</a>
							</h2>
							<p class="draft-title-en">{p.titleEn}</p>
							<dl class="draft-spec">
								<div class="spec-row"><dt>年份</dt><dd>{p.year}</dd></div>
								<div class="spec-row"><dt>身份</dt><dd>{p.role}</dd></div>
							</dl>
							<p class="draft-summary">{p.summary}</p>
							{#if p.externalUrl}
								<a class="link-underline draft-url" href={p.externalUrl} target="_blank" rel="noopener noreferrer">
									{stripUrl(p.externalUrl)}
								</a>
							{/if}
						</div>
						<a class="draft-figure" href="/projects/{meta.slug}/{p.slug}" aria-label="阅读{p.title}">
							<div class="mounted-frame">
								<Artwork src={p.cover} alt={p.title} aspect={p.aspect} />
							</div>
						</a>
					</article>
				{/each}
			</div>
		{:else}
			<!-- Layout IV: 研究图版 image left with CN figure label, caption right -->
			<div class="plate-stack">
				{#each items as p, i (p.slug)}
					<article class="plate-item" use:reveal>
						<a class="plate-figure" href="/projects/{meta.slug}/{p.slug}" aria-label="阅读{p.title}">
							<div class="mounted-frame">
								<Artwork src={p.cover} alt={p.title} aspect={p.aspect} />
							</div>
							<span class="plate-label">图{figNumerals[i] ?? i + 1}</span>
						</a>
						<div class="plate-caption">
							<span class="plate-index">{p.index}</span>
							<h2 class="plate-title">
								<a class="plate-title-link" href="/projects/{meta.slug}/{p.slug}">{p.title}</a>
							</h2>
							<p class="plate-title-en">{p.titleEn}</p>
							<dl class="draft-spec">
								<div class="spec-row"><dt>年份</dt><dd>{p.year}</dd></div>
								<div class="spec-row"><dt>身份</dt><dd>{p.role}</dd></div>
							</dl>
							<p class="plate-summary">{p.summary}</p>
						</div>
					</article>
				{/each}
			</div>
		{/if}
	</div>
</section>

<div class="spacer" style="--size: 0.5"></div>

<!-- 分卷导航 Volume navigation -->
<nav class="grid vol-nav" aria-label="分卷导航" use:reveal>
	<div class="vol-nav-inner">
		{#if data.prev}
			<a class="vol-nav-link vol-nav-prev" href="/projects/{data.prev.slug}">
				<span class="vol-nav-dir">上一卷</span>
				<span class="vol-nav-title">{data.prev.numeral} · {data.prev.title}</span>
			</a>
		{:else}
			<span class="vol-nav-link vol-nav-empty" aria-hidden="true"></span>
		{/if}
		<a class="vol-nav-index link-underline" href="/projects">全卷目录</a>
		{#if data.next}
			<a class="vol-nav-link vol-nav-next" href="/projects/{data.next.slug}">
				<span class="vol-nav-dir">下一卷</span>
				<span class="vol-nav-title">{data.next.numeral} · {data.next.title}</span>
			</a>
		{:else}
			<span class="vol-nav-link vol-nav-empty" aria-hidden="true"></span>
		{/if}
	</div>
</nav>

<Footer />

<style>
	/* 字体声部走全局 token（app.css :root，DESIGN.md §5.1） */

	/* ============ 卷首 Volume lead ============ */

	.vol-lead {
		position: relative;
	}

	.vol-lead-mark {
		grid-column: 1 / 2;
		width: 1px;
		height: 100%;
		min-height: 8rem;
		background: linear-gradient(180deg, transparent, rgba(158, 107, 85, 0.28), transparent);
		justify-self: start;
	}

	.vol-numeral {
		grid-column: 1 / 3;
		align-self: start;
		justify-self: start;
		font-family: var(--font-brush);
		font-size: 1.6rem;
		color: var(--color-link);
		writing-mode: vertical-rl;
		padding: 0.9rem 0.45rem;
		border: 1px solid rgba(158, 107, 85, 0.3);
		margin-top: 0.4rem;
	}

	.vol-lead-body {
		grid-column: 3 / -1;
	}

.vol-breadcrumb {
		font-family: var(--font-ui);
		font-size: 0.8rem;
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
		margin-bottom: 2rem;
		display: flex;
		gap: 0.6rem;
		align-items: baseline;
	}

	.vol-breadcrumb-sep {
		color: var(--color-text-muted);
	}

	.vol-title {
		font-family: var(--font-heading);
		font-size: clamp(2.6rem, 7vw, 4.8rem);
		font-weight: 500;
		letter-spacing: 0.06em;
		line-height: 1.15;
		color: var(--color-text);
	}

	.vol-subtag {
		font-family: var(--font-brush);
		font-size: 1rem;
		letter-spacing: 0.5em;
		color: var(--color-link);
		margin-top: 1rem;
	}

	.vol-en {
		font: italic var(--text-lg)/var(--leading-base) var(--font-latin);
		letter-spacing: var(--tracking-heading);
		color: var(--color-text-muted);
		margin-top: var(--space-2);
	}

.vol-count {
		color: var(--color-text-muted);
		margin-left: 0.5em;
	}

	.vol-colophon {
		font-family: var(--font-brush);
		font-size: 1.02rem;
		line-height: 2;
		color: var(--color-text-muted);
		max-width: 26em;
		margin-top: 2.2rem;
	}

	/* ============ Works section shell ============ */

	.vol-side {
		display: none;
	}

	.vol-content {
		grid-column: 1 / -1;
	}

	/* ============ Layout I: 手写目录 ============ */

	.catalog-list {
		list-style: none;
	}

	.catalog-row {
		border-bottom: 1px solid rgba(38, 35, 32, 0.05);
	}

	.catalog-row:first-child {
		border-top: 1px solid rgba(38, 35, 32, 0.05);
	}

	.catalog-link {
		display: grid;
		grid-template-columns: 2.5rem 1fr;
		gap: 0.4rem 1.2rem;
		padding: 2rem 0;
		text-decoration: none;
	}

	.catalog-index {
		font-family: var(--font-ui);
		font-size: 0.78rem;
		letter-spacing: 0.1em;
		color: var(--color-text-muted);
		padding-top: 0.5em;
	}

	.catalog-main {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.catalog-title-cn {
		font-family: var(--font-heading);
		font-size: clamp(1.3rem, 2.8vw, 2rem);
		font-weight: 500;
		letter-spacing: 0.04em;
		color: var(--color-text);
		border-bottom: 1px solid transparent;
		align-self: start;
		transition:
			color 0.8s cubic-bezier(0.16, 1, 0.3, 1),
			border-color 0.8s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.catalog-link:hover .catalog-title-cn {
		color: var(--color-link);
		border-bottom-color: rgba(158, 107, 85, 0.35);
	}

.catalog-title-en {
		font: italic var(--text-base)/var(--leading-base) var(--font-latin);
		letter-spacing: var(--tracking-heading);
		color: var(--color-text-muted);
	}

	.catalog-summary {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: 400;
		line-height: var(--leading-base);
		color: var(--color-text-muted);
		max-width: 36em;
		margin-top: 0.4rem;
	}

.catalog-meta {
		grid-column: 2;
		display: flex;
		gap: 1.5rem;
		font-family: var(--font-ui);
		font-size: 0.78rem;
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
		margin-top: 0.6rem;
	}

	/* ============ Mounted frame (装裱, shared) ============ */

	.mounted-frame {
		padding: 2px;
		border: 8px solid var(--color-bg-alt);
		outline: 1px solid rgba(158, 107, 85, 0.12);
		outline-offset: 7px;
		box-shadow: 0 2px 14px var(--shadow);
		transition: box-shadow 0.8s cubic-bezier(0.16, 1, 0.3, 1);
	}


	a:hover .mounted-frame {
		box-shadow: 0 4px 22px var(--shadow-deep);
	}


	/* ============ Layout II: 装裱剧照 ============ */

	.stills-stack {
		display: flex;
		flex-direction: column;
		gap: 5rem;
	}

	.stills-link {
		display: block;
		text-decoration: none;
	}

	.stills-caption {
		display: grid;
		grid-template-columns: 2.5rem 1fr auto;
		gap: 0.5rem 1rem;
		align-items: baseline;
		margin-top: 1.6rem;
	}

.stills-index {
		font-family: var(--font-ui);
		font-size: 0.78rem;
		letter-spacing: 0.1em;
		color: var(--color-text-muted);
	}

	.mounted-title {
		font-family: var(--font-heading);
		font-size: clamp(1.2rem, 2.4vw, 1.7rem);
		font-weight: 500;
		letter-spacing: 0.04em;
		color: var(--color-text);
		transition: color 0.8s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.stills-link:hover .mounted-title {
		color: var(--color-link);
	}

.stills-year {
		font-family: var(--font-ui);
		font-size: 0.8rem;
		letter-spacing: 0.1em;
		color: var(--color-text-muted);
	}

	.stills-summary {
		grid-column: 1 / -1;
		grid-row: 3;
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: 400;
		line-height: var(--leading-base);
		color: var(--color-text-muted);
		max-width: 42em;
		margin-top: 0.4rem;
	}

	/* ============ Layout III: 图稿研究 ============ */

	.draft-stack {
		display: flex;
		flex-direction: column;
		gap: 5rem;
	}

	.draft-item {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
	}

	.draft-index,
	.plate-index {
		font-family: var(--font-ui);
		font-size: 0.78rem;
		letter-spacing: 0.1em;
		color: var(--color-text-muted);
	}

	.draft-title,
	.plate-title {
		font-family: var(--font-heading);
		font-size: clamp(1.3rem, 2.6vw, 1.9rem);
		font-weight: 500;
		letter-spacing: 0.04em;
		margin-top: 0.8rem;
	}

	.draft-title-link,
	.plate-title-link {
		color: var(--color-text);
		text-decoration: none;
		transition: color 0.8s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.draft-title-link:hover,
	.plate-title-link:hover {
		color: var(--color-link);
	}

.draft-title-en,
	.plate-title-en {
		font: italic var(--text-base)/var(--leading-base) var(--font-latin);
		letter-spacing: var(--tracking-heading);
		color: var(--color-text-muted);
		margin-top: 0.5rem;
	}

	.draft-spec {
		margin-top: 1.6rem;
		max-width: 20em;
	}

	.spec-row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		padding: 0.55rem 0;
		border-bottom: 1px solid rgba(38, 35, 32, 0.06);
		font-family: var(--font-ui);
		font-size: 0.85rem;
	}

	.spec-row:first-child {
		border-top: 1px solid rgba(38, 35, 32, 0.06);
	}

.spec-row dt {
		color: var(--color-text-muted);
		letter-spacing: 0.08em;
	}

	.spec-row dd {
		color: var(--color-text-muted);
	}

	.draft-summary,
	.plate-summary {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: 400;
		line-height: var(--leading-base);
		color: var(--color-text-muted);
		margin-top: 1.4rem;
	}

	.draft-url {
		display: inline-block;
		font-family: var(--font-ui);
		font-size: 0.85rem;
		letter-spacing: 0.04em;
		color: var(--color-link);
		margin-top: 1.2rem;
	}

	.draft-figure,
	.plate-figure {
		display: block;
		text-decoration: none;
	}

	/* ============ Layout IV: 研究图版 ============ */

	.plate-stack {
		display: flex;
		flex-direction: column;
		gap: 5rem;
	}

	.plate-item {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
	}

	.plate-figure {
		position: relative;
	}

	.plate-label {
		position: absolute;
		left: 0.4rem;
		bottom: -1.9rem;
		font-family: var(--font-brush);
		font-size: 0.9rem;
		letter-spacing: 0.3em;
		color: var(--color-link);
	}

	.plate-caption {
		padding-top: 1rem;
	}

	/* ============ 分卷导航 ============ */

	.vol-nav-inner {
		grid-column: 1 / -1;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1.5rem;
		padding: 2rem 0;
		border-top: 1px solid rgba(38, 35, 32, 0.08);
	}

	.vol-nav-link {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		text-decoration: none;
		min-width: 7rem;
	}

	.vol-nav-next {
		text-align: right;
	}

	.vol-nav-dir {
		font-family: var(--font-ui);
		font-size: 0.72rem;
		letter-spacing: 0.14em;
		color: var(--color-text-muted);
	}

	.vol-nav-title {
		font-family: var(--font-heading);
		font-size: 1rem;
		letter-spacing: 0.06em;
		color: var(--color-text-muted);
		transition: color 0.8s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.vol-nav-link:hover .vol-nav-title {
		color: var(--color-link);
	}

	.vol-nav-index {
		font-family: var(--font-brush);
		font-size: 0.92rem;
		letter-spacing: 0.2em;
		color: var(--color-text-muted);
		flex-shrink: 0;
	}

	.volume-empty { padding-block: var(--space-6); max-width: 30em; }
	.volume-empty h2 { font: var(--text-xl)/var(--leading-tight) var(--font-heading); color: var(--color-text); }
	.volume-empty p { margin-block: var(--space-4); color: var(--color-text-muted); line-height: var(--leading-base); }
	.volume-empty a { font-size: var(--text-sm); color: var(--color-link-hover); }
	.catalog-main, .draft-meta, .plate-caption { min-width: 0; overflow-wrap: anywhere; }

	/* ============ Responsive ============ */

	@media (min-width: 900px) {
		.vol-lead-mark {
			grid-column: 1 / 2;
		}

		.vol-numeral {
			grid-column: 2 / 3;
			font-size: 1.8rem;
		}

		.vol-lead-body {
			grid-column: 3 / -2;
		}

		/* Sticky volume colophon in the left margin column */
		.vol-side {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			gap: 1.2rem;
			grid-column: 1 / 4;
			position: sticky;
			top: calc(var(--header-height) + 2rem);
			align-self: start;
			border-right: 1px solid rgba(158, 107, 85, 0.1);
			min-height: 12rem;
			padding: 0.5rem 2rem 0.5rem 0;
			margin-right: 2rem;
		}

		.vol-side-numeral {
			font-family: var(--font-brush);
			font-size: 1.3rem;
			color: var(--color-link);
			writing-mode: vertical-rl;
			letter-spacing: 0.3em;
		}

		.vol-side-count {
			font-family: var(--font-ui);
			font-size: 0.72rem;
			letter-spacing: 0.14em;
			color: var(--color-text-muted);
		}

		.vol-content {
			grid-column: 4 / -1;
		}

		.catalog-link {
			grid-template-columns: 3.5rem 1fr auto;
		}

		.catalog-meta {
			grid-column: 3;
			grid-row: 1;
			flex-direction: column;
			gap: 0.5rem;
			text-align: right;
			margin-top: 0.5em;
		}

		.draft-item {
			grid-template-columns: minmax(0, 4fr) minmax(0, 7fr);
			gap: 3rem;
			align-items: start;
		}

		.plate-item {
			grid-template-columns: minmax(0, 7fr) minmax(0, 4fr);
			gap: 3rem;
			align-items: start;
		}

		.plate-caption {
			padding-top: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.vol-numeral {
			transform: none;
			transition: none;
		}

		.catalog-title-cn,
		.mounted-title,
		.mounted-frame,
		.draft-title-link,
		.plate-title-link,
		.vol-nav-title {
			transition: none;
		}
	}
</style>
