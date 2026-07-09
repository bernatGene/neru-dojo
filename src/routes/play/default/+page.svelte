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
		type DefaultGameConfig,
	} from '$lib/game/generate';
	import type { PageData } from './$types';

	const storageKey = 'neru-dojo-default-config';

	let { data }: { data: PageData } = $props();
	let config = $state<DefaultGameConfig>(defaultDefaultGameConfig);
	let game = $derived(data.seed ? generateDefaultGame(data.seed, data.words, config) : null);

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
</script>

{#if data.seed && game}
	<ChallengeFrame mode="default" seed={data.seed} {game}>
		{#snippet startContent()}
			<label class="mt-8 flex items-center gap-4 text-2xl">
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
		{/snippet}

		{#snippet board(_session)}
			<PanelBoard {..._session} />
		{/snippet}
	</ChallengeFrame>
{:else}
	<SeedRedirect />
{/if}
