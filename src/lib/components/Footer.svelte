<script>
	import { develop } from '$lib/actions/develop.js';
	import { profile as defaultProfile } from '$lib/domain/profile.js';
	import { page } from '$app/state';
	const profile = $derived(page.data.profile ?? defaultProfile);

	const year = new Date().getFullYear();
</script>

<footer class="site-footer grid" use:develop>
	<div class="footer-colophon">
		<p class="colophon-line">不完满，方见真意。</p>
		<span class="colophon-seal" aria-hidden="true">
			<span class="seal-text">子杰</span>
		</span>
	</div>

	<div class="footer-content">
		<p class="footer-copy">© {year} {profile.name} · {profile.location}</p>
		<a href="/copyright" class="link-underline footer-link">版权声明</a>
	</div>
</footer>

<style>
	.site-footer {
		padding-top: calc(0.6 * var(--spacer-height));
		padding-bottom: calc(1 * var(--spacer-height));
		row-gap: 0;
		align-items: end;
	}

	/* Closing colophon: a brush-hand line stamped with a vermilion name seal.
	   底缘为金缮接缝（DESIGN.md §9.3，每屏至多一处金色）。 */
	.footer-colophon {
		grid-column: 1 / -1;
		display: flex;
		align-items: center;
		gap: 1rem;
		padding-bottom: calc(0.5 * var(--spacer-height));
		margin-bottom: calc(0.4 * var(--spacer-height));
		position: relative;
	}

	.footer-colophon::after {
		content: "";
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 1px;
		background: linear-gradient(
			90deg,
			transparent, var(--color-special) 35%,
			var(--color-special) 65%, transparent
		);
		opacity: 0.55;
	}

	.colophon-line {
		font-family: var(--font-brush);
		font-size: clamp(1.25rem, 5vw, 1.7rem);
		line-height: 1.6;
		letter-spacing: 0.08em;
		color: var(--color-text);
	}

	.colophon-seal {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.6em;
		height: 2.6em;
		flex: 0 0 auto;
		font-family: var(--font-heading);
		font-size: 0.85rem;
		line-height: 1.05;
		text-align: center;
		color: var(--color-bg);
		background: var(--color-link);
		border-radius: var(--radius-sharp);
		transform: rotate(-2deg);
		box-shadow: 0 1px 6px rgba(158, 107, 85, 0.28);
		opacity: 0.92;
	}

	.seal-text {
		writing-mode: vertical-rl;
		letter-spacing: 0.08em;
	}

	.footer-content {
		grid-column: 1 / -1;
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.footer-copy {
		font-family: var(--font-ui);
		font-size: 0.8rem;
		color: var(--color-text-muted);
		letter-spacing: 0.03em;
	}

	.footer-link {
		font-family: var(--font-ui);
		font-size: 0.8rem;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		transition: color 0.4s var(--ease-organic);
	}

	@media (hover: hover) {
		.footer-link:hover {
			color: var(--color-link);
		}
	}

	@media (min-width: 900px) {
		.footer-colophon {
			grid-column: 3 / 11;
		}
		.footer-content {
			grid-column: 3 / 13;
		}
	}
</style>
