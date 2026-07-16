<script lang="ts">
	import ChallengeFrame from '$lib/components/ChallengeFrame.svelte';
	import RecursiveGridBoard from '$lib/components/boards/RecursiveGridBoard.svelte';
	import SeedRedirect from '$lib/components/SeedRedirect.svelte';
	import { modeHref } from '$lib/game/modes';
	import {
		clampRecursiveGridConfig,
		defaultRecursiveGridConfig,
		generateRecursiveGridGame,
		recursiveGridConfigLimits,
		type RecursiveGridConfig,
	} from '$lib/game/generate';
	import { encodeModeSeed, rgridConfigStorageKey } from '$lib/game/configEncoding';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let config = $state<RecursiveGridConfig>(defaultRecursiveGridConfig);
	let game = $derived(data.seed ? generateRecursiveGridGame(data.seed, config) : null);

	$effect.pre(() => {
		config = data.config ?? defaultRecursiveGridConfig;
	});

	$effect(() => {
		const effectiveConfig = data.config ?? defaultRecursiveGridConfig;
		if (!data.baseSeed) return;

		const nextUrl = modeHref('rgrid', encodeModeSeed('rgrid', data.baseSeed, effectiveConfig));
		if (nextUrl !== window.location.pathname + window.location.search) {
			history.replaceState(null, '', nextUrl);
		}
	});

	function syncConfig(nextConfig: RecursiveGridConfig) {
		config = clampRecursiveGridConfig(nextConfig);
		localStorage.setItem(rgridConfigStorageKey, JSON.stringify(config));

		if (data.baseSeed) {
			history.replaceState(
				null,
				'',
				modeHref('rgrid', encodeModeSeed('rgrid', data.baseSeed, config)),
			);
		}
	}

	function updateConfig(key: keyof RecursiveGridConfig, event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		syncConfig({ ...config, [key]: Number(input.value) });
	}

	function requestFullscreen() {
		document.documentElement.requestFullscreen();
	}
</script>

{#if data.seed && game}
	<ChallengeFrame mode="rgrid" seed={data.seed} {game}>
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
{:else}
	<SeedRedirect mode="rgrid" />
{/if}
