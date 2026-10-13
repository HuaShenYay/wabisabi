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

	const cnNumerals = ['壹', '贰', '叁', '肆', '伍', '陆'];

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
	<!-- Architectural Joint: directly bridges Hero into About within the 3D Karesansui space -->
	<div class="continuum-joint machine" aria-hidden="true">
		<span class="joint-notch"></span>
		<span class="joint-coord">KARESANSUI CONTINUUM // 00°00'N — TRANSIT INTO MANUSCRIPT</span>
		<span class="joint-rule"></span>
		<span class="joint-cn">渡 · 入卷</span>
	</div>

	<!-- 序卷 · 题跋 (Prologue / Preface) -->
	<div class="movement preface manuscript-grid" use:develop>
		<span class="chapter-watermark" aria-hidden="true">序</span>
		<header class="preface-head sticky-head" data-reveal-item>
			<span class="chapter-badge">序卷 · 题跋 // FOLIO 00</span>
			<div class="art-title-lockup">
				<span class="art-latin-display" aria-hidden="true">PROLOGUE</span>
				<h2 id="about-heading" class="art-heading">
					<span class="art-char char-up">关</span><span class="art-char char-down">于</span>
				</h2>
			</div>
			<p class="chapter-en">A personal note on the uncarved</p>
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
					{#if index === 0}
						<span class="lead-rubbing-mark" aria-hidden="true">「题记」</span>
					{/if}
					{paragraph}
				</p>
			{/each}
			<p class="preface-hail" data-reveal-item>
				<span class="hail-tag">尺素 · 来信</span>
				<a class="link-underline" href="mailto:{profile.email}">{profile.email}</a>
			</p>
		</div>
	</div>

	<!-- 一 · 志篇 · 心之所向 (Fields of inquiry) -->
	<section class="movement mv-focus manuscript-grid" aria-labelledby="focus-heading" use:develop>
		<span class="chapter-watermark" aria-hidden="true">志</span>
		<header class="mv-head sticky-head" data-reveal-item>
			<span class="chapter-badge">志篇 · 第一 // FOLIO 01</span>
			<div class="art-title-lockup">
				<span class="art-latin-display" aria-hidden="true">INQUIRY</span>
				<h3 id="focus-heading" class="art-heading art-heading--vertical">
					<span class="art-char char-up">心</span><span class="art-char char-mid">之</span><span class="art-char char-down">所</span><span class="art-char char-up">向</span>
				</h3>
			</div>
			<p class="chapter-en">Fields of inquiry</p>
		</header>
		<ul class="focus-list">
			{#each focusAreas as area, index}
				<li class="focus-item" data-reveal-item>
					<div class="f-top">
						<div class="f-art-num" aria-hidden="true">
							<span class="f-kanji-num">{cnNumerals[index] ?? index + 1}</span>
							<span class="f-orelo-num">0{index + 1}</span>
						</div>
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
			<span class="chapter-badge">行篇 · 第二 // FOLIO 02</span>
			<div class="art-title-lockup">
				<span class="art-latin-display" aria-hidden="true">SOJOURN</span>
				<h3 id="education-heading" class="art-heading art-heading--vertical">
					<span class="art-char char-up">学</span><span class="art-char char-down">行</span>
				</h3>
			</div>
			<p class="chapter-en">Education &amp; Footsteps</p>
		</header>
		<ol class="edu-list">
			{#each education as edu, index}
				<li class="edu-item" data-reveal-item>
					<span class="edu-art-stamp" aria-hidden="true">{cnNumerals[index] ?? index + 1} · 0{index + 1}</span>
					<h4 class="e-school">{edu.school}</h4>
					<p class="e-major">{edu.major}</p>
					{#if edu.note}<p class="e-note">{edu.note}</p>{/if}
				</li>
			{/each}
		</ol>
	</section>

	<!-- 三 · 道篇 · 造物观 (A way of making · Philosophical Manifesto) -->
	<section class="movement mv-creed manuscript-grid night-ink" aria-labelledby="philosophy-heading" use:develop>
		<span class="chapter-watermark" aria-hidden="true">道</span>
		<header class="mv-head sticky-head" data-reveal-item>
			<span class="chapter-badge">道篇 · 第三 // FOLIO 03</span>
			<div class="art-title-lockup">
				<span class="art-latin-display" aria-hidden="true">POETICS</span>
				<h3 id="philosophy-heading" class="art-heading art-heading--vertical">
					<span class="art-char char-up">造</span><span class="art-char char-mid">物</span><span class="art-char char-down">观</span>
				</h3>
			</div>
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
						<span class="creed-art-num" aria-hidden="true">{cnNumerals[index] ?? index + 1}</span>
						<span class="creed-badge">MANIFESTO · 0{index + 1}</span>
						<p class="creed-label">{philosophy.label}</p>
					</div>
					<p class="creed-lead">{parts[0]}</p>
					{#if parts[1]}<p class="creed-text">{parts[1]}</p>{/if}
				</blockquote>
			{/each}
			<div class="creed-action" data-reveal-item>
				<a class="creed-link link-underline" href="/projects" data-sveltekit-preload-data="hover">
					<span>在作品中继续阅读</span>
					<span class="creed-link-en">ENTER ARCHIVE</span>
					<span class="arrow" aria-hidden="true">↗</span>
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

	/* Architectural seam connecting Hero directly into About */
	.continuum-joint {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding-inline: var(--grid-margin);
		max-width: var(--manuscript-width);
		margin-inline: auto;
		padding-block: var(--space-4);
		color: var(--color-text-muted);
		position: relative;
		z-index: 2;
	}
	.joint-notch {
		width: 9px;
		height: 9px;
		background: var(--color-text);
		clip-path: polygon(10% 0%, 100% 18%, 84% 100%, 0% 82%);
		filter: url(#wabi-rough);
	}
	.joint-rule {
		flex: 1;
		height: 1.5px;
		background: linear-gradient(90deg, var(--color-text-muted), rgba(42, 41, 36, 0.08));
		filter: url(#wabi-rough);
	}
	.joint-cn {
		font-family: var(--font-heading);
		font-size: var(--text-sm);
		letter-spacing: 0.36em;
		color: var(--color-text);
		filter: url(#wabi-rough);
	}

	.manuscript-grid {
		display: grid;
		grid-template-columns: 30fr 70fr;
		column-gap: var(--space-8);
		padding-inline: var(--grid-margin);
		max-width: var(--manuscript-width);
		margin-inline: auto;
		position: relative;
		z-index: 1;
	}

	/* Colossal eroded woodblock glyph (巨物刀刻飞白艺术字) */
	.chapter-watermark {
		position: absolute;
		right: -0.06em;
		top: var(--space-4);
		font-family: var(--font-heading);
		font-size: clamp(9rem, 22vw, 23rem);
		line-height: 0.88;
		letter-spacing: var(--tracking-crush);
		color: rgba(42, 41, 36, 0.06);
		-webkit-text-stroke: 1.5px color-mix(in srgb, var(--color-text) 26%, transparent);
		text-shadow:
			7px -4px 0 rgba(169, 124, 90, 0.14),
			-3px 3px 0 rgba(42, 41, 36, 0.08);
		filter: url(#wabi-erosion);
		pointer-events: none;
		user-select: none;
		z-index: 0;
	}

	/* Sticky Chapter Header Anchor */
	@media (min-width: 601px) {
		.sticky-head {
			position: sticky;
			top: 16svh;
			align-self: start;
			z-index: 2;
		}
	}

	.chapter-badge {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font: 400 var(--text-micro)/1.6 var(--font-machine);
		color: var(--color-text-muted);
		letter-spacing: var(--tracking-machine);
		margin-bottom: var(--space-3);
		text-transform: uppercase;
	}
	.chapter-badge::before {
		content: '';
		width: var(--space-5);
		height: 1.5px;
		background: currentColor;
		opacity: .75;
		filter: url(#wabi-rough);
	}

	/* Bold Artistic Typography Lockup: Orelo Display Latin + Broken-Axis Eroded OldSong */
	.art-title-lockup {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		margin-block: var(--space-2) var(--space-3);
	}
	.art-latin-display {
		font-family: var(--font-display-latin);
		font-size: clamp(2.1rem, 4.2vw, 4.4rem);
		line-height: 0.86;
		letter-spacing: -0.03em;
		color: rgba(42, 41, 36, 0.16);
		text-transform: uppercase;
		user-select: none;
		filter: url(#wabi-rough);
		transform: translateX(-4px);
	}
	.art-heading {
		font-family: var(--font-heading);
		font-size: clamp(3rem, 5.2vw, 5.6rem);
		font-weight: 400;
		line-height: 0.96;
		letter-spacing: -0.02em;
		color: var(--color-text);
		margin-top: -0.28em;
		display: inline-flex;
		align-items: baseline;
		gap: 0.06em;
		text-shadow:
			4px -2px 0 rgba(169, 124, 90, 0.22),
			-1px 2px 0 rgba(243, 239, 230, 0.8);
		filter: url(#wabi-rough);
	}
	.art-char {
		display: inline-block;
	}
	.char-up {
		transform: translateY(-0.08em) rotate(-1.2deg);
	}
	.char-mid {
		font-size: 0.76em;
		transform: translateY(0.06em) rotate(1.5deg);
		opacity: 0.88;
	}
	.char-down {
		transform: translateY(0.12em) rotate(0.8deg);
	}

	@media (min-width: 901px) {
		.art-heading--vertical {
			writing-mode: vertical-rl;
			font-size: clamp(2.6rem, 4.2vw, 4.5rem);
			line-height: 1.05;
			letter-spacing: 0.16em;
			margin-top: -0.15em;
			margin-left: var(--space-3);
		}
		.art-heading--vertical .char-up {
			transform: translateX(-0.08em) rotate(-1.2deg);
		}
		.art-heading--vertical .char-mid {
			transform: translateX(0.1em) rotate(1.6deg);
		}
		.art-heading--vertical .char-down {
			transform: translateX(0.08em) rotate(0.8deg);
		}
	}

	.chapter-en {
		font: italic var(--text-base)/var(--leading-base) var(--font-latin);
		color: var(--color-text-muted);
		margin-top: var(--space-1);
	}

	.movement {
		padding-block: var(--space-8) var(--space-9);
		position: relative;
	}

	/* ===== Gritty, Rough, Stepped Stop-Motion Reveal (颗粒感 · 粗糙感 · 卡顿感) =====
	   Replaces modern smooth cubic-bezier transitions with a 4-step woodblock rubbing
	   ratchet (steps(4, end)) and registration jitter. */
	.manuscript-grid:global(.is-developing) [data-reveal-item] {
		opacity: 0;
		transform: translate(-4px, 12px) skewX(-1.2deg);
		clip-path: inset(0 0 88% 0);
	}
	.manuscript-grid:global(.is-developed) [data-reveal-item] {
		animation: woodblock-rubbing 520ms steps(4, end) both;
		animation-delay: calc(var(--i, 0) * 140ms);
	}

	@keyframes woodblock-rubbing {
		0% {
			opacity: 0;
			transform: translate(-5px, 12px) skewX(-1.5deg);
			clip-path: inset(0 0 86% 0);
		}
		25% {
			opacity: 0.42;
			transform: translate(4px, 6px) skewX(0.9deg);
			clip-path: inset(0 0 52% 0);
		}
		50% {
			opacity: 0.78;
			transform: translate(-2px, 3px) skewX(-0.4deg);
			clip-path: inset(0 0 18% 0);
		}
		75% {
			opacity: 0.94;
			transform: translate(1px, -1px);
			clip-path: inset(0 0 4% 0);
		}
		100% {
			opacity: 1;
			transform: none;
			clip-path: inset(0 0 0% 0);
		}
	}

	/* Section 0: 序卷 · 题跋 (Preface) */
	.preface {
		padding-top: var(--space-6);
		padding-bottom: var(--space-9);
	}
	.preface-head { padding-top: var(--space-2); }
	.preface-identity {
		margin-top: var(--space-5);
		padding-left: var(--space-3);
		border-left: 2px solid var(--color-text);
		filter: url(#wabi-rough);
	}
	.identity-name {
		display: block;
		font: 400 var(--text-micro)/1.6 var(--font-machine);
		letter-spacing: var(--tracking-machine);
		text-transform: uppercase;
		color: var(--color-text);
	}
	.identity-loc {
		display: block;
		font: var(--text-sm)/var(--leading-base) var(--font-body);
		margin-top: var(--space-1);
		color: var(--color-text-muted);
	}

	.preface-body {
		max-width: 38em;
		padding: var(--space-5) var(--space-6);
		position: relative;
		z-index: 1;
		background: color-mix(in srgb, var(--color-bg) 88%, transparent);
		backdrop-filter: blur(8px) saturate(95%);
		border: 1px solid var(--color-border);
		box-shadow: var(--shadow-paper);
	}
	.bio-paragraph {
		font-size: var(--text-base);
		line-height: var(--leading-loose);
		text-wrap: pretty;
		color: var(--color-text);
	}
	.bio-paragraph + .bio-paragraph { margin-top: var(--space-5); }
	.preface-lead {
		font: 400 var(--text-2xl)/var(--leading-base) var(--font-heading);
		letter-spacing: var(--tracking-heading);
		color: var(--color-text);
		padding-bottom: var(--space-4);
		border-bottom: 1.5px solid var(--color-text);
		margin-bottom: var(--space-5);
		text-shadow: 2px -1px 0 rgba(169, 124, 90, 0.16);
	}
	.lead-rubbing-mark {
		font-family: var(--font-heading);
		font-size: var(--text-sm);
		letter-spacing: 0.2em;
		color: var(--color-seal);
		margin-right: var(--space-2);
		vertical-align: super;
		filter: url(#wabi-rough);
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
		font: var(--text-xs) var(--font-heading);
		letter-spacing: .24em;
		padding: 3px 10px;
		border: 1px solid var(--color-link);
		background: var(--color-link-wash);
		color: var(--color-link-hover);
		filter: url(#wabi-rough);
	}
	.preface-hail a { overflow-wrap: anywhere; }

	/* Movement 一: 志篇 · 心之所向 (Inquiry) */
	.mv-focus { grid-template-columns: 36fr 64fr; }
	.focus-list {
		padding-top: var(--space-2);
		position: relative;
		z-index: 1;
	}
	.focus-item {
		position: relative;
		padding: var(--space-5) var(--space-5) var(--space-6);
		border-top: 1.5px solid var(--color-border);
		background: color-mix(in srgb, var(--color-bg) 86%, transparent);
		backdrop-filter: blur(6px);
		border-inline: 1px solid var(--color-divider);
		transition:
			transform 160ms steps(2, end),
			background-color 160ms steps(2, end);
	}
	/* Rough dry-brush woodblock top bar — stamps in 3 discrete steps */
	.focus-item::before {
		content: '';
		position: absolute;
		top: -1.5px;
		left: 0;
		right: 0;
		height: 2px;
		background: var(--color-text);
		filter: url(#wabi-rough);
		transform: scaleX(0);
		transform-origin: left center;
		transition: transform 360ms steps(3, end);
	}
	:global(.is-developed) .focus-item::before {
		transform: scaleX(1);
	}
	.focus-item:nth-child(2) {
		margin-left: var(--space-6);
		--item-tilt: 0.25deg;
	}
	.focus-item:nth-child(3) {
		margin-left: var(--space-3);
		--item-tilt: -0.22deg;
	}
	.focus-item:hover {
		transform: translate(4px, -2px);
	}
	.focus-item:hover .f-label {
		color: var(--color-link-hover);
		text-shadow: 3px -2px 0 rgba(169, 124, 90, 0.24);
	}

	.f-top {
		display: flex;
		align-items: baseline;
		gap: var(--space-4);
	}
	.f-art-num {
		position: relative;
		display: inline-flex;
		align-items: baseline;
		gap: 4px;
		filter: url(#wabi-rough);
	}
	.f-kanji-num {
		font-family: var(--font-heading);
		font-size: var(--text-2xl);
		line-height: 1;
		color: var(--color-link);
		opacity: 0.85;
	}
	.f-orelo-num {
		font-family: var(--font-display-latin);
		font-size: var(--text-lg);
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
	}
	.f-label {
		font: 400 clamp(1.5rem, 1.2rem + 1.1vw, 2.25rem)/var(--leading-tight) var(--font-heading);
		letter-spacing: var(--tracking-heading);
		filter: url(#wabi-rough);
		transition:
			color 160ms steps(2, end),
			text-shadow 160ms steps(2, end);
	}
	.f-desc {
		max-width: 28em;
		margin-top: var(--space-3);
		font-size: var(--text-base);
		line-height: var(--leading-base);
		color: var(--color-text-muted);
	}

	/* Movement 二: 行篇 · 学行 (Education Timeline) */
	.mv-edu { grid-template-columns: 44fr 56fr; }
	.edu-list {
		position: relative;
		padding-left: var(--space-6);
		padding-right: var(--space-4);
		border-left: 2px solid var(--color-text);
		z-index: 1;
		background: color-mix(in srgb, var(--color-bg) 86%, transparent);
		backdrop-filter: blur(6px);
		border-right: 1px solid var(--color-divider);
	}
	.edu-item {
		position: relative;
		padding-block: var(--space-4) var(--space-6);
	}
	.edu-item:last-child { padding-bottom: var(--space-3); }
	/* Jagged carved stone shard node (replaces modern round dot) */
	.edu-item::before {
		content: '';
		position: absolute;
		top: calc(var(--space-4) + 4px);
		left: calc(-1 * var(--space-6) - 6px);
		width: 11px;
		height: 11px;
		background: var(--color-text);
		clip-path: polygon(14% 0%, 94% 12%, 100% 86%, 20% 100%, 0% 64%);
		filter: url(#wabi-rough);
		transition:
			transform 140ms steps(2, end),
			background-color 140ms steps(2, end);
	}
	.edu-item:hover::before {
		transform: rotate(28deg) scale(1.25);
		background: var(--color-seal);
	}
	.edu-art-stamp {
		display: inline-block;
		font-family: var(--font-display-latin);
		font-size: var(--text-xs);
		letter-spacing: 0.22em;
		color: var(--color-link);
		margin-bottom: var(--space-1);
		filter: url(#wabi-rough);
	}
	.e-school {
		max-width: 22em;
		font: 400 var(--text-xl)/var(--leading-tight) var(--font-heading);
		letter-spacing: var(--tracking-heading);
		filter: url(#wabi-rough);
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

	/* Movement 三: 道篇 · 造物观 (Creed Scrollytelling in 3D Night Ink) */
	.mv-creed {
		position: relative;
		isolation: isolate;
		grid-template-columns: 28fr 72fr;
		padding-block: var(--space-9);
		background: transparent;
	}
	/* Semi-translucent torn Night Ink wash so the 3D nocturnal sanctuary shines through */
	.mv-creed::before {
		content: '';
		position: absolute;
		z-index: -1;
		inset: 0 calc(-1 * max(0px, (100vw - var(--manuscript-width)) / 2));
		background: color-mix(in srgb, var(--raw-night) 82%, transparent);
		clip-path: polygon(0% 2.6%, 6% 0.5%, 15% 2.1%, 28% 0.2%, 39% 1.8%, 52% 0.1%, 65% 2.2%, 77% 0.4%, 88% 1.9%, 100% 0.3%, 100% 100%, 0% 100%);
		filter: url(#wabi-rough);
	}
	.mv-creed .chapter-watermark {
		color: rgba(233, 226, 210, 0.05);
		-webkit-text-stroke: 1.5px rgba(233, 226, 210, 0.22);
		text-shadow: 7px -4px 0 rgba(176, 138, 78, 0.16);
	}
	.mv-creed .art-latin-display {
		color: rgba(233, 226, 210, 0.16);
	}
	.mv-creed .art-heading {
		color: var(--raw-bone);
		text-shadow: 4px -2px 0 rgba(176, 138, 78, 0.24);
	}
	.creed {
		max-width: 42em;
		position: relative;
		z-index: 1;
	}
	/* Stepped 3-frame ratchet when switching active creed on scroll (卡顿感) */
	.creed-card {
		position: relative;
		padding-left: var(--space-5);
		border-left: 3px solid rgba(233, 226, 210, 0.14);
		opacity: 0.42;
		transition:
			opacity 260ms steps(3, end),
			border-color 260ms steps(3, end),
			transform 260ms steps(3, end);
	}
	.creed-card + .creed-card { margin-top: var(--space-8); }
	.creed-card.is-active-creed {
		opacity: 1;
		border-left-color: var(--raw-bone);
		transform: translateX(4px);
	}

	.creed-header {
		display: flex;
		align-items: baseline;
		gap: var(--space-3);
		margin-bottom: var(--space-4);
	}
	.creed-art-num {
		font-family: var(--font-heading);
		font-size: var(--text-2xl);
		line-height: 1;
		color: var(--color-special);
		filter: url(#wabi-rough);
	}
	.creed-badge {
		font: 400 var(--text-micro)/1.6 var(--font-machine);
		color: var(--raw-bone-muted);
		letter-spacing: var(--tracking-machine);
		text-transform: uppercase;
	}
	.creed-label {
		font: italic var(--text-lg)/var(--leading-base) var(--font-display-latin);
		color: var(--raw-bone-muted);
	}
	.creed-lead {
		max-width: 22em;
		font: 400 clamp(1.65rem, 1.3rem + 1.4vw, 2.5rem)/var(--leading-tight) var(--font-heading);
		text-wrap: pretty;
		color: var(--raw-bone);
		filter: url(#wabi-rough);
		text-shadow: 3px -2px 0 rgba(176, 138, 78, 0.18);
	}
	.creed-text {
		max-width: 33em;
		margin-top: var(--space-4);
		font-size: var(--text-base);
		line-height: var(--leading-loose);
		color: var(--raw-bone-muted);
		text-wrap: pretty;
	}
	.creed-action {
		margin-top: var(--space-7);
	}
	.creed-link {
		display: inline-flex;
		align-items: baseline;
		gap: var(--space-3);
		min-height: 44px;
		font-family: var(--font-heading);
		font-size: var(--text-base);
		letter-spacing: 0.18em;
		padding: var(--space-2) var(--space-5);
		border: 1px solid var(--raw-bone);
		background: rgba(233, 226, 210, 0.08);
		color: var(--raw-bone);
		filter: url(#wabi-rough);
		transition:
			background-color 200ms steps(2, end),
			color 200ms steps(2, end),
			transform 160ms steps(2, end);
	}
	.creed-link-en {
		font-family: var(--font-display-latin);
		font-size: var(--text-xs);
		letter-spacing: 0.16em;
		opacity: 0.8;
	}
	.creed-link:hover {
		background: var(--raw-bone);
		color: var(--raw-night);
		transform: translate(-2px, -2px);
	}
	.creed-link .arrow {
		transition: transform 160ms steps(2, end);
	}
	.creed-link:hover .arrow {
		transform: translate(3px, -3px);
	}

	@media (max-width: 900px) {
		.manuscript-grid { column-gap: var(--space-6); }
		.preface { grid-template-columns: 32fr 68fr; }
		.mv-edu { grid-template-columns: 36fr 64fr; }
		.mv-creed { grid-template-columns: 32fr 68fr; }
		.chapter-watermark { font-size: clamp(7rem, 22vw, 12rem); }
	}

	@media (max-width: 600px) {
		.continuum-joint .joint-coord { display: none; }
		.manuscript-grid { grid-template-columns: 1fr; row-gap: var(--space-6); }
		.preface { padding-block: var(--space-6) var(--space-8); }
		.preface-head { display: grid; grid-template-columns: 1fr 1fr; column-gap: var(--space-4); }
		.preface-head .chapter-badge,
		.preface-head .chapter-en { grid-column: 1 / -1; }
		.art-heading { font-size: var(--text-3xl); }
		.preface-identity { margin-top: var(--space-4); }
		.preface-body { padding: var(--space-3); }
		.preface-lead { font-size: var(--text-lg); }
		.preface-hail { margin-top: var(--space-5); gap: var(--space-3); }
		.movement { padding-block: var(--space-6) var(--space-8); }
		.mv-head { display: grid; grid-template-columns: auto 1fr; column-gap: var(--space-4); align-items: baseline; }
		.mv-head .chapter-badge { grid-column: 1 / -1; }
		.mv-head .chapter-en { grid-column: 1 / -1; margin-top: var(--space-2); }
		.focus-list { padding-top: 0; }
		.focus-item { padding: var(--space-4) var(--space-3); }
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
			clip-path: none;
			animation: none;
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
