import { asset } from '$app/paths';
import { error } from '@sveltejs/kit';
import { isValidSeed } from './seed';
import { loadWords } from './words';

type SeedLoadEvent = { url: URL; fetch: typeof fetch };

export const loadSeed = ({ url }: SeedLoadEvent) => {
	const seed = url.searchParams.get('seed');
	if (seed !== null && !isValidSeed(seed)) error(404, 'Invalid seed');
	return { seed };
};

export const loadSeedWithWords = async (event: SeedLoadEvent) => ({
	...loadSeed(event),
	words: await loadWords(event.fetch, asset('/english.json')),
});
