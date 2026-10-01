<script>
	import { develop } from '$lib/actions/develop.js';
	import { socialLinks as seedSocial } from '$lib/domain/social.js';

	let { data } = $props();

	const socialLinks = $derived(data?.socialLinks ?? seedSocial);

	// Give each platform a brush-hand Chinese title; fall back to the label.
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

<section id="links" class="links grid-section">
	<span class="chapter-watermark" aria-hidden="true">响</span>
	<div class="grid links-inner" use:develop>
		<header class="links-head" data-reveal-item>
			<span class="chapter-badge">响篇 · 联络</span>
			<h2 class="links-title">联络</h2>
			<span class="links-en">Elsewhere</span>
			<p class="links-note">若有共鸣，欢迎来信。</p>
		</header>
		<ol class="link-list">
			{#each socialLinks as link}
				<li class="link-row" data-reveal-item>
					<a class="big-link" href={link.url}>
						<span class="bl-cn">{cnLabel(link)}</span>
						<span class="bl-en">{link.label}</span>
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
		padding-block: var(--space-8);
	}

	.chapter-watermark {
		position: absolute;
		right: 3%;
		top: var(--space-4);
		font-family: var(--font-heading);
		font-size: clamp(8rem, 16vw, 18rem);
		line-height: 1;
		color: var(--color-text);
		opacity: 0.035;
		pointer-events: none;
		user-select: none;
		z-index: 0;
	}

	.chapter-badge {
		font: italic var(--text-xs)/var(--leading-base) var(--font-latin);
		color: var(--color-link);
		letter-spacing: .12em;
		text-transform: uppercase;
		flex-basis: 100%;
		margin-bottom: var(--space-1);
	}

	.links-inner {
		row-gap: 0;
		align-items: start;
		position: relative;
		z-index: 1;
	}

	/* Still-Water develop transitions with viscous organic timing */
	.links-inner:global(.is-developing) [data-reveal-item] {
		opacity: 0;
		transform: translateY(20px);
		filter: blur(4px);
	}
	.links-inner:global(.is-developed) [data-reveal-item] {
		opacity: 1;
		transform: none;
		filter: none;
		transition:
			opacity 900ms var(--ease-organic),
			transform 900ms var(--ease-organic),
			filter 900ms var(--ease-organic);
		transition-delay: calc(var(--i, 0) * 80ms);
	}

	.links-head {
		grid-column: 1 / -1;
		display: flex;
		align-items: baseline;
		gap: var(--space-3);
		flex-wrap: wrap;
		margin-bottom: var(--space-5);
	}
	.links-note { flex-basis: 100%; font-size: var(--text-sm); line-height: var(--leading-base); color: var(--color-text-muted); margin-top: var(--space-2); }

	.links-title {
		font-family: var(--font-heading);
		font-size: var(--text-2xl);
		letter-spacing: var(--tracking-heading);
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
		border-top: 1px solid var(--color-link-wash);
		position: relative;
		transition: transform var(--duration-base) var(--ease-organic);
	}

	.link-row:last-child {
		border-bottom: 1px solid var(--color-link-wash);
	}

	.link-row:hover {
		transform: translateX(4px);
	}

	.big-link {
		display: flex;
		align-items: baseline;
		gap: var(--space-4);
		padding: var(--space-5) 0;
		min-height: 44px;
		position: relative;
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

	/* Ink line draws in beneath the Chinese title on hover (墨线绘入). */
	.bl-cn::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: calc(-1 * var(--space-2));
		height: 1px;
		background: var(--color-link);
		transform: scaleX(0);
		transform-origin: left center;
		transition: transform var(--duration-slow) var(--ease-organic);
	}

	.bl-en {
		font-family: var(--font-ui);
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-heading);
		color: var(--color-text-muted);
		transition: color var(--duration-slow) var(--ease-organic);
	}

	.bl-mark {
		margin-left: auto;
		align-self: center;
		font-size: var(--text-lg);
		color: var(--color-text-muted);
		opacity: .65;
		transition: opacity var(--duration-slow) var(--ease-organic), color var(--duration-slow) var(--ease-organic), transform var(--duration-base) var(--ease-organic);
	}

	@media (hover: hover) {
		.big-link:hover .bl-cn {
			color: var(--color-link);
		}
		.big-link:hover .bl-cn::after {
			transform: scaleX(1);
		}
		.big-link:hover .bl-en {
			color: var(--color-text-muted);
		}
		.big-link:hover .bl-mark {
			opacity: 1;
			color: var(--color-link);
			transform: translate(2px, -2px);
		}
	}

	@media (min-width: 600px) {
		.links-head {
			grid-column: 2 / -1;
		}
		.link-list {
			grid-column: 2 / -1;
		}
	}

	@media (min-width: 900px) {
		.links-head {
			grid-column: 3 / 5;
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-2);
			margin-bottom: 0;
			position: sticky;
			top: 18svh;
			align-self: start;
		}
		.link-list {
			grid-column: 6 / 13;
		}
		.chapter-watermark {
			font-size: clamp(6rem, 12vw, 10rem);
		}
	}

	@media (min-width: 1200px) {
		.links-head {
			grid-column: 4 / 6;
		}
		.link-list {
			grid-column: 7 / 13;
		}
	}

	@media (max-width: 600px) {
		.chapter-watermark {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.links-inner:global(.is-developing) [data-reveal-item],
		.links-inner:global(.is-developed) [data-reveal-item] {
			opacity: 1;
			transform: none;
			filter: none;
			transition: none;
		}
		.link-row {
			transform: none !important;
		}
	}
</style>
