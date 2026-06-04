import { asset } from '$app/paths';
import { error } from '@sveltejs/kit';
import { isValidSeed } from './seed';
import { loadWords } from './words';

type SeedLoadEvent = { params: { seed: string }; fetch: typeof fetch };

export const loadSeed = ({ params }: SeedLoadEvent) => {
	if (!isValidSeed(params.seed)) error(404, 'Invalid seed');
	return { seed: params.seed };
};

export const loadSeedWithWords = async (event: SeedLoadEvent) => ({
	...loadSeed(event),
	words: await loadWords(event.fetch, asset('/english.json')),
});
