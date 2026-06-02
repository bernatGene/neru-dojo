<script lang="ts">
	let { text, active }: { text: string; active: boolean } = $props();
	let label = $derived(active ? text : 'not me');
</script>

<span
	class={`inline-flex h-10 min-w-36 items-center justify-center whitespace-nowrap border-2 px-4 text-base align-middle ${
		active
			? 'border-highlight-600 bg-highlight-500 text-background-100'
			: 'border-foreground-600 bg-background-100 text-foreground-600'
	}`}
>
	{label}
</span>
