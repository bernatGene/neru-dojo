<script lang="ts">
	import { asset } from '$app/paths';
	import type { Snippet } from 'svelte';

	let {
		started,
		completed,
		onStart,
		children,
	}: {
		started: boolean;
		completed: boolean;
		onStart: () => void;
		children: Snippet;
	} = $props();

	function handleStartKeydown(event: KeyboardEvent) {
		if (started || completed || event.key !== 'Enter' || event.metaKey || event.ctrlKey || event.altKey) {
			return;
		}

		if (event.target instanceof Element && event.target.closest('a, button, input, select, textarea')) {
			return;
		}

		onStart();
	}
</script>

<svelte:window onkeydown={handleStartKeydown} />

<div class="relative h-full min-h-0">
	{@render children()}

	{#if !started && !completed}
		<div
			class="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background-100/95 text-center text-foreground-600"
		>
			<img src={asset('/neru-appicon.png')} alt="Neru" class="h-28 w-28" />
			<span class="mt-8 text-4xl">neru-dojo</span>
			<div class="mt-4 flex items-center gap-3 text-2xl">
				<span>click</span>
				<button
					type="button"
					class="border-2 border-foreground-600 bg-background-100 px-4 py-1 text-2xl text-foreground-600 outline-none hover:bg-foreground-600 hover:text-background-100 focus-visible:border-highlight-600"
					onclick={onStart}
				>
					here
				</button>
				<span>to start</span>
			</div>
			<div class="mt-3 text-2xl">(or press [enter ↵])</div>
		</div>
	{/if}
</div>
