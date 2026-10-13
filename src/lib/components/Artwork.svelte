<script lang="ts">
	let { src, alt, aspect = 'landscape_16_9', aspectRatio, fit = 'cover', eager = false }: { src?: string; alt: string; aspect?: string; aspectRatio?: number; fit?: 'cover' | 'contain'; eager?: boolean } = $props();
	let failedSrc = $state('');
	let loaded = $state(false);
	const ratio = $derived(aspectRatio && Number.isFinite(aspectRatio) && aspectRatio > 0 ? String(aspectRatio) : aspect === 'portrait_4_3' ? '3 / 4' : aspect === 'landscape_4_3' ? '4 / 3' : '16 / 9');

	const srcset = $derived.by(() => {
		if (!src || !src.startsWith('https://cdn.sanity.io/images/') || !src.includes('w=1600')) return undefined;
		try {
			const base = new URL(src);
			const baseW = Number(base.searchParams.get('w'));
			const baseH = Number(base.searchParams.get('h'));
			if (!baseW) return undefined;
			return [640, 960, 1280, 1600]
				.map((w) => {
					const u = new URL(base);
					u.searchParams.set('w', String(w));
					if (baseH) u.searchParams.set('h', String(Math.round((baseH * w) / baseW)));
					return `${u.href} ${w}w`;
				})
				.join(', ');
		} catch {
			return undefined;
		}
	});
</script>

<div class="artwork" style:aspect-ratio={ratio} class:is-loaded={loaded}>
	{#if src && failedSrc !== src}
		<img
			{src}
			{srcset}
			sizes={srcset ? '(min-width: 900px) 65vw, 92vw' : undefined}
			{alt}
			style:object-fit={fit}
			loading={eager ? 'eager' : 'lazy'}
			fetchpriority={eager ? 'high' : undefined}
			decoding="async"
			onload={() => loaded = true}
			onerror={() => failedSrc = src ?? ''}
		/>
		<div class="artwork-veil" aria-hidden="true"></div>
		<span class="crop-mark mark-tl" aria-hidden="true"></span>
		<span class="crop-mark mark-br" aria-hidden="true"></span>
	{:else}
		<div class="artwork-placeholder" role="img" aria-label={`${alt}，暂无图版`}><span>{alt}</span><small>图版待补</small></div>
	{/if}
</div>

<style>
	.artwork {
		width: 100%;
		background: var(--color-bg-deep);
		position: relative;
		overflow: hidden;
	}

	img {
		display: block;
		width: 100%;
		height: 100%;
		position: absolute;
		inset: 0;
		object-fit: cover;
		filter: saturate(0.76) contrast(1.04);
		opacity: 0.9;
		transition:
			opacity 240ms steps(3, end),
			filter 240ms steps(3, end);
	}

	.artwork.is-loaded img {
		opacity: 1;
		filter: saturate(0.82) contrast(1.02);
	}

	:global(a:hover) .artwork img {
		filter: saturate(0.92) contrast(1.06);
	}

	/* Raw fibrous washi-paper & mineral grain veil (replaces dot-matrix) */
	.artwork-veil {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background-image: url("/noise.svg");
		background-repeat: repeat;
		background-size: 256px 256px;
		opacity: 0.32;
		mix-blend-mode: multiply;
		transition: opacity 220ms steps(3, end);
	}

	:global(a:hover) .artwork-veil {
		opacity: 0.14;
	}

	/* Archival registration / crop marks */
	.crop-mark {
		position: absolute;
		width: 7px;
		height: 7px;
		pointer-events: none;
		opacity: 0.35;
		z-index: 2;
	}

	.mark-tl {
		top: 5px;
		left: 5px;
		border-top: 1px solid var(--color-text-muted);
		border-left: 1px solid var(--color-text-muted);
	}

	.mark-br {
		bottom: 5px;
		right: 5px;
		border-bottom: 1px solid var(--color-text-muted);
		border-right: 1px solid var(--color-text-muted);
	}

	.artwork-placeholder {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: var(--space-5);
		gap: var(--space-3);
		color: var(--color-text-muted);
	}

	span {
		font: var(--text-xl)/var(--leading-tight) var(--font-heading);
		text-wrap: balance;
	}

	small {
		font: var(--text-xs) var(--font-ui);
		letter-spacing: var(--tracking-heading);
	}

	@media (prefers-reduced-motion: reduce) {
		img {
			transition: none;
			transform: none !important;
		}
	}
</style>
