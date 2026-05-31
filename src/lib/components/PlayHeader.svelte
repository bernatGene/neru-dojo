<script lang="ts">
	import RunHeader from './RunHeader.svelte';

	type Theme = 'light' | 'dark';

	let {
		currentTask,
		totalTasks,
		misses,
		elapsedMs,
		theme,
		nextTheme,
		onToggleTheme
	}: {
		currentTask: number;
		totalTasks: number;
		misses: number;
		elapsedMs: number;
		theme: Theme;
		nextTheme: Theme;
		onToggleTheme: () => void;
	} = $props();
</script>

<div class="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
	<div></div>

	<RunHeader {currentTask} {totalTasks} {misses} {elapsedMs} />

	<button
		type="button"
		class="justify-self-end border-2 border-foreground-600 bg-background-100 px-5 py-3 text-xl text-foreground-600 outline-none hover:bg-foreground-600 hover:text-background-100 focus-visible:border-highlight-600"
		onclick={onToggleTheme}
		aria-label={`Switch to ${nextTheme} theme`}
	>
		{theme}
	</button>
</div>
