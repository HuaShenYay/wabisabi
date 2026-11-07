<script>
	import { page } from '$app/state';
	import { getLocale, translator } from '$lib/i18n';
	const locale = $derived(getLocale(page.data.locale));
	const t = $derived(translator(locale));
	let { data } = $props();
	const profile = $derived(data.profile);

	const year = new Date().getFullYear();
</script>

<svelte:head>
	<title>{t('版权声明', 'Copyright')} - {t(profile.name, profile.nameEn)}</title>
	<meta name="description" content={t(`${profile.name}作品集网站的版权信息、使用条款与隐私说明。`, `Copyright, terms of use and privacy information for ${profile.nameEn}'s portfolio.`)} />
	<meta name="robots" content="noindex, follow" />
</svelte:head>



<div class="spacer" style="--size: 1"></div>

<section class="grid grid-section">
	<h1 class="section-label copyright-label">{t('版权', 'Copyright')}</h1>
	<div class="copyright-body">
		<p class="copyright-paragraph">
			{t('本网站所有内容，包括但不限于文字、图像、生成式艺术作品、视觉设计、代码及庭院场景，版权归 ', 'All content on this website, including text, images, generative artworks, visual design, code and courtyard scenes, is owned by ')}<strong>{t(profile.name, profile.nameEn)}</strong>{t(' 所有。', '.')}
		</p>
		<p class="copyright-paragraph">
			{t("未经书面许可，不得以任何形式复制、转载、传播或用于商业目的。个人学习与欣赏用途欢迎引用，请注明出处。", "Reproduction, redistribution or commercial use requires written permission. Quotation for personal study and appreciation is welcome with attribution.")}
		</p>
		<p class="copyright-meta">
			© {year} {profile.name} ({profile.nameEn}). All rights reserved.
		</p>
	</div>
</section>

<div class="ink-divider" aria-hidden="true"></div>

<section class="grid grid-section">
	<h2 class="section-label copyright-label">{t('使用条款', 'Terms of use')}</h2>
	<div class="copyright-body">
		<p class="copyright-paragraph">
			{t("访问本网站即表示您同意以下条款。本网站提供的内容仅供参考与欣赏，不构成任何专业建议。", "By visiting this website, you agree to these terms. Its content is for reference and appreciation and does not constitute professional advice.")}
		</p>
		<p class="copyright-paragraph">
			{t("本网站以简洁的文字与图像呈现内容，可在不同尺寸的设备上阅读。您也可以在系统设置中减少动态效果。", "This website presents text and images for reading on different screen sizes. You can reduce motion in your system settings.")}
		</p>
		<p class="copyright-paragraph">
			{t("本网站尊重并保护用户隐私。本站不收集个人身份信息，不使用追踪 Cookie。如通过邮件联系，您的邮箱地址仅用于回复您的咨询。", "This website respects your privacy. It does not collect personally identifying information or use tracking cookies. If you contact us by email, your address is used only to reply to your inquiry.")}
		</p>
	</div>
</section>

<!-- §19.7 三条分隔线：dense(5) → sparse(1) → dense(4) -->
<div class="ink-divider ink-divider--sparse" aria-hidden="true"></div>

<section class="grid grid-section">
	<h2 class="section-label copyright-label">{t('致谢', 'Credits')}</h2>
	<div class="copyright-body">
		<p class="copyright-paragraph">
			{t('本网站基于以下技术与资源构建：', 'This website is built with the following tools and resources:')}
		</p>
		<ol class="credits-list">
			<li><span class="credit-name">SvelteKit</span><span class="credit-role">{t('框架', 'Framework')}</span></li>
			<li><span class="credit-name">SVG</span><span class="credit-role">{t('墨线与细微纸纹', 'Ink & paper textures')}</span></li>
			<li><span class="credit-name">Source Han Serif / Songti</span><span class="credit-role">{t('正文字体', 'Body type')}</span></li>
			<li><span class="credit-name">LXGW WenKai / Cormorant Garamond</span><span class="credit-role">{t('标题字体', 'Heading type')}</span></li>
		</ol>
		<p class="copyright-paragraph">
			{t("设计灵感来源于侘寂美学与当代极简主义设计的交叉地带。感谢所有开源社区贡献者。", "The design draws on wabi-sabi aesthetics and contemporary minimalism. Thanks to everyone who contributes to the open-source community.")}
		</p>
	</div>
</section>

<div class="ink-divider ink-divider--dense-b" aria-hidden="true"></div>

<section class="grid grid-section">
	<h2 class="section-label copyright-label">{t('联系', 'Contact')}</h2>
	<div class="copyright-body">
		<p class="copyright-paragraph">
			{t('如对版权事宜有疑问，或希望进行项目合作，请通过邮件联系：', 'For copyright questions or project collaborations, please get in touch by email:')}
		</p>
		<p class="copyright-contact">
			<a class="link-underline" href="mailto:{profile.email}">{profile.email}</a>
		</p>
	</div>
</section>

<div class="spacer" style="--size: 1"></div>

<style>
	.copyright-label {
		grid-column: 1 / 3;
	}

	.copyright-body {
		grid-column: 3 / -1;
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.copyright-paragraph {
		font-family: var(--font-ui);
		font-size: 1.05rem;
		line-height: 1.75;
		color: var(--color-text);
		font-weight: 400;
		max-width: 38em;
		text-wrap: pretty;
		margin-bottom: 1.2rem;
	}

	.copyright-paragraph strong {
		font-weight: 400;
		color: var(--color-text);
	}

	.copyright-meta {
		font-family: var(--font-ui);
		font-size: 0.85rem;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
		margin-top: 1.5rem;
	}

	.credits-list {
		margin: 1.5rem 0;
		max-width: 38em;
	}

	.credits-list li {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: var(--space-4);
		padding: 0.6rem 0;
		border-bottom: 1px solid var(--color-bg-deep);
		border-image: linear-gradient(90deg, transparent, var(--color-bg-deep) 15%, var(--color-bg-deep) 85%, transparent) 1;
	}

	.credits-list li:first-child {
		border-top: 1px solid var(--color-bg-deep);
		border-top-style: solid;
		border-image: linear-gradient(90deg, transparent, var(--color-bg-deep) 15%, var(--color-bg-deep) 85%, transparent) 1;
	}

	.credit-name {
		font-family: var(--font-ui);
		font-size: 1rem;
		color: var(--color-text-muted);
		font-weight: 400;
	}

	.credit-role {
		font-family: var(--font-ui);
		font-size: 0.8rem;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		flex-shrink: 0;
	}

	.copyright-contact {
		font-family: var(--font-ui);
		font-size: 1.1rem;
		color: var(--color-link-hover);
		margin-top: 0.5rem;
	}
	.copyright-contact a { display: inline-flex; align-items: center; min-height: var(--touch-target); max-width: 100%; }

	@media (max-width: 599px) {
		.copyright-label, .copyright-body { grid-column: 1 / -1; }
		.copyright-label { margin-bottom: var(--space-4); font: var(--text-lg)/var(--leading-tight) var(--font-heading); }
		.credit-role { max-width: 6em; text-align: right; }
	}

	@media (min-width: 600px) {
		.copyright-label {
			grid-column: 2 / 4;
		}

		.copyright-body {
			grid-column: 4 / -1;
		}

		.copyright-paragraph {
			font-size: 1.15rem;
		}
	}

	@media (min-width: 900px) {
		.copyright-label {
			grid-column: 3 / 5;
		}

		.copyright-body {
			grid-column: 5 / -2;
		}

		.copyright-paragraph {
			font-size: 1.2rem;
		}
	}

	@media (min-width: 1200px) {
		.copyright-label {
			grid-column: 4 / 6;
		}

		.copyright-body {
			grid-column: 6 / -2;
		}
	}
</style>
