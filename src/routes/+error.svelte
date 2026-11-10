<script>
	import { page } from '$app/state';
	import { getLocale, translator } from '$lib/i18n';
	const locale = $derived(getLocale(page.data.locale));
	const t = $derived(translator(locale));
	import { profile } from '$lib/domain/profile.js';

	const status = $derived(page.status);
	const message = $derived(t(page.error?.message ?? '未知错误', status === 404 ? 'Page not found.' : 'This page could not be loaded. Please try again.'));

	// Wabi-Sabi spirit: each error has its own poetic reflection
	/** @type {Record<number, string>} */
	const reflections = {
		404: '此处空无一物，恰如残缺之美。',
		500: '石上有裂，光得以入。'
	};
	const defaultReflection = '万物无常，错误亦是过程的一部分。';

	const reflection = $derived(t(reflections[status] ?? defaultReflection, status === 404 ? 'An unwritten page.' : 'A crack in the stone lets the light in.'));
</script>

<svelte:head>
	<title>{status} - {t(profile.name, profile.nameEn)}</title>
	<meta name="description" content={t(`${status} - 页面未找到。返回首页继续探索。`, `${status} - Return home to explore more work.`)} />
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<section class="error-section grid grid-section">
	<div class="error-content">
		<p class="error-status-label">{status === 404 ? t('页面未找到', 'Not found') : t('页面加载失败', 'Error')}</p>
		<h1 class="error-display">{status}</h1>
		<p class="error-reflection">{reflection}</p>

		<div class="ink-divider" aria-hidden="true"></div>

		<p class="error-detail">
			{message}
		</p>

		<a href="/" class="link-underline error-home-link">
			{t('返回首页', 'Return home')}
		</a>
	</div>
</section>

<style>
	.error-section {
		min-height: 65svh;
		display: flex;
		align-items: center;
		padding-block: var(--space-6);
	}

	.error-content {
		grid-column: 2 / -2;
		padding-block: var(--space-5);
	}

	@media (min-width: 900px) {
		.error-content {
			grid-column: 3 / 8;
			padding-block: var(--space-6);
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
