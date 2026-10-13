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

	/* v2 巨物: monumental outline glyph */
	.chapter-watermark {
		position: absolute;
		right: -0.12em;
		top: var(--space-4);
		font-family: var(--font-heading);
		font-size: var(--display-1);
		line-height: 1;
		letter-spacing: var(--tracking-crush);
		color: transparent;
		-webkit-text-stroke: 1px color-mix(in srgb, var(--color-text) 20%, transparent);
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
	.badge-rule { width: var(--space-5); height: 1px; background: currentColor; opacity: .6; }

	.links-inner {
		row-gap: 0;
		align-items: start;
		position: relative;
		z-index: 1;
	}

	/* v2 墨晕 Bleed */
	.links-inner:global(.is-developing) [data-reveal-item] {
		opacity: 0;
		transform: translateY(10px);
		filter: blur(12px);
		clip-path: inset(-50% -50% 45% -50%);
	}
	.links-inner:global(.is-developed) [data-reveal-item] {
		opacity: 1;
		transform: none;
		filter: none;
		clip-path: inset(-50% -50% -50% -50%);
		transition:
			opacity var(--duration-bleed) var(--ease-organic),
			transform var(--duration-bleed) var(--ease-organic),
			filter calc(var(--duration-bleed) * 1.1) var(--ease-organic),
			clip-path var(--duration-unmount) var(--ease-ink);
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
		font-size: var(--text-3xl);
		letter-spacing: var(--tracking-crush);
		color: var(--color-text);
	}

	.links-en {
		font-family: var(--font-latin);
		font-size: var(--text-base);
		font-style: italic;
		letter-spacing: var(--tracking-base);
		color: var(--color-text-muted);
		align-self: center;
	}

	.link-list {
		grid-column: 1 / -1;
	}

	.link-row {
		border-top: 1px solid var(--color-divider);
		position: relative;
		transition: transform var(--duration-base) var(--ease-organic);
	}
	.link-row:last-child {
		border-bottom: 1px solid var(--color-divider);
	}
	.link-row:hover {
		transform: translateX(6px);
	}

	.big-link {
		display: flex;
		align-items: baseline;
		gap: var(--space-4);
		padding: var(--space-5) 0;
		min-height: 48px;
		position: relative;
	}

	/* 朱印 seal emerges on hover */
	.link-seal {
		position: absolute;
		left: calc(-1 * var(--space-4));
		top: calc(50% - 3.5px);
		opacity: 0;
		transform: scale(0.4);
		transition: opacity var(--duration-base) var(--ease-organic), transform var(--duration-base) var(--ease-organic);
	}

	.link-num {
		font-size: var(--text-micro);
		color: var(--color-text-faint);
		letter-spacing: var(--tracking-machine);
	}

	.bl-cn {
		font-family: var(--font-heading);
		font-size: var(--text-2xl);
		line-height: var(--leading-tight);
		letter-spacing: var(--tracking-heading);
		color: var(--color-text);
		position: relative;
		transition: color var(--duration-slow) var(--ease-organic);
	}

	.bl-en {
		font-size: var(--text-micro);
		letter-spacing: var(--tracking-machine);
		color: var(--color-text-muted);
		text-transform: uppercase;
		transition: color var(--duration-slow) var(--ease-organic);
	}

	.bl-mark {
		margin-left: auto;
		align-self: center;
		font-size: var(--text-base);
		color: var(--color-text-muted);
		opacity: .55;
		transition: opacity var(--duration-slow) var(--ease-organic), color var(--duration-slow) var(--ease-organic), transform var(--duration-base) var(--ease-organic);
	}

	@media (hover: hover) {
		.big-link:hover .link-seal {
			opacity: 1;
			transform: scale(1);
		}
		.big-link:hover .bl-cn {
			color: var(--color-link);
		}
		.big-link:hover .bl-en {
			color: var(--color-text);
		}
		.big-link:hover .bl-mark {
			opacity: 1;
			color: var(--color-link);
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
