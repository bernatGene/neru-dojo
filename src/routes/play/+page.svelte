<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { createSeed } from '$lib/game/seed';

	onMount(() => {
		goto(`${base}/play/default/${createSeed()}`, { replaceState: true, noScroll: true });
	});
</script>

<svelte:head>
	<title>Neru Dojo</title>
</svelte:head>

<main class="flex min-h-screen items-center justify-center bg-background-100 font-mono text-2xl text-foreground-600">
	loading neru-dojo
</main>
