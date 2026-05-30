<script lang="ts">
	let {
		id,
		text,
		active,
		onSubmit
	}: { id: string; text: string; active: boolean; onSubmit: (id: string, value: string) => void } =
		$props();
	let value = $state('');
	let targetChars = $derived(Array.from(text));
	let extraChars = $derived(Array.from(value.slice(text.length)));

	function submit() {
		onSubmit(id, value);
		value = '';
	}

	function charClass(index: number, char: string) {
		if (index >= value.length) {
			return 'text-foreground-300';
		}

		return value[index] === char
			? 'text-foreground-600'
			: 'bg-highlight-500 text-background-100';
	}
</script>

<form
	class={`inline-flex h-10 box-border items-center whitespace-nowrap border-2 align-middle ${
		active ? 'border-highlight-600 bg-highlight-100' : 'border-foreground-600 bg-background-100'
	}`}
	onsubmit={(event) => {
		event.preventDefault();
		submit();
	}}
>
	<div class="relative h-full w-[28ch]">
		{#if active && value.length > 0}
			<div
				class="pointer-events-none absolute inset-0 flex items-center overflow-hidden whitespace-pre px-3 text-base"
			>
				{#each targetChars as char, index}
					<span class={charClass(index, char)}>{char}</span>
				{/each}
				{#each extraChars as char}
					<span class="bg-highlight-500 text-background-100">{char}</span>
				{/each}
			</div>
		{/if}

		<input
			class={`h-full w-full border-0 px-3 text-base caret-foreground-600 outline-none placeholder:text-foreground-300 ${
				active
					? 'bg-background-100 text-transparent'
					: 'bg-background-100 text-foreground-600'
			}`}
			bind:value
			placeholder={active ? text : "don't write"}
			autocomplete="off"
			autocapitalize="off"
			spellcheck={false}
		/>
	</div>
	<button
		type="submit"
		class={`h-full border-y-0 border-l-2 border-r-0 px-4 text-base outline-none focus-visible:bg-highlight-500 focus-visible:text-background-100 ${
			active
				? 'border-highlight-600 bg-highlight-500 text-background-100'
				: 'border-foreground-600 bg-background-100 text-foreground-600 hover:bg-foreground-600 hover:text-background-100'
		}`}
	>
		submit
	</button>
</form>
