<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { modeHref } from '$lib/game/modes';
	import { createSeed } from '$lib/game/seed';
	import type { GameMode } from '$lib/game/types';

	let { mode = 'default' }: { mode?: GameMode } = $props();

	onMount(() => {
		goto(modeHref(mode, createSeed()), {
			replaceState: true,
			noScroll: true,
		});
	});
</script>

<main class="flex min-h-screen items-center justify-center bg-background-100 font-mono text-2xl text-foreground-600">
	loading neru-dojo
</main>
