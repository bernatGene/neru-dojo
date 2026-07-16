const seedAlphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const baseSeedPattern = /^[0-9A-Za-z]{6,12}$/;

export const CONFIG_SEPARATOR = '-';

export function createSeed(length = 8) {
	const bytes = new Uint8Array(length);

	if (globalThis.crypto) {
		globalThis.crypto.getRandomValues(bytes);
	} else {
		for (let index = 0; index < bytes.length; index += 1) {
			bytes[index] = Math.floor(Math.random() * 256);
		}
	}

	let seed = '';
	for (const byte of bytes) {
		seed += seedAlphabet[byte % seedAlphabet.length];
	}

	return seed;
}

export function isValidBaseSeed(seed: string) {
	return baseSeedPattern.test(seed);
}

export function isValidSeed(seed: string) {
	return isValidBaseSeed(seed);
}

export function extractBaseSeed(seed: string) {
	const [first] = seed.split(CONFIG_SEPARATOR);
	return isValidBaseSeed(first) ? first : seed;
}
