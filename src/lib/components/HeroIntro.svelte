<script lang="ts">
	import { page } from '$app/state';
	import { getLocale, translator } from '$lib/i18n';
	const locale = $derived(getLocale(page.data.locale));
	const t = $derived(translator(locale));
</script>

<section class="hero-intro site-shell" class:hero-en={locale === 'en'} aria-labelledby="home-heading">
	<div class="hero-copy">
		<h1 id="home-heading" class="woodblock-art">
			<span class="hero-line">{t('写下所思', 'Think in words')}<span class="hero-punctuation">{t('，', '.')}</span></span>
			<span class="hero-line hero-line--offset">{t('造出所想', 'Make it real')}<span class="hero-punctuation">{t('。', '.')}</span></span>
		</h1>
	</div>
	<div class="hero-bottom">
		<div class="hero-actions">
			<a href="/projects" class="work-link" data-sveltekit-preload-data="hover"><span>{t('展阅作品', 'Explore works')}</span><span class="work-arrow" aria-hidden="true">↗</span></a>
			<a href="/about" class="about-link" data-sveltekit-preload-data="hover">{t('关于我', 'About me')} <span aria-hidden="true">→</span></a>
		</div>
	</div>
</section>

<style>
	/* 两行题辞沿对角线展开，靠字的尺度与留白建立首屏层次。 */
	.hero-intro {
		min-height: calc(100svh - var(--header-height) - var(--space-6));
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: var(--space-6);
		padding-block: clamp(var(--space-5), 7svh, var(--space-7)) var(--space-6);
	}
	.hero-copy { flex: 1; display: flex; align-items: center; padding-left: clamp(0px, 1.5vw, var(--space-4)); }
	h1 {
		font-family: var(--font-hero);
		font-size: clamp(3.5rem, 8.8vw, 7.75rem);
		line-height: 1.24;
		letter-spacing: -.035em;
		font-weight: 400;
	}
	.hero-line { display: block; white-space: nowrap; }
	.hero-line--offset { margin-top: .06em; padding-left: 1.55em; }
	.hero-punctuation { display: inline-block; font-size: .62em; margin-left: .04em; }
	.hero-bottom {
		display: flex;
		justify-content: flex-end;
		align-items: flex-end;
		gap: var(--space-5);
		padding-inline: clamp(0px, 1.5vw, var(--space-4));
	}
	.hero-actions { display: flex; align-items: baseline; gap: var(--space-5); flex-shrink: 0; padding-bottom: var(--space-1); }
	.work-link { display: inline-flex; align-items: center; gap: var(--space-4); min-height: 52px; font: var(--text-lg)/1.5 var(--font-heading); }
	.work-arrow { font: 2rem/1 var(--font-machine); transition: transform var(--duration-base) var(--ease-organic); }
	.work-link:is(:hover, :focus-visible) .work-arrow { transform: translate(3px, -3px); }
	.about-link { display: inline-flex; align-items: center; gap: var(--space-2); min-height: var(--touch-target); font: var(--text-sm)/1.5 var(--font-body); color: var(--color-text-muted); }
	.about-link:is(:hover, :focus-visible) { color: var(--color-link-hover); }
	.hero-en h1 { font-family: var(--font-body); font-size: clamp(3.5rem, 8.6vw, 7.5rem); letter-spacing: -.045em; line-height: 1.06; }
	.hero-en .hero-line--offset { padding-left: 1.2em; margin-top: .12em; }
	.hero-en .hero-punctuation { font-size: 1em; margin-left: 0; }
	@media (min-width: 601px) and (max-height: 760px) {
		.hero-intro { padding-block: var(--space-5); gap: var(--space-5); }
		h1, .hero-en h1 { font-size: clamp(3.5rem, min(8.8vw, 12svh), 6.5rem); }
	}
	@media (min-width: 601px) and (max-width: 899px) {
		.hero-actions { gap: var(--space-4); }
	}
	@media (max-width: 600px) {
		.hero-intro { min-height: calc(100svh - var(--header-height) - var(--space-5)); padding-block: var(--space-6); gap: var(--space-6); }
		.hero-copy, .hero-bottom { padding-inline: 0; }
		h1 { font-size: clamp(3rem, 15.5vw, 5.5rem); line-height: 1.32; }
		.hero-line--offset { padding-left: .7em; margin-top: .12em; }
		.hero-bottom { flex-direction: column; align-items: stretch; gap: var(--space-5); }
		.hero-actions { justify-content: space-between; gap: var(--space-4); padding-bottom: 0; }
		.work-link { font-size: var(--text-lg); }
		.hero-en .hero-actions { gap: var(--space-3); white-space: nowrap; }
		.hero-en .work-link { gap: var(--space-2); font-size: var(--text-base); }
		.hero-en .work-arrow { font-size: 1.5rem; }
		.hero-en h1 { font-size: clamp(2rem, 12vw, 4.375rem); line-height: 1.12; }
		.hero-en .hero-line--offset { padding-left: .6em; margin-top: .18em; }
	}
	@media (max-width: 600px) and (max-height: 700px) {
		.hero-intro { padding-block: var(--space-5); gap: var(--space-5); }
		.hero-bottom { gap: var(--space-4); }
	}
</style>
