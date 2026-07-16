import { loadSeed } from '$lib/game/load';
import type { ClickConfig } from '$lib/game/generate';
import type { PageLoad } from './$types';

export const load: PageLoad = (event) => loadSeed<ClickConfig>('click', event);
