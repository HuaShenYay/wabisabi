<script lang="ts">
	let { name, eager = false, onready = () => {}, onerror = () => {} }: {
		name: 'pine-day' | 'pine-night' | 'pine-trunk' | 'pine-bough';
		eager?: boolean;
		onready?: () => void;
		onerror?: () => void;
	} = $props();
	const version = '20261030';
	async function loaded(event: Event) {
		const image = event.currentTarget as HTMLImageElement;
		try { await image.decode(); onready(); } catch { onerror(); }
	}
</script>

<picture>
	<source media="(max-width: 768px)" type="image/avif" srcset={`/landscape/${name}-mobile.avif?v=${version}`} />
	<source media="(max-width: 768px)" type="image/webp" srcset={`/landscape/${name}-mobile.webp?v=${version}`} />
	<source type="image/avif" srcset={`/landscape/${name}.avif?v=${version}`} />
	<img src={`/landscape/${name}.webp?v=${version}`} alt="" width={name === 'pine-trunk' ? 1024 : 1536} height={name === 'pine-trunk' ? 1536 : 1024}
		fetchpriority={eager ? 'high' : 'low'} decoding="async" draggable="false" onload={loaded} {onerror} />
</picture>

<style>
	picture, img { display: block; width: 100%; height: 100%; }
	img { object-fit: cover; }
</style>
