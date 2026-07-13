<script lang="ts">
	import { onMount } from 'svelte';
	import ChallengeFrame from '$lib/components/ChallengeFrame.svelte';
	import PanelBoard from '$lib/components/boards/PanelBoard.svelte';
	import SeedRedirect from '$lib/components/SeedRedirect.svelte';
	import {
		clampDefaultGameConfig,
		defaultDefaultGameConfig,
		defaultGameConfigLimits,
		generateDefaultGame,
		getDefaultTaskMixTotal,
		rebalanceDefaultTaskMix,
		redistributeDefaultTaskMix,
		type DefaultGameConfig,
		type DefaultTaskMixKey,
	} from '$lib/game/generate';
	import type { PageData } from './$types';

	const storageKey = 'neru-dojo-default-config';

	let { data }: { data: PageData } = $props();
	let config = $state<DefaultGameConfig>(defaultDefaultGameConfig);
	let totalTasks = $derived(getDefaultTaskMixTotal(config.taskMix));

	onMount(() => {
		config = loadConfig();
	});

	function loadConfig() {
		const stored = localStorage.getItem(storageKey);
		if (!stored) return defaultDefaultGameConfig;

		try {
			return clampDefaultGameConfig({ ...defaultDefaultGameConfig, ...JSON.parse(stored) });
		} catch {
			return defaultDefaultGameConfig;
		}
	}

	function updateTextLength(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		config = clampDefaultGameConfig({ ...config, textLengthMultiplier: Number(input.value) });
		localStorage.setItem(storageKey, JSON.stringify(config));
	}

	function updateTaskMix(key: DefaultTaskMixKey, event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		config = clampDefaultGameConfig({
			...config,
			taskMix: rebalanceDefaultTaskMix(config.taskMix, key, Number(input.value)),
		});
		localStorage.setItem(storageKey, JSON.stringify(config));
	}

	function updateTotalTasks(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		config = clampDefaultGameConfig({
			...config,
			taskMix: redistributeDefaultTaskMix(Number(input.value)),
		});
		localStorage.setItem(storageKey, JSON.stringify(config));
	}
</script>

{#if data.seed && data.words}
	{@const game = generateDefaultGame(data.seed, data.words, config)}
	<ChallengeFrame mode="default" seed={data.seed} {game}>
		{#snippet startContent()}
			<div class="mt-8 flex flex-col gap-4 text-2xl">
				<div class="flex items-center justify-center gap-6">
					<label class="flex items-center gap-4">
						<span>text length</span>
						<input
							type="number"
							min={defaultGameConfigLimits.textLengthMultiplier.min}
							max={defaultGameConfigLimits.textLengthMultiplier.max}
							value={config.textLengthMultiplier}
							class="w-24 border-2 border-foreground-600 bg-background-100 px-3 py-2 text-2xl text-foreground-600 outline-none focus-visible:border-highlight-600"
							oninput={updateTextLength}
						/>
						<span>x</span>
					</label>

					<label class="flex items-center gap-4">
						<span>tasks</span>
						<input
							type="number"
							min={defaultGameConfigLimits.taskCount.min}
							max={defaultGameConfigLimits.taskCount.max}
							value={totalTasks}
							class="w-24 border-2 border-foreground-600 bg-background-100 px-3 py-2 text-2xl text-foreground-600 outline-none focus-visible:border-highlight-600"
							oninput={updateTotalTasks}
						/>
					</label>
				</div>

				<div class="grid grid-cols-3 gap-3">
					<label class="flex flex-col gap-1 text-left">
						<span>inline</span>
						<input
							type="number"
							min={defaultGameConfigLimits.taskMix.min}
							max={totalTasks}
							value={config.taskMix.inlineClick}
							class="w-32 border-2 border-foreground-600 bg-background-100 px-3 py-2 text-2xl text-foreground-600 outline-none focus-visible:border-highlight-600"
							oninput={(event) => updateTaskMix('inlineClick', event)}
						/>
					</label>
					<label class="flex flex-col gap-1 text-left">
						<span>input</span>
						<input
							type="number"
							min={defaultGameConfigLimits.taskMix.min}
							max={totalTasks}
							value={config.taskMix.input}
							class="w-32 border-2 border-foreground-600 bg-background-100 px-3 py-2 text-2xl text-foreground-600 outline-none focus-visible:border-highlight-600"
							oninput={(event) => updateTaskMix('input', event)}
						/>
					</label>
					<label class="flex flex-col gap-1 text-left">
						<span>float</span>
						<input
							type="number"
							min={defaultGameConfigLimits.taskMix.min}
							max={totalTasks}
							value={config.taskMix.floatClick}
							class="w-32 border-2 border-foreground-600 bg-background-100 px-3 py-2 text-2xl text-foreground-600 outline-none focus-visible:border-highlight-600"
							oninput={(event) => updateTaskMix('floatClick', event)}
						/>
					</label>
				</div>
			</div>
		{/snippet}

		{#snippet board(_session)}
			<PanelBoard {..._session} />
		{/snippet}
	</ChallengeFrame>
{:else if !data.seed}
	<SeedRedirect />
{/if}
