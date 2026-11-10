<script lang="ts">
	import { page } from '$app/state';
	import { getLocale, translator, categoryLabel } from '$lib/i18n';
	const locale = $derived(getLocale(page.data.locale));
	const t = $derived(translator(locale));

	import Artwork from './Artwork.svelte';
	import { categoryMeta, type Project } from '$lib/domain/projects';
	let { project }: { project: Project } = $props();
	const href = $derived(`/projects/${categoryMeta[project.category].slug}/${project.slug}`);
</script>

<section class="latest-work site-shell" aria-labelledby="latest-heading">
	<div class="latest-inner">
		<span class="ink-rule ink-rule--sparse" aria-hidden="true"></span>
		<header class="latest-heading">
			<h2 id="latest-heading">{t('最近作品', 'Latest work')}</h2>
		</header>
		<article class="latest-entry">
			<a class="latest-link" class:with-image={Boolean(project.cover)} {href} aria-labelledby="latest-title" data-sveltekit-preload-data="hover">
				<div class="latest-copy">
					<p class="latest-meta"><span>{categoryLabel(locale, project.category)}</span>{#if project.year}<span>{project.year}</span>{/if}</p>
					<h3 id="latest-title">{project.title}</h3>
					{#if project.summary}<p class="latest-summary">{project.summary}</p>{/if}
					<span class="latest-read">{t('阅读此作', 'Read this work')} <span aria-hidden="true">→</span></span>
				</div>
				{#if project.cover}
					<div class="latest-image"><Artwork src={project.cover} alt={project.title} aspect={project.aspect} /></div>
				{/if}
			</a>
		</article>
	</div>
</section>

<style>
	.latest-inner { position: relative; display: grid; grid-template-columns: minmax(0, 24fr) minmax(0, 76fr); gap: var(--space-6); padding-block: var(--space-6) var(--space-8); }
	.ink-rule { position: absolute; top: 0; left: 0; width: 82%; opacity: .4; }
	.latest-heading h2 { font: var(--text-base)/var(--leading-base) var(--font-heading); letter-spacing: var(--tracking-heading); }
	.latest-entry, .latest-copy { min-width: 0; }
	.latest-link { display: grid; align-items: start; gap: var(--space-5); }
	.latest-link.with-image { grid-template-columns: minmax(0, 58fr) minmax(0, 42fr); }
	.latest-meta { display: flex; flex-wrap: wrap; gap: var(--space-4); color: var(--color-text-muted); font: var(--text-xs)/var(--leading-base) var(--font-body); font-variant-numeric: tabular-nums; }
	h3 { margin-top: var(--space-4); font: var(--text-2xl)/1.5 var(--font-heading); letter-spacing: var(--tracking-heading); overflow-wrap: anywhere; text-wrap: balance; }
	.latest-summary { max-width: 32em; margin-top: var(--space-4); color: var(--color-text-muted); font: var(--text-base)/var(--leading-base) var(--font-body); text-wrap: pretty; overflow-wrap: anywhere; }
	.latest-read { display: inline-flex; align-items: center; gap: var(--space-4); min-height: var(--touch-target); margin-top: var(--space-5); border-bottom: 1px solid var(--color-border); font: var(--text-sm)/1.5 var(--font-body); transition: border-color var(--duration-base) var(--ease-organic); }
	.latest-link:is(:hover, :focus-visible) .latest-read { border-color: currentColor; }
	.latest-image { margin-top: var(--space-2); }
	@media (max-width: 899px) {
		.latest-link.with-image { grid-template-columns: 1fr; }
		.latest-image { max-width: 24rem; margin-top: var(--space-3); }
	}
	@media (max-width: 600px) {
		.latest-inner { grid-template-columns: 1fr; gap: var(--space-5); padding-block: var(--space-5) var(--space-7); }
		.ink-rule { width: 88%; }
		.latest-heading { display: flex; align-items: baseline; flex-wrap: wrap; gap: var(--space-3); }
		h3 { font-size: var(--text-xl); }
		.latest-read { margin-top: var(--space-4); }
	}
</style>
