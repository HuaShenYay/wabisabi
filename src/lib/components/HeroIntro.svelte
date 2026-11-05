<script lang="ts">
	import type { Profile } from '$lib/domain/profile';
	import { profile as defaultProfile } from '$lib/domain/profile';
	let { profile = defaultProfile }: { profile?: Profile } = $props();
</script>

<section class="hero-intro site-shell" aria-labelledby="home-heading">
	<div class="hero-copy">
		<p class="hero-kicker">文字、影像与数字造物</p>
		<h1 id="home-heading" class="woodblock-art"><span>在人文与技术之间，</span><span>留一处诗意。</span></h1>
		<p class="hero-english">Between humanities and technology.</p>
	</div>
	<div class="hero-bottom">
		<p class="hero-note">{profile.title}<span>{profile.location}</span></p>
		<div class="hero-actions">
			<a href="/projects" class="work-link ink-frame"><span>展阅作品</span><span aria-hidden="true">↗</span></a>
			<a href="#about" class="about-link">关于我 <span aria-hidden="true">↓</span></a>
		</div>
	</div>
</section>

<style>
	.hero-intro { min-height: 70svh; display: flex; flex-direction: column; justify-content: space-between; gap: var(--space-7); padding-block: clamp(3.5rem, 10svh, 7rem) var(--space-7); }
	.hero-kicker { font: var(--text-sm)/1.6 var(--font-body); letter-spacing: .18em; color: var(--color-text-muted); margin-bottom: var(--space-5); }
	h1 { font-size: clamp(2rem, 4.7vw, 4.5rem); line-height: 1.55; letter-spacing: .03em; font-weight: 400; }
	h1 span { display: block; }
	.hero-english { margin-top: var(--space-4); color: var(--color-text-muted); font: italic var(--text-lg)/1.5 var(--font-display-latin); }
	.hero-bottom { display: flex; justify-content: space-between; align-items: end; gap: var(--space-5); }
	.hero-note { font: var(--text-sm)/1.9 var(--font-body); color: var(--color-text-muted); }
	.hero-note span { display: block; }
	.hero-actions { display: flex; align-items: center; gap: var(--space-5); }
	.work-link { display: inline-flex; justify-content: space-between; align-items: center; gap: var(--space-6); min-height: 52px; padding: var(--space-3) var(--space-4); font: var(--text-base)/1.5 var(--font-heading); }
	.about-link { display: inline-flex; align-items: center; gap: var(--space-3); min-height: 44px; font-size: var(--text-sm); color: var(--color-text-muted); }
	@media (max-width: 600px) {
		.hero-intro { min-height: 65svh; padding-block: var(--space-6); gap: var(--space-6); }
		h1 { font-size: clamp(1.65rem, 6.2vw, 2.3rem); line-height: 1.8; }
		.hero-kicker { margin-bottom: var(--space-4); font-size: var(--text-xs); }
		.hero-english { font-size: var(--text-base); max-width: 18em; }
		.hero-bottom { flex-direction: column; align-items: start; gap: var(--space-5); }
		.hero-actions { gap: var(--space-4); flex-wrap: wrap; }
		.work-link { gap: var(--space-5); }
	}
</style>
