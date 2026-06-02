type StoredSeedStats = { attempts: number; bestMs: number };
export type SeedStats = StoredSeedStats & { modeBestMs: number };

const storageKey = 'neru-dojo-seed-results:v1';
type SeedStatsByKey = Record<string, StoredSeedStats>;

export function saveSeedStats(mode: string, seed: string, elapsedMs: number): SeedStats {
	const key = `${mode}:${seed}`;
	const stats = readSeedStats();
	const previous = stats[key];
	const next = {
		attempts: (previous?.attempts ?? 0) + 1,
		bestMs: Math.min(previous?.bestMs ?? elapsedMs, elapsedMs),
	};

	stats[key] = next;

	const modeBestMs = Math.min(
		...Object.entries(stats)
			.filter(([key]) => key.startsWith(`${mode}:`))
			.map(([, item]) => item.bestMs),
	);

	try {
		localStorage.setItem(storageKey, JSON.stringify(stats));
	} catch {
		return { ...next, modeBestMs };
	}

	return { ...next, modeBestMs };
}

export function clearSeedStats() {
	localStorage.removeItem(storageKey);
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
