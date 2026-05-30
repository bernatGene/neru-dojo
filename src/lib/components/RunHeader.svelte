<script lang="ts">
	import { formatElapsed } from '$lib/game/time';

	let {
		currentTask,
		totalTasks,
		misses,
		elapsedMs
	}: { currentTask: number; totalTasks: number; misses: number; elapsedMs: number } = $props();
</script>

<header class="flex items-center justify-center gap-10 text-2xl text-foreground-600">
	<span>task {Math.min(currentTask, totalTasks)}/{totalTasks}</span>
	<span>misses {misses}</span>
	<span>{formatElapsed(elapsedMs)}</span>
</header>
