<script lang="ts">
	import { asset } from '$app/paths';
	import RunHeader from './RunHeader.svelte';

	type Theme = 'light' | 'dark';

	let {
		currentTask,
		totalTasks,
		misses,
		elapsedMs,
		theme,
		nextTheme,
		onRestart,
		onToggleTheme
	}: {
		currentTask: number;
		totalTasks: number;
		misses: number;
		elapsedMs: number;
		theme: Theme;
		nextTheme: Theme;
		onRestart: () => void;
		onToggleTheme: () => void;
	} = $props();
</script>

<div class="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
	<div></div>

	<RunHeader {currentTask} {totalTasks} {misses} {elapsedMs} />

	<div class="flex justify-self-end gap-3">
		<button
			type="button"
			class="group flex h-[56px] w-[56px] items-center justify-center border-2 border-foreground-600 bg-background-100 outline-none hover:bg-foreground-600 focus-visible:border-highlight-600"
			onclick={onRestart}
			aria-label="Restart run"
		>
			<img
				src={asset('/restart.svg')}
				alt=""
				class="h-7 w-7 dark:invert group-hover:invert dark:group-hover:invert-0"
			/>
		</button>

		<a
			href="https://github.com/bernatGene/neru-dojo"
			target="_blank"
			rel="noreferrer"
			class="group flex h-[56px] w-[56px] items-center justify-center border-2 border-foreground-600 bg-background-100 outline-none hover:bg-foreground-600 focus-visible:border-highlight-600"
			aria-label="Open GitHub repository"
		>
			<img
				src={asset('/github-mark.png')}
				alt=""
				class="h-7 w-7 dark:invert group-hover:invert dark:group-hover:invert-0"
			/>
		</a>

		<button
			type="button"
			class="border-2 border-foreground-600 bg-background-100 px-5 py-3 text-xl text-foreground-600 outline-none hover:bg-foreground-600 hover:text-background-100 focus-visible:border-highlight-600"
			onclick={onToggleTheme}
			aria-label={`Switch to ${nextTheme} theme`}
		>
			{theme}
		</button>
	</div>
</div>
