export class Random {
	#state: number;

	constructor(seed: string) {
		this.#state = hashSeed(seed);
	}

	next() {
		this.#state += 0x6d2b79f5;
		let value = this.#state;
		value = Math.imul(value ^ (value >>> 15), value | 1);
		value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
		return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
	}

	int(min: number, max: number) {
		return Math.floor(this.next() * (max - min + 1)) + min;
	}

	pick<T>(items: readonly T[]) {
		return items[this.int(0, items.length - 1)];
	}

	chance(probability: number) {
		return this.next() < probability;
	}
}

function hashSeed(seed: string) {
	let hash = 2166136261;

	for (let index = 0; index < seed.length; index += 1) {
		hash ^= seed.charCodeAt(index);
		hash = Math.imul(hash, 16777619);
	}

	return hash >>> 0;
}
