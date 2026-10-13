<script>
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { profile as defaultProfile } from '$lib/domain/profile';
	const profile = $derived(page.data.profile ?? defaultProfile);

	/** @type {HTMLElement | undefined} */
	let seamWord;
	/** @type {HTMLElement | undefined} */
	let seam;

	// Viscous horizontal parallax anchored to the element's viewport position:
	// monumental letters drift across the paper horizon as the user scrolls.
	onMount(() => {
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduce || !seamWord || !seam) return;

		let ticking = false;
		let listening = false;
		let lastX = '';

		function update() {
			if (!seamWord || !seam) return;
			const rect = seam.getBoundingClientRect();
			const vh = window.innerHeight;
			const centre = rect.top + rect.height / 2 - vh / 2;
			const progress = Math.max(-1, Math.min(1, centre / vh));
			const range = Math.min(64, window.innerWidth * 0.06);
			const nextX = (-progress * range).toFixed(2);
			if (nextX !== lastX) {
				lastX = nextX;
				seamWord.style.transform = `translate3d(${nextX}px, 0, 0)`;
			}
		}

		function onScroll() {
			if (!ticking) {
				requestAnimationFrame(() => {
					update();
					ticking = false;
				});
				ticking = true;
			}
		}

		const visibility = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !listening) {
					listening = true;
					window.addEventListener('scroll', onScroll, { passive: true });
					update();
				} else if (!entry.isIntersecting && listening) {
					listening = false;
					window.removeEventListener('scroll', onScroll);
				}
			},
			{ rootMargin: '120px 0px' }
		);
		visibility.observe(seam);
		update();

		return () => {
			visibility.disconnect();
			if (listening) window.removeEventListener('scroll', onScroll);
		};
	});
</script>

<!--
	v2「間 · 休止符」(Interval / Ma)
	A monumental architectural pause between the autobiography and links.
	Carries a colossal, cropped inscription across the horizon and machine-voice
	coordinates beneath it.
-->
<section bind:this={seam} class="interval-section" aria-label="间 · 休止符">
	<header class="interval-head machine">
		<span class="seal" aria-hidden="true"></span>
		<span>INTERVAL · 間</span>
		<span class="head-rule" aria-hidden="true"></span>
		<span>EPILOGUE</span>
	</header>

	<div class="interval-stage">
		<span bind:this={seamWord} class="colossal-title" aria-hidden="true">
			{profile.nameEn}
		</span>
		<p class="interval-verse">
			在空无与数字之间，留下微温的墨痕。
		</p>
	</div>

	<footer class="interval-meta machine">
		<span>{profile.name} — {profile.title}</span>
		<span>LOC. {profile.location}</span>
		<span>PORTFOLIO ARCHIVE / 2026</span>
	</footer>
</section>

<style>
	.interval-section {
		grid-column: 1 / -1;
		position: relative;
		overflow: hidden;
		padding-block: var(--space-9) var(--space-8);
		border-top: 1px solid var(--color-divider);
		border-bottom: 1px solid var(--color-divider);
		background: radial-gradient(ellipse 90% 70% at 50% 50%, color-mix(in srgb, var(--color-bg-alt) 65%, transparent), transparent 75%);
		user-select: none;
	}

	.interval-head {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding-inline: var(--grid-margin);
		color: var(--color-text-muted);
		margin-bottom: var(--space-6);
	}
	.head-rule { width: var(--space-6); height: 1px; background: currentColor; opacity: .4; }

	.interval-stage {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-height: 38svh;
		padding-inline: var(--grid-margin);
	}

	/* 巨物: colossal cropped English name in Orelo / Display Latin */
	.colossal-title {
		display: block;
		font-family: var(--font-display-latin);
		font-size: min(var(--display-0), 28vw);
		line-height: 0.9;
		letter-spacing: var(--tracking-crush);
		color: var(--color-text);
		opacity: 0.16;
		white-space: nowrap;
		margin-left: calc(-1 * var(--grid-margin) * 0.5);
		will-change: transform;
		pointer-events: none;
	}

	/* 刻 · vertical single-line verse anchored against the colossal letters */
	.interval-verse {
		writing-mode: vertical-rl;
		font-family: var(--font-heading);
		font-size: clamp(var(--text-lg), 1rem + 0.6vw, var(--text-2xl));
		letter-spacing: .34em;
		line-height: 1.4;
		color: var(--color-text);
		margin-left: auto;
		z-index: 1;
		text-shadow: 0 1px 18px var(--color-bg);
	}

	.interval-meta {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: var(--space-3);
		padding-inline: var(--grid-margin);
		margin-top: var(--space-7);
		color: var(--color-text-faint);
	}

	@media (max-width: 768px) {
		.interval-section { padding-block: var(--space-8); }
		.interval-stage { flex-direction: column; align-items: flex-start; gap: var(--space-5); min-height: auto; }
		.colossal-title { font-size: 26vw; margin-left: 0; }
		.interval-verse { writing-mode: horizontal-tb; margin-left: 0; font-size: var(--text-base); letter-spacing: .16em; }
		.interval-meta { flex-direction: column; gap: var(--space-2); }
	}

	@media (prefers-reduced-motion: reduce) {
		.colossal-title { transform: none !important; will-change: auto; }
	}
</style>
