<script lang="ts">
	import InlineControl from './InlineControl.svelte';
	import type { GameControl, GamePanel, InlineGameControl } from '$lib/game/types';

	let {
		panel,
		controlById,
		activeControlId,
		hint,
		onClickControl,
		onFormSubmit,
		onScroll
	}: {
		panel: GamePanel;
		controlById: Record<string, GameControl>;
		activeControlId: string | null;
		hint: string | null;
		onClickControl: (id: string) => void;
		onFormSubmit: (id: string, value: string) => void;
		onScroll: () => void;
	} = $props();

	let bottomHint = $derived(Boolean(hint?.includes('down') || hint?.includes('bottom')));

	function getInlineControl(controlId: string): InlineGameControl {
		const control = controlById[controlId];

		if (control.type === 'overlay') {
			throw new Error('Overlay controls are not panel controls');
		}

		return control;
	}
</script>

<section class="flex min-h-0 min-w-0 flex-col overflow-hidden border-2 border-foreground-600 bg-background-100">
	<header class="border-b-2 border-foreground-600 px-5 py-3 text-xl text-foreground-600">
		{panel.title}
	</header>

	<div
		data-panel-id={panel.id}
		class="relative flex-1 overflow-y-auto px-5 py-5 text-xl leading-10 text-foreground-600"
		onscroll={onScroll}
	>
		{#if hint && !bottomHint}
			<div
				class="sticky top-0 z-10 mb-4 border-4 border-highlight-600 bg-highlight-500 px-4 py-3 text-2xl text-background-100"
			>
				{hint}
			</div>
		{/if}

		<div class="max-w-none">
			{#each panel.tokens as token}
				{#if token.kind === 'word'}
					<span class="mr-2 inline-block">{token.text}</span>
				{:else if token.kind === 'break'}
					<span class="block h-8"></span>
				{:else}
					<InlineControl
						control={getInlineControl(token.controlId)}
						active={token.controlId === activeControlId}
						{onClickControl}
						{onFormSubmit}
					/>
				{/if}
			{/each}
		</div>

		{#if hint && bottomHint}
			<div
				class="sticky bottom-0 z-10 mt-4 border-4 border-highlight-600 bg-highlight-500 px-4 py-3 text-2xl text-background-100"
			>
				{hint}
			</div>
		{/if}
	</div>
</section>
