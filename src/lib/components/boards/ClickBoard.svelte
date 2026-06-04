<script lang="ts">
	import OverlayButton from '$lib/components/OverlayButton.svelte';
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
	}: BoardProps = $props();

	function handleClickPanel() {
		if (started && !completed) onClickMiss();
	}

</script>

<BoardShell {started} {completed} {onStart}>
	{#key runKey}
		<button
			type="button"
			class="relative h-full w-full cursor-default border-2 border-foreground-600 bg-background-100"
			onclick={handleClickPanel}
			aria-label="Click panel"
		></button>
	{/key}

	{#if started && !completed && activeControl?.type === 'overlay'}
		<OverlayButton
			id={activeControl.id}
			x={activeControl.x}
			y={activeControl.y}
			width={activeControl.width}
			height={activeControl.height}
			onInteract={onClickControl}
		/>
	{/if}
</BoardShell>
