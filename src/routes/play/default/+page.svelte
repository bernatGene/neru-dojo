<script lang="ts">
	import ChallengeFrame from '$lib/components/ChallengeFrame.svelte';
	import PanelBoard from '$lib/components/boards/PanelBoard.svelte';
	import SeedRedirect from '$lib/components/SeedRedirect.svelte';
	import { generateDefaultGame } from '$lib/game/generate';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let game = $derived(data.seed ? generateDefaultGame(data.seed, data.words) : null);
</script>

{#if data.seed && game}
	<ChallengeFrame mode="default" seed={data.seed} {game}>
		{#snippet board(_session)}
			<PanelBoard {..._session} />
		{/snippet}
	</ChallengeFrame>
{:else}
	<SeedRedirect />
{/if}
