<script>
	import HeroIntro from '$lib/components/HeroIntro.svelte';
	import AboutSection from '$lib/components/AboutSection.svelte';
	import LinksSection from '$lib/components/LinksSection.svelte';
	let { data } = $props();
</script>

<HeroIntro profile={data?.profile} />
<AboutSection {data} />
<LinksSection {data} />
