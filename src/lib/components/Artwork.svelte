<script lang="ts">
	let { src, alt, aspect = 'landscape_16_9', aspectRatio, fit = 'cover', eager = false }: { src?: string; alt: string; aspect?: string; aspectRatio?: number; fit?: 'cover' | 'contain'; eager?: boolean } = $props();
	let failedSrc = $state('');
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

<div class="artwork" style:aspect-ratio={ratio}>
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
			onerror={() => failedSrc = src ?? ''}
		/>
	{:else}
		<div class="artwork-placeholder" role="img" aria-label={`${alt}，暂无图版`}><span>{alt}</span><small>图版待补</small></div>
	{/if}
</div>

<style>
	.artwork { width: 100%; background: var(--color-bg-deep); position: relative; }
	img { display: block; width: 100%; height: 100%; position: absolute; inset: 0; object-fit: cover; filter: saturate(.82) contrast(.95); }
	.artwork-placeholder { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; padding: var(--space-5); gap: var(--space-3); color: var(--color-text-muted); }
	span { font: var(--text-xl)/var(--leading-tight) var(--font-heading); text-wrap: balance; }
	small { font: var(--text-xs) var(--font-ui); letter-spacing: var(--tracking-heading); }
</style>
