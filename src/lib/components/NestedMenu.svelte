<script lang="ts">
	import type { NestedMenuGameControl } from '$lib/game/types';

	let {
		control,
		isActive,
		isOpen,
		onToggle,
		onClose,
		onCorrect,
		onMiss,
	}: {
		control: NestedMenuGameControl;
		isActive: boolean;
		isOpen: boolean;
		onToggle: (id: string) => void;
		onClose: () => void;
		onCorrect: (id: string) => void;
		onMiss: () => void;
	} = $props();

	const itemHeightRem = 3.25;
	let root: HTMLElement;
	let openPath = $state<number[]>([]);
	let visibleColumns = $derived(control.columns.slice(0, visibleColumnCount()));

	$effect(() => {
		if (!isOpen) openPath = [];
	});

	function visibleColumnCount() {
		let count = 1;

		for (let level = 0; level < control.columns.length - 1; level += 1) {
			if (openPath[level] === undefined) break;
			count += 1;
		}

		return count;
	}

	function hasCorrectPrefix(level: number) {
		for (let index = 0; index < level; index += 1) {
			if (openPath[index] !== control.targetPath[index]) return false;
		}

		return true;
	}

	function items(count: number) {
		return Array.from({ length: count }, (_, index) => index);
	}

	function handleItemHover(level: number, index: number) {
		if (control.navigation !== 'hover') return;

		openPath = [...openPath.slice(0, level), index];
	}

	function handleItemClick(level: number, index: number) {
		const isTarget = hasCorrectPrefix(level) && index === control.targetPath[level];
		const isFinal = level === control.columns.length - 1;

		if (!isTarget) {
			onClose();
			onMiss();
			return;
		}

		if (isFinal) {
			onClose();
			onCorrect(control.id);
			return;
		}

		openPath = [...openPath.slice(0, level), index];
	}

	function itemLabel(level: number, index: number) {
		const isFinal = level === control.columns.length - 1;
		const opensOnHover = control.navigation === 'hover' && !isFinal;

		if (!isActive) return opensOnHover ? "don't hover" : "don't click";
		if (!hasCorrectPrefix(level) || index !== control.targetPath[level]) return 'not here';
		if (isFinal) return 'click me';
		return opensOnHover ? 'hover me' : 'open me';
	}

	function columnsStyle() {
		return 'left: 100%; top: 0;';
	}

	function columnStyle(level: number) {
		let top = 0;
		const rootTop = root?.getBoundingClientRect().top ?? 0;
		const itemHeight = itemHeightRem * Number.parseFloat(getComputedStyle(document.documentElement).fontSize);

		for (let index = 1; index <= level; index += 1) {
			const column = control.columns[index];
			const selected = openPath[index - 1] ?? 0;
			const parentY = rootTop + top * itemHeight + selected * itemHeight;
			const opensDown = window.innerHeight - parentY >= parentY;

			top += opensDown
				? selected * itemHeightRem
				: (selected + 1 - column.itemCount) * itemHeightRem;
		}

		return `left: ${level * 12}rem; top: ${top}rem;`;
	}

	function triggerClass() {
		return `w-48 whitespace-nowrap border-2 px-5 py-3 text-xl outline-none focus-visible:border-highlight-600 ${
			isActive
				? 'border-highlight-600 bg-highlight-500 text-background-100'
				: 'border-foreground-600 bg-background-100 text-foreground-600 hover:bg-foreground-600 hover:text-background-100'
		}`;
	}

	function itemClass(level: number, index: number) {
		const isTarget = isActive && hasCorrectPrefix(level) && index === control.targetPath[level];
		return `block w-full whitespace-nowrap px-5 py-3 text-left text-xl outline-none focus-visible:bg-highlight-500 focus-visible:text-background-100 ${
			isTarget
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

<div bind:this={root} class="relative" role="presentation" onfocusout={handleFocusout}>
	<button type="button" class={triggerClass()} onclick={() => onToggle(control.id)}>
		{isActive ? 'click me' : "don't click"}
	</button>

	{#if isOpen}
		<div class="absolute" style={columnsStyle()}>
			{#each visibleColumns as column, level}
				<div
					class="absolute w-48 border-2 border-foreground-600 bg-background-100"
					style={columnStyle(level)}
				>
					{#each items(column.itemCount) as item}
						<button
							type="button"
							class={itemClass(level, item)}
							onpointerenter={() => handleItemHover(level, item)}
							onclick={() => handleItemClick(level, item)}
						>
							{itemLabel(level, item)}
						</button>
					{/each}
				</div>
			{/each}
		</div>
	{/if}
</div>
