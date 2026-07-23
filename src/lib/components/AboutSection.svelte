<script>
	import { reveal } from '$lib/actions/reveal.js';
	import { profile } from '$lib/domain/profile.js';
	import { focusAreas, education, designPhilosophy } from '$lib/domain/portfolio.js';
</script>

<section id="about" class="grid grid-section" use:reveal>
	<h2 class="section-label intro">Intro</h2>
	<p class="body-text section-paragraph intro">
		宋子杰是一位AI人文艺术创作者，长期关注人工智能与当代艺术、游戏文化的交叉地带。他通过生成式工具、视觉叙事和数字实验，探索技术时代的人文表达。他也是一名游戏爱好者，从独立作品到3A大作中寻找灵感与叙事语言。欢迎通过邮件与他交流项目、合作或只是聊聊游戏与艺术：
		<a class="link-underline" href="mailto:{profile.email}">{profile.email}</a>
	</p>

	<div class="ink-divider" aria-hidden="true"></div>

	<h2 class="section-label focus">Focus</h2>
	<ol class="body-text section-list focus">
		{#each focusAreas as area}
			<li><span>{area.label}</span><span>{area.desc}</span></li>
		{/each}
	</ol>

	<div class="ink-divider" aria-hidden="true"></div>

	<h2 class="section-label education">Education</h2>
	<ol class="body-text section-list education">
		{#each education as edu}
			<li><span>{edu.school}</span><span>{edu.major}</span><span>{edu.note}</span></li>
		{/each}
	</ol>

	<div class="ink-divider" aria-hidden="true"></div>

	<h2 class="section-label philosophy">Philosophy</h2>
	<ol class="body-text section-list philosophy">
		{#each designPhilosophy as p}
			<li><span>{p.label}</span><span>{p.desc}</span></li>
		{/each}
	</ol>
</section>

<style>
	.section-label.focus,
	.section-label.education,
	.section-label.philosophy {
		grid-column: 1 / 3;
	}

	.section-list.focus,
	.section-list.education,
	.section-list.philosophy {
		grid-column: 3 / -1;
		margin-bottom: calc(0.5 * var(--spacer-height));
	}

	.section-list.focus li,
	.section-list.philosophy li {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}

	.section-list.focus li span:last-child,
	.section-list.philosophy li span:last-child {
		opacity: 0.5;
		text-align: right;
	}

	.section-list.education li {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem 1.5rem;
		align-items: baseline;
	}

	.section-list.education li span:nth-child(2) {
		color: var(--ink-soft);
	}

	.section-list.education li span:nth-child(3) {
		opacity: 0.5;
		font-size: 0.9em;
	}

	@media (min-width: 600px) {
		.section-label.focus,
		.section-label.education,
		.section-label.philosophy {
			grid-column: 2 / 4;
		}

		.section-list.focus,
		.section-list.education,
		.section-list.philosophy {
			grid-column: 4 / -1;
		}
	}

	@media (min-width: 900px) {
		.section-label.focus,
		.section-label.education,
		.section-label.philosophy {
			grid-column: 3 / 5;
		}

		.section-list.focus,
		.section-list.education,
		.section-list.philosophy {
			grid-column: 5 / -1;
		}
	}

	@media (min-width: 1200px) {
		.section-label.focus,
		.section-label.education,
		.section-label.philosophy {
			grid-column: 4 / 6;
		}

		.section-list.focus,
		.section-list.education,
		.section-list.philosophy {
			grid-column: 6 / -1;
		}
	}
</style>
