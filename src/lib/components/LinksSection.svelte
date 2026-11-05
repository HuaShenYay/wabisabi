<script>
	import { socialLinks as seedSocial } from '$lib/domain/social.js';
	let { data } = $props();
	const socialLinks = $derived(data?.socialLinks ?? seedSocial);
</script>

<section class="contact site-shell" id="links" aria-labelledby="contact-heading">
	<div class="contact-inner">
		<span class="ink-rule" aria-hidden="true"></span>
		<header><h2 id="contact-heading">联络</h2><p>若有共鸣，欢迎来信。</p></header>
		<ul>{#each socialLinks as link}
			<li><a href={link.url} target={link.platform === 'email' ? undefined : '_blank'} rel={link.platform === 'email' ? undefined : 'noopener noreferrer'}><span>{link.label}</span><span aria-hidden="true">↗</span></a></li>
		{/each}</ul>
	</div>
</section>

<style>
	.contact-inner { display: grid; grid-template-columns: 1fr 2.3fr; gap: var(--space-6); position: relative; padding-block: var(--space-6) var(--space-7); }
	.ink-rule { position: absolute; top: 0; }
	h2 { font: var(--text-xl)/1.5 var(--font-heading); letter-spacing: .12em; }
	header p { margin-top: var(--space-3); font: var(--text-sm)/1.8 var(--font-body); color: var(--color-text-muted); }
	ul { display: flex; flex-wrap: wrap; gap: var(--space-3) var(--space-5); align-content: start; }
	a { display: flex; align-items: center; gap: var(--space-3); min-height: 44px; font: var(--text-base)/1.5 var(--font-body); }
	a span:last-child { font-size: var(--text-sm); color: var(--color-text-muted); }
	@media (max-width: 600px) { .contact-inner { grid-template-columns: 1fr; gap: var(--space-4); padding-block: var(--space-5) var(--space-6); } }
</style>
