<script lang="ts">
	import { onMount } from 'svelte';
	import ChallengeFrame from '$lib/components/ChallengeFrame.svelte';
	import RecursiveGridBoard from '$lib/components/boards/RecursiveGridBoard.svelte';
	import {
		clampRecursiveGridConfig,
		defaultRecursiveGridConfig,
		generateRecursiveGridGame,
		recursiveGridConfigLimits,
		type RecursiveGridConfig,
	} from '$lib/game/generate';
	import type { PageData } from './$types';

	const storageKey = 'neru-dojo-grid-config';

	let { data }: { data: PageData } = $props();
	let config = $state<RecursiveGridConfig>(defaultRecursiveGridConfig);
	let game = $derived(generateRecursiveGridGame(data.seed, config));

	onMount(() => {
		config = loadConfig();
	});

	function loadConfig() {
		const stored = localStorage.getItem(storageKey);
		if (!stored) return defaultRecursiveGridConfig;

		try {
			return clampRecursiveGridConfig({ ...defaultRecursiveGridConfig, ...JSON.parse(stored) });
		} catch {
			return defaultRecursiveGridConfig;
		}
	}

	function updateConfig(key: keyof RecursiveGridConfig, event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		config = clampRecursiveGridConfig({ ...config, [key]: Number(input.value) });
		localStorage.setItem(storageKey, JSON.stringify(config));
	}

	function requestFullscreen() {
		document.documentElement.requestFullscreen();
	}
</script>

<ChallengeFrame mode="grid" seed={data.seed} {game}>
	{#snippet startContent()}
		<div class="mt-8 flex max-w-2xl flex-col gap-5 text-left text-2xl">
			<p class="text-center">
				this mode should be played
				<button
					type="button"
					class="border-2 border-foreground-600 bg-background-100 px-3 py-1 text-2xl text-foreground-600 outline-none hover:bg-foreground-600 hover:text-background-100 focus-visible:border-highlight-600"
					onclick={requestFullscreen}
				>
					fullscreen
				</button>
			</p>

			<div class="grid grid-cols-4 items-end gap-3">
				<label class="flex flex-col gap-1">
					<span>rows</span>
					<input
						type="number"
						min={recursiveGridConfigLimits.rows.min}
						max={recursiveGridConfigLimits.rows.max}
						value={config.rows}
						class="w-28 border-2 border-foreground-600 bg-background-100 px-3 py-2 text-2xl text-foreground-600 outline-none focus-visible:border-highlight-600"
						oninput={(event) => updateConfig('rows', event)}
					/>
				</label>
				<label class="flex flex-col gap-1">
					<span>cols</span>
					<input
						type="number"
						min={recursiveGridConfigLimits.cols.min}
						max={recursiveGridConfigLimits.cols.max}
						value={config.cols}
						class="w-28 border-2 border-foreground-600 bg-background-100 px-3 py-2 text-2xl text-foreground-600 outline-none focus-visible:border-highlight-600"
						oninput={(event) => updateConfig('cols', event)}
					/>
				</label>
				<label class="flex flex-col gap-1">
					<span>levels</span>
					<input
						type="number"
						min={recursiveGridConfigLimits.levels.min}
						max={recursiveGridConfigLimits.levels.max}
						value={config.levels}
						class="w-28 border-2 border-foreground-600 bg-background-100 px-3 py-2 text-2xl text-foreground-600 outline-none focus-visible:border-highlight-600"
						oninput={(event) => updateConfig('levels', event)}
					/>
				</label>
				<label class="flex flex-col gap-1">
					<span>targets</span>
					<input
						type="number"
						min={recursiveGridConfigLimits.targetsPerLevel.min}
						max={recursiveGridConfigLimits.targetsPerLevel.max}
						value={config.targetsPerLevel}
						class="w-28 border-2 border-foreground-600 bg-background-100 px-3 py-2 text-2xl text-foreground-600 outline-none focus-visible:border-highlight-600"
						oninput={(event) => updateConfig('targetsPerLevel', event)}
					/>
				</label>
			</div>
		</div>
	{/snippet}

	{#snippet board(_session)}
		<RecursiveGridBoard {..._session} />
	{/snippet}
</ChallengeFrame>
