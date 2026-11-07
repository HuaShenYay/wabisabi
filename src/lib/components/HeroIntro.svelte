<script lang="ts">
	import { page } from '$app/state';
	import { getLocale, translator } from '$lib/i18n';
	const locale = $derived(getLocale(page.data.locale));
	const t = $derived(translator(locale));
</script>

<section class="hero-intro site-shell" class:hero-en={locale === 'en'} aria-labelledby="home-heading">
	<div class="hero-copy">
		<p class="hero-kicker">{t('文字、影像与数字造物', 'Words, images & digital craft')}</p>
		<h1 id="home-heading" class="woodblock-art"><span>{t('在人文与技术之间，', 'Between humanity and technology,')}</span><span>{t('留一处诗意。', 'a little room for poetry.')}</span></h1>
		<p class="hero-english" lang={t('en', 'zh-CN')}>{t('Between humanities and technology.', '在人文与技术之间，留一处诗意。')}</p>
		<!-- 起笔 dense，与下一段的 sparse 墨线相接。 -->
		<span class="ink-rule ink-rule--dense hero-rule" aria-hidden="true"></span>
	</div>
	<div class="hero-bottom">
		<div class="hero-actions">
			<a href="/projects" class="work-link"><span>{t('展阅作品', 'Explore works')}</span><span aria-hidden="true">→</span></a>
			<a href="/about" class="about-link" data-sveltekit-preload-data="hover">{t('关于我', 'About me')} <span aria-hidden="true">→</span></a>
		</div>
	</div>
</section>

<style>
	/* 首屏保留题辞，底端露出下一段墨线，提示继续阅读。 */
	.hero-intro { min-height: calc(100svh - var(--header-height) - var(--footer-height)); display: flex; flex-direction: column; justify-content: space-between; gap: clamp(var(--space-6), 9svh, var(--space-7)); padding-block: clamp(var(--space-6), 12svh, var(--space-8)) var(--space-7); }
	.hero-copy { padding-left: clamp(0px, 2.2vw, 30px); }
	.hero-kicker { font: var(--text-sm)/1.6 var(--font-body); letter-spacing: .18em; color: var(--color-text-muted); margin-bottom: var(--space-5); }
	h1 { font-size: clamp(2rem, 4.7vw, 4.5rem); line-height: 1.55; letter-spacing: .03em; font-weight: 400; }
	h1 span { display: block; }
	h1 span:last-child { padding-left: clamp(0px, 1.05em, 2.6em); }
	.hero-english { margin-top: var(--space-4); padding-left: clamp(0px, 1.4vw, 20px); color: var(--color-text-muted); font: italic var(--text-lg)/1.5 var(--font-display-latin); }
	.hero-rule { display: block; width: 58%; margin-top: clamp(var(--space-5), 7svh, var(--space-7)); opacity: .5; }
	.hero-bottom { display: flex; justify-content: flex-end; align-items: end; gap: var(--space-5); }
	.hero-en h1 { font-family: var(--font-latin); font-size: clamp(2.25rem, 4.5vw, 4rem); line-height: 1.35; letter-spacing: -.025em; max-width: 20em; text-wrap: balance; }
	.hero-en h1 span:last-child { padding-left: .65em; }
	.hero-en .hero-kicker { letter-spacing: .08em; }
	.hero-en .hero-english { font: var(--text-base)/var(--leading-base) var(--font-body); }
	.hero-actions { display: flex; align-items: center; gap: var(--space-5); }
	.work-link { display: inline-flex; justify-content: space-between; align-items: center; gap: var(--space-5); min-height: 52px; padding-block: var(--space-3); border-bottom: 1px solid var(--color-border); font: var(--text-base)/1.5 var(--font-heading); transition: color var(--duration-base) var(--ease-organic), border-color var(--duration-base) var(--ease-organic); }
	.work-link:is(:hover, :focus-visible) { border-color: currentColor; }
	.work-link:active { border-color: var(--color-text); }
	.about-link { display: inline-flex; align-items: center; gap: var(--space-3); min-height: 44px; font-size: var(--text-sm); color: var(--color-text-muted); }
	.about-link:is(:hover, :focus-visible) { color: var(--color-link-hover); }
	/* 矮屏按可用高度收束题辞与留白，让作品入口仍在首屏内。 */
	@media (min-width: 601px) and (max-height: 800px) {
		.hero-intro { padding-block: var(--space-5); gap: var(--space-5); }
		.hero-kicker { margin-bottom: var(--space-4); }
		h1 { font-size: clamp(2rem, min(4.7vw, 7svh), 4.5rem); line-height: 1.45; }
		.hero-rule { margin-top: var(--space-4); }
	}
	@media (max-width: 600px) {
		.hero-intro { padding-block: clamp(var(--space-6), 11svh, var(--space-7)) var(--space-6); gap: var(--space-6); }
		.hero-copy { padding-left: 0; }
		h1 { font-size: clamp(1.65rem, 6.2vw, 2.3rem); line-height: 1.8; }
		h1 span:last-child { padding-left: .55em; }
		.hero-kicker { margin-bottom: var(--space-4); font-size: var(--text-xs); }
		.hero-english { font-size: var(--text-base); max-width: 18em; padding-left: 0; }
		.hero-rule { width: 72%; margin-top: var(--space-6); }
		.hero-bottom { flex-direction: column; align-items: start; gap: var(--space-5); }
		.hero-actions { gap: var(--space-4); flex-wrap: wrap; }
		.work-link { gap: var(--space-5); }
		.hero-en h1 { font-size: clamp(2rem, 8vw, 2.8rem); }
	}
</style>
