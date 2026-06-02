<script lang="ts">
	import type { MenuUnfold } from '$lib/game/types';

	let {
		id,
		unfold,
		targetIndex,
		isOpen,
		onToggle,
		onClose,
		onCorrect,
		onMiss,
	}: {
		id: string;
		unfold: MenuUnfold;
		targetIndex?: number;
		isOpen: boolean;
		onToggle: (id: string) => void;
		onClose: () => void;
		onCorrect: (id: string) => void;
		onMiss: () => void;
	} = $props();

	const items = Array.from({ length: 20 }, (_, index) => index);
	let hasTarget = $derived(targetIndex !== undefined);

	function itemLabel(index: number) {
		if (targetIndex === undefined) return "don't click";
		if (index < targetIndex) return 'scroll down';
		if (index > targetIndex) return 'scroll up';
		return 'click me';
	}

	function handleItemClick(index: number) {
		onClose();

		if (index === targetIndex) {
			onCorrect(id);
			return;
		}

		onMiss();
	}

	function listClass() {
		const horizontal = unfold.endsWith('left') ? 'right-full' : 'left-full';
		const vertical = unfold.startsWith('up') ? 'bottom-0' : 'top-0';
		return `absolute ${horizontal} ${vertical} max-h-[19.5rem] w-48 overflow-y-auto border-2 border-foreground-600 bg-background-100`;
	}

	function triggerClass() {
		return `w-48 whitespace-nowrap border-2 px-5 py-3 text-xl outline-none focus-visible:border-highlight-600 ${
			hasTarget
				? 'border-highlight-600 bg-highlight-500 text-background-100'
				: 'border-foreground-600 bg-background-100 text-foreground-600 hover:bg-foreground-600 hover:text-background-100'
		}`;
	}

	function itemClass(index: number) {
		return `block w-full whitespace-nowrap px-5 py-3 text-left text-xl outline-none focus-visible:bg-highlight-500 focus-visible:text-background-100 ${
			index === targetIndex
				? 'bg-highlight-500 text-background-100'
				: 'text-foreground-600 hover:bg-foreground-600 hover:text-background-100'
		}`;
	}

	function handleFocusout(event: FocusEvent) {
		if (!(event.currentTarget instanceof HTMLElement)) return;
		if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return;

		onClose();
	}
</script>

<div class="relative" role="presentation" onfocusout={handleFocusout}>
	<button type="button" class={triggerClass()} onclick={() => onToggle(id)}>
		{hasTarget ? 'click me' : "don't click"}
	</button>

	{#if isOpen}
		<div class={listClass()}>
			{#each items as item}
				<button type="button" class={itemClass(item)} onclick={() => handleItemClick(item)}>
					{itemLabel(item)}
				</button>
			{/each}
		</div>
	{/if}
</div>
