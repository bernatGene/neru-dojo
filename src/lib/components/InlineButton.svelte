<script lang="ts">
	let {
		id,
		active,
		onInteract
	}: { id: string; active: boolean; onInteract: (id: string) => void } = $props();
</script>

<button
	type="button"
	class={`inline-flex h-10 min-w-36 items-center justify-center whitespace-nowrap border-2 px-4 text-base outline-none focus-visible:border-highlight-600 ${
		active
			? 'border-highlight-600 bg-highlight-500 text-background-100'
			: 'border-foreground-600 bg-background-100 text-foreground-600 hover:bg-foreground-600 hover:text-background-100'
	}`}
	onclick={() => onInteract(id)}
>
	{active ? 'click me' : "don't click"}
</button>
