import {
	clampDefaultGameConfig,
	clampRecursiveGridConfig,
	defaultDefaultGameConfig,
	defaultRecursiveGridConfig,
	getDefaultTaskMixTotal,
	type DefaultGameConfig,
	type RecursiveGridConfig,
} from './generate';
import { CONFIG_SEPARATOR, isValidBaseSeed } from './seed';
import type { GameMode } from './types';

export const defaultConfigStorageKey = 'neru-dojo-default-config';
export const rgridConfigStorageKey = 'neru-dojo-rgrid-config';

function readStoredConfig<T>(storageKey: string): Partial<T> {
	try {
		const stored = localStorage.getItem(storageKey);
		if (!stored) return {};

		const parsed = JSON.parse(stored);
		if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
			return parsed as Partial<T>;
		}
	} catch {
		// fall through to defaults
	}

	return {};
}

function decodeDefaultParams(params: number[]): Partial<DefaultGameConfig> {
	const partial: Partial<DefaultGameConfig> = {};

	if (params.length > 0) {
		partial.textLengthMultiplier = params[0];
	}

	if (params.length > 2 || params.length > 3 || params.length > 4) {
		partial.taskMix = { ...defaultDefaultGameConfig.taskMix };
		if (params.length > 2) partial.taskMix.inlineClick = params[2];
		if (params.length > 3) partial.taskMix.input = params[3];
		if (params.length > 4) partial.taskMix.floatClick = params[4];
	}

	return partial;
}

function encodeDefaultConfig(config: DefaultGameConfig): number[] {
	return [
		config.textLengthMultiplier,
		getDefaultTaskMixTotal(config.taskMix),
		config.taskMix.inlineClick,
		config.taskMix.input,
		config.taskMix.floatClick,
	];
}

function decodeRgridParams(params: number[]): Partial<RecursiveGridConfig> {
	const partial: Partial<RecursiveGridConfig> = {};

	if (params.length > 0) partial.rows = params[0];
	if (params.length > 1) partial.cols = params[1];
	if (params.length > 2) partial.levels = params[2];
	if (params.length > 3) partial.targetsPerLevel = params[3];

	return partial;
}

function encodeRgridConfig(config: RecursiveGridConfig): number[] {
	return [config.rows, config.cols, config.levels, config.targetsPerLevel];
}

export function decodeModeSeed(seed: string): { baseSeed: string; params: number[] } {
	const parts = seed.split(CONFIG_SEPARATOR);
	const baseCandidate = parts[0] ?? '';
	const baseSeed = isValidBaseSeed(baseCandidate) ? baseCandidate : seed;
	const paramParts = isValidBaseSeed(baseCandidate) ? parts.slice(1) : [];
	const params = paramParts
		.map(Number)
		.filter((value) => Number.isFinite(value));

	return { baseSeed, params };
}

export function loadModeConfig(
	mode: 'default',
	seed: string,
): { baseSeed: string; config: DefaultGameConfig };
export function loadModeConfig(
	mode: 'rgrid',
	seed: string,
): { baseSeed: string; config: RecursiveGridConfig };
export function loadModeConfig(
	mode: GameMode,
	seed: string,
): { baseSeed: string; config: DefaultGameConfig | RecursiveGridConfig | undefined };
export function loadModeConfig(mode: GameMode, seed: string) {
	const { baseSeed, params } = decodeModeSeed(seed);

	switch (mode) {
		case 'default': {
			const stored = readStoredConfig<DefaultGameConfig>(defaultConfigStorageKey);
			const partial = decodeDefaultParams(params);
			const merged = { ...defaultDefaultGameConfig, ...stored, ...partial };
			return { baseSeed, config: clampDefaultGameConfig(merged) };
		}
		case 'rgrid': {
			const stored = readStoredConfig<RecursiveGridConfig>(rgridConfigStorageKey);
			const partial = decodeRgridParams(params);
			const merged = { ...defaultRecursiveGridConfig, ...stored, ...partial };
			return { baseSeed, config: clampRecursiveGridConfig(merged) };
		}
		default:
			return { baseSeed, config: undefined };
	}
}

export function encodeModeSeed(
	mode: 'default',
	baseSeed: string,
	config: DefaultGameConfig,
): string;
export function encodeModeSeed(
	mode: 'rgrid',
	baseSeed: string,
	config: RecursiveGridConfig,
): string;
export function encodeModeSeed(mode: GameMode, baseSeed: string, config?: unknown): string;
export function encodeModeSeed(mode: GameMode, baseSeed: string, config?: unknown) {
	switch (mode) {
		case 'default':
			return [baseSeed, ...encodeDefaultConfig(config as DefaultGameConfig)].join(CONFIG_SEPARATOR);
		case 'rgrid':
			return [baseSeed, ...encodeRgridConfig(config as RecursiveGridConfig)].join(CONFIG_SEPARATOR);
		default:
			return baseSeed;
	}
}
