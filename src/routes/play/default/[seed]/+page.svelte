<script lang="ts">
	import ChallengeFrame from '$lib/components/ChallengeFrame.svelte';
	import PanelBoard from '$lib/components/boards/PanelBoard.svelte';
	import { generateDefaultGame } from '$lib/game/generate';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let game = $derived(generateDefaultGame(data.seed, data.words));
</script>

<ChallengeFrame mode="default" seed={data.seed} {game}>
	{#snippet board(_session)}
		<PanelBoard {..._session} />
	{/snippet}
</ChallengeFrame>
