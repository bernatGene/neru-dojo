<script lang="ts">
	import ChallengeFrame from '$lib/components/ChallengeFrame.svelte';
	import ClickBoard from '$lib/components/boards/ClickBoard.svelte';
	import SeedRedirect from '$lib/components/SeedRedirect.svelte';
	import { generateClickGame } from '$lib/game/generate';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let game = $derived(data.seed ? generateClickGame(data.seed) : null);
</script>

{#if data.seed && game}
	<ChallengeFrame mode="click" seed={data.seed} {game}>
		{#snippet board(_session)}
			<ClickBoard {..._session} />
		{/snippet}
	</ChallengeFrame>
{:else}
	<SeedRedirect mode="click" />
{/if}
