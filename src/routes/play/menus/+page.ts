import { loadSeed } from '$lib/game/load';
import type { PageLoad } from './$types';

export const load: PageLoad = (event) => loadSeed('menus', event);
