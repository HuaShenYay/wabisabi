<script>
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { profile as defaultProfile } from '$lib/domain/profile';
	const profile = $derived(page.data.profile ?? defaultProfile);

	/** @type {HTMLElement | undefined} */
	let seamWord;
	/** @type {HTMLElement | undefined} */
	let seam;

	// Chrono-slow horizontal parallax anchored to the element's viewport
	// position: the name is fully centred as it passes mid-screen and drifts
	// only gently on either side, so the three characters never clip.
	onMount(() => {
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduce || !seamWord || !seam) return;

		let ticking = false;

		function update() {
			if (!seamWord || !seam) return;
			const rect = seam.getBoundingClientRect();
			const centre = rect.top + rect.height / 2 - window.innerHeight / 2;
			const progress = Math.max(-1, Math.min(1, centre / window.innerHeight));
			const range = Math.min(34, window.innerWidth * 0.034);
			const x = -progress * range;
			seamWord.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
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

		window.addEventListener('scroll', onScroll, { passive: true });
		update();

		return () => window.removeEventListener('scroll', onScroll);
	});
</script>

<section bind:this={seam} class="name-seam" aria-label={profile.name}>
	<p class="seam-label">Afterword</p>
	<span bind:this={seamWord} class="seam-word deboss-text">{profile.name}</span>
	<p class="seam-kicker">{profile.nameEn} · {profile.location} · {profile.title}</p>
</section>

<style>
	.name-seam {
		grid-column: 1 / -1;
		overflow: hidden;
		padding-block: var(--space-8) var(--space-7);
		user-select: none;
	}
	.seam-label { margin-left: var(--grid-margin); margin-bottom: var(--space-5); font: italic var(--text-base)/var(--leading-base) var(--font-latin); color: var(--color-text-muted); }

	.seam-word {
		display: block;
		font-family: var(--font-heading);
		font-size: clamp(calc(var(--text-3xl) * 1.5), 14vw, calc(var(--text-3xl) * 3));
		line-height: var(--leading-tight);
		letter-spacing: var(--tracking-heading);
		white-space: nowrap;
		color: var(--color-text);
		opacity: 0.9;
		margin-left: var(--grid-margin);
		will-change: transform;
	}

	.seam-kicker {
		font-family: var(--font-ui);
		font-size: var(--text-xs);
		line-height: var(--leading-base);
		letter-spacing: var(--tracking-heading);
		color: var(--color-text-muted);
		margin-top: var(--space-5);
		margin-left: var(--grid-margin);
		margin-right: var(--grid-margin);
	}

	@media (max-width: 600px) {
		.name-seam { padding-block: var(--space-7); }
		.seam-kicker { max-width: 25em; }
	}
	@media (prefers-reduced-motion: reduce) { .seam-word { transform: none !important; will-change: auto; } }
</style>
