<script>
	import { reveal } from '$lib/actions/reveal.js';
	import { socialLinks } from '$lib/domain/social.js';
</script>

<section id="links" class="grid grid-section" use:reveal>
	<h2 class="section-label links">Links</h2>
	<ol class="body-text section-list links">
		{#each socialLinks as link}
			<li><a class="link-underline" href={link.url}>{link.label}</a></li>
		{/each}
	</ol>
</section>
