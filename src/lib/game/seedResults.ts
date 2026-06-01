export type SeedStats = { attempts: number; bestMs: number };

const storageKey = 'neru-dojo-seed-results:v1';

export function saveSeedStats(preset: string, seed: string, elapsedMs: number): SeedStats {
	const key = `${preset}:${seed}`;
	const stats = readSeedStats();
	const previous = stats[key];
	const next = {
		attempts: (previous?.attempts ?? 0) + 1,
		bestMs: Math.min(previous?.bestMs ?? elapsedMs, elapsedMs)
	};

	stats[key] = next;

	try {
		localStorage.setItem(storageKey, JSON.stringify(stats));
	} catch {
		return next;
	}

	return next;
}

function readSeedStats(): Record<string, SeedStats> {
	try {
		const stored = localStorage.getItem(storageKey);
		const parsed: unknown = stored ? JSON.parse(stored) : {};

		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
			return {};
		}

		const stats: Record<string, SeedStats> = {};

		for (const [key, value] of Object.entries(parsed)) {
			const entry = value as Partial<SeedStats>;

			if (
				entry &&
				typeof entry === 'object' &&
				!Array.isArray(entry) &&
				typeof entry.attempts === 'number' &&
				typeof entry.bestMs === 'number'
			) {
				stats[key] = { attempts: entry.attempts, bestMs: entry.bestMs };
			}
		}

		return stats;
	} catch {
		return {};
	}
}
