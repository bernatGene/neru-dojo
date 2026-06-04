<script lang="ts">
	import MenuArena from '$lib/components/MenuArena.svelte';
	import type { MenuGameControl } from '$lib/game/types';
	import BoardShell from './BoardShell.svelte';
	import type { BoardProps } from './types';

	let {
		game,
		started,
		completed,
		runKey,
		activeControl,
		onClickControl,
		onClickMiss,
		onStart,
	}: BoardProps = $props();

	let activeMenuControl = $derived(
		started && !completed && activeControl?.type === 'menu' ? activeControl : null,
	);

</script>

<BoardShell {started} {completed} {onStart}>
	{#key runKey}
		<MenuArena
			controls={game.menuControls}
			activeControl={activeMenuControl as MenuGameControl | null}
			{onClickControl}
			onClickMiss={started && !completed ? onClickMiss : () => {}}
		/>
	{/key}
</BoardShell>
