<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { getHorizontalScrollHint, getScrollHint } from '$lib/game/scrollHints';
	import OverlayButton from './OverlayButton.svelte';
	import Panel from './Panel.svelte';
	import type { GameControl, GameModel, ScrollGameControl } from '$lib/game/types';

type ActiveHint = { panelId: string; text: string } | null;

type Guide = {
	axis: 'vertical' | 'horizontal';
	left: number;
	top: number;
	width: number;
	height: number;
	start: number;
	end: number;
};

type ControlElements = { panel: HTMLElement; target: HTMLElement } | null;

	let {
		game,
		started,
		completed,
		runKey,
		activeControl,
		activeControlId,
		onClickControl,
		onFormSubmit,
		onScrollComplete
	}: {
		game: GameModel;
		started: boolean;
		completed: boolean;
		runKey: string;
		activeControl: GameControl | null;
		activeControlId: string | null;
		onClickControl: (id: string) => void;
		onFormSubmit: (id: string, value: string) => void;
		onScrollComplete: (id: string) => void;
	} = $props();

	let activeHint = $state<ActiveHint>(null);
	let measureFrame: number | null = null;
	let holdTimer: number | null = null;
	let board = $state<HTMLElement | null>(null);
	let guide = $state<Guide | null>(null);

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

	function scheduleHintUpdate() {
		if (measureFrame !== null) return;

		measureFrame = requestAnimationFrame(() => {
			measureFrame = null;
			updateHints();
			updateScrollGuide();
		});
	}

	function updateHints() {
		if (game.mode === 'click' || !started || completed || !activeControlId || !activeControl) {
			activeHint = null;
			return;
		}

		const control = activeControl;

		if (control.type === 'overlay') {
			activeHint = null;
			return;
		}

		const elements = getControlElements(control);

		if (control.type === 'scroll' && control.axis === 'horizontal') {
			const text = elements ? getHorizontalScrollHint(elements.panel, elements.target) : null;
			activeHint = text ? { panelId: control.panelId, text } : null;
			return;
		}

		if (!elements) {
			activeHint = null;
			return;
		}

		const text = getScrollHint(elements.panel, elements.target);
		activeHint = text ? { panelId: control.panelId, text } : null;
	}

	function updateScrollGuide() {
		const control = getActiveScrollControl();

		if (!control || !board) {
			guide = null;
			cancelHold();
			return;
		}

		const elements = getControlElements(control);

		if (!elements) {
			guide = null;
			cancelHold();
			return;
		}

		const panelRect = elements.panel.getBoundingClientRect();
		const targetRect = elements.target.getBoundingClientRect();
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

		return activeControl?.type === 'scroll' ? activeControl : null;
	}

	function getControlElements(control: { id: string; panelId: string }): ControlElements {
		const panel = document.querySelector<HTMLElement>(`[data-panel-id="${control.panelId}"]`);
		const target = panel?.querySelector<HTMLElement>(`[data-control-id="${control.id}"]`);
		return panel && target ? { panel, target } : null;
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
		if (holdTimer !== null) return;

		holdTimer = window.setTimeout(() => {
			holdTimer = null;

			if (isActiveScrollInsideGuide(controlId)) {
				onScrollComplete(controlId);
			}
		}, 150);
	}

	function isActiveScrollInsideGuide(controlId: string) {
		const control = getActiveScrollControl();

		if (!control || control.id !== controlId || !guide) return false;

		const elements = getControlElements(control);

		return elements
			? isTargetInsideGuide(
					control.axis,
					elements.panel.getBoundingClientRect(),
					elements.target.getBoundingClientRect(),
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
	}
</script>

<div class="relative min-h-0 flex-1" bind:this={board}>
		{#key runKey}
			<div
				class={game.mode === 'click'
					? 'relative h-full w-full border-2 border-foreground-600 bg-background-100'
					: game.mode === 'scroll'
						? 'flex h-full flex-col gap-5'
						: 'h-full'}
			>
				{#if game.mode !== 'click'}
				<div
					class={`grid min-h-0 gap-5 ${game.mode === 'scroll' ? 'flex-1' : 'h-full'}`}
					style="grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr);"
				>
					{#each game.panels as panel}
						<Panel
							{panel}
							{activeControlId}
							hint={activeHint?.panelId === panel.id ? activeHint.text : null}
							endPadding={game.mode === 'scroll'}
							{onClickControl}
							{onFormSubmit}
							onScroll={scheduleHintUpdate}
						/>
					{/each}
				</div>

				{#if game.mode === 'scroll'}
					<Panel
						panelId="horizontal"
						tokens={game.horizontalTokens}
						{activeControlId}
						hint={activeHint?.panelId === 'horizontal' ? activeHint.text : null}
						horizontal
						{onClickControl}
						{onFormSubmit}
						onScroll={scheduleHintUpdate}
					/>
				{/if}
				{/if}
			</div>
		{/key}

		{#if guide}
			<div
				class="pointer-events-none absolute z-20 overflow-hidden"
				style={`left: ${guide.left}px; top: ${guide.top}px; width: ${guide.width}px; height: ${guide.height}px;`}
			>
				{#each [guide.start, guide.end] as position}
					<div
						class={guide.axis === 'vertical'
							? 'pointer-events-none absolute left-0 right-0 z-20 border-t-4 border-highlight-600'
							: 'pointer-events-none absolute bottom-0 top-0 z-20 border-l-4 border-highlight-600'}
						style={guide.axis === 'vertical' ? `top: ${position}px;` : `left: ${position}px;`}
					></div>
				{/each}
			</div>
		{/if}

		{#if started && !completed && activeControl?.type === 'overlay'}
			{#if game.mode !== 'click'}
				<div class="pointer-events-none absolute inset-0 z-10 bg-background-100/5 backdrop-blur-[1px]"></div>
			{/if}
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
