<script lang="ts">
	import ChallengeFrame from '$lib/components/ChallengeFrame.svelte';
	import PanelBoard from '$lib/components/boards/PanelBoard.svelte';
	import { generateScrollGame } from '$lib/game/generate';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let game = $derived(generateScrollGame(data.seed, data.words));
</script>

<ChallengeFrame mode="scroll" seed={data.seed} {game}>
	{#snippet board(_session)}
		<PanelBoard {..._session} scroll />
	{/snippet}
</ChallengeFrame>
