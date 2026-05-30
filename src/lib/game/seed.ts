const seedAlphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const seedPattern = /^[0-9A-Za-z]{6,12}$/;

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

export function isValidSeed(seed: string) {
	return seedPattern.test(seed);
}
