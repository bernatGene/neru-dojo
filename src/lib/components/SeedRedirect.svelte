<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { createSeed } from '$lib/game/seed';

	onMount(() => {
		goto(resolve('/play/[mode]/[seed]', { mode: 'default', seed: createSeed() }), {
			replaceState: true,
			noScroll: true,
		});
	});
</script>

<main class="flex min-h-screen items-center justify-center bg-background-100 font-mono text-2xl text-foreground-600">
	loading neru-dojo
</main>
