<script lang="ts">
	import type { Profile } from '$lib/domain/profile';
	import { profile as defaultProfile } from '$lib/domain/profile';
	let { profile = defaultProfile }: { profile?: Profile } = $props();
	const year = new Date().getFullYear();
</script>

<!--
	Avant-Wabi Hero Installation (枯山水 · 破格刀刻排印)
	Raw sumi-ink artistic typography stamped directly onto the 3D Karesansui mist sanctuary,
	with woodblock erosion (#wabi-erosion), Orelo display Latin counterpoint, and stepped
	stop-motion (steps()) registration cadence. Connects directly into About below.
-->
<div class="hero-intro">
	<!-- Colossal eroded woodblock glyph floating in the mist-paper negative space -->
	<div class="hero-monument-glyph" aria-hidden="true">
		<span class="glyph-main">間</span>
		<span class="glyph-latin">MA / VOID</span>
	</div>

	<a class="signature machine" href="#about" aria-label={`关于${profile.name}`}>
		<span class="seal" aria-hidden="true"></span>
		<span>FOLIO N° 001</span>
		<span class="sig-rule" aria-hidden="true"></span>
		<span class="sig-cn">手稿与造物</span>
		<span class="sig-en">RAW ARCHIVE</span>
	</a>

	<div class="hero-copy">
		<p class="hero-art-latin" aria-hidden="true">
			<span>UNConstructed</span>
			<span class="art-latin-italic">Stillness</span>
		</p>
		<h1>
			<span class="h1-col h1-col--first">
				<span class="char-drop">在</span>人文与技术之<span class="char-focus">间</span>，
			</span>
			<span class="h1-col h1-col--second">
				留一处<span class="char-focus">诗意</span>。
			</span>
		</h1>
		<div class="hero-rubbing-stamp" aria-hidden="true">
			<span>侘</span>
			<span>寂</span>
		</div>
	</div>

	<div class="hero-index">
		<dl class="index-list machine" aria-label="作品档案注记">
			<div><dt>LOCUS</dt><dd>枯山水 · 零号庭院 / KARESANSUI I</dd></div>
			<div><dt>MEDIUM</dt><dd>RAW TEXT — MOVING IMAGE — CODE</dd></div>
			<div><dt>AUTHOR</dt><dd>{profile.nameEn} — {year}</dd></div>
		</dl>
		<div class="hero-actions">
			<a class="work-link" href="/projects" data-sveltekit-preload-data="hover">
				<span class="work-cn">入卷展阅</span>
				<span class="work-en">SELECTED WORKS</span>
				<span class="work-arrow" aria-hidden="true">↗</span>
			</a>
			<a class="scroll-bridge-link machine" href="#about">
				<span>↓ 顺轴入「序」</span>
			</a>
		</div>
	</div>
</div>

<style>
	.hero-intro {
		position: relative;
		min-height: 100svh;
		width: 100%;
		pointer-events: none;
		color: var(--color-text);
		opacity: var(--hero-intro-opacity, 1);
		transform: translateY(var(--hero-intro-drift, 0px));
		visibility: var(--hero-intro-visibility, visible);
	}
	.hero-intro a { pointer-events: auto; }

	/* Colossal eroded woodblock glyph (巨物飞白艺术字) */
	.hero-monument-glyph {
		position: absolute;
		right: calc(var(--grid-margin) * 0.6);
		top: 10svh;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		pointer-events: none;
		user-select: none;
		z-index: 0;
		animation: woodblock-stamp 680ms steps(4, end) 120ms both;
	}
	.glyph-main {
		font-family: var(--font-heading);
		font-size: clamp(11rem, 26vw, 26rem);
		line-height: 0.84;
		letter-spacing: var(--tracking-crush);
		color: rgba(42, 41, 36, 0.08);
		-webkit-text-stroke: 1.5px rgba(42, 41, 36, 0.28);
		text-shadow:
			6px -4px 0 rgba(169, 124, 90, 0.14),
			-3px 3px 0 rgba(42, 41, 36, 0.09);
		filter: url(#wabi-erosion);
	}
	.glyph-latin {
		font-family: var(--font-display-latin);
		font-size: clamp(1.4rem, 3.2vw, 3.4rem);
		letter-spacing: 0.18em;
		line-height: 0.9;
		color: rgba(42, 41, 36, 0.26);
		margin-top: calc(-1 * var(--space-4));
		margin-right: var(--space-3);
		filter: url(#wabi-rough);
	}

	/* 机 · museum label signature anchored on the left spine */
	.signature {
		position: absolute;
		top: calc(var(--header-height) * 0.5 - 0.8em);
		left: var(--grid-margin);
		display: flex;
		align-items: center;
		gap: var(--space-3);
		color: var(--color-text);
		animation: woodblock-stamp 420ms steps(3, end) 80ms both;
	}
	.sig-rule {
		width: var(--space-6);
		height: 1.5px;
		background: currentColor;
		opacity: .65;
		filter: url(#wabi-rough);
	}
	.sig-cn {
		font-family: var(--font-heading);
		font-size: var(--text-xs);
		letter-spacing: .32em;
		text-transform: none;
	}
	.sig-en { opacity: .72; }

	/* 刻 × 艺 · Deconstructed sculptural vertical title + Orelo display Latin */
	.hero-copy {
		position: absolute;
		top: calc(var(--header-height) + var(--space-3));
		left: calc(var(--grid-margin) + var(--space-4));
		display: flex;
		align-items: flex-start;
		gap: var(--space-4);
	}

	.hero-art-latin {
		writing-mode: vertical-rl;
		text-orientation: mixed;
		font-family: var(--font-display-latin);
		font-size: clamp(1.4rem, 2.2vw, 2.6rem);
		line-height: 0.92;
		letter-spacing: -0.02em;
		text-transform: uppercase;
		color: rgba(42, 41, 36, 0.22);
		user-select: none;
		filter: url(#wabi-rough);
		animation: woodblock-stamp 560ms steps(4, end) 220ms both;
	}
	.art-latin-italic {
		font-family: var(--font-latin);
		font-style: italic;
		text-transform: none;
		letter-spacing: 0.06em;
		color: var(--color-link);
		opacity: 0.78;
		margin-top: var(--space-3);
	}

	h1 {
		display: flex;
		flex-direction: row-reverse;
		align-items: flex-start;
		gap: var(--space-4);
		color: var(--color-text);
		text-shadow: 2px 1px 0 rgba(243, 239, 230, 0.75);
	}
	.h1-col {
		writing-mode: vertical-rl;
		text-orientation: mixed;
		display: block;
		font-family: var(--font-heading);
		font-size: clamp(1.45rem, 1.05rem + 1.1vw, 2.35rem);
		font-weight: 400;
		line-height: 1.18;
		letter-spacing: .16em;
		filter: url(#wabi-rough);
		animation: woodblock-stamp 640ms steps(5, end) 340ms both;
	}
	.h1-col--second {
		padding-block-start: 1.5em;
		animation-delay: 560ms;
	}
	/* Artistic scale breaks inside vertical calligraphy */
	.char-drop {
		font-size: 1.32em;
		line-height: 0.95;
		display: inline-block;
		transform: translateX(-2px);
	}
	.char-focus {
		font-size: 1.28em;
		color: var(--color-text);
		text-shadow:
			3px -2px 0 rgba(169, 124, 90, 0.24),
			-1px 1px 0 rgba(42, 41, 36, 0.18);
	}

	/* Carved woodblock seal stamp beside h1 */
	.hero-rubbing-stamp {
		writing-mode: vertical-rl;
		display: inline-flex;
		gap: 2px;
		padding: 5px 4px;
		border: 1.5px solid var(--color-seal);
		color: var(--color-seal);
		font-family: var(--font-heading);
		font-size: var(--text-xs);
		letter-spacing: 0.2em;
		line-height: 1.1;
		margin-top: var(--space-5);
		transform: rotate(-1.4deg);
		filter: url(#wabi-rough);
		animation: woodblock-stamp 420ms steps(3, end) 760ms both;
	}

	/* 机 · index annotations + brutalist woodblock CTA */
	.hero-index {
		position: absolute;
		left: calc(var(--grid-margin) + var(--space-4));
		bottom: var(--space-5);
		display: grid;
		gap: var(--space-3);
		max-width: 36em;
		padding: var(--space-3) var(--space-4);
		background: radial-gradient(ellipse 100% 100% at 0% 50%, color-mix(in srgb, var(--color-bg) 82%, transparent), transparent 94%);
		animation: woodblock-stamp 640ms steps(4, end) 680ms both;
	}
	.index-list { display: grid; gap: var(--space-1); color: var(--color-text-muted); }
	.index-list div { display: grid; grid-template-columns: 6.5em 1fr; gap: var(--space-3); }
	.index-list dt { color: var(--color-text-faint); }

	.hero-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-6);
		margin-top: var(--space-1);
	}

	.work-link {
		display: inline-flex;
		align-items: baseline;
		gap: var(--space-3);
		min-height: 44px;
		padding: var(--space-2) var(--space-4);
		border: 1px solid var(--color-text);
		background: color-mix(in srgb, var(--color-bg) 82%, transparent);
		filter: url(#wabi-rough);
		transition:
			background-color 240ms steps(3, end),
			color 240ms steps(3, end),
			transform 160ms steps(2, end);
	}
	.work-cn {
		font-family: var(--font-heading);
		font-size: var(--text-lg);
		letter-spacing: .24em;
	}
	.work-en {
		font-family: var(--font-display-latin);
		font-size: var(--text-sm);
		letter-spacing: 0.14em;
	}
	.work-arrow {
		transition: transform 180ms steps(2, end);
	}
	.work-link:hover {
		background: var(--color-text);
		color: var(--color-bg);
		transform: translate(-2px, -2px);
	}
	.work-link:hover .work-arrow {
		transform: translate(3px, -3px);
	}
	.scroll-bridge-link {
		color: var(--color-text-muted);
		letter-spacing: var(--tracking-machine);
		padding-block: var(--space-2);
		border-bottom: 1px dashed var(--color-border);
		transition: color 180ms steps(2, end);
	}
	.scroll-bridge-link:hover {
		color: var(--color-link-hover);
	}
	.hero-intro a:focus-visible {
		outline: 2px solid var(--color-link-hover);
		outline-offset: var(--space-2);
	}

	/* Stepped stop-motion woodblock registration keyframes (卡顿与粗糙拓印感) */
	@keyframes woodblock-stamp {
		0% {
			opacity: 0;
			transform: translate(-4px, 8px) skewX(-1.2deg);
			clip-path: inset(0 0 85% 0);
		}
		33% {
			opacity: 0.48;
			transform: translate(3px, 4px) skewX(0.6deg);
			clip-path: inset(0 0 42% 0);
		}
		66% {
			opacity: 0.85;
			transform: translate(-1px, 2px);
			clip-path: inset(0 0 12% 0);
		}
		100% {
			opacity: 1;
			transform: none;
			clip-path: inset(0 0 0% 0);
		}
	}

	@media (max-width: 900px) {
		.sig-en { display: none; }
		.hero-art-latin { font-size: 1.5rem; }
	}
	@media (max-width: 600px) {
		.hero-intro {
			min-height: auto;
			padding-top: calc(var(--header-height) + var(--space-4));
			padding-bottom: var(--space-7);
			display: flex;
			flex-direction: column;
			gap: var(--space-5);
		}
		.signature {
			position: static;
			align-self: flex-start;
			padding-inline: var(--grid-margin);
			margin-bottom: var(--space-1);
		}
		.sig-rule { width: var(--space-4); }
		.hero-monument-glyph {
			top: calc(var(--header-height) + var(--space-2));
			right: var(--grid-margin);
			opacity: 0.28;
		}
		.glyph-main { font-size: 32vw; }
		.glyph-latin { font-size: 0.95rem; }
		.hero-copy {
			position: static;
			padding-inline: var(--grid-margin);
			flex-direction: column;
			gap: var(--space-3);
		}
		.hero-art-latin {
			writing-mode: horizontal-tb;
			font-size: var(--text-base);
			line-height: 1.1;
		}
		.art-latin-italic {
			display: inline-block;
			margin-top: 0;
			margin-left: var(--space-2);
		}
		h1 {
			writing-mode: horizontal-tb;
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-2);
			text-shadow: none;
		}
		.h1-col {
			writing-mode: horizontal-tb;
			font-size: clamp(1.45rem, 6vw, 1.85rem);
			line-height: var(--leading-tight);
			letter-spacing: .08em;
		}
		.h1-col--second {
			padding-block-start: 0;
			padding-inline-start: 1.2em;
		}
		.char-drop {
			font-size: 1.22em;
			transform: none;
		}
		.hero-rubbing-stamp {
			writing-mode: horizontal-tb;
			display: inline-flex;
			padding: 2px 8px;
			margin-top: var(--space-2);
			transform: rotate(-1deg);
		}
		.hero-index {
			position: static;
			padding: var(--space-4);
			margin-inline: var(--grid-margin);
			background: color-mix(in srgb, var(--color-bg) 88%, transparent);
			border: 1px solid var(--color-border);
		}
		.index-list div:nth-child(2) { display: none; }
		.index-list div { grid-template-columns: 5.5em 1fr; }
	}
	@media (prefers-reduced-motion: reduce) {
		.hero-monument-glyph, .signature, .hero-art-latin, .h1-col, .hero-rubbing-stamp, .hero-index {
			animation: none;
		}
	}
</style>
