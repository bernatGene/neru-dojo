<script lang="ts">
	let {
		id,
		x,
		y,
		onInteract
	}: { id: string; x: number; y: number; onInteract: (id: string) => void } = $props();
</script>

<button
	type="button"
	data-control-id={id}
	class="absolute z-20 inline-flex h-10 min-w-36 -translate-x-1/2 -translate-y-1/2 items-center justify-center whitespace-nowrap border-2 border-highlight-600 bg-highlight-500 px-4 text-base text-background-100 outline-none focus-visible:border-highlight-600"
	style={`left: ${x}%; top: ${y}%;`}
	onclick={() => onInteract(id)}
>
	click me
</button>
