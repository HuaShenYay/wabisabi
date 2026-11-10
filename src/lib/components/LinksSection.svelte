<script lang="ts">
	import { page } from '$app/state';
	import { getLocale, translator } from '$lib/i18n';
	const locale = $derived(getLocale(page.data.locale));
	const t = $derived(translator(locale));

	import { socialLinks as seedSocial, type SocialLink, type SocialPlatform } from '$lib/domain/social.js';
	let { data }: { data: { socialLinks?: readonly SocialLink[] } } = $props();
	const socialLinks = $derived(data?.socialLinks ?? seedSocial);
	const labels: Record<SocialPlatform, [string, string]> = {
		email: ['电子邮件', 'Email'],
		bilibili: ['哔哩哔哩', 'Bilibili'],
		github: ['代码仓库', 'GitHub'],
		rednote: ['小红书', 'RedNote'],
		twitter: ['推特', 'X'],
		instagram: ['照片墙', 'Instagram'],
		itch: ['独立游戏平台', 'itch.io'],
		arena: ['灵感收藏', 'Are.na']
	};
</script>

<section class="contact site-shell" id="links" aria-labelledby="contact-heading">
	<div class="contact-inner">
		<!-- 接在关于区块末条 sparse 之后，取 dense；造物观缺席时由 app.css 的 :has 兜底切换 -->
		<span class="ink-rule ink-rule--dense" aria-hidden="true"></span>
		<header><h2 id="contact-heading">{t('联络', 'Contact')}</h2><p>{t('若有共鸣，欢迎来信。', 'If this resonates, write to me.')}</p></header>
		<ul>{#each socialLinks as link}
			<li><a href={link.url} target={link.platform === 'email' ? undefined : '_blank'} rel={link.platform === 'email' ? undefined : 'noopener noreferrer'}><span>{t(...(labels[link.platform] ?? ['站外链接', 'External link']))}</span><span aria-hidden="true">↗</span></a></li>
		{/each}</ul>
	</div>
</section>

<style>
	.contact-inner { display: grid; grid-template-columns: 38fr 62fr; gap: var(--space-6); position: relative; padding: var(--space-7) clamp(12px, 2.2vw, 32px) var(--space-8); }
	.ink-rule { position: absolute; top: 0; left: 0; width: 64%; opacity: .36; }
	h2 { font: var(--text-xl)/1.5 var(--font-heading); letter-spacing: .12em; }
	header p { margin-top: var(--space-3); font: var(--text-sm)/1.8 var(--font-body); color: var(--color-text-muted); }
	ul { display: flex; flex-wrap: wrap; gap: var(--space-3) var(--space-5); align-content: start; }
	a { display: flex; align-items: center; gap: var(--space-3); min-height: 44px; font: var(--text-base)/1.5 var(--font-body); }
	a span:last-child { font-size: var(--text-sm); color: var(--color-text-muted); transition: color var(--duration-base) var(--ease-organic); }
	a:is(:hover, :focus-visible) span:last-child { color: var(--color-link-hover); }
	@media (max-width: 600px) {
		.contact-inner { grid-template-columns: 1fr; gap: var(--space-4); padding: var(--space-5) 12px var(--space-7); }
		.ink-rule { width: 80%; }
	}
</style>
