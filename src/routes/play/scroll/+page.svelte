<script lang="ts">
	import ChallengeFrame from '$lib/components/ChallengeFrame.svelte';
	import PanelBoard from '$lib/components/boards/PanelBoard.svelte';
	import SeedRedirect from '$lib/components/SeedRedirect.svelte';
	import { generateScrollGame } from '$lib/game/generate';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

{#if data.seed && data.words}
	{@const game = generateScrollGame(data.seed, data.words)}
	<ChallengeFrame mode="scroll" seed={data.seed} {game}>
		{#snippet board(_session)}
			<PanelBoard {..._session} scroll />
		{/snippet}
	</ChallengeFrame>
{:else if !data.seed}
	<SeedRedirect mode="scroll" />
{/if}
