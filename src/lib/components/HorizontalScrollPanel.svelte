<script lang="ts">
	import InlineControl from './InlineControl.svelte';
	import type { GameControl, GameToken, PanelGameControl } from '$lib/game/types';

	let {
		tokens,
		controlById,
		activeControlId,
		hint,
		onScroll
	}: {
		tokens: GameToken[];
		controlById: Record<string, GameControl>;
		activeControlId: string | null;
		hint: string | null;
		onScroll: () => void;
	} = $props();

	function getPanelControl(controlId: string): PanelGameControl {
		const control = controlById[controlId];

		if (control.type === 'overlay') {
			throw new Error('Overlay controls are not panel controls');
		}

		return control;
	}
</script>

<section class="relative h-24 overflow-hidden border-2 border-foreground-600 bg-background-100">
	<div
		data-panel-id="horizontal"
		class="h-full overflow-x-auto overflow-y-hidden whitespace-nowrap px-5 py-5 text-xl leading-10 text-foreground-600"
		onscroll={onScroll}
	>
		{#if hint}
			<div
				class="sticky left-0 z-10 mr-4 inline-block border-4 border-highlight-600 bg-highlight-500 px-4 py-1 text-2xl text-background-100"
			>
				{hint}
			</div>
		{/if}

		<span class="inline-block w-[50vw]"></span>

		{#each tokens as token}
			{#if token.kind === 'word'}
				<span class="mr-2 inline-block">{token.text}</span>
			{:else if token.kind === 'control'}
				<InlineControl
					control={getPanelControl(token.controlId)}
					active={token.controlId === activeControlId}
					onClickControl={() => {}}
					onFormSubmit={() => {}}
				/>
			{/if}
		{/each}

		<span class="inline-block w-[50vw]"></span>
	</div>
</section>
