<script lang="ts">
	import { onMount } from 'svelte';
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

	let fullscreenMetrics = $state({ screenHeight: 0, topInset: 0, hasReservedTopArea: false });
	let controlStyle = $derived(activeControl?.type === 'rgrid' ? getControlStyle(activeControl) : '');

	onMount(() => {
		const update = () => {
			const screenHeight = window.screen.height;
			const topInset = Math.max(0, screenHeight - window.innerHeight);

			fullscreenMetrics = {
				screenHeight,
				topInset,
				hasReservedTopArea: document.fullscreenElement !== null && topInset > 0,
			};
		};

		update();

		window.addEventListener('resize', update);
		document.addEventListener('fullscreenchange', update);

		return () => {
			window.removeEventListener('resize', update);
			document.removeEventListener('fullscreenchange', update);
		};
	});

	function getControlStyle(control: RecursiveGridGameControl) {
		if (!fullscreenMetrics.hasReservedTopArea) {
			return `left: ${control.x}%; top: ${control.y}%; width: ${control.width}%; height: ${control.height}%;`;
		}

		let y = control.y;
		const safeTopPercent = (fullscreenMetrics.topInset / fullscreenMetrics.screenHeight) * 100;

		if (y < safeTopPercent) {
			const steps = Math.ceil((safeTopPercent - y) / control.height);
			y += steps * control.height;
		}

		const top = (y / 100) * fullscreenMetrics.screenHeight - fullscreenMetrics.topInset;
		const height = (control.height / 100) * fullscreenMetrics.screenHeight;

		return `left: ${control.x}%; top: ${top}px; width: ${control.width}%; height: ${height}px;`;
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
