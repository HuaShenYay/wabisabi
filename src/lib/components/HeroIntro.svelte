<script lang="ts">
	import type { Profile } from '$lib/domain/profile';
	import { profile as defaultProfile } from '$lib/domain/profile';
	let { profile = defaultProfile }: { profile?: Profile } = $props();
	const year = new Date().getFullYear();
</script>

<!--
	v2「巨物 · 間」Hero editorial layer.
	The colossal 間 lives inside WabiScene (it must blend with the WebGL print);
	this layer carries the three voices around it:
	刻 — the vertical title, 书 — nothing (silence), 机 — museum-label annotations.
-->
<div class="hero-intro">
	<a class="signature machine" href="#about" aria-label={`关于${profile.name}`}>
		<span class="seal" aria-hidden="true"></span>
		<span>N° 001</span>
		<span class="sig-rule" aria-hidden="true"></span>
		<span class="sig-cn">研究与作品</span>
		<span class="sig-en">Research &amp; Portfolio</span>
	</a>

	<div class="hero-copy">
		<h1>
			<span class="h1-line">在人文与技术之间，</span>
			<span class="h1-line h1-line--low">留一处诗意。</span>
		</h1>
	</div>

	<div class="hero-index">
		<dl class="index-list machine" aria-label="作品档案注记">
			<div><dt>Object</dt><dd>間 · Ma / The interval</dd></div>
			<div><dt>Fields</dt><dd>Digital humanities — Moving image — Code</dd></div>
			<div><dt>Author</dt><dd>{profile.nameEn} — {year}</dd></div>
		</dl>
		<a class="work-link" href="/projects" data-sveltekit-preload-data="hover">
			<span class="work-cn">翻阅作品</span>
			<span class="work-en machine">Selected works</span>
			<span class="work-arrow" aria-hidden="true">↗</span>
		</a>
	</div>

	<div class="scroll-cue" aria-hidden="true">
		<span class="scroll-cue-line"></span>
		<span class="scroll-cue-txt machine">Scroll</span>
		<span class="scroll-cue-cn">溯水寻岸</span>
	</div>
</div>

<style>
	.hero-intro {
		position: absolute;
		inset: 0;
		pointer-events: none;
		color: var(--color-on-night);
		text-shadow: 0 1px 14px rgba(27, 26, 23, 0.55);
		opacity: var(--hero-intro-opacity, 1);
		transform: translateY(var(--hero-intro-drift, 0px));
		filter: blur(var(--hero-intro-blur, 0px));
		visibility: var(--hero-intro-visibility, visible);
		transition: filter 80ms linear;
	}
	.hero-intro a { pointer-events: auto; }

	/* 机 · museum label signature */
	.signature {
		position: absolute;
		top: calc(var(--header-height) * 0.5 - 0.8em);
		left: var(--grid-margin);
		display: flex;
		align-items: center;
		gap: var(--space-3);
		animation: stamp 900ms var(--ease-organic) 200ms both;
	}
	.sig-rule { width: var(--space-6); height: 1px; background: currentColor; opacity: .5; }
	.sig-cn { font-family: var(--font-heading); font-size: var(--text-xs); letter-spacing: .32em; text-transform: none; }
	.sig-en { opacity: .7; }

	/* 刻 · vertical title, set like a hanging scroll in the left sky */
	.hero-copy {
		position: absolute;
		top: calc(var(--header-height) + var(--space-2));
		left: var(--grid-margin);
	}
	h1 {
		writing-mode: vertical-rl;
		text-orientation: mixed;
		display: flex;
		gap: var(--space-4);
		font-family: var(--font-heading);
		font-size: clamp(1.15rem, 0.95rem + 0.45vw, 1.55rem);
		font-weight: 400;
		line-height: 1.25;
		letter-spacing: .28em;
	}
	.h1-line {
		display: block;
		animation: bleed var(--duration-bleed) var(--ease-organic) both;
		animation-delay: 700ms;
	}
	.h1-line--low {
		padding-block-start: 1.2em;
		animation-delay: calc(700ms + var(--duration-ma) + 240ms);
	}

	/* 机 · index annotations + the single CTA */
	.hero-index {
		position: absolute;
		left: var(--grid-margin);
		bottom: var(--space-5);
		display: grid;
		gap: var(--space-4);
		max-width: 34em;
		animation: bleed var(--duration-bleed) var(--ease-organic) 1500ms both;
	}
	.index-list { display: grid; gap: var(--space-1); }
	.index-list div { display: grid; grid-template-columns: 7em 1fr; gap: var(--space-3); }
	.index-list dt { opacity: .62; }
	.work-link {
		display: inline-flex;
		align-items: baseline;
		gap: var(--space-3);
		justify-self: start;
		min-height: 44px;
		padding-block: var(--space-2);
		border-bottom: 1px solid color-mix(in srgb, var(--color-on-night) 55%, transparent);
		transition: border-color var(--duration-echo) var(--ease-organic), opacity var(--duration-echo) var(--ease-organic);
	}
	.work-cn { font-family: var(--font-heading); font-size: var(--text-lg); letter-spacing: .2em; }
	.work-arrow { transition: transform var(--duration-echo) var(--ease-organic); }
	.work-link:hover { border-color: var(--color-on-night); }
	.work-link:hover .work-arrow { transform: translate(3px, -3px); }
	.hero-intro a:focus-visible { outline: 2px solid var(--color-on-night); outline-offset: var(--space-2); }

	/* Scroll cue: a single falling ink line */
	.scroll-cue {
		position: absolute;
		left: 50%;
		bottom: var(--space-5);
		transform: translateX(-50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2);
		opacity: calc(var(--hero-intro-opacity, 1) * 0.85);
	}
	.scroll-cue-cn { font-family: var(--font-heading); font-size: var(--text-xs); letter-spacing: .4em; writing-mode: vertical-rl; }
	.scroll-cue-line {
		width: 1px;
		height: var(--space-6);
		background: linear-gradient(180deg, transparent, var(--color-on-night));
		transform-origin: top;
		animation: fall 2.6s var(--ease-ink) infinite;
	}

	@keyframes fall {
		0% { transform: scaleY(0); opacity: 0; }
		40% { transform: scaleY(1); opacity: 1; }
		100% { transform: scaleY(1) translateY(30%); opacity: 0; }
	}
	@keyframes bleed {
		from { opacity: 0; filter: blur(14px); clip-path: inset(-20% -20% 60% -20%); }
		to { opacity: 1; filter: none; clip-path: inset(-20% -20% -20% -20%); }
	}
	@keyframes stamp {
		0% { opacity: 0; }
		8% { opacity: 1; transform: translate(1px, -1px); }
		16% { transform: none; }
		100% { opacity: 1; }
	}

	@media (max-width: 900px) {
		.sig-en { display: none; }
	}
	@media (max-width: 600px) {
		.signature { top: var(--space-5); }
		.sig-rule { width: var(--space-4); }
		.hero-copy { top: auto; bottom: calc(var(--space-9) + env(safe-area-inset-bottom)); right: var(--grid-margin); }
		h1 { writing-mode: horizontal-tb; flex-direction: column; gap: 0; font-size: var(--text-xl); letter-spacing: .12em; line-height: var(--leading-tight); }
		.h1-line--low { padding-block-start: 0; padding-inline-start: 2em; }
		.hero-index { bottom: calc(var(--space-4) + env(safe-area-inset-bottom)); right: var(--grid-margin); gap: var(--space-4); }
		.index-list div:nth-child(2) { display: none; }
		.index-list div { grid-template-columns: 5.5em 1fr; }
		.scroll-cue { display: none; }
	}
	@media (prefers-reduced-motion: reduce) {
		.signature, .h1-line, .hero-index, .scroll-cue-line { animation: none; }
	}
</style>
