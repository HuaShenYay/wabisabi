<script>
	import { develop } from '$lib/actions/develop.js';
	import { profile as defaultProfile } from '$lib/domain/profile.js';
	import { page } from '$app/state';
	const profile = $derived(page.data.profile ?? defaultProfile);

	const year = new Date().getFullYear();
</script>

<footer class="site-footer grid" use:develop>
	<div class="footer-content">
		<p class="footer-copy">© {year} {profile.name} · {profile.location}</p>
		<a href="/copyright" class="link-underline footer-link">版权声明</a>
	</div>
</footer>

<style>
	.site-footer {
		padding-top: calc(0.8 * var(--spacer-height));
		padding-bottom: calc(1.2 * var(--spacer-height));
		row-gap: 0;
		align-items: end;
		border-top: 1px solid var(--color-divider);
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
		.footer-content {
			grid-column: 3 / 13;
		}
	}
</style>
