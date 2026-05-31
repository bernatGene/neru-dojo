<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { onMount, tick } from 'svelte';
	import OverlayButton from '$lib/components/OverlayButton.svelte';
	import Panel from '$lib/components/Panel.svelte';
	import PlayHeader from '$lib/components/PlayHeader.svelte';
	import Results from '$lib/components/Results.svelte';
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
	let activeControl = $derived(activeControlId ? game.controlById[activeControlId] : null);
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

		if (
			controlId === activeControlId &&
			['click', 'overlay'].includes(getControlType(game, controlId))
		) {
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

		if (control.type === 'overlay') {
			hints = emptyHints();
			return;
		}

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
		<PlayHeader
			currentTask={currentTaskIndex + 1}
			totalTasks={game.tasks.length}
			{misses}
			{elapsedMs}
			{theme}
			{nextTheme}
			onToggleTheme={toggleTheme}
		/>

		<div class="relative min-h-0 flex-1">
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

			{#if started && !completed && activeControl?.type === 'overlay'}
				<div class="pointer-events-none absolute inset-0 z-10 bg-background-100/5 backdrop-blur-[1px]"></div>
				<OverlayButton
					id={activeControl.id}
					x={activeControl.x}
					y={activeControl.y}
					onInteract={handleClickControl}
				/>
			{/if}
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
