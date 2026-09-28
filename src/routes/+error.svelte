<script>
	import { page } from '$app/state';
	import Header from '$lib/components/Header.svelte';
	import { reveal } from '$lib/actions/reveal.js';
	import { profile } from '$lib/domain/profile.js';

	const status = $derived(page.status);
	const message = $derived(page.error?.message ?? '未知错误');

	// Wabi-Sabi spirit: each error has its own poetic reflection
	/** @type {Record<number, string>} */
	const reflections = {
		404: '此处空无一物，恰如残缺之美。',
		500: '石上有裂，光得以入。'
	};
	const defaultReflection = '万物无常，错误亦是过程的一部分。';

	const reflection = $derived(reflections[status] ?? defaultReflection);
</script>

<svelte:head>
	<title>{status} - {profile.name}</title>
	<meta name="description" content="{status} - 页面未找到。返回首页继续探索。" />
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<Header />

<section class="error-section grid grid-section" use:reveal>
	<div class="error-content">
		<p class="error-status-label">{status === 404 ? 'Not Found' : 'Error'}</p>
		<h1 class="error-display">{status}</h1>
		<p class="error-reflection">{reflection}</p>

		<div class="ink-divider" aria-hidden="true"></div>

		<p class="error-detail">
			{message}
		</p>

		<a href="/" class="link-underline error-home-link">
			返回首页
		</a>
	</div>
</section>

<style>
	.error-section {
		min-height: var(--viewport-height, 100vh);
		min-height: 100dvh;
		display: flex;
		align-items: center;
		padding-top: var(--header-height);
	}

	.error-content {
		grid-column: 2 / -2;
		padding: calc(2 * var(--spacer-height)) 0;
	}

	@media (min-width: 900px) {
		.error-content {
			grid-column: 3 / 8;
			padding: calc(3 * var(--spacer-height)) 0;
		}
	}

	@media (min-width: 1200px) {
		.error-content {
			grid-column: 4 / 9;
		}
	}

	.error-status-label {
		font-family: var(--font-ui);
		font-size: 0.85rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--color-text-muted);
		font-weight: 300;
		margin-bottom: 1.5rem;
	}

	.error-display {
		font-family: var(--font-latin);
		font-size: clamp(8rem, 24vw, 18rem);
		line-height: 0.85;
		letter-spacing: -0.03em;
		color: var(--color-text);
		text-transform: uppercase;
		opacity: 0.92;
		margin-bottom: 2rem;
	}

	.error-reflection {
		font-family: var(--font-ui);
		font-size: clamp(1.1rem, 2.2vw, 1.6rem);
		font-weight: 300;
		color: var(--color-text-muted);
		line-height: 1.6;
		max-width: 28em;
		letter-spacing: 0.02em;
	}

	.error-detail {
		font-family: var(--font-ui);
		font-size: 0.9rem;
		color: var(--color-text-muted);
		line-height: 1.5;
		margin-bottom: 2rem;
		max-width: 35em;
	}

	.error-home-link {
		font-family: var(--font-ui);
		font-size: 1.1rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 300;
		color: var(--color-link);
	}
</style>
