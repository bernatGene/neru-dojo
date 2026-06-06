<script lang="ts">
	import ChallengeFrame from '$lib/components/ChallengeFrame.svelte';
	import MenusBoard from '$lib/components/boards/MenusBoard.svelte';
	import SeedRedirect from '$lib/components/SeedRedirect.svelte';
	import { generateMenusGame } from '$lib/game/generate';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let game = $derived(data.seed ? generateMenusGame(data.seed) : null);
</script>

{#if data.seed && game}
	<ChallengeFrame mode="menus" seed={data.seed} {game}>
		{#snippet board(_session)}
			<MenusBoard {..._session} />
		{/snippet}
	</ChallengeFrame>
{:else}
	<SeedRedirect mode="menus" />
{/if}
