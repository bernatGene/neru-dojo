import { asset } from '$app/paths';
import { loadWords } from './words';
import type { GameMode } from './types';
import { loadModeConfig } from './configEncoding';

export type SeedLoadEvent = { url: URL; fetch: typeof fetch };

export function loadSeed<T>(mode: GameMode, { url }: SeedLoadEvent) {
	const seed = url.searchParams.get('seed') ?? '';
	const { baseSeed, config } = loadModeConfig(mode, seed);

	return { seed: seed || null, baseSeed, config: config as T };
}

export async function loadSeedWithWords<T>(mode: GameMode, event: SeedLoadEvent) {
	return {
		...loadSeed<T>(mode, event),
		words: await loadWords(event.fetch, asset('/english.json')),
	};
}
