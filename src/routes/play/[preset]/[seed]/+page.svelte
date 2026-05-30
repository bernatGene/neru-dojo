<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { onMount, tick } from 'svelte';
	import Panel from '$lib/components/Panel.svelte';
	import Results from '$lib/components/Results.svelte';
	import RunHeader from '$lib/components/RunHeader.svelte';
	import { generateGame, getControlType } from '$lib/game/generate';
	import { getScrollHint } from '$lib/game/scrollHints';
	import { createSeed } from '$lib/game/seed';
	import type { PanelId } from '$lib/game/types';
	import type { PageData } from './$types';

	type Theme = 'light' | 'dark';

	const themeStorageKey = 'neru-dojo-theme';

	let { data }: { data: PageData } = $props();
	let theme = $state<Theme>('light');
	let nextTheme = $derived(theme === 'light' ? 'dark' : 'light');
	let loadedSeed = $state<string | null>(null);
	let runId = $state(0);
	let started = $state(false);
	let currentTaskIndex = $state(0);
	let misses = $state(0);
	let startTime = $state(0);
	let now = $state(0);
	let finishedAt = $state<number | null>(null);
	let hints = $state(emptyHints());
	let hintFrame: number | null = null;
	let game = $derived(generateGame(data.seed, data.words, data.preset));
	let completed = $derived(finishedAt !== null);
	let activeTask = $derived(completed ? null : game.tasks[currentTaskIndex]);
	let activeControlId = $derived(activeTask?.controlId ?? null);
	let elapsedMs = $derived(started ? (finishedAt ?? now) - startTime : 0);

	onMount(() => {
		theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';

		const timer = window.setInterval(() => {
			if (started && finishedAt === null) {
				now = performance.now();
			}
		}, 50);

		const handleResize = () => scheduleHintUpdate();
		window.addEventListener('resize', handleResize);

		return () => {
			window.clearInterval(timer);
			window.removeEventListener('resize', handleResize);
			if (hintFrame !== null) {
				cancelAnimationFrame(hintFrame);
			}
		};
	});

	$effect(() => {
		if (loadedSeed === null) {
			loadedSeed = data.seed;
		} else if (loadedSeed !== data.seed) {
			loadedSeed = data.seed;
			resetRun();
		}
	});

	$effect(() => {
		currentTaskIndex;
		started;
		finishedAt;
		runId;
		void tick().then(scheduleHintUpdate);
	});

	function emptyHints(): Record<PanelId, string | null> {
		return { nav: null, content: null, meta: null };
	}

	function applyTheme(next: Theme) {
		document.documentElement.classList.toggle('dark', next === 'dark');
		document.documentElement.dataset.theme = next;
		localStorage.setItem(themeStorageKey, next);
	}

	function toggleTheme() {
		const next: Theme = theme === 'light' ? 'dark' : 'light';
		theme = next;
		applyTheme(next);
	}

	function start() {
		if (started || completed) {
			return;
		}

		const timestamp = performance.now();
		started = true;
		startTime = timestamp;
		now = timestamp;
		scheduleHintUpdate();
	}

	function handleStartKeydown(event: KeyboardEvent) {
		if (!started && !completed && !event.metaKey && !event.ctrlKey && !event.altKey) {
			start();
		}
	}

	function handleClickControl(controlId: string) {
		if (!started || completed) {
			return;
		}

		if (controlId === activeControlId && getControlType(game, controlId) === 'click') {
			advanceTask();
			return;
		}

		misses += 1;
		scheduleHintUpdate();
	}

	function handleFormSubmit(controlId: string, value: string) {
		if (!started || completed) {
			return;
		}

		if (
			controlId === activeControlId &&
			getControlType(game, controlId) === 'write' &&
			normalizeText(value) === game.controlById[controlId].text
		) {
			advanceTask();
			return;
		}

		misses += 1;
		scheduleHintUpdate();
	}

	function advanceTask() {
		const nextTaskIndex = currentTaskIndex + 1;

		if (nextTaskIndex >= game.tasks.length) {
			const timestamp = performance.now();
			now = timestamp;
			finishedAt = timestamp;
			hints = emptyHints();
			return;
		}

		currentTaskIndex = nextTaskIndex;
		void tick().then(scheduleHintUpdate);
	}

	function resetRun() {
		started = false;
		currentTaskIndex = 0;
		misses = 0;
		startTime = 0;
		now = 0;
		finishedAt = null;
		hints = emptyHints();
		runId += 1;
	}

	function retry() {
		resetRun();
	}

	function newSeed() {
		goto(`${base}/play/default/${createSeed()}`, { noScroll: true });
	}

	function normalizeText(value: string) {
		return value.trim().toLowerCase().replace(/\s+/g, ' ');
	}

	function scheduleHintUpdate() {
		if (hintFrame !== null) {
			return;
		}

		hintFrame = requestAnimationFrame(() => {
			hintFrame = null;
			updateHints();
		});
	}

	function updateHints() {
		if (!started || completed || !activeControlId) {
			hints = emptyHints();
			return;
		}

		const control = game.controlById[activeControlId];
		const panel = document.querySelector<HTMLElement>(`[data-panel-id="${control.panelId}"]`);
		const target = panel?.querySelector<HTMLElement>(`[data-control-id="${activeControlId}"]`);

		if (!panel || !target) {
			hints = emptyHints();
			return;
		}

		const nextHints = emptyHints();
		nextHints[control.panelId] = getScrollHint(panel, target);
		hints = nextHints;
	}
</script>

<svelte:head>
	<title>Neru Dojo</title>
	<meta name="description" content="Mouseless reaction-time training with Neru." />
</svelte:head>

<svelte:window onkeydown={handleStartKeydown} />

<main class="h-screen overflow-hidden bg-background-100 font-mono text-foreground-600">
	<section class="flex h-full flex-col gap-5 p-6">
		<div class="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
			<div></div>

			<RunHeader
				currentTask={currentTaskIndex + 1}
				totalTasks={game.tasks.length}
				{misses}
				{elapsedMs}
			/>

			<button
				type="button"
				class="justify-self-end border-2 border-foreground-600 bg-background-100 px-5 py-3 text-xl text-foreground-600 outline-none hover:bg-foreground-600 hover:text-background-100 focus-visible:border-highlight-600"
				onclick={toggleTheme}
				aria-label={`Switch to ${nextTheme} theme`}
			>
				{theme}
			</button>
		</div>

		<div class="min-h-0 flex-1">
			{#key `${data.seed}-${runId}`}
				<div
					class="grid h-full gap-5"
					style="grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr);"
				>
					{#each game.panels as panel}
						<Panel
							{panel}
							controlById={game.controlById}
							{activeControlId}
							hint={hints[panel.id]}
							onClickControl={handleClickControl}
							onFormSubmit={handleFormSubmit}
							onScroll={scheduleHintUpdate}
						/>
					{/each}
				</div>
			{/key}
		</div>
	</section>

	{#if !started && !completed}
		<button
			type="button"
			class="fixed inset-0 z-30 flex cursor-default flex-col items-center justify-center bg-background-100/95 text-center text-foreground-600"
			onclick={start}
			aria-label="Start"
		>
			<img src={`${base}/neru-appicon.png`} alt="Neru" class="h-28 w-28" />
			<span class="mt-8 text-4xl">neru-dojo</span>
			<span class="mt-4 text-2xl">press anywhere to start</span>
		</button>
	{/if}

	{#if completed}
		<Results {elapsedMs} {misses} onRetry={retry} onNew={newSeed} />
	{/if}
</main>
