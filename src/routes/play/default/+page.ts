import { loadSeedWithWords } from '$lib/game/load';
import type { DefaultGameConfig } from '$lib/game/generate';
import type { PageLoad } from './$types';

export const load: PageLoad = (event) =>
	loadSeedWithWords<DefaultGameConfig>('default', event);
