<script lang="ts">
	import type { RichTextSpan } from '$lib/domain/projects';
	let { content, text = '' }: { content?: readonly RichTextSpan[]; text?: string } = $props();
</script>

{#snippet words(span: RichTextSpan)}
	{#if span.strong && span.em}<strong><em>{span.text}</em></strong>
	{:else if span.strong}<strong>{span.text}</strong>
	{:else if span.em}<em>{span.text}</em>
	{:else}{span.text}{/if}
{/snippet}
{#if content}
	{#each content as span}{#if span.href}<a href={span.href} class="link-underline" rel="noopener noreferrer">{@render words(span)}</a>{:else}{@render words(span)}{/if}{/each}
{:else}{text}{/if}
