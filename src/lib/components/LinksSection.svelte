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
	<div class="grid links-inner" use:develop>
		<header class="links-head">
			<h2 class="links-title">联络</h2>
			<span class="links-en">Elsewhere</span>
			<p class="links-note">若有共鸣，欢迎来信。</p>
		</header>
		<ol class="link-list">
			{#each socialLinks as link}
				<li class="link-row">
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
	.links-inner {
		row-gap: 0;
		align-items: start;
	}

	.links-head {
		grid-column: 1 / -1;
		display: flex;
		align-items: baseline;
		gap: var(--space-3);
		flex-wrap: wrap;
		margin-bottom: var(--space-5);
	}
	.links-note { flex-basis: 100%; font-size: var(--text-sm); line-height: var(--leading-base); color: var(--color-text-muted); }

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
	}

	.link-row:last-child {
		border-bottom: 1px solid var(--color-link-wash);
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
		transition: opacity var(--duration-slow) var(--ease-organic), color var(--duration-slow) var(--ease-organic);
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
			gap: var(--space-3);
			margin-bottom: 0;
		}
		.link-list {
			grid-column: 6 / 13;
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
</style>
