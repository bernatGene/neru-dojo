<script lang="ts">
	let {
		axis,
		start,
		end
	}: {
		axis: 'vertical' | 'horizontal';
		start: number;
		end: number;
	} = $props();
</script>

{#if axis === 'vertical'}
	<div
		class="pointer-events-none absolute left-0 right-0 z-20 border-t-4 border-highlight-600"
		style={`top: ${start}px;`}
	></div>
	<div
		class="pointer-events-none absolute left-0 right-0 z-20 border-t-4 border-highlight-600"
		style={`top: ${end}px;`}
	></div>
{:else}
	<div
		class="pointer-events-none absolute bottom-0 top-0 z-20 border-l-4 border-highlight-600"
		style={`left: ${start}px;`}
	></div>
	<div
		class="pointer-events-none absolute bottom-0 top-0 z-20 border-l-4 border-highlight-600"
		style={`left: ${end}px;`}
	></div>
{/if}
