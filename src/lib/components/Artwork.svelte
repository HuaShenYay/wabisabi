<script lang="ts">
	let { src, alt, aspect = 'landscape_16_9', aspectRatio, fit = 'cover', eager = false }: { src?: string; alt: string; aspect?: string; aspectRatio?: number; fit?: 'cover' | 'contain'; eager?: boolean } = $props();
	let failedSrc = $state('');
	const ratio = $derived(aspectRatio && Number.isFinite(aspectRatio) && aspectRatio > 0 ? String(aspectRatio) : aspect === 'portrait_4_3' ? '3 / 4' : aspect === 'landscape_4_3' ? '4 / 3' : '16 / 9');
</script>

<div class="artwork" style:aspect-ratio={ratio}>
	{#if src && failedSrc !== src}
		<img {src} {alt} style:object-fit={fit} loading={eager ? 'eager' : 'lazy'} decoding="async" onerror={() => failedSrc = src ?? ''} />
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
