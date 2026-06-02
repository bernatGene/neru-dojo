<script lang="ts">
	import type { MenuGameControl, NestedMenuGameControl } from '$lib/game/types';
	import DropdownMenu from './DropdownMenu.svelte';
	import NestedMenu from './NestedMenu.svelte';
	import ScrollableMenu from './ScrollableMenu.svelte';

	let {
		controls,
		activeControl,
		onClickControl,
		onClickMiss,
	}: {
		controls: readonly MenuGameControl[];
		activeControl: MenuGameControl | null;
		onClickControl: (id: string) => void;
		onClickMiss: () => void;
	} = $props();

	let openMenuId = $state<string | null>(null);

	function positionStyle(control: MenuGameControl) {
		const x = `${control.x}%`;
		const y = `${control.y}%`;
		const translateX = control.x === 100 ? '-100%' : control.x === 50 ? '-50%' : '0';
		const translateY = control.y === 100 ? '-100%' : control.y === 50 ? '-50%' : '0';

		return `left: ${x}; top: ${y}; transform: translate(${translateX}, ${translateY});`;
	}

	function activeTargetIndex(control: MenuGameControl) {
		if (activeControl?.id !== control.id || activeControl.menuType === 'nested') return undefined;

		return activeControl.targetIndex;
	}

	function activeNestedControl(control: MenuGameControl): NestedMenuGameControl {
		if (activeControl?.id === control.id && activeControl.menuType === 'nested') return activeControl;

		return control as NestedMenuGameControl;
	}

	function handleArenaMiss() {
		openMenuId = null;
		onClickMiss();
	}

	function handleMenuToggle(id: string) {
		openMenuId = openMenuId === id ? null : id;
	}

	function handleMenuClose() {
		openMenuId = null;
	}

	function handleMenuCorrect(id: string) {
		openMenuId = null;
		onClickControl(id);
	}

	function handleMenuMiss() {
		openMenuId = null;
		onClickMiss();
	}
</script>

<div class="relative h-full w-full border-2 border-foreground-600 bg-background-100">
	<button type="button" class="absolute inset-0 cursor-default" onclick={handleArenaMiss} aria-label="Menu arena">
	</button>

	{#each controls as control}
		<div class="absolute z-10" style={positionStyle(control)}>
			{#if control.menuType === 'dropdown'}
				<DropdownMenu
					id={control.id}
					unfold={control.unfold}
					targetIndex={activeTargetIndex(control)}
					onCorrect={onClickControl}
					onMiss={onClickMiss}
				/>
			{:else if control.menuType === 'scrollable'}
				<ScrollableMenu
					id={control.id}
					unfold={control.unfold}
					targetIndex={activeTargetIndex(control)}
					isOpen={openMenuId === control.id}
					onToggle={handleMenuToggle}
					onClose={handleMenuClose}
					onCorrect={handleMenuCorrect}
					onMiss={handleMenuMiss}
				/>
			{:else}
				<NestedMenu
					control={activeNestedControl(control)}
					isActive={activeControl?.id === control.id}
					isOpen={openMenuId === control.id}
					onToggle={handleMenuToggle}
					onClose={handleMenuClose}
					onCorrect={handleMenuCorrect}
					onMiss={handleMenuMiss}
				/>
			{/if}
		</div>
	{/each}
</div>
