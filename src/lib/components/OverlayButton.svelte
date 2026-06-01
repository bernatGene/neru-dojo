<script lang="ts">
	let {
		id,
		x,
		y,
		width,
		height,
		onInteract
	}: {
		id: string;
		x: number;
		y: number;
		width?: number;
		height?: number;
		onInteract: (id: string) => void;
	} = $props();
</script>

{#if width && height}
	<button
		type="button"
		data-control-id={id}
		class="absolute z-20 -translate-x-1/2 -translate-y-1/2 border-2 border-highlight-600 bg-highlight-500 outline-none focus-visible:border-highlight-600"
		style={`left: ${x}%; top: ${y}%; width: ${width}px; height: ${height}px;`}
		onclick={() => onInteract(id)}
		aria-label="Click target"
	></button>
{:else}
	<button
		type="button"
		data-control-id={id}
		class="absolute z-20 inline-flex h-10 min-w-36 -translate-x-1/2 -translate-y-1/2 items-center justify-center whitespace-nowrap border-2 border-highlight-600 bg-highlight-500 px-4 text-base text-background-100 outline-none focus-visible:border-highlight-600"
		style={`left: ${x}%; top: ${y}%;`}
		onclick={() => onInteract(id)}
	>
		click me
	</button>
{/if}
