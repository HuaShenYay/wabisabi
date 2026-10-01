<script>
	import { onMount } from 'svelte';
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

	let activeCreed = $state(0);
	/** @type {HTMLElement[]} */
	let creedNodes = $state([]);

	onMount(() => {
		if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			return;
		}

		// Scroll spotlight for philosophical creeds (inspired by The Boat narrative focus)
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						const idx = creedNodes.indexOf(/** @type {HTMLElement} */ (entry.target));
						if (idx !== -1) {
							activeCreed = idx;
						}
					}
				}
			},
			{ rootMargin: '-24% 0px -24% 0px', threshold: 0.3 }
		);

		for (const node of creedNodes) {
			if (node) observer.observe(node);
		}

		return () => {
			observer.disconnect();
		};
	});
</script>

<section id="about" class="about" aria-labelledby="about-heading">
	<!-- 序卷 · 题跋 (Prologue / Preface) -->
	<div class="movement preface manuscript-grid" use:develop>
		<span class="chapter-watermark" aria-hidden="true">序</span>
		<header class="preface-head sticky-head" data-reveal-item>
			<span class="chapter-badge">序卷 · 题跋</span>
			<h2 id="about-heading">关于</h2>
			<p class="chapter-en">A personal note</p>
			<div class="preface-identity">
				<span class="identity-name">{profile.nameEn}</span>
				<span class="identity-loc">{profile.location}</span>
			</div>
		</header>
		<div class="preface-body">
			{#each biography as paragraph, index}
				<p
					class="bio-paragraph"
					class:preface-lead={index === 0}
					data-reveal-item
				>
					{paragraph}
				</p>
			{/each}
			<p class="preface-hail" data-reveal-item>
				<span class="hail-tag">来信</span>
				<a class="link-underline" href="mailto:{profile.email}">{profile.email}</a>
			</p>
		</div>
	</div>

	<!-- 一 · 志篇 · 心之所向 (Fields of inquiry) -->
	<section class="movement mv-focus manuscript-grid" aria-labelledby="focus-heading" use:develop>
		<span class="chapter-watermark" aria-hidden="true">志</span>
		<header class="mv-head sticky-head" data-reveal-item>
			<span class="chapter-badge">志篇 · 第一</span>
			<h3 id="focus-heading">心之所向</h3>
			<p class="chapter-en">Fields of inquiry</p>
		</header>
		<ul class="focus-list">
			{#each focusAreas as area, index}
				<li class="focus-item" data-reveal-item>
					<div class="f-top">
						<span class="f-num" aria-hidden="true">0{index + 1}</span>
						<h4 class="f-label">{area.label}</h4>
					</div>
					<p class="f-desc">{area.desc}</p>
				</li>
			{/each}
		</ul>
	</section>

	<!-- 二 · 行篇 · 学行 (Education & Journey) -->
	<section class="movement mv-edu manuscript-grid" aria-labelledby="education-heading" use:develop>
		<span class="chapter-watermark" aria-hidden="true">行</span>
		<header class="mv-head sticky-head" data-reveal-item>
			<span class="chapter-badge">行篇 · 第二</span>
			<h3 id="education-heading">学行</h3>
			<p class="chapter-en">Education &amp; Journey</p>
		</header>
		<ol class="edu-list">
			{#each education as edu}
				<li class="edu-item" data-reveal-item>
					<h4 class="e-school">{edu.school}</h4>
					<p class="e-major">{edu.major}</p>
					{#if edu.note}<p class="e-note">{edu.note}</p>{/if}
				</li>
			{/each}
		</ol>
	</section>

	<!-- 三 · 道篇 · 造物观 (A way of making · Philosophical Manifesto) -->
	<section class="movement mv-creed manuscript-grid" aria-labelledby="philosophy-heading" use:develop>
		<span class="chapter-watermark" aria-hidden="true">道</span>
		<header class="mv-head sticky-head" data-reveal-item>
			<span class="chapter-badge">道篇 · 第三</span>
			<h3 id="philosophy-heading">造物观</h3>
			<p class="chapter-en">A way of making</p>
		</header>
		<div class="creed">
			{#each designPhilosophy as philosophy, index}
				{@const parts = creedParts(philosophy.desc)}
				<blockquote
					bind:this={creedNodes[index]}
					class="creed-card"
					class:is-active-creed={activeCreed === index}
					data-reveal-item
				>
					<div class="creed-header">
						<span class="creed-badge">理念 · 0{index + 1}</span>
						<p class="creed-label">{philosophy.label}</p>
					</div>
					<p class="creed-lead">{parts[0]}</p>
					{#if parts[1]}<p class="creed-text">{parts[1]}</p>{/if}
				</blockquote>
			{/each}
			<div class="creed-action" data-reveal-item>
				<a class="creed-link link-underline" href="/projects" data-sveltekit-preload-data="hover">
					在作品中继续阅读 <span class="arrow" aria-hidden="true">↗</span>
				</a>
			</div>
		</div>
	</section>
</section>

<style>
	.about {
		position: relative;
		scroll-margin-top: var(--space-5);
	}

	.manuscript-grid {
		display: grid;
		grid-template-columns: 28fr 72fr;
		column-gap: var(--space-8);
		padding-inline: var(--grid-margin);
		max-width: var(--manuscript-width);
		margin-inline: auto;
		position: relative;
	}

	/* Faint, atmospheric calligraphy watermark seal for each narrative chapter (inspired by The Boat) */
	.chapter-watermark {
		position: absolute;
		right: 3%;
		top: var(--space-6);
		font-family: var(--font-heading);
		font-size: clamp(8rem, 16vw, 18rem);
		line-height: 1;
		color: var(--color-text);
		opacity: 0.038;
		pointer-events: none;
		user-select: none;
		z-index: 0;
	}

	/* Sticky Chapter Header Anchor (Seijaku / 静寂定力) */
	@media (min-width: 601px) {
		.sticky-head {
			position: sticky;
			top: 18svh;
			align-self: start;
			z-index: 2;
		}
	}

	.chapter-badge {
		display: inline-block;
		font: italic var(--text-xs)/var(--leading-base) var(--font-latin);
		color: var(--color-link);
		letter-spacing: .12em;
		margin-bottom: var(--space-2);
		text-transform: uppercase;
	}

	.chapter-en {
		font: italic var(--text-base)/var(--leading-base) var(--font-latin);
		color: var(--color-text-muted);
		margin-top: var(--space-1);
	}

	/* Movement Spacing & Transitions */
	.movement {
		padding-block: var(--space-8) var(--space-9);
		position: relative;
	}

	/* Still-Water develop transitions with viscous organic timing */
	.manuscript-grid:global(.is-developing) [data-reveal-item] {
		opacity: 0;
		transform: translateY(22px) rotate(var(--item-tilt, 0deg));
		filter: blur(4px);
	}
	.manuscript-grid:global(.is-developed) [data-reveal-item] {
		opacity: 1;
		transform: none;
		filter: none;
		transition:
			opacity 900ms var(--ease-organic),
			transform 900ms var(--ease-organic),
			filter 900ms var(--ease-organic);
		transition-delay: calc(var(--i, 0) * 85ms);
	}

	/* Section 0: 序卷 · 题跋 (Preface) */
	.preface {
		padding-top: var(--space-7);
		padding-bottom: var(--space-9);
	}
	.preface-head { padding-top: var(--space-2); }
	h2 {
		font: 400 var(--text-3xl)/var(--leading-tight) var(--font-heading);
		letter-spacing: .16em;
		margin-top: var(--space-2);
	}
	.preface-identity {
		margin-top: var(--space-6);
		font: italic var(--text-base)/var(--leading-base) var(--font-latin);
		color: var(--color-text-muted);
	}
	.identity-name { display: block; }
	.identity-loc {
		display: block;
		font: var(--text-sm)/var(--leading-base) var(--font-body);
		margin-top: var(--space-1);
		color: var(--color-text-faint);
	}

	.preface-body {
		max-width: 36em;
		padding-top: var(--space-3);
		position: relative;
		z-index: 1;
	}
	.bio-paragraph {
		font-size: var(--text-base);
		line-height: var(--leading-loose);
		text-wrap: pretty;
		color: var(--color-text);
		transition: color var(--duration-base) var(--ease-organic);
	}
	.bio-paragraph + .bio-paragraph { margin-top: var(--space-5); }
	.preface-lead {
		font: 400 var(--text-xl)/var(--leading-base) var(--font-heading);
		letter-spacing: var(--tracking-heading);
		color: var(--color-text);
		padding-bottom: var(--space-3);
		border-bottom: 1px solid var(--color-divider);
		margin-bottom: var(--space-5);
	}
	.preface-hail {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-4);
		margin-top: var(--space-7);
		font-size: var(--text-sm);
		line-height: var(--leading-base);
		color: var(--color-text-muted);
	}
	.hail-tag {
		font: var(--text-xs) var(--font-ui);
		letter-spacing: .1em;
		padding: 2px 8px;
		background: var(--color-link-wash);
		color: var(--color-link);
		border-radius: var(--radius-sharp);
	}
	.preface-hail a { overflow-wrap: anywhere; }

	/* Movement 一: 志篇 · 心之所向 (Inquiry) */
	.mv-focus { grid-template-columns: 38fr 62fr; }
	h3 {
		font: 400 var(--text-2xl)/var(--leading-tight) var(--font-heading);
		letter-spacing: var(--tracking-heading);
		margin-top: var(--space-2);
	}
	.focus-list {
		padding-top: var(--space-2);
		position: relative;
		z-index: 1;
	}
	.focus-item {
		position: relative;
		padding-block: var(--space-5) var(--space-6);
		border-top: 1px solid var(--color-border);
		transition: transform var(--duration-base) var(--ease-organic), background-color var(--duration-base) var(--ease-organic);
	}
	/* Hairline brush-draw animation on reveal */
	.focus-item::before {
		content: '';
		position: absolute;
		top: -1px;
		left: 0;
		right: 0;
		height: 1px;
		background: var(--color-link);
		transform: scaleX(0);
		transform-origin: left center;
		transition: transform 950ms var(--ease-organic);
	}
	:global(.is-developed) .focus-item::before {
		transform: scaleX(1);
	}
	.focus-item:nth-child(2) {
		margin-left: var(--space-5);
		--item-tilt: 0.18deg;
	}
	.focus-item:nth-child(3) {
		margin-left: var(--space-3);
		--item-tilt: -0.15deg;
	}
	.focus-item:hover {
		transform: translateX(4px);
	}
	.focus-item:hover .f-label {
		color: var(--color-link);
	}

	.f-top {
		display: flex;
		align-items: baseline;
		gap: var(--space-3);
	}
	.f-num {
		font: italic var(--text-xs) var(--font-latin);
		color: var(--color-link);
		letter-spacing: .08em;
	}
	.f-label {
		font: 400 var(--text-xl)/var(--leading-tight) var(--font-heading);
		letter-spacing: var(--tracking-heading);
		transition: color var(--duration-base) var(--ease-organic);
	}
	.f-desc {
		max-width: 28em;
		margin-top: var(--space-3);
		font-size: var(--text-base);
		line-height: var(--leading-base);
		color: var(--color-text-muted);
	}

	/* Movement 二: 行篇 · 学行 (Education Timeline) */
	.mv-edu { grid-template-columns: 46fr 54fr; }
	.edu-list {
		position: relative;
		padding-left: var(--space-6);
		border-left: 1px solid var(--color-border);
		z-index: 1;
	}
	.edu-item {
		position: relative;
		padding-block: var(--space-3) var(--space-6);
	}
	.edu-item:last-child { padding-bottom: var(--space-3); }
	/* Golden kintsugi / ink droplet node */
	.edu-item::before {
		content: '';
		position: absolute;
		top: calc(var(--space-4) + 2px);
		left: calc(-1 * var(--space-6) - 3.5px);
		width: 7px;
		height: 7px;
		background: var(--color-link);
		border-radius: 50%;
		box-shadow: 0 0 0 2px var(--color-bg);
		transition: transform var(--duration-base) var(--ease-organic);
	}
	.edu-item:hover::before {
		transform: scale(1.35);
		background: var(--color-link-hover);
	}
	.e-school {
		max-width: 22em;
		font: 400 var(--text-lg)/var(--leading-base) var(--font-heading);
	}
	.e-major {
		font-size: var(--text-sm);
		line-height: var(--leading-base);
		color: var(--color-text-muted);
		margin-top: var(--space-2);
	}
	.e-note {
		margin-top: var(--space-3);
		font-size: var(--text-sm);
		line-height: var(--leading-base);
		color: var(--color-text-muted);
	}

	/* Movement 三: 道篇 · 造物观 (Creed Scrollytelling) */
	.mv-creed {
		position: relative;
		isolation: isolate;
		grid-template-columns: 26fr 74fr;
		padding-block: var(--space-8);
	}
	.mv-creed::before {
		content: '';
		position: absolute;
		z-index: -1;
		inset: 0 calc(-1 * max(0px, (100vw - var(--manuscript-width)) / 2));
		background: var(--color-bg-alt);
	}
	.creed {
		max-width: 40em;
		position: relative;
		z-index: 1;
	}
	.creed-card {
		position: relative;
		padding-left: var(--space-5);
		border-left: 2px solid transparent;
		transition:
			opacity var(--duration-slow) var(--ease-organic),
			border-color var(--duration-slow) var(--ease-organic),
			transform var(--duration-slow) var(--ease-organic);
		opacity: 0.52;
	}
	.creed-card + .creed-card { margin-top: var(--space-8); }
	/* Active creed in reading zone illuminates with full ink richness */
	.creed-card.is-active-creed {
		opacity: 1;
		border-left-color: var(--color-link);
		transform: translateX(2px);
	}

	.creed-header {
		display: flex;
		align-items: baseline;
		gap: var(--space-3);
		margin-bottom: var(--space-4);
	}
	.creed-badge {
		font: italic var(--text-xs) var(--font-latin);
		color: var(--color-link);
		letter-spacing: .08em;
	}
	.creed-label {
		font: italic var(--text-base)/var(--leading-base) var(--font-latin);
		color: var(--color-text-muted);
	}
	.creed-lead {
		max-width: 22em;
		font: 400 var(--text-2xl)/var(--leading-base) var(--font-heading);
		text-wrap: pretty;
		color: var(--color-text);
	}
	.creed-text {
		max-width: 33em;
		margin-top: var(--space-5);
		font-size: var(--text-base);
		line-height: var(--leading-loose);
		color: var(--color-text-muted);
		text-wrap: pretty;
	}
	.creed-action {
		margin-top: var(--space-7);
	}
	.creed-link {
		display: inline-flex;
		align-items: center;
		gap: var(--space-3);
		min-height: 44px;
		font-size: var(--text-sm);
		padding: var(--space-2) var(--space-4);
		background: var(--color-link-wash);
		border-radius: var(--radius-sharp);
		transition: background-color var(--duration-base) var(--ease-organic), color var(--duration-base) var(--ease-organic);
	}
	.creed-link:hover {
		background: var(--color-link);
		color: var(--color-bg);
	}
	.creed-link .arrow {
		transition: transform var(--duration-base) var(--ease-organic);
	}
	.creed-link:hover .arrow {
		transform: translate(2px, -2px);
	}

	@media (max-width: 900px) {
		.manuscript-grid { column-gap: var(--space-6); }
		.preface { grid-template-columns: 30fr 70fr; }
		.mv-edu { grid-template-columns: 34fr 66fr; }
		.mv-creed { grid-template-columns: 30fr 70fr; }
		.chapter-watermark { font-size: clamp(6rem, 12vw, 10rem); }
	}

	@media (max-width: 600px) {
		.manuscript-grid { grid-template-columns: 1fr; row-gap: var(--space-6); }
		.preface { padding-block: var(--space-6) var(--space-8); }
		.preface-head { display: grid; grid-template-columns: 1fr 1fr; column-gap: var(--space-4); }
		.preface-head .chapter-badge,
		.preface-head .chapter-en { grid-column: 1 / -1; }
		h2 { font-size: var(--text-2xl); }
		.preface-identity { margin-top: var(--space-4); text-align: right; }
		.preface-body { padding-top: 0; }
		.preface-lead { font-size: var(--text-lg); }
		.preface-hail { margin-top: var(--space-5); gap: var(--space-3); }
		.movement { padding-block: var(--space-6) var(--space-8); }
		.mv-head { display: grid; grid-template-columns: auto 1fr; column-gap: var(--space-4); align-items: baseline; }
		.mv-head .chapter-badge { grid-column: 1 / -1; }
		h3 { font-size: var(--text-xl); margin-bottom: 0; }
		.mv-head .chapter-en { grid-column: 2; margin-top: var(--space-2); }
		.focus-list { padding-top: 0; }
		.focus-item { padding-block: var(--space-4) var(--space-5); }
		.focus-item:nth-child(2) { margin-left: var(--space-4); }
		.focus-item:nth-child(3) { margin-left: var(--space-2); }
		.f-label { font-size: var(--text-lg); }
		.mv-creed { padding-block: var(--space-7); }
		.creed-lead { font-size: var(--text-xl); }
		.creed-text { margin-top: var(--space-4); }
		.chapter-watermark { display: none; }
		.creed-card { opacity: 1 !important; }
	}

	@media (prefers-reduced-motion: reduce) {
		.manuscript-grid:global(.is-developing) [data-reveal-item],
		.manuscript-grid:global(.is-developed) [data-reveal-item] {
			opacity: 1;
			transform: none;
			filter: none;
			transition: none;
		}
		.focus-item::before {
			transform: scaleX(1) !important;
			transition: none !important;
		}
		.creed-card {
			opacity: 1 !important;
			border-left-color: var(--color-link) !important;
			transform: none !important;
			transition: none !important;
		}
	}
</style>
