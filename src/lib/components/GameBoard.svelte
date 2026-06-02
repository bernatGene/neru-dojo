<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { getHorizontalScrollHint, getScrollHint } from '$lib/game/scrollHints';
	import HorizontalScrollPanel from './HorizontalScrollPanel.svelte';
	import OverlayButton from './OverlayButton.svelte';
	import Panel from './Panel.svelte';
	import ScrollGuide from './ScrollGuide.svelte';
	import type { GameModel, PanelId, ScrollGameControl } from '$lib/game/types';

type Guide = {
	axis: 'vertical' | 'horizontal';
	left: number;
	top: number;
	width: number;
	height: number;
	start: number;
	end: number;
};

	let {
		game,
		started,
		completed,
		runKey,
		activeControlId,
		onClickControl,
		onFormSubmit,
		onScrollComplete
	}: {
		game: GameModel;
		started: boolean;
		completed: boolean;
		runKey: string;
		activeControlId: string | null;
		onClickControl: (id: string) => void;
		onFormSubmit: (id: string, value: string) => void;
		onScrollComplete: (id: string) => void;
	} = $props();

	let hints = $state(emptyHints());
	let horizontalHint = $state<string | null>(null);
	let measureFrame: number | null = null;
	let holdTimer: number | null = null;
	let holdControlId: string | null = null;
	let board = $state<HTMLElement | null>(null);
	let guide = $state<Guide | null>(null);
	let activeControl = $derived(activeControlId ? game.controlById[activeControlId] : null);

	onMount(() => {
		window.addEventListener('resize', scheduleHintUpdate);

		return () => {
			window.removeEventListener('resize', scheduleHintUpdate);
			if (measureFrame !== null) cancelAnimationFrame(measureFrame);
			cancelHold();
		};
	});

	$effect(() => {
		activeControlId;
		started;
		completed;
		runKey;
		cancelHold();
		void tick().then(scheduleHintUpdate);
	});

	function emptyHints(): Record<PanelId, string | null> {
		return { nav: null, content: null, meta: null };
	}

	function scheduleHintUpdate() {
		if (measureFrame !== null) return;

		measureFrame = requestAnimationFrame(() => {
			measureFrame = null;
			updateHints();
			updateScrollGuide();
		});
	}

	function updateHints() {
		if (game.mode === 'click' || !started || completed || !activeControlId) {
			hints = emptyHints();
			horizontalHint = null;
			return;
		}

		const control = game.controlById[activeControlId];

		if (control.type === 'overlay') {
			hints = emptyHints();
			horizontalHint = null;
			return;
		}

		if (control.type === 'scroll' && control.axis === 'horizontal') {
			const panel = document.querySelector<HTMLElement>(`[data-panel-id="${control.panelId}"]`);
			const target = panel?.querySelector<HTMLElement>(`[data-control-id="${activeControlId}"]`);

			hints = emptyHints();
			horizontalHint = panel && target ? getHorizontalScrollHint(panel, target) : null;
			return;
		}

		const panel = document.querySelector<HTMLElement>(`[data-panel-id="${control.panelId}"]`);
		const target = panel?.querySelector<HTMLElement>(`[data-control-id="${activeControlId}"]`);

		if (!panel || !target) {
			hints = emptyHints();
			return;
		}

		hints = { ...emptyHints(), [control.panelId]: getScrollHint(panel, target) };
		horizontalHint = null;
	}

	function updateScrollGuide() {
		const control = getActiveScrollControl();

		if (!control || !board) {
			guide = null;
			cancelHold();
			return;
		}

		const panel = document.querySelector<HTMLElement>(`[data-panel-id="${control.panelId}"]`);
		const target = panel?.querySelector<HTMLElement>(`[data-control-id="${control.id}"]`);

		if (!panel || !target) {
			guide = null;
			cancelHold();
			return;
		}

		const panelRect = panel.getBoundingClientRect();
		const targetRect = target.getBoundingClientRect();
		const boardRect = board.getBoundingClientRect();
		const separation = control.axis === 'vertical' ? targetRect.height * 4 : targetRect.width * 1.5;
		const size = control.axis === 'vertical' ? panelRect.height : panelRect.width;
		const center = getGuideCenter(size, separation, control.guidePosition);
		const start = center - separation / 2;
		const end = center + separation / 2;

		guide = {
			axis: control.axis,
			left: panelRect.left - boardRect.left,
			top: panelRect.top - boardRect.top,
			width: panelRect.width,
			height: panelRect.height,
			start,
			end,
		};

		if (isTargetInsideGuide(control.axis, panelRect, targetRect, start, end)) {
			startHold(control.id);
		} else {
			cancelHold();
		}
	}

	function getActiveScrollControl(): ScrollGameControl | null {
		if (game.mode !== 'scroll' || !started || completed || !activeControlId) return null;

		const control = game.controlById[activeControlId];
		return control.type === 'scroll' ? control : null;
	}

	function getGuideCenter(size: number, separation: number, position: number) {
		const middleStart = size * 0.28;
		const middleEnd = size * 0.72;
		const min = Math.min(Math.max(12 + separation / 2, middleStart), size / 2);
		const max = Math.max(Math.min(size - 12 - separation / 2, middleEnd), min);

		return min + (max - min) * position;
	}

	function isTargetInsideGuide(
		axis: 'vertical' | 'horizontal',
		panelRect: DOMRect,
		targetRect: DOMRect,
		start: number,
		end: number,
	) {
		if (axis === 'vertical') {
			return targetRect.top >= panelRect.top + start && targetRect.bottom <= panelRect.top + end;
		}

		return targetRect.left >= panelRect.left + start && targetRect.right <= panelRect.left + end;
	}

	function startHold(controlId: string) {
		if (holdControlId === controlId && holdTimer !== null) return;

		cancelHold();
		holdControlId = controlId;
		holdTimer = window.setTimeout(() => {
			holdTimer = null;

			if (holdControlId === controlId && isActiveScrollInsideGuide(controlId)) {
				onScrollComplete(controlId);
			}
		}, 150);
	}

	function isActiveScrollInsideGuide(controlId: string) {
		const control = getActiveScrollControl();

		if (!control || control.id !== controlId || !guide) return false;

		const panel = document.querySelector<HTMLElement>(`[data-panel-id="${control.panelId}"]`);
		const target = panel?.querySelector<HTMLElement>(`[data-control-id="${control.id}"]`);

		return panel && target
			? isTargetInsideGuide(
					control.axis,
					panel.getBoundingClientRect(),
					target.getBoundingClientRect(),
					guide.start,
					guide.end,
				)
			: false;
	}

	function cancelHold() {
		if (holdTimer !== null) {
			window.clearTimeout(holdTimer);
			holdTimer = null;
		}

		holdControlId = null;
	}
</script>

{#if game.mode === 'click'}
	<div class="relative min-h-0 flex-1">
		{#key runKey}
			<div class="relative h-full w-full border-2 border-foreground-600 bg-background-100">
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
			</div>
		{/key}
	</div>
{:else}
	<div class="relative min-h-0 flex-1" bind:this={board}>
		{#key runKey}
			<div class={game.mode === 'scroll' ? 'flex h-full flex-col gap-5' : 'h-full'}>
				<div
					class={`grid min-h-0 gap-5 ${game.mode === 'scroll' ? 'flex-1' : 'h-full'}`}
					style="grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr);"
				>
					{#each game.panels as panel}
						<Panel
							{panel}
							controlById={game.controlById}
							{activeControlId}
							hint={hints[panel.id]}
							endPadding={game.mode === 'scroll'}
							{onClickControl}
							{onFormSubmit}
							onScroll={scheduleHintUpdate}
						/>
					{/each}
				</div>

				{#if game.mode === 'scroll'}
					<HorizontalScrollPanel
						tokens={game.horizontalTokens}
						controlById={game.controlById}
						{activeControlId}
						hint={horizontalHint}
						onScroll={scheduleHintUpdate}
					/>
				{/if}
			</div>
		{/key}

		{#if guide}
			<div
				class="pointer-events-none absolute z-20 overflow-hidden"
				style={`left: ${guide.left}px; top: ${guide.top}px; width: ${guide.width}px; height: ${guide.height}px;`}
			>
				<ScrollGuide axis={guide.axis} start={guide.start} end={guide.end} />
			</div>
		{/if}

		{#if started && !completed && activeControl?.type === 'overlay'}
			<div class="pointer-events-none absolute inset-0 z-10 bg-background-100/5 backdrop-blur-[1px]"></div>
			<OverlayButton id={activeControl.id} x={activeControl.x} y={activeControl.y} onInteract={onClickControl} />
		{/if}
	</div>
{/if}
