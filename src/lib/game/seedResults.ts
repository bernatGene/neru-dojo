export type SeedStats = { attempts: number; bestMs: number };

const storageKey = 'neru-dojo-seed-results:v1';
type SeedStatsByKey = Record<string, SeedStats>;

export function saveSeedStats(mode: string, seed: string, elapsedMs: number): SeedStats {
	const key = `${mode}:${seed}`;
	const stats = readSeedStats();
	const previous = stats[key];
	const next = {
		attempts: (previous?.attempts ?? 0) + 1,
		bestMs: Math.min(previous?.bestMs ?? elapsedMs, elapsedMs),
	};

	stats[key] = next;

	try {
		localStorage.setItem(storageKey, JSON.stringify(stats));
	} catch {
		return next;
	}

	return next;
}

function readSeedStats(): SeedStatsByKey {
	try {
		const stored = localStorage.getItem(storageKey);
		if (!stored) return {};

		const parsed: unknown = JSON.parse(stored);
		return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
			? (parsed as SeedStatsByKey)
			: {};
	} catch {
		return {};
	}
}
