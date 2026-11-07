<script>
	import AboutSection from '$lib/components/AboutSection.svelte';
	import LinksSection from '$lib/components/LinksSection.svelte';
	let { data } = $props();
</script>

<AboutSection {data} />
<LinksSection {data} />
