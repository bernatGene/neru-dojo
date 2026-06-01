import type { GameModel } from './types';

export function isClickTask(game: GameModel, activeControlId: string | null, controlId: string) {
	if (controlId !== activeControlId) return false;

	const type = game.controlById[controlId].type;
	return type === 'click' || type === 'overlay';
}

export function isWriteTask(
	game: GameModel,
	activeControlId: string | null,
	controlId: string,
	value: string,
) {
	return (
		controlId === activeControlId &&
		game.controlById[controlId].type === 'write' &&
		normalizeText(value) === game.controlById[controlId].text
	);
}

function normalizeText(value: string) {
	return value.trim().toLowerCase().replace(/\s+/g, ' ');
}
