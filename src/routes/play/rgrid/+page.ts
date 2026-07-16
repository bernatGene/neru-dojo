import { loadSeed } from '$lib/game/load';
import type { RecursiveGridConfig } from '$lib/game/generate';
import type { PageLoad } from './$types';

export const load: PageLoad = (event) =>
	loadSeed<RecursiveGridConfig>('rgrid', event);
