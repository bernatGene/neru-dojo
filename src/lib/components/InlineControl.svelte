<script lang="ts">
	import InlineButton from './InlineButton.svelte';
	import InlineForm from './InlineForm.svelte';
	import InlineScrollTarget from './InlineScrollTarget.svelte';
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
		<InlineButton id={control.id} {active} onInteract={onClickControl} />
	{:else if control.type === 'write'}
		<InlineForm id={control.id} text={control.text} {active} onSubmit={onFormSubmit} />
	{:else}
		<InlineScrollTarget text={control.text} {active} />
	{/if}
</span>
