<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { onMount } from "svelte";
  import GameBoard from "$lib/components/GameBoard.svelte";
  import PlayHeader from "$lib/components/PlayHeader.svelte";
  import Results from "$lib/components/Results.svelte";
  import { generateGame } from "$lib/game/generate";
  import { createSeed } from "$lib/game/seed";
  import { clearSeedStats, saveSeedStats, type SeedStats } from "$lib/game/seedResults";
  import type { PageData } from "./$types";

  type Theme = "light" | "dark";

  const themeStorageKey = "neru-dojo-theme";

  let { data }: { data: PageData } = $props();
  let theme = $state<Theme>("light");
  let loadedRun = $state<string | null>(null);
  let runId = $state(0);
  let currentTaskIndex = $state(0);
  let misses = $state(0);
  let startTime = $state(0);
  let now = $state(0);
  let finishedAt = $state<number | null>(null);
  let seedStats = $state<SeedStats | null>(null);
  let game = $derived(generateGame(data.seed, data.words, data.mode));
  let started = $derived(startTime > 0);
  let completed = $derived(finishedAt !== null);
  let activeControl = $derived(completed ? null : game.tasks[currentTaskIndex]);
  let activeControlId = $derived(activeControl?.id ?? null);
  let elapsedMs = $derived(started ? (finishedAt ?? now) - startTime : 0);

  onMount(() => {
    theme = document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";

    const timer = window.setInterval(() => {
      if (started && finishedAt === null) {
        now = performance.now();
      }
    }, 50);

    return () => {
      window.clearInterval(timer);
    };
  });

  $effect(() => {
    const run = `${data.mode}:${data.seed}`;

    if (loadedRun === null) {
      loadedRun = run;
    } else if (loadedRun !== run) {
      loadedRun = run;
      resetRun();
    }
  });

  function applyTheme(next: Theme) {
    document.documentElement.classList.toggle("dark", next === "dark");
    document.documentElement.dataset.theme = next;
    localStorage.setItem(themeStorageKey, next);
  }

  function toggleTheme() {
    const next: Theme = theme === "light" ? "dark" : "light";
    theme = next;
    applyTheme(next);
  }

  function start() {
    if (started || completed) {
      return;
    }

    const timestamp = performance.now();
    startTime = timestamp;
    now = timestamp;
  }

  function handleClickControl(controlId: string) {
    if (!started || completed) return;
    if (!completeControl(controlId, "click")) misses += 1;
  }

  function handleClickMiss() {
    if (started && !completed) misses += 1;
  }

  function handleFormSubmit(controlId: string, value: string) {
    if (!started || completed) return;
    if (!completeControl(controlId, "write", value)) misses += 1;
  }

  function handleScrollComplete(controlId: string) {
    completeControl(controlId, "scroll");
  }

  function completeControl(controlId: string, action: "click" | "write" | "scroll", value = "") {
    if (!started || completed || activeControl?.id !== controlId) return false;

    if (
      (action === "click" && (activeControl.type === "click" || activeControl.type === "overlay")) ||
      (action === "write" &&
        activeControl.type === "write" &&
        normalizeText(value) === activeControl.text) ||
      (action === "scroll" && activeControl.type === "scroll")
    ) {
      advanceTask();
      return true;
    }

    return false;
  }

  function normalizeText(value: string) {
    return value.trim().toLowerCase().replace(/\s+/g, " ");
  }

  function advanceTask() {
    const nextTaskIndex = currentTaskIndex + 1;

    if (nextTaskIndex >= game.tasks.length) {
      const timestamp = performance.now();
      now = timestamp;
      finishedAt = timestamp;
      seedStats = saveSeedStats(data.mode, data.seed, timestamp - startTime);
      return;
    }

    currentTaskIndex = nextTaskIndex;
  }

  function resetRun() {
    currentTaskIndex = 0;
    misses = 0;
    startTime = 0;
    now = 0;
    finishedAt = null;
    seedStats = null;
    runId += 1;
  }

  function newSeed() {
    goto(
      resolve("/play/[mode]/[seed]", {
        mode: data.mode,
        seed: createSeed(),
      }),
      { noScroll: true },
    );
  }

  function clearStats() {
    clearSeedStats();
    seedStats = null;
  }
</script>

<svelte:head>
  <title>Neru Dojo</title>
  <meta
    name="description"
    content="Mouseless reaction-time training with Neru."
  />
</svelte:head>

<main
  class="h-screen overflow-hidden bg-background-100 font-mono text-foreground-600"
>
  <section class="flex h-full flex-col gap-5 p-6">
    <PlayHeader
      currentTask={currentTaskIndex + 1}
      totalTasks={game.tasks.length}
      {misses}
      {elapsedMs}
      {theme}
      mode={data.mode}
      seed={data.seed}
      onRestart={resetRun}
      onToggleTheme={toggleTheme}
    />

    <GameBoard
      {game}
      {started}
      {completed}
      runKey={`${data.mode}-${data.seed}-${runId}`}
      {activeControl}
      {activeControlId}
      onClickControl={handleClickControl}
      onClickMiss={handleClickMiss}
      onFormSubmit={handleFormSubmit}
      onScrollComplete={handleScrollComplete}
      onStart={start}
    />
  </section>

  {#if completed}
    <Results
      seed={data.seed}
      mode={data.mode}
      {elapsedMs}
      {misses}
      {seedStats}
      onRetry={resetRun}
      onNew={newSeed}
      onClearStats={clearStats}
    />
  {/if}
</main>
