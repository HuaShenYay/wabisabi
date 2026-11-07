<script>
	import { page } from '$app/state';
	import { getLocale, translator } from '$lib/i18n';
	const locale = $derived(getLocale(page.data.locale));
	const t = $derived(translator(locale));

	import { profile as seedProfile } from '$lib/domain/profile.js';
	import { focusAreas as seedFocus, education as seedEducation, designPhilosophy as seedPhilosophy } from '$lib/domain/portfolio.js';
	let { data } = $props();
	const profile = $derived(data?.profile ?? seedProfile);
	const focusAreas = $derived(data?.focusAreas ?? seedFocus);
	const education = $derived(data?.education ?? seedEducation);
	const philosophy = $derived(data?.philosophy ?? seedPhilosophy);
	const biography = $derived(String(profile.bio).split(/(?<=[。！？])/).filter(part => part.trim()));
</script>

<div class="about site-shell" id="about">
	<!-- §19.7 四叶断口序列：dense(5) → sparse(1) → dense(4) → sparse(1) -->
	<section class="note-section note-section--a" aria-labelledby="about-heading">
		<span class="ink-rule ink-rule--dense" aria-hidden="true"></span>
		<header><h1 id="about-heading">{t('关于', 'About')}</h1>{#if locale === 'zh'}<p>About</p>{/if}</header>
		<div class="note-content biography" lang="zh-CN">{#each biography as paragraph}<p>{paragraph}</p>{/each}</div>
	</section>
	<section class="note-section note-section--b" aria-labelledby="focus-heading">
		<span class="ink-rule ink-rule--sparse" aria-hidden="true"></span>
		<header><h2 id="focus-heading">{t('关注', 'Interests')}</h2>{#if locale === 'zh'}<p>Interests</p>{/if}</header>
		<ul class="note-content note-list" lang="zh-CN">
			{#each focusAreas as area}<li><h3>{area.label}</h3><p>{area.desc}</p></li>{/each}
		</ul>
	</section>
	<section class="note-section note-section--c" aria-labelledby="education-heading">
		<span class="ink-rule ink-rule--dense-b" aria-hidden="true"></span>
		<header><h2 id="education-heading">{t('学行', 'Education')}</h2>{#if locale === 'zh'}<p>Education</p>{/if}</header>
		<ul class="note-content note-list" lang="zh-CN">
			{#each education as entry}<li><h3>{entry.school}</h3><p>{entry.major}</p>{#if entry.note}<p>{entry.note}</p>{/if}</li>{/each}
		</ul>
	</section>
	{#if philosophy.length}
		<section class="note-section note-section--d" aria-labelledby="philosophy-heading">
			<span class="ink-rule ink-rule--sparse-b" aria-hidden="true"></span>
			<header><h2 id="philosophy-heading">{t('造物观', 'Approach')}</h2>{#if locale === 'zh'}<p>Approach</p>{/if}</header>
			<div class="note-content note-list" lang="zh-CN">{#each philosophy as entry}<div><h3>{entry.label}</h3><p>{entry.desc}</p></div>{/each}</div>
		</section>
	{/if}
</div>

<style>
	/* §21 独立成页后，页首留一段「翻开新页」的呼吸；与样张注入值一致。 */
	.about { margin-top: var(--space-7); scroll-margin-top: var(--space-5); }
	.note-section { position: relative; display: grid; gap: var(--space-6); padding-inline: clamp(12px, 2.2vw, 32px); }
	.note-section > .ink-rule { position: absolute; top: 0; left: 0; }
	/* 各段保留错落比例、留白与墨线，统一露出页面底层纸纹。 */
	.note-section--a { grid-template-columns: 34fr 66fr; padding-block: var(--space-6) var(--space-7); padding-inline: clamp(12px, 2.2vw, 32px); }
	.note-section--a > .ink-rule { width: 72%; }
	.note-section--b { grid-template-columns: 60fr 40fr; padding-block: var(--space-7) var(--space-6); padding-inline: clamp(20px, 3vw, 46px); }
	.note-section--b header { grid-column: 2; grid-row: 1; text-align: right; }
	.note-section--b .note-content { grid-column: 1; grid-row: 1; }
	.note-section--b > .ink-rule { width: 94%; left: 6%; }
	.note-section--c { grid-template-columns: 26fr 74fr; padding-block: var(--space-6) var(--space-8); padding-inline: clamp(8px, 1.6vw, 22px); }
	.note-section--c > .ink-rule { width: 58%; left: 2%; }
	.note-section--d { grid-template-columns: 44fr 56fr; padding-block: var(--space-5) var(--space-7); padding-inline: clamp(14px, 2.6vw, 36px); }
	.note-section--d > .ink-rule { width: 80%; left: 20%; }
	/* §21 独立成页后，「关于」升为 h1；可见文字与字号不变，其余三叶仍是 h2。 */
	h1, h2 { font: var(--text-xl)/1.5 var(--font-heading); letter-spacing: .12em; font-weight: 400; }
	header p { margin-top: var(--space-2); font: italic var(--text-base)/1.5 var(--font-display-latin); color: var(--color-text-muted); }
	.note-content { max-width: 36em; font: var(--text-base)/2 var(--font-body); overflow-wrap: anywhere; }
	.biography p + p { margin-top: var(--space-4); }
	.note-list { display: grid; gap: var(--space-5); }
	h3 { font: var(--text-lg)/1.6 var(--font-heading); }
	.note-list p { margin-top: var(--space-2); color: var(--color-text-muted); font-size: var(--text-sm); }
	@media (max-width: 600px) {
		.about { margin-top: var(--space-6); }
		.note-section { grid-template-columns: 1fr; gap: var(--space-4); padding-inline: 12px; padding-block: var(--space-5) var(--space-6); }
		.note-section--b header, .note-section--b .note-content { grid-column: 1; grid-row: auto; }
		.note-section--b header { text-align: left; }
		.note-section > .ink-rule { width: 78%; left: 0; }
	}
</style>
