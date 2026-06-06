import { resolve } from '$app/paths';
import type { GameMode } from './types';

export const gameModes: readonly GameMode[] = ['default', 'click', 'scroll', 'menus', 'rgrid'];

export function isGameMode(mode: string): mode is GameMode {
	return gameModes.includes(mode as GameMode);
}

export function modeHref(mode: GameMode, seed: string) {
	return `${resolve(`/play/${mode}`)}?seed=${encodeURIComponent(seed)}`;
}
