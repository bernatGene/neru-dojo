import { loadSeedWithWords } from '$lib/game/load';
import type { PageLoad } from './$types';

export const load: PageLoad = (event) => loadSeedWithWords('scroll', event);
