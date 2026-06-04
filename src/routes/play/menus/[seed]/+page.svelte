<script lang="ts">
	import ChallengeFrame from '$lib/components/ChallengeFrame.svelte';
	import MenusBoard from '$lib/components/boards/MenusBoard.svelte';
	import { generateMenusGame } from '$lib/game/generate';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let game = $derived(generateMenusGame(data.seed));
</script>

<ChallengeFrame mode="menus" seed={data.seed} {game}>
	{#snippet board(_session)}
		<MenusBoard {..._session} />
	{/snippet}
</ChallengeFrame>
