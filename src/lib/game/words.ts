type MonkeytypeWords = {
	words?: string[];
};

export async function loadWords(fetcher: typeof fetch, basePath = '') {
	const response = await fetcher(`${basePath}/english.json`);

	if (!response.ok) {
		throw new Error('Failed to load English word list');
	}

	const data = (await response.json()) as MonkeytypeWords;

	if (!Array.isArray(data.words) || data.words.length === 0) {
		throw new Error('English word list is empty');
	}

	return data.words;
}
