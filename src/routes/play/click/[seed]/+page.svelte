<script lang="ts">
	import ChallengeFrame from '$lib/components/ChallengeFrame.svelte';
	import ClickBoard from '$lib/components/boards/ClickBoard.svelte';
	import { generateClickGame } from '$lib/game/generate';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let game = $derived(generateClickGame(data.seed));
</script>

<ChallengeFrame mode="click" seed={data.seed} {game}>
	{#snippet board(_session)}
		<ClickBoard {..._session} />
	{/snippet}
</ChallengeFrame>
