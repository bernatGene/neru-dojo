<script lang="ts">
	import InlineForm from './InlineForm.svelte';
	import type { PanelGameControl } from '$lib/game/types';

	let {
		control,
		active,
		onClickControl,
		onFormSubmit
	}: {
		control: PanelGameControl;
		active: boolean;
		onClickControl: (id: string) => void;
		onFormSubmit: (id: string, value: string) => void;
	} = $props();
</script>

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
