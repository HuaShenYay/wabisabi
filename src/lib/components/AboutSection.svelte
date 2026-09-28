<script>
	import { develop } from '$lib/actions/develop.js';
	import { profile as seedProfile } from '$lib/domain/profile.js';
	import { focusAreas as seedFocus, education as seedEducation, designPhilosophy as seedPhilosophy } from '$lib/domain/portfolio.js';

	let { data } = $props();
	const profile = $derived(data?.profile ?? seedProfile);
	const focusAreas = $derived(data?.focusAreas ?? seedFocus);
	const education = $derived(data?.education ?? seedEducation);
	const designPhilosophy = $derived(data?.philosophy ?? seedPhilosophy);
	const biography = $derived(String(profile.bio).split(/(?<=[。！？])/).filter((part) => part.trim()));

	/** @param {string} text */
	function creedParts(text) {
		const separator = text.indexOf(' - ');
		return separator < 0 ? [text, ''] : [text.slice(0, separator), text.slice(separator + 3)];
	}
</script>

<section id="about" class="about" aria-labelledby="about-heading">
	<div class="preface manuscript-grid" use:develop>
		<header class="preface-head">
			<p class="chapter-en">A personal note</p>
			<h2 id="about-heading">关于</h2>
			<p class="preface-identity">{profile.nameEn}<span>{profile.location}</span></p>
		</header>
		<div class="preface-body">
			{#each biography as paragraph, index}
				<p class:preface-lead={index === 0} class="bio-paragraph">{paragraph}</p>
			{/each}
			<p class="preface-hail">
				<span>来信</span>
				<a class="link-underline" href="mailto:{profile.email}">{profile.email}</a>
			</p>
		</div>
	</div>

	<section class="movement mv-focus manuscript-grid" aria-labelledby="focus-heading" use:develop>
		<header class="mv-head">
			<span class="chapter-mark" aria-hidden="true">一</span>
			<h3 id="focus-heading">心之所向</h3>
			<p class="chapter-en">Fields of inquiry</p>
		</header>
		<ul class="focus-list">
			{#each focusAreas as area}
				<li>
					<h4 class="f-label">{area.label}</h4>
					<p class="f-desc">{area.desc}</p>
				</li>
			{/each}
		</ul>
	</section>

	<section class="movement mv-edu manuscript-grid" aria-labelledby="education-heading" use:develop>
		<header class="mv-head">
			<span class="chapter-mark" aria-hidden="true">二</span>
			<h3 id="education-heading">学行</h3>
			<p class="chapter-en">Education</p>
		</header>
		<ol class="edu-list">
			{#each education as edu}
				<li>
					<h4 class="e-school">{edu.school}</h4>
					<p class="e-major">{edu.major}</p>
					{#if edu.note}<p class="e-note">{edu.note}</p>{/if}
				</li>
			{/each}
		</ol>
	</section>

	<section class="movement mv-creed manuscript-grid" aria-labelledby="philosophy-heading" use:develop>
		<header class="mv-head">
			<span class="chapter-mark" aria-hidden="true">三</span>
			<h3 id="philosophy-heading">造物观</h3>
			<p class="chapter-en">A way of making</p>
		</header>
		<div class="creed">
			{#each designPhilosophy as philosophy}
				{@const parts = creedParts(philosophy.desc)}
				<blockquote>
					<p class="creed-label">{philosophy.label}</p>
					<p class="creed-lead">{parts[0]}</p>
					{#if parts[1]}<p class="creed-text">{parts[1]}</p>{/if}
				</blockquote>
			{/each}
			<a class="creed-link link-underline" href="/projects" data-sveltekit-preload-data="hover">在作品中继续阅读 <span aria-hidden="true">↗</span></a>
		</div>
	</section>
</section>

<style>
	.about { position: relative; scroll-margin-top: var(--space-5); }
	.manuscript-grid {
		display: grid;
		grid-template-columns: 28fr 72fr;
		column-gap: var(--space-8);
		padding-inline: var(--grid-margin);
		max-width: var(--manuscript-width);
		margin-inline: auto;
	}
	/* Let the writing surface gently, without smearing readable text. */
	.manuscript-grid:global(.is-developing) > * { opacity: 0; filter: none; transform: translateY(var(--space-3)); }
	.manuscript-grid:global(.is-developed) > * {
		opacity: 1;
		filter: none;
		transform: none;
		transition: opacity calc(var(--duration-slow) + var(--duration-base)) var(--ease-organic), transform calc(var(--duration-slow) + var(--duration-base)) var(--ease-organic);
		transition-delay: calc(var(--i, 0) * var(--duration-fast));
	}
	.preface {
		padding-top: var(--space-7);
		padding-bottom: var(--space-9);
	}
	.preface-head { padding-top: var(--space-2); }
	.chapter-en { font: italic var(--text-base)/var(--leading-base) var(--font-latin); color: var(--color-text-muted); }
	h2 { font: 400 var(--text-3xl)/var(--leading-tight) var(--font-heading); letter-spacing: .16em; margin-top: var(--space-4); }
	.preface-identity { margin-top: var(--space-6); font: italic var(--text-base)/var(--leading-base) var(--font-latin); color: var(--color-text-muted); }
	.preface-identity span { display: block; font: var(--text-sm)/var(--leading-base) var(--font-body); margin-top: var(--space-2); }
	.preface-body { max-width: 34em; padding-top: var(--space-3); }
	.bio-paragraph { font-size: var(--text-base); line-height: var(--leading-loose); text-wrap: pretty; }
	.bio-paragraph + .bio-paragraph { margin-top: var(--space-4); }
	.preface-lead { font: 400 var(--text-xl)/var(--leading-base) var(--font-heading); }
	.preface-hail { display: flex; flex-wrap: wrap; align-items: baseline; gap: var(--space-4); margin-top: var(--space-6); font-size: var(--text-sm); line-height: var(--leading-base); color: var(--color-text-muted); }
	.preface-hail a { overflow-wrap: anywhere; }
	.movement { padding-block: var(--space-7) var(--space-9); }
	.mv-head { align-self: start; }
	.chapter-mark { display: block; font: var(--text-sm)/var(--leading-base) var(--font-heading); color: var(--color-text-muted); margin-bottom: var(--space-4); }
	h3 { font: 400 var(--text-2xl)/var(--leading-tight) var(--font-heading); letter-spacing: var(--tracking-heading); margin-bottom: var(--space-3); }
	.mv-focus { grid-template-columns: 38fr 62fr; }
	.focus-list { padding-top: var(--space-4); }
	.focus-list li { padding-block: var(--space-5); border-top: 1px solid var(--color-border); }
	.focus-list li:nth-child(2) { margin-left: var(--space-6); }
	.focus-list li:nth-child(3) { margin-left: var(--space-4); }
	.f-label { font: 400 var(--text-xl)/var(--leading-tight) var(--font-heading); letter-spacing: var(--tracking-heading); }
	.f-desc { max-width: 26em; margin-top: var(--space-3); font-size: var(--text-base); line-height: var(--leading-base); color: var(--color-text-muted); }
	.mv-edu { grid-template-columns: 46fr 54fr; padding-top: var(--space-6); }
	.edu-list { padding-left: var(--space-5); border-left: 1px solid var(--color-border); }
	.edu-list li { position: relative; padding-block: var(--space-3) var(--space-6); }
	.edu-list li:last-child { padding-bottom: var(--space-3); }
	.edu-list li::before { content: ''; position: absolute; top: var(--space-4); left: calc(-1 * var(--space-5) - var(--space-1) / 2); width: var(--space-1); height: var(--space-1); background: var(--color-text-muted); border-radius: var(--radius-sharp); }
	.e-school { max-width: 20em; font: 400 var(--text-lg)/var(--leading-base) var(--font-heading); }
	.e-major { font-size: var(--text-sm); line-height: var(--leading-base); color: var(--color-text-muted); margin-top: var(--space-2); }
	.e-note { margin-top: var(--space-3); font-size: var(--text-sm); line-height: var(--leading-base); color: var(--color-text-muted); }
	.mv-creed {
		position: relative;
		isolation: isolate;
		grid-template-columns: 22fr 78fr;
		padding-block: var(--space-8);
	}
	.mv-creed::before { content: ''; position: absolute; z-index: -1; inset: 0 calc(-1 * max(0px, (100vw - var(--manuscript-width)) / 2)); background: var(--color-bg-alt); }
	.creed { max-width: 38em; }
	.creed blockquote + blockquote { margin-top: var(--space-7); }
	.creed-label { font: italic var(--text-base)/var(--leading-base) var(--font-latin); color: var(--color-text-muted); margin-bottom: var(--space-5); }
	.creed-lead { max-width: 19em; font: 400 var(--text-2xl)/var(--leading-base) var(--font-heading); text-wrap: pretty; }
	.creed-text { max-width: 31em; margin-top: var(--space-5); font-size: var(--text-base); line-height: var(--leading-loose); color: var(--color-text-muted); text-wrap: pretty; }
	.creed-link { display: inline-flex; align-items: center; gap: var(--space-4); min-height: 44px; margin-top: var(--space-6); font-size: var(--text-sm); }

	@media (max-width: 900px) {
		.manuscript-grid { column-gap: var(--space-6); }
		.preface { grid-template-columns: 30fr 70fr; }
		.mv-edu { grid-template-columns: 34fr 66fr; }
		.mv-creed { grid-template-columns: 30fr 70fr; }
	}
	@media (max-width: 600px) {
		.manuscript-grid { grid-template-columns: 1fr; row-gap: var(--space-6); }
		.preface { padding-block: var(--space-6) var(--space-8); }
		.preface-head { display: grid; grid-template-columns: 1fr 1fr; column-gap: var(--space-4); }
		.preface-head .chapter-en { grid-column: 1 / -1; }
		h2 { font-size: var(--text-2xl); }
		.preface-identity { margin-top: var(--space-4); text-align: right; }
		.preface-body { padding-top: 0; }
		.preface-lead { font-size: var(--text-lg); }
		.preface-hail { margin-top: var(--space-5); gap: var(--space-3); }
		.movement { padding-block: var(--space-6) var(--space-8); }
		.mv-head { display: grid; grid-template-columns: auto 1fr; column-gap: var(--space-4); align-items: baseline; }
		.chapter-mark { margin-bottom: 0; }
		h3 { font-size: var(--text-xl); margin-bottom: 0; }
		.mv-head .chapter-en { grid-column: 2; margin-top: var(--space-2); }
		.focus-list { padding-top: 0; }
		.focus-list li { padding-block: var(--space-4) var(--space-5); }
		.focus-list li:nth-child(2) { margin-left: var(--space-4); }
		.focus-list li:nth-child(3) { margin-left: var(--space-2); }
		.f-label { font-size: var(--text-lg); }
		.mv-creed { padding-block: var(--space-7); }
		.creed-lead { font-size: var(--text-xl); }
		.creed-text { margin-top: var(--space-4); }
	}
	@media (prefers-reduced-motion: reduce) {
		.manuscript-grid:global(.is-developing) > *, .manuscript-grid:global(.is-developed) > * { opacity: 1; transform: none; transition: none; }
	}
</style>
