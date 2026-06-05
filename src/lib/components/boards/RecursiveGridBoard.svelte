<script lang="ts">
	import BoardShell from './BoardShell.svelte';
	import type { BoardProps } from './types';

	let {
		started,
		completed,
		runKey,
		activeControl,
		onClickControl,
		onClickMiss,
		onStart,
		startContent,
	}: BoardProps = $props();

	function handleMiss() {
		if (started && !completed) onClickMiss();
	}
</script>

<BoardShell {started} {completed} {onStart} {startContent}>
	{#key runKey}
		<button
			type="button"
			class="relative h-full w-full cursor-default border-2 border-foreground-600 bg-background-100"
			onclick={handleMiss}
			aria-label="Recursive grid panel"
		></button>
	{/key}

	{#if started && !completed}
		<div class="fixed inset-0 z-50 bg-background-100">
			<button
				type="button"
				class="absolute inset-0 cursor-default"
				onclick={handleMiss}
				aria-label="Recursive grid miss area"
			></button>

			{#if activeControl?.type === 'grid'}
				<button
					type="button"
					data-control-id={activeControl.id}
					class="absolute z-10 border-2 border-highlight-600 bg-highlight-500 outline-none focus-visible:border-highlight-600"
					style={`left: ${activeControl.x}%; top: ${activeControl.y}%; width: ${activeControl.width}%; height: ${activeControl.height}%;`}
					onclick={() => onClickControl(activeControl.id)}
					aria-label="Click grid target"
				></button>
			{/if}
		</div>
	{/if}
</BoardShell>
