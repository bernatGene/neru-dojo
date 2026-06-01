import { error } from '@sveltejs/kit';
import { asset } from '$app/paths';
import { isValidSeed } from '$lib/game/seed';
import type { GameMode } from '$lib/game/types';
import { loadWords } from '$lib/game/words';
import type { PageLoad } from './$types';

export const prerender = false;

const gameModes: readonly GameMode[] = ['default', 'overlay'];

export const load: PageLoad = async ({ params, fetch }) => {
	const mode = params.mode as GameMode;

	if (!gameModes.includes(mode)) {
		error(404, 'Unknown mode');
	}

	if (!isValidSeed(params.seed)) {
		error(404, 'Invalid seed');
	}

	return {
		mode,
		seed: params.seed,
		words: mode === 'overlay' ? [] : await loadWords(fetch, asset('/english.json')),
	};
};
