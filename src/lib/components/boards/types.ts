import type { Snippet } from 'svelte';
import type { GameControl, GameModel } from '$lib/game/types';

export type BoardProps = {
	game: GameModel;
	started: boolean;
	completed: boolean;
	runKey: string;
	activeControl: GameControl | null;
	activeControlId: string | null;
	onClickControl: (id: string) => void;
	onClickMiss: () => void;
	onFormSubmit: (id: string, value: string) => void;
	onScrollComplete: (id: string) => void;
	onStart: () => void;
	startContent?: Snippet;
};
