<script>
	import { page } from '$app/state';
	import { getLocale, translator, categoryLabel } from '$lib/i18n';
	const locale = $derived(getLocale(page.data.locale));
	const t = $derived(translator(locale));

	import Artwork from '$lib/components/Artwork.svelte';
	import RichText from '$lib/components/RichText.svelte';

	let { data } = $props();

	// Reactive: same component instance is reused for prev/next navigation
	const article = $derived(data.article);
	const cat = $derived(data.categoryMeta);

	// Track image order so captions get Chinese figure numerals (图一, 图二 ...)
	const figNumerals = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
	const figIndexes = $derived.by(() => {
		const map = new Map();
		let n = 0;
		for (const b of data.article.body) {
			if (b.type === 'image') map.set(b, n++);
		}
		return map;
	});
</script>

<svelte:head>
	<title>{article.title} - {t(data.profile.name, data.profile.nameEn)}</title>
	<meta name="description" content={article.summary} />
</svelte:head>

<div class="reading-page">


<div class="spacer" style="--size: 0.55"></div>

<!-- 题头 Article head -->
<header class="grid work-head">
	<p class="work-breadcrumb">
		<a class="link-underline" href="/projects">{t('作品', 'Works')}</a>
		<span class="crumb-sep" aria-hidden="true">/</span>
		<a class="link-underline" href="/projects/{cat.slug}">{categoryLabel(locale, article.category)}</a>
	</p>
	<h1 class="work-title deboss-text">{article.title}</h1>
	<dl class="work-spec">
		{#if article.year}<div class="spec-cell"><dt class="machine">{t('年份', 'Year')}</dt><dd>{article.year}</dd></div>{/if}
		{#if article.role}<div class="spec-cell"><dt class="machine">{t('职责', 'Role')}</dt><dd>{article.role}</dd></div>{/if}
		{#if article.externalUrl}
			<div class="spec-cell">
				<dt class="machine">{t('链接', 'Link')}</dt>
				<dd>
					<a class="link-underline spec-url machine" href={article.externalUrl} target="_blank" rel="noopener noreferrer">
						{t('访问网站', 'Visit site')} ↗
					</a>
				</dd>
			</div>
		{/if}
	</dl>
</header>

{#if article.cover && article.showCover !== false}
<div class="spacer" style="--size: 0.35"></div>

<!-- 卷首图 Cover plate: text-only posts need no placeholder image. -->
<div class="grid work-cover">
	<figure class="cover-figure">
		<div class="mounted-frame ink-frame">
			<Artwork src={article.cover} alt={article.title} aspect={article.aspect} eager />
		</div>
		<figcaption class="plate-label">{t('卷首', 'Frontispiece')}</figcaption>
	</figure>
</div>
{/if}

<div class="spacer" style="--size: 0.35"></div>

<!-- 正文 Article body: renders the ArticleBlock contract.
     Sanity Portable Text is mapped to these blocks in the CMS service. -->
<article class="grid work-body">
	<div class="body-flow">
		{#each article.body as block}
			{#if block.type === 'paragraph'}
				<p class="body-paragraph"><RichText content={block.content} text={block.text} /></p>
			{:else if block.type === 'heading'}
				<svelte:element this={block.level === 3 ? 'h3' : 'h2'} class="body-heading">{block.text}</svelte:element>
			{:else if block.type === 'list'}
				<svelte:element this={block.ordered ? 'ol' : 'ul'} class="body-list">
					{#each block.items as item}<li><RichText content={item.content} text={item.text} /></li>{/each}
				</svelte:element>
			{:else if block.type === 'quote'}
				<blockquote class="body-quote">
					<p class="quote-text"><RichText content={block.content} text={block.text} /></p>
					{#if block.cite}<cite class="quote-cite">{block.cite}</cite>{/if}
				</blockquote>
			{:else if block.type === 'image'}
				<figure class="body-figure">
					<div class="mounted-frame ink-frame">
						<Artwork src={block.src} alt={block.alt || block.caption || article.title} aspectRatio={block.aspectRatio} fit="contain" />
					</div>
					<figcaption class="plate-label">
						{t(`图${figNumerals[figIndexes.get(block)] ?? ''}`, `Fig. ${figIndexes.get(block) + 1}`)}{#if block.caption}<span class="fig-caption">{block.caption}</span>{/if}
					</figcaption>
				</figure>
			{/if}
		{:else}
			<p class="body-paragraph">{article.summary || t('这件作品的创作手记正在整理中。', 'Notes on this work are being prepared.')}</p>
		{/each}

		<!-- 尾跋 Closing colophon -->
		<p class="body-colophon">
			{#if article.year}{article.year}{t(' 年', '')} · {/if}{t(`${data.profile.name}记`, data.profile.nameEn)}
		</p>
	</div>
</article>

<div class="spacer" style="--size: 0.5"></div>

<!-- 前后作品导航 -->
<nav class="grid work-nav" aria-label={t('作品导航', 'Work navigation')}>
	<div class="work-nav-inner">
		{#if data.prevWork}
			<a class="work-nav-link" href="/projects/{data.prevWork.categorySlug}/{data.prevWork.slug}">
				<span class="work-nav-dir machine">{t('上一篇', 'Previous')}</span>
				<span class="work-nav-title">{data.prevWork.title}</span>
			</a>
		{:else}
			<span class="work-nav-link" aria-hidden="true"></span>
		{/if}
		<a class="work-nav-index link-underline" href="/projects/{cat.slug}">{t('返回', 'Back to ')}{categoryLabel(locale, article.category)}</a>
		{#if data.nextWork}
			<a class="work-nav-link work-nav-next" href="/projects/{data.nextWork.categorySlug}/{data.nextWork.slug}">
				<span class="work-nav-dir machine">{t('下一篇', 'Next')}</span>
				<span class="work-nav-title">{data.nextWork.title}</span>
			</a>
		{:else}
			<span class="work-nav-link" aria-hidden="true"></span>
		{/if}
	</div>
</nav>


</div>

<style>
	/* ============ 题头 ============ */

	.work-breadcrumb {
		grid-column: 1 / -1;
		font-family: var(--font-ui);
		font-size: 0.8rem;
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
		display: flex;
		gap: 0.8rem;
		align-items: center;
		margin-bottom: 2.2rem;
	}

	.crumb-sep {
		color: var(--color-text-muted);
	}


	.work-title {
		grid-column: 1 / -1;
		font-family: var(--font-heading);
		font-size: clamp(1.9rem, 4.5vw, 3.4rem);
		font-weight: 500;
		letter-spacing: 0.05em;
		line-height: 1.2;
		color: var(--color-text);
	}

	.work-spec {
		grid-column: 1 / -1;
		display: flex;
		flex-wrap: wrap;
		gap: 0 3rem;
		margin-top: 2.4rem;
		border-top: 1px solid var(--color-divider);
	}

	.spec-cell {
		display: flex;
		gap: 0.8rem;
		align-items: baseline;
		padding: 0.9rem 0;
		font-family: var(--font-ui);
		font-size: 0.85rem;
	}

.spec-cell dt {
		color: var(--color-text-muted);
		letter-spacing: 0.1em;
	}

	.spec-cell dd {
		color: var(--color-text-muted);
		letter-spacing: 0.04em;
	}

	.spec-url {
		color: var(--color-link);
	}

	/* ============ 装裱 mounted frame (shared) ============ */

	.mounted-frame {
		position: relative;
		padding: var(--space-3);
	}




	.plate-label {
		display: block;
		font-family: var(--font-brush);
		font-size: 0.9rem;
		letter-spacing: 0.3em;
		color: var(--color-link);
		margin-top: 1.1rem;
		padding-left: 0.2rem;
	}

	.fig-caption {
		font-family: var(--font-ui);
		font-size: 0.78rem;
		letter-spacing: 0.1em;
		color: var(--color-text-muted);
		margin-left: 1.2rem;
	}

	/* ============ 卷首图 ============ */

	.cover-figure {
		grid-column: 1 / -1;
	}


	/* ============ 正文 ============ */

	.body-flow {
		grid-column: 1 / -1;
		display: flex;
		flex-direction: column;
	}

	.body-paragraph {
		font-family: var(--font-body);
		font-size: var(--text-base);
		font-weight: 400;
		line-height: var(--leading-loose);
		color: var(--color-text);
		max-width: 34em;
		margin-bottom: var(--space-5);
		text-wrap: pretty;
		overflow-wrap: anywhere;
		white-space: pre-line;
	}
	.body-list { padding-left: var(--space-5); margin-bottom: var(--space-5); max-width: 34em; font: var(--text-base)/var(--leading-loose) var(--font-body); color: var(--color-text); overflow-wrap: anywhere; }
	ul.body-list { list-style: disc; }
	ol.body-list { list-style: decimal; }
	.body-list li { margin-bottom: var(--space-2); }

	.body-heading {
		font-family: var(--font-heading);
		font-size: clamp(1.3rem, 2.4vw, 1.7rem);
		font-weight: 500;
		letter-spacing: 0.2em;
		color: var(--color-text);
		margin: var(--space-6) 0 var(--space-4);
	}
	.body-heading:first-child { margin-top: 0; }
	h3.body-heading { font-size: var(--text-lg); letter-spacing: var(--tracking-heading); }

	.body-quote {
		border-left: 1px solid rgba(158, 107, 85, 0.4);
		padding: 0.4rem 0 0.4rem 1.8rem;
		margin: 2.5rem 0;
		max-width: 30em;
	}

	.quote-text {
		font-family: var(--font-brush);
		font-size: 1.15rem;
		line-height: 2;
		color: var(--color-text);
		letter-spacing: 0.08em;
	}

	.quote-cite {
		display: block;
		font-family: var(--font-brush);
		font-style: normal;
		font-size: 0.85rem;
		letter-spacing: 0.2em;
		color: var(--color-text-muted);
		margin-top: 0.8rem;
	}

	.quote-cite::before {
		content: '· ';
		color: var(--color-link);
	}

	.body-figure {
		margin: 2.5rem 0 3rem;
	}

	.body-colophon {
		font-family: var(--font-brush);
		font-size: 0.92rem;
		letter-spacing: 0.24em;
		color: var(--color-text-muted);
		margin-top: 3rem;
		padding-top: 2rem;
		border-top: 1px solid var(--color-divider);
		align-self: flex-end;
		text-align: right;
	}

	/* ============ 前后导航 ============ */

	.work-nav-inner {
		grid-column: 1 / -1;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1.5rem;
		padding: 2rem 0;
		border-top: 1px solid var(--color-divider);
	}

	.work-nav-link {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		text-decoration: none;
		min-width: 7rem;
	}

	.work-nav-next {
		text-align: right;
	}

	.work-nav-dir {
		font-family: var(--font-ui);
		font-size: 0.72rem;
		letter-spacing: 0.14em;
		color: var(--color-text-muted);
	}

	.work-nav-title {
		font-family: var(--font-heading);
		font-size: 1rem;
		letter-spacing: 0.06em;
		color: var(--color-text-muted);
		transition: color 0.8s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.work-nav-link:hover .work-nav-title {
		color: var(--color-link);
	}

	.work-nav-index {
		font-family: var(--font-brush);
		font-size: 0.92rem;
		letter-spacing: 0.2em;
		color: var(--color-text-muted);
		flex-shrink: 0;
	}

	/* ============ Responsive ============ */

	@media (min-width: 900px) {
		.work-breadcrumb,
		.work-title,
		.work-spec {
			grid-column: 2 / -2;
		}

		.cover-figure {
			grid-column: 2 / -2;
		}

		.body-flow {
			grid-column: 3 / -2;
		}

		.body-figure {
			margin-right: -6%;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.work-nav-title {
			transition: none;
		}
	}
	@media (max-width: 768px) {
		.work-breadcrumb { flex-wrap: wrap; gap: var(--space-2); font-size: var(--text-sm); }
		.work-title { overflow-wrap: anywhere; line-height: var(--leading-tight); }
		.work-spec { gap: 0 var(--space-4); margin-top: var(--space-5); }
		.spec-cell { min-width: 0; max-width: 100%; font-size: var(--text-sm); }
		.spec-cell dd { min-width: 0; overflow-wrap: anywhere; }
		.body-paragraph, .body-list { font-size: 1.0625rem; line-height: var(--leading-base); }
		.body-quote { padding-left: var(--space-4); margin-block: var(--space-5); }
		.body-figure { margin-block: var(--space-5); }
		.work-nav-inner { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: var(--space-4); }
		.work-nav-index { grid-column: 1 / -1; grid-row: 1; justify-self: start; padding-block: var(--space-3); }
		.work-nav-link { min-width: 0; overflow-wrap: anywhere; }
		.work-nav-title { line-height: var(--leading-base); }
	}
</style>
