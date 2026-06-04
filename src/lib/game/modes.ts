import { resolve } from '$app/paths';
import type { GameMode } from './types';

export const gameModes: readonly GameMode[] = ['default', 'click', 'scroll', 'menus'];

export function modeHref(mode: GameMode, seed: string) {
	if (mode === 'click') return resolve('/play/click/[seed]', { seed });
	if (mode === 'scroll') return resolve('/play/scroll/[seed]', { seed });
	if (mode === 'menus') return resolve('/play/menus/[seed]', { seed });

	return resolve('/play/default/[seed]', { seed });
}
