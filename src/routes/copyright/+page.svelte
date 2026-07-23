<script>
	import Header from '$lib/components/Header.svelte';
	import { reveal } from '$lib/actions/reveal.js';
	import { profile } from '$lib/domain/profile.js';
	import { siteConfig } from '$lib/config/site.js';

	const year = new Date().getFullYear();
</script>

<svelte:head>
	<title>版权声明 - {profile.name}</title>
	<meta name="description" content="版权声明与使用条款。{profile.name}作品集网站的版权信息、使用条款与隐私说明。" />
	<meta name="robots" content="noindex, follow" />
	<link rel="canonical" href="{siteConfig.url}/copyright" />
</svelte:head>

<Header />

<div class="spacer" style="--size: 1"></div>

<section class="grid grid-section" use:reveal>
	<h2 class="section-label copyright-label">版权</h2>
	<div class="copyright-body">
		<p class="copyright-paragraph">
			本网站所有内容，包括但不限于文字、图像、生成式艺术作品、视觉设计、代码及 Three.js 场景，
			版权归 <strong>{profile.name}</strong> 所有。
		</p>
		<p class="copyright-paragraph">
			未经书面许可，不得以任何形式复制、转载、传播或用于商业目的。
			个人学习与欣赏用途欢迎引用，请注明出处。
		</p>
		<p class="copyright-meta">
			© {year} {profile.name} ({profile.nameEn}). All rights reserved.
		</p>
	</div>
</section>

<div class="ink-divider" aria-hidden="true"></div>

<section class="grid grid-section" use:reveal>
	<h2 class="section-label copyright-label">使用条款</h2>
	<div class="copyright-body">
		<p class="copyright-paragraph">
			访问本网站即表示您同意以下条款。本网站提供的内容仅供参考与欣赏，
			不构成任何专业建议。
		</p>
		<p class="copyright-paragraph">
			本网站使用 WebGL 技术呈现三维场景。如您的设备不支持 WebGL 或已禁用相关功能，
			部分视觉效果可能无法正常显示。文字内容在所有设备上均可访问。
		</p>
		<p class="copyright-paragraph">
			本网站尊重并保护用户隐私。本站不收集个人身份信息，不使用追踪 Cookie。
			如通过邮件联系，您的邮箱地址仅用于回复您的咨询。
		</p>
	</div>
</section>

<div class="ink-divider" aria-hidden="true"></div>

<section class="grid grid-section" use:reveal>
	<h2 class="section-label copyright-label">致谢</h2>
	<div class="copyright-body">
		<p class="copyright-paragraph">
			本网站基于以下技术与资源构建：
		</p>
		<ol class="credits-list">
			<li><span class="credit-name">SvelteKit</span><span class="credit-role">框架</span></li>
			<li><span class="credit-name">Three.js</span><span class="credit-role">三维场景</span></li>
			<li><span class="credit-name">SVG Filters</span><span class="credit-role">文字浮雕与纹理</span></li>
			<li><span class="credit-name">Neue Haas Grotesk</span><span class="credit-role">正文字体</span></li>
			<li><span class="credit-name">Orelo Semi Wide</span><span class="credit-role">展示字体</span></li>
		</ol>
		<p class="copyright-paragraph">
			设计灵感来源于侘寂美学与当代极简主义设计的交叉地带。
			感谢所有开源社区贡献者。
		</p>
	</div>
</section>

<div class="ink-divider" aria-hidden="true"></div>

<section class="grid grid-section" use:reveal>
	<h2 class="section-label copyright-label">联系</h2>
	<div class="copyright-body">
		<p class="copyright-paragraph">
			如对版权事宜有疑问，或希望进行项目合作，请通过邮件联系：
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
	}

	.copyright-paragraph {
		font-family: var(--font-family--body);
		font-size: 1.05rem;
		line-height: 1.75;
		color: var(--ink);
		font-weight: 300;
		max-width: 38em;
		margin-bottom: 1.2rem;
	}

	.copyright-paragraph strong {
		font-weight: 400;
		color: var(--ink);
	}

	.copyright-meta {
		font-family: var(--font-family--body);
		font-size: 0.85rem;
		letter-spacing: 0.05em;
		color: var(--stone);
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
		padding: 0.6rem 0;
		border-bottom: 1px solid var(--sand);
		opacity: 0.5;
		border-image: linear-gradient(90deg, transparent, var(--sand) 15%, var(--sand) 85%, transparent) 1;
	}

	.credits-list li:first-child {
		border-top: 1px solid var(--sand);
		border-top-style: solid;
		border-image: linear-gradient(90deg, transparent, var(--sand) 15%, var(--sand) 85%, transparent) 1;
	}

	.credit-name {
		font-family: var(--font-family--body);
		font-size: 1rem;
		color: var(--ink-soft);
		font-weight: 300;
	}

	.credit-role {
		font-family: var(--font-family--body);
		font-size: 0.8rem;
		color: var(--fog);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.copyright-contact {
		font-family: var(--font-family--body);
		font-size: 1.1rem;
		color: var(--clay);
		margin-top: 0.5rem;
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
