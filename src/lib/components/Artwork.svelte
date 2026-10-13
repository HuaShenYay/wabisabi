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
		filter: saturate(0.82) contrast(0.95);
		opacity: 0.88;
		transition:
			opacity var(--duration-base) var(--ease-organic),
			filter var(--duration-base) var(--ease-organic),
			transform var(--duration-slow) var(--ease-organic);
	}

	.artwork.is-loaded img {
		opacity: 1;
		filter: saturate(0.88) contrast(0.98);
	}

	:global(a:hover) .artwork img {
		transform: scale(1.02);
		filter: saturate(0.95) contrast(1.02);
	}

	/* Archival print halftone / paper veil */
	.artwork-veil {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background-image: radial-gradient(rgba(27, 26, 23, 0.08) 1px, transparent 1px);
		background-size: 5px 5px;
		opacity: 0.35;
		mix-blend-mode: multiply;
		transition: opacity var(--duration-base) var(--ease-organic);
	}

	:global(a:hover) .artwork-veil {
		opacity: 0.12;
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
