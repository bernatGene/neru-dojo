import type { GameConfig } from './types';

export const defaultPreset: GameConfig = {
	taskCount: 15,
	paragraphSize: 54,
	writeChance: 0.25,
	writeWordCount: 5,
	mainPanelTargetChance: 0.8,
	controlSpacing: {
		min: 18,
		max: 34
	},
	panels: [
		{ id: 'nav', title: 'nav', wordCount: 920 },
		{ id: 'content', title: 'content', wordCount: 1600 },
		{ id: 'meta', title: 'meta', wordCount: 920 }
	]
};

export const presets = {
	default: defaultPreset
} as const;

export type PresetSlug = keyof typeof presets;
