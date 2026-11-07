<script>
	import HeroIntro from '$lib/components/HeroIntro.svelte';
	import LatestWork from '$lib/components/LatestWork.svelte';
	let { data } = $props();
</script>

<HeroIntro />
{#if data.latestProject}
	<LatestWork project={data.latestProject} />
{/if}
