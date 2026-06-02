<script lang="ts">
	import InlineForm from './InlineForm.svelte';
	import type { GamePanel, GameToken, ScrollPanelId } from '$lib/game/types';

	let {
		panel,
		panelId = panel?.id ?? 'horizontal',
		title = panel?.title,
		tokens = panel?.tokens ?? [],
		activeControlId,
		hint,
		horizontal = false,
		endPadding = false,
		onClickControl,
		onFormSubmit,
		onScroll
	}: {
		panel?: GamePanel;
		panelId?: ScrollPanelId;
		title?: string;
		tokens?: GameToken[];
		activeControlId: string | null;
		hint: string | null;
		horizontal?: boolean;
		endPadding?: boolean;
		onClickControl: (id: string) => void;
		onFormSubmit: (id: string, value: string) => void;
		onScroll: () => void;
	} = $props();

	let bottomHint = $derived(Boolean(hint?.includes('down') || hint?.includes('bottom')));

</script>

<section
	class={horizontal
		? 'relative h-24 overflow-hidden border-2 border-foreground-600 bg-background-100'
		: 'flex min-h-0 min-w-0 flex-col overflow-hidden border-2 border-foreground-600 bg-background-100'}
>
	{#if title}
		<header class="border-b-2 border-foreground-600 px-5 py-3 text-xl text-foreground-600">
			{title}
		</header>
	{/if}

	<div
		data-panel-id={panelId}
		class={horizontal
			? 'h-full overflow-x-auto overflow-y-hidden whitespace-nowrap px-5 py-5 text-xl leading-10 text-foreground-600'
			: 'relative flex-1 overflow-y-auto px-5 py-5 text-xl leading-10 text-foreground-600'}
		onscroll={onScroll}
	>
		{#if hint && horizontal}
			<div class="sticky left-0 z-10 mr-4 inline-block border-4 border-highlight-600 bg-highlight-500 px-4 py-1 text-2xl text-background-100">
				{hint}
			</div>
		{:else if hint && !bottomHint}
			<div
				class="sticky top-0 z-10 mb-4 border-4 border-highlight-600 bg-highlight-500 px-4 py-3 text-2xl text-background-100"
			>
				{hint}
			</div>
		{/if}

		<div class={horizontal ? 'inline' : 'max-w-none'}>
			{#if horizontal}
				<span class="inline-block w-[50vw]"></span>
			{:else if endPadding}
				<span class="block h-[45vh]"></span>
			{/if}

			{#each tokens as token}
				{#if token.kind === 'word'}
					<span class="mr-2 inline-block">{token.text}</span>
				{:else if token.kind === 'break' && !horizontal}
					<span class="block h-8"></span>
				{:else if token.kind === 'control'}
					{@const control = token.control}
					{@const active = control.id === activeControlId}
					<span data-control-id={control.id} class="mr-3 inline-block align-middle">
						{#if control.type === 'click'}
							<button
								type="button"
								class={`inline-flex h-10 min-w-36 items-center justify-center whitespace-nowrap border-2 px-4 text-base outline-none focus-visible:border-highlight-600 ${
									active
										? 'border-highlight-600 bg-highlight-500 text-background-100'
										: 'border-foreground-600 bg-background-100 text-foreground-600 hover:bg-foreground-600 hover:text-background-100'
								}`}
								onclick={() => onClickControl(control.id)}
							>
								{active ? 'click me' : "don't click"}
							</button>
						{:else if control.type === 'write'}
							<InlineForm id={control.id} text={control.text} {active} onSubmit={onFormSubmit} />
						{:else}
							<span
								class={`inline-flex h-10 min-w-36 items-center justify-center whitespace-nowrap border-2 px-4 text-base align-middle ${
									active
										? 'border-highlight-600 bg-highlight-500 text-background-100'
										: 'border-foreground-600 bg-background-100 text-foreground-600'
								}`}
							>
								{active ? control.text : 'not me'}
							</span>
						{/if}
					</span>
				{/if}
			{/each}

			{#if horizontal}
				<span class="inline-block w-[50vw]"></span>
			{:else if endPadding}
				<span class="block h-[45vh]"></span>
			{/if}
		</div>

		{#if hint && bottomHint && !horizontal}
			<div
				class="sticky bottom-0 z-10 mt-4 border-4 border-highlight-600 bg-highlight-500 px-4 py-3 text-2xl text-background-100"
			>
				{hint}
			</div>
		{/if}
	</div>
</section>
