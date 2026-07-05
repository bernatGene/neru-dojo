<script lang="ts">
	import { onMount, tick } from 'svelte';
	import OverlayButton from '$lib/components/OverlayButton.svelte';
	import Panel from '$lib/components/Panel.svelte';
	import { getHorizontalScrollHint, getScrollHint } from '$lib/game/scrollHints';
	import type { ScrollGameControl } from '$lib/game/types';
	import BoardShell from './BoardShell.svelte';
	import type { BoardProps } from './types';

	type ActiveHint = { panelId: string; text: string } | null;
	type Guide = { axis: 'vertical' | 'horizontal'; left: number; top: number; width: number; height: number; start: number; end: number };
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
		onScrollComplete,
		onStart,
		scroll = false,
	}: BoardProps & { scroll?: boolean } = $props();

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
			if (scroll) updateScrollGuide();
		});
	}

	function updateHints() {
		if (
			!started ||
			completed ||
			!activeControlId ||
			!activeControl ||
			activeControl.type === 'overlay' ||
			activeControl.type === 'menu' ||
			activeControl.type === 'rgrid'
		) {
			activeHint = null;
			return;
		}

		const elements = getControlElements(activeControl);
		if (activeControl.type === 'scroll' && activeControl.axis === 'horizontal') {
			const text = elements ? getHorizontalScrollHint(elements.panel, elements.target) : null;
			activeHint = text ? { panelId: activeControl.panelId, text } : null;
			return;
		}

		if (!elements) {
			activeHint = null;
			return;
		}

		const text = getScrollHint(elements.panel, elements.target);
		activeHint = text ? { panelId: activeControl.panelId, text } : null;
	}

	function updateScrollGuide() {
		const control = getActiveScrollControl();
		const elements = control ? getControlElements(control) : null;

		if (!control || !elements || !board) {
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

		guide = { axis: control.axis, left: panelRect.left - boardRect.left, top: panelRect.top - boardRect.top, width: panelRect.width, height: panelRect.height, start, end };

		if (isTargetInsideGuide(control.axis, panelRect, targetRect, start, end)) startHold(control.id);
		else cancelHold();
	}

	function getActiveScrollControl(): ScrollGameControl | null {
		return scroll && started && !completed && activeControl?.type === 'scroll' ? activeControl : null;
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

	function isTargetInsideGuide(axis: 'vertical' | 'horizontal', panelRect: DOMRect, targetRect: DOMRect, start: number, end: number) {
		return axis === 'vertical'
			? targetRect.top >= panelRect.top + start && targetRect.bottom <= panelRect.top + end
			: targetRect.left >= panelRect.left + start && targetRect.right <= panelRect.left + end;
	}

	function startHold(controlId: string) {
		if (holdTimer !== null) return;
		holdTimer = window.setTimeout(() => {
			holdTimer = null;
			if (isActiveScrollInsideGuide(controlId)) onScrollComplete(controlId);
		}, 150);
	}

	function isActiveScrollInsideGuide(controlId: string) {
		const control = getActiveScrollControl();
		const elements = control ? getControlElements(control) : null;
		return Boolean(control && elements && control.id === controlId && guide && isTargetInsideGuide(control.axis, elements.panel.getBoundingClientRect(), elements.target.getBoundingClientRect(), guide.start, guide.end));
	}

	function cancelHold() {
		if (holdTimer !== null) {
			window.clearTimeout(holdTimer);
			holdTimer = null;
		}
	}
</script>

<BoardShell {started} {completed} {onStart}>
	<div bind:this={board} class="relative h-full">
		{#key runKey}
			<div class={scroll ? 'flex h-full flex-col gap-5' : 'h-full'}>
				<div class={`grid min-h-0 gap-5 ${scroll ? 'flex-1' : 'h-full'}`} style="grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr);">
					{#each game.panels as panel}
						<Panel {panel} {activeControlId} hint={activeHint?.panelId === panel.id ? activeHint.text : null} endPadding={scroll} {onClickControl} {onFormSubmit} onScroll={scheduleHintUpdate} />
					{/each}
				</div>

				{#if scroll}
					<Panel panelId="horizontal" tokens={game.horizontalTokens} {activeControlId} hint={activeHint?.panelId === 'horizontal' ? activeHint.text : null} horizontal {onClickControl} {onFormSubmit} onScroll={scheduleHintUpdate} />
				{/if}
			</div>
		{/key}

		{#if guide}
			<div class="pointer-events-none absolute z-20 overflow-hidden" style={`left: ${guide.left}px; top: ${guide.top}px; width: ${guide.width}px; height: ${guide.height}px;`}>
				{#each [guide.start, guide.end] as position}
					<div class={guide.axis === 'vertical' ? 'pointer-events-none absolute left-0 right-0 z-20 border-t-4 border-highlight-600' : 'pointer-events-none absolute bottom-0 top-0 z-20 border-l-4 border-highlight-600'} style={guide.axis === 'vertical' ? `top: ${position}px;` : `left: ${position}px;`}></div>
				{/each}
			</div>
		{/if}

		{#if started && !completed && activeControl?.type === 'overlay'}
			<div class="pointer-events-none absolute inset-0 z-10 bg-background-100/5 backdrop-blur-[1px]"></div>
			<OverlayButton id={activeControl.id} x={activeControl.x} y={activeControl.y} width={activeControl.width} height={activeControl.height} onInteract={onClickControl} />
		{/if}
	</div>
</BoardShell>
