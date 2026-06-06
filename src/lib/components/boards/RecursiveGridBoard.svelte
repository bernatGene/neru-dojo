<script lang="ts">
	import { onMount } from 'svelte';
	import { getFullscreenMetrics, type FullscreenMetrics } from '$lib/browser/fullscreenMetrics';
	import type { RecursiveGridGameControl } from '$lib/game/types';
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

	let fullscreenMetrics = $state<FullscreenMetrics | null>(null);
	let controlStyle = $derived(activeControl?.type === 'rgrid' ? getControlStyle(activeControl) : '');

	onMount(() => {
		const update = () => {
			fullscreenMetrics = getFullscreenMetrics();
			requestAnimationFrame(() => {
				fullscreenMetrics = getFullscreenMetrics();
			});
		};

		update();

		window.addEventListener('resize', update);
		window.visualViewport?.addEventListener('resize', update);
		document.addEventListener('fullscreenchange', update);

		return () => {
			window.removeEventListener('resize', update);
			window.visualViewport?.removeEventListener('resize', update);
			document.removeEventListener('fullscreenchange', update);
		};
	});

	function getControlStyle(control: RecursiveGridGameControl) {
		if (typeof window === 'undefined') {
			return `left: ${control.x}%; top: ${control.y}%; width: ${control.width}%; height: ${control.height}%;`;
		}

		let left = 0;
		let right = window.innerWidth;
		let top = 0;
		let bottom = fullscreenMetrics?.hasReservedTopArea
			? fullscreenMetrics.screenHeight
			: window.innerHeight;

		for (const cell of control.path) {
			[left, right] = divideAxis(left, right, cell.col, control.cols);
			[top, bottom] = divideAxis(top, bottom, cell.row, control.rows);
		}

		if (fullscreenMetrics?.hasReservedTopArea) {
			[top, bottom] = getReachableGridY(top, bottom);
		}

		return pixelStyle(left, top, right, bottom);
	}

	function divideAxis(start: number, end: number, index: number, count: number) {
		const cellSize = Math.trunc((end - start) / count);
		const cellStart = start + index * cellSize;
		const cellEnd = index === count - 1 ? end : start + (index + 1) * cellSize;

		return [cellStart, cellEnd] as const;
	}

	function pixelStyle(left: number, top: number, right: number, bottom: number) {
		return `left: ${left}px; top: ${top}px; width: ${right - left}px; height: ${bottom - top}px;`;
	}

	function getReachableGridY(top: number, bottom: number) {
		if (!fullscreenMetrics?.hasReservedTopArea) return [top, bottom] as const;

		if (bottom > fullscreenMetrics.topInset) {
			return [top - fullscreenMetrics.topInset, bottom - fullscreenMetrics.topInset] as const;
		}

		const height = bottom - top;
		const steps = Math.ceil((fullscreenMetrics.topInset - bottom) / height) + 1;
		const reachableTop = top + steps * height - fullscreenMetrics.topInset;

		return [reachableTop, reachableTop + height] as const;
	}

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

			{#if activeControl?.type === 'rgrid'}
				<button
					type="button"
					data-control-id={activeControl.id}
					class="absolute z-10 border-2 border-highlight-600 bg-highlight-500 outline-none focus-visible:border-highlight-600"
					style={controlStyle}
					onclick={() => onClickControl(activeControl.id)}
					aria-label="Click rgrid target"
				></button>
			{/if}
		</div>
	{/if}
</BoardShell>
