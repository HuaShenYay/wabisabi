<script>
	import { develop } from '$lib/actions/develop.js';
	import { socialLinks as seedSocial } from '$lib/domain/social.js';

	let { data } = $props();

	const socialLinks = $derived(data?.socialLinks ?? seedSocial);

	/** @type {Record<string, string>} */
	const cnByPlatform = {
		email: '来信',
		bilibili: '哔哩哔哩',
		github: '代码',
		rednote: '小红书',
		twitter: '推文',
		instagram: '影像',
		itch: '游戏',
		arena: '收藏'
	};
	/** @param {{ platform: string, label: string }} link */
	const cnLabel = (link) => cnByPlatform[link.platform] ?? link.label;
</script>

<!--
	v2「响篇 · 联络」(Communication / Echo)
	Museum accession records: accession numbers, KingHwa headings, machine labels,
	and a single cinnabar stamp on hover.
-->
<section id="links" class="links grid-section">
	<span class="chapter-watermark" aria-hidden="true">响</span>
	<div class="grid links-inner" use:develop>
		<header class="links-head" data-reveal-item>
			<span class="chapter-badge machine">
				<span class="badge-rule" aria-hidden="true"></span>
				CAT. N° 05 — COMMUNICATION
			</span>
			<h2 class="links-title">联络</h2>
			<span class="links-en">Elsewhere</span>
			<p class="links-note">若有共鸣，欢迎来信。</p>
		</header>
		<ol class="link-list">
			{#each socialLinks as link, index}
				<li class="link-row" data-reveal-item>
					<a class="big-link" href={link.url} target={link.platform === 'email' ? undefined : '_blank'} rel={link.platform === 'email' ? undefined : 'noopener noreferrer'}>
						<span class="link-seal seal" aria-hidden="true"></span>
						<span class="link-num machine">0{index + 1}</span>
						<span class="bl-cn">{cnLabel(link)}</span>
						<span class="bl-en machine">{link.label}</span>
						<span class="bl-mark" aria-hidden="true">↗</span>
					</a>
				</li>
			{/each}
		</ol>
	</div>
</section>

<style>
	.links {
		position: relative;
		overflow: hidden;
		padding-block: var(--space-9) var(--space-8);
	}

	/* v2 巨物: monumental woodblock-eroded outline glyph */
	.chapter-watermark {
		position: absolute;
		right: -0.06em;
		top: var(--space-4);
		font-family: var(--font-heading);
		font-size: var(--display-1);
		line-height: 0.9;
		letter-spacing: var(--tracking-crush);
		color: rgba(42, 41, 36, 0.06);
		-webkit-text-stroke: 1.5px color-mix(in srgb, var(--color-text) 26%, transparent);
		text-shadow: 7px -4px 0 rgba(169, 124, 90, 0.14);
		filter: url(#wabi-erosion);
		pointer-events: none;
		user-select: none;
		z-index: 0;
	}

	.chapter-badge {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font: 400 var(--text-micro)/1.6 var(--font-machine);
		color: var(--color-text-muted);
		letter-spacing: var(--tracking-machine);
		text-transform: uppercase;
		flex-basis: 100%;
		margin-bottom: var(--space-2);
	}
	.badge-rule { width: var(--space-5); height: 1.5px; background: currentColor; opacity: .7; filter: url(#wabi-rough); }

	.links-inner {
		row-gap: 0;
		align-items: start;
		position: relative;
		z-index: 1;
	}

	/* Stepped stop-motion woodblock reveal */
	.links-inner:global(.is-developing) [data-reveal-item] {
		opacity: 0;
		transform: translate(-4px, 10px) skewX(-1deg);
		clip-path: inset(0 0 85% 0);
	}
	.links-inner:global(.is-developed) [data-reveal-item] {
		opacity: 1;
		transform: none;
		clip-path: inset(0 0 0% 0);
		transition:
			opacity 360ms steps(4, end),
			transform 360ms steps(4, end),
			clip-path 360ms steps(4, end);
		transition-delay: calc(var(--i, 0) * 110ms);
	}

	.links-head {
		grid-column: 1 / -1;
		display: flex;
		align-items: baseline;
		gap: var(--space-3);
		flex-wrap: wrap;
		margin-bottom: var(--space-6);
	}
	.links-note {
		flex-basis: 100%;
		font-size: var(--text-sm);
		line-height: var(--leading-base);
		color: var(--color-text-muted);
		margin-top: var(--space-2);
	}

	.links-title {
		font-family: var(--font-heading);
		font-size: clamp(2.8rem, 4.8vw, 4.8rem);
		line-height: 0.95;
		letter-spacing: var(--tracking-crush);
		color: var(--color-text);
		filter: url(#wabi-rough);
		text-shadow: 3px -2px 0 rgba(169, 124, 90, 0.22);
	}

	.links-en {
		font-family: var(--font-display-latin);
		font-size: var(--text-xl);
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
		align-self: center;
		filter: url(#wabi-rough);
	}

	.link-list {
		grid-column: 1 / -1;
	}

	.link-row {
		border-top: 1.5px solid var(--color-border);
		position: relative;
		transition: transform 160ms steps(2, end);
	}
	.link-row:last-child {
		border-bottom: 1.5px solid var(--color-border);
	}
	.link-row:hover {
		transform: translate(5px, -1px);
	}

	.big-link {
		display: flex;
		align-items: baseline;
		gap: var(--space-4);
		padding: var(--space-5) 0;
		min-height: 48px;
		position: relative;
	}

	/* 朱印 seal stamps in 2 steps on hover */
	.link-seal {
		position: absolute;
		left: calc(-1 * var(--space-4));
		top: calc(50% - 3.5px);
		opacity: 0;
		transform: scale(0.4) rotate(-8deg);
		filter: url(#wabi-rough);
		transition:
			opacity 140ms steps(2, end),
			transform 140ms steps(2, end);
	}

	.link-num {
		font-family: var(--font-display-latin);
		font-size: var(--text-base);
		color: var(--color-link);
		letter-spacing: 0.1em;
	}

	.bl-cn {
		font-family: var(--font-heading);
		font-size: var(--text-2xl);
		line-height: var(--leading-tight);
		letter-spacing: var(--tracking-heading);
		color: var(--color-text);
		position: relative;
		filter: url(#wabi-rough);
		transition: color 180ms steps(2, end);
	}

	.bl-en {
		font-size: var(--text-micro);
		letter-spacing: var(--tracking-machine);
		color: var(--color-text-muted);
		text-transform: uppercase;
		transition: color 180ms steps(2, end);
	}

	.bl-mark {
		margin-left: auto;
		align-self: center;
		font-size: var(--text-base);
		color: var(--color-text-muted);
		opacity: .55;
		transition:
			opacity 180ms steps(2, end),
			color 180ms steps(2, end),
			transform 160ms steps(2, end);
	}

	@media (hover: hover) {
		.big-link:hover .link-seal {
			opacity: 1;
			transform: scale(1) rotate(-4deg);
		}
		.big-link:hover .bl-cn {
			color: var(--color-link-hover);
		}
		.big-link:hover .bl-en {
			color: var(--color-text);
		}
		.big-link:hover .bl-mark {
			opacity: 1;
			color: var(--color-link-hover);
			transform: translate(3px, -3px);
		}
	}

	@media (min-width: 600px) {
		.links-head { grid-column: 2 / -1; }
		.link-list { grid-column: 2 / -1; }
	}

	@media (min-width: 900px) {
		.links-head {
			grid-column: 3 / 6;
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-2);
			margin-bottom: 0;
			position: sticky;
			top: 18svh;
			align-self: start;
		}
		.link-list { grid-column: 6 / 13; }
		.chapter-watermark { font-size: clamp(8rem, 24vw, 16rem); }
	}

	@media (min-width: 1200px) {
		.links-head { grid-column: 3 / 6; }
		.link-list { grid-column: 6 / 12; }
	}

	@media (max-width: 600px) {
		.chapter-watermark { display: none; }
		.bl-cn { font-size: var(--text-xl); }
		.link-seal { display: none; }
	}

	@media (prefers-reduced-motion: reduce) {
		.links-inner:global(.is-developing) [data-reveal-item],
		.links-inner:global(.is-developed) [data-reveal-item] {
			opacity: 1;
			transform: none;
			filter: none;
			clip-path: none;
			transition: none;
		}
		.link-row { transform: none !important; }
	}
</style>
