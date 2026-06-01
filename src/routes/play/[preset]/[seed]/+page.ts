import { error } from '@sveltejs/kit';
import { asset } from '$app/paths';
import { isValidSeed } from '$lib/game/seed';
import { loadWords } from '$lib/game/words';
import type { PageLoad } from './$types';

export const prerender = false;

export const load: PageLoad = async ({ params, fetch }) => {
	if (params.preset !== 'default') {
		error(404, 'Unknown preset');
	}

	if (!isValidSeed(params.seed)) {
		error(404, 'Invalid seed');
	}

	return {
		preset: params.preset,
		seed: params.seed,
		words: await loadWords(fetch, asset('/english.json')),
	};
};
