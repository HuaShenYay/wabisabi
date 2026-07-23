<script>
	import { profile } from '$lib/domain/profile.js';

	const year = new Date().getFullYear();
</script>

<footer class="site-footer grid">
	<div class="footer-content">
		<p class="footer-copy">
			© {year} {profile.name}
		</p>
		<a href="/copyright" class="link-underline footer-link">
			版权声明
		</a>
	</div>
</footer>

<style>
	.site-footer {
		padding-top: calc(0.5 * var(--spacer-height));
		padding-bottom: calc(1 * var(--spacer-height));
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
		font-family: var(--font-family--body);
		font-size: 0.8rem;
		color: var(--stone);
		letter-spacing: 0.03em;
	}

	.footer-link {
		font-family: var(--font-family--body);
		font-size: 0.8rem;
		color: var(--stone);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		transition: color 0.4s ease;
	}

	@media (hover: hover) {
		.footer-link:hover {
			color: var(--clay);
		}
	}
</style>
