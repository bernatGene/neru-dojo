<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { getScrollHint } from '$lib/game/scrollHints';
	import OverlayButton from './OverlayButton.svelte';
	import Panel from './Panel.svelte';
	import type { GameModel, PanelId } from '$lib/game/types';

	let {
		game,
		started,
		completed,
		runKey,
		activeControlId,
		onClickControl,
		onFormSubmit
	}: {
		game: GameModel;
		started: boolean;
		completed: boolean;
		runKey: string;
		activeControlId: string | null;
		onClickControl: (id: string) => void;
		onFormSubmit: (id: string, value: string) => void;
	} = $props();

	let hints = $state(emptyHints());
	let hintFrame: number | null = null;
	let activeControl = $derived(activeControlId ? game.controlById[activeControlId] : null);

	onMount(() => {
		window.addEventListener('resize', scheduleHintUpdate);

		return () => {
			window.removeEventListener('resize', scheduleHintUpdate);
			if (hintFrame !== null) cancelAnimationFrame(hintFrame);
		};
	});

	$effect(() => {
		activeControlId;
		started;
		completed;
		runKey;
		void tick().then(scheduleHintUpdate);
	});

	function emptyHints(): Record<PanelId, string | null> {
		return { nav: null, content: null, meta: null };
	}

	function scheduleHintUpdate() {
		if (hintFrame !== null) return;

		hintFrame = requestAnimationFrame(() => {
			hintFrame = null;
			updateHints();
		});
	}

	function updateHints() {
		if (!started || completed || !activeControlId) {
			hints = emptyHints();
			return;
		}

		const control = game.controlById[activeControlId];

		if (control.type === 'overlay') {
			hints = emptyHints();
			return;
		}

		const panel = document.querySelector<HTMLElement>(`[data-panel-id="${control.panelId}"]`);
		const target = panel?.querySelector<HTMLElement>(`[data-control-id="${activeControlId}"]`);

		if (!panel || !target) {
			hints = emptyHints();
			return;
		}

		hints = { ...emptyHints(), [control.panelId]: getScrollHint(panel, target) };
	}
</script>

<div class="relative min-h-0 flex-1">
	{#key runKey}
		<div class="grid h-full gap-5" style="grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr);">
			{#each game.panels as panel}
				<Panel
					{panel}
					controlById={game.controlById}
					{activeControlId}
					hint={hints[panel.id]}
					{onClickControl}
					{onFormSubmit}
					onScroll={scheduleHintUpdate}
				/>
			{/each}
		</div>
	{/key}

	{#if started && !completed && activeControl?.type === 'overlay'}
		<div class="pointer-events-none absolute inset-0 z-10 bg-background-100/5 backdrop-blur-[1px]"></div>
		<OverlayButton id={activeControl.id} x={activeControl.x} y={activeControl.y} onInteract={onClickControl} />
	{/if}
</div>
