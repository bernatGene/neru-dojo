<script lang="ts">
	import ChallengeFrame from '$lib/components/ChallengeFrame.svelte';
	import ClickBoard from '$lib/components/boards/ClickBoard.svelte';
	import SeedRedirect from '$lib/components/SeedRedirect.svelte';
	import { modeHref } from '$lib/game/modes';
	import {
		clampClickConfig,
		defaultClickConfig,
		generateClickGame,
		clickConfigLimits,
		type ClickConfig,
	} from '$lib/game/generate';
	import { clickConfigStorageKey, encodeModeSeed } from '$lib/game/configEncoding';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let config = $state<ClickConfig>(defaultClickConfig);
	let game = $derived(data.seed ? generateClickGame(data.seed, config) : null);

	$effect.pre(() => {
		config = data.config ?? defaultClickConfig;
	});

	$effect(() => {
		const effectiveConfig = data.config ?? defaultClickConfig;
		if (!data.baseSeed) return;

		const nextUrl = modeHref('click', encodeModeSeed('click', data.baseSeed, effectiveConfig));
		if (nextUrl !== window.location.pathname + window.location.search) {
			history.replaceState(null, '', nextUrl);
		}
	});

	function syncConfig(nextConfig: ClickConfig) {
		config = clampClickConfig(nextConfig);
		localStorage.setItem(clickConfigStorageKey, JSON.stringify(config));

		if (data.baseSeed) {
			history.replaceState(
				null,
				'',
				modeHref('click', encodeModeSeed('click', data.baseSeed, config)),
			);
		}
	}

	function updateConfig(key: keyof ClickConfig, event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		syncConfig({ ...config, [key]: Number(input.value) });
	}

	function requestFullscreen() {
		document.documentElement.requestFullscreen();
	}
</script>

{#if data.seed && game}
	<ChallengeFrame mode="click" seed={data.seed} {game}>
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

				<div class="grid grid-cols-3 items-end gap-3">
					<label class="flex flex-col gap-1">
						<span>targets</span>
						<input
							type="number"
							min={clickConfigLimits.targets.min}
							max={clickConfigLimits.targets.max}
							value={config.targets}
							class="w-28 border-2 border-foreground-600 bg-background-100 px-3 py-2 text-2xl text-foreground-600 outline-none focus-visible:border-highlight-600"
							oninput={(event) => updateConfig('targets', event)}
						/>
					</label>
					<label class="flex flex-col gap-1">
						<span>min size %</span>
						<input
							type="number"
							min={clickConfigLimits.minSize.min}
							max={clickConfigLimits.minSize.max}
							value={config.minSize}
							class="w-28 border-2 border-foreground-600 bg-background-100 px-3 py-2 text-2xl text-foreground-600 outline-none focus-visible:border-highlight-600"
							oninput={(event) => updateConfig('minSize', event)}
						/>
					</label>
					<label class="flex flex-col gap-1">
						<span>max size %</span>
						<input
							type="number"
							min={clickConfigLimits.maxSize.min}
							max={clickConfigLimits.maxSize.max}
							value={config.maxSize}
							class="w-28 border-2 border-foreground-600 bg-background-100 px-3 py-2 text-2xl text-foreground-600 outline-none focus-visible:border-highlight-600"
							oninput={(event) => updateConfig('maxSize', event)}
						/>
					</label>
				</div>
			</div>
		{/snippet}

		{#snippet board(_session)}
			<ClickBoard {..._session} />
		{/snippet}
	</ChallengeFrame>
{:else}
	<SeedRedirect mode="click" />
{/if}