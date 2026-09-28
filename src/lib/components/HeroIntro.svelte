<script lang="ts">
	import type { Profile } from '$lib/domain/profile';
	import { profile as defaultProfile } from '$lib/domain/profile';
	let { profile = defaultProfile }: { profile?: Profile } = $props();
</script>

<div class="hero-intro">
	<a class="signature" href="#about" aria-label={`关于${profile.name}`}>
		<span class="signature-name">研究与作品</span>
		<span class="signature-en">Research &amp; Portfolio</span>
	</a>
	<div class="hero-copy">
		<p class="eyebrow">Digital humanities · Moving image · Code</p>
		<h1>在人文与技术之间，留一处诗意。</h1>
	</div>
	<a class="work-link" href="/projects" data-sveltekit-preload-data="hover"><span>翻阅作品</span><span class="link-en">Selected works</span><span aria-hidden="true">↗</span></a>
</div>

<style>
	.hero-intro { position: absolute; inset: 0; pointer-events: none; color: var(--color-bg); text-shadow: 0 1px 12px var(--color-text); opacity: var(--hero-intro-opacity, 1); transform: translateY(var(--hero-intro-drift, 0px)); visibility: var(--hero-intro-visibility, visible); }
	.hero-intro a { pointer-events: auto; }
	.signature { position: absolute; top: var(--space-5); left: var(--grid-margin); display: flex; align-items: baseline; gap: var(--space-3); }
	.signature-name { font-size: var(--text-sm); letter-spacing: .22em; }
	.signature-en { font: italic var(--text-base) var(--font-latin); }
	.hero-copy { position: absolute; bottom: var(--space-6); left: var(--grid-margin); animation: emerge 1400ms var(--ease-organic) both; }
	.eyebrow { font: italic var(--text-sm) var(--font-latin); letter-spacing: .04em; margin-bottom: var(--space-3); }
	h1 { font-family: var(--font-heading); font-size: clamp(var(--text-xl), 1.4rem + 0.6vw, var(--text-2xl)); font-weight: 400; line-height: var(--leading-tight); letter-spacing: .1em; text-wrap: balance; }
	.work-link { position: absolute; right: var(--grid-margin); bottom: var(--space-6); display: inline-flex; gap: var(--space-4); align-items: center; min-height: 44px; border-bottom: 1px solid color-mix(in srgb, var(--color-bg) 55%, transparent); font-size: var(--text-sm); transition: opacity var(--duration-slow); }
	.link-en { font: italic var(--text-base) var(--font-latin); }
	.work-link:hover { opacity: .7; }
	.hero-intro a:focus-visible { outline: 2px solid var(--color-bg); outline-offset: var(--space-2); }
	@keyframes emerge { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
	@media (max-width: 600px) {
		.signature-en { display: none; }
		.hero-copy { bottom: calc(var(--space-7) + env(safe-area-inset-bottom)); right: var(--grid-margin); }
		.eyebrow { font-size: var(--text-xs); max-width: 25em; line-height: var(--leading-base); }
		h1 { font-size: var(--text-base); line-height: var(--leading-base); letter-spacing: var(--tracking-heading); }
		.work-link { bottom: calc(var(--space-4) + env(safe-area-inset-bottom)); gap: var(--space-3); }
		.link-en { display: none; }
	}
	@media (prefers-reduced-motion: reduce) { .hero-copy { animation: none; } }
</style>
