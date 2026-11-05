<script>
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
	<section class="note-section" aria-labelledby="about-heading">
		<span class="ink-rule" aria-hidden="true"></span>
		<header><h2 id="about-heading">关于</h2><p>About</p></header>
		<div class="note-content biography">{#each biography as paragraph}<p>{paragraph}</p>{/each}</div>
	</section>
	<section class="note-section" aria-labelledby="focus-heading">
		<span class="ink-rule" aria-hidden="true"></span>
		<header><h2 id="focus-heading">关注</h2><p>Interests</p></header>
		<ul class="note-content note-list">
			{#each focusAreas as area}<li><h3>{area.label}</h3><p>{area.desc}</p></li>{/each}
		</ul>
	</section>
	<section class="note-section" aria-labelledby="education-heading">
		<span class="ink-rule" aria-hidden="true"></span>
		<header><h2 id="education-heading">学行</h2><p>Education</p></header>
		<ul class="note-content note-list">
			{#each education as entry}<li><h3>{entry.school}</h3><p>{entry.major}</p>{#if entry.note}<p>{entry.note}</p>{/if}</li>{/each}
		</ul>
	</section>
	{#if philosophy.length}
		<section class="note-section" aria-labelledby="philosophy-heading">
			<span class="ink-rule" aria-hidden="true"></span>
			<header><h2 id="philosophy-heading">造物观</h2><p>Approach</p></header>
			<div class="note-content note-list">{#each philosophy as entry}<div><h3>{entry.label}</h3><p>{entry.desc}</p></div>{/each}</div>
		</section>
	{/if}
</div>

<style>
	.about { scroll-margin-top: var(--space-5); }
	.note-section { position: relative; display: grid; grid-template-columns: 1fr 2.3fr; gap: var(--space-6); padding-block: var(--space-6) var(--space-7); }
	.note-section > .ink-rule { position: absolute; top: 0; }
	h2 { font: var(--text-xl)/1.5 var(--font-heading); letter-spacing: .12em; }
	header p { margin-top: var(--space-2); font: italic var(--text-base)/1.5 var(--font-display-latin); color: var(--color-text-muted); }
	.note-content { max-width: 36em; font: var(--text-base)/2 var(--font-body); overflow-wrap: anywhere; }
	.biography p + p { margin-top: var(--space-4); }
	.note-list { display: grid; gap: var(--space-5); }
	h3 { font: var(--text-lg)/1.6 var(--font-heading); }
	.note-list p { margin-top: var(--space-2); color: var(--color-text-muted); font-size: var(--text-sm); }
	@media (max-width: 600px) { .note-section { grid-template-columns: 1fr; gap: var(--space-5); padding-block: var(--space-5) var(--space-6); } }
</style>
