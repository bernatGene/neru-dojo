<script lang="ts">
	import { formatElapsed } from '$lib/game/time';
	import type { SeedStats } from '$lib/game/seedResults';
	import type { GameMode } from '$lib/game/types';

	let {
		seed,
		mode,
		elapsedMs,
		misses,
		seedStats,
		onRetry,
		onNew,
		onClearStats
	}: {
		seed: string;
		mode: GameMode;
		elapsedMs: number;
		misses: number;
		seedStats: SeedStats | null;
		onRetry: () => void;
		onNew: () => void;
		onClearStats: () => void;
	} = $props();
</script>

<div
	class="absolute inset-0 z-30 flex items-center justify-center bg-background-100/95 px-6 font-mono text-foreground-600"
>
	<section class="w-full max-w-xl border-2 border-foreground-600 bg-background-100 p-8">
		<h2 class="text-4xl font-medium">results @ {seed} {mode}</h2>
		<p class="mt-8 text-2xl">
			time {formatElapsed(elapsedMs)}{#if seedStats}{' '}(best: {formatElapsed(seedStats.bestMs)}){/if}
		</p>
		<p class="mt-3 text-2xl">misses {misses}</p>
		{#if seedStats}
			<p class="mt-3 text-2xl">attempts {seedStats.attempts}</p>
			<p class="mt-3 text-2xl">
				best in ({mode}) {formatElapsed(seedStats.modeBestMs)}{#if elapsedMs === seedStats.modeBestMs} *{/if}
			</p>
		{/if}

		<div class="mt-10 flex gap-4">
			<button
				type="button"
				class="border-2 border-foreground-600 bg-background-100 px-6 py-4 text-xl text-foreground-600 outline-none hover:bg-foreground-600 hover:text-background-100 focus-visible:border-highlight-600"
				onclick={onRetry}
			>
				retry
			</button>
			<button
				type="button"
				class="border-2 border-highlight-600 bg-highlight-500 px-6 py-4 text-xl text-background-100 outline-none focus-visible:border-foreground-600"
				onclick={onNew}
			>
				new seed
			</button>
			<button
				type="button"
				class="border-2 border-foreground-600 bg-background-100 px-6 py-4 text-xl text-foreground-600 outline-none hover:bg-foreground-600 hover:text-background-100 focus-visible:border-highlight-600"
				onclick={onClearStats}
			>
				clear stats
			</button>
		</div>
	</section>
</div>
