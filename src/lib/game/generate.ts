import { defaultConfig } from './config';
import { Random } from './random';
import type {
	GameControl,
	GameModel,
	GamePanel,
	GameToken,
	InlineGameControl,
	MenuGameControl,
	PanelGameControl,
	PanelId,
	RecursiveGridGameControl,
	ScrollGameControl,
} from './types';

export type RecursiveGridConfig = {
	rows: number;
	cols: number;
	levels: number;
	targetsPerLevel: number;
};

export const defaultRecursiveGridConfig: RecursiveGridConfig = {
	rows: 3,
	cols: 3,
	levels: 4,
	targetsPerLevel: 5,
};

export const recursiveGridConfigLimits = {
	rows: { min: 1, max: 6 },
	cols: { min: 1, max: 6 },
	levels: { min: 1, max: 9 },
	targetsPerLevel: { min: 1, max: 20 },
} satisfies Record<keyof RecursiveGridConfig, { min: number; max: number }>;

export function clampRecursiveGridConfig(config: RecursiveGridConfig): RecursiveGridConfig {
	return {
		rows: clampInteger(config.rows, recursiveGridConfigLimits.rows),
		cols: clampInteger(config.cols, recursiveGridConfigLimits.cols),
		levels: clampInteger(config.levels, recursiveGridConfigLimits.levels),
		targetsPerLevel: clampInteger(
			config.targetsPerLevel,
			recursiveGridConfigLimits.targetsPerLevel,
		),
	};
}

export function generateRecursiveGridGame(seed: string, config: RecursiveGridConfig): GameModel {
	const random = new Random(seed);
	const safeConfig = clampRecursiveGridConfig(config);
	const tasks: RecursiveGridGameControl[] = [];
	const nextControlId = createControlIdFactory();

	for (let level = 1; level <= safeConfig.levels; level += 1) {
		for (let index = 0; index < safeConfig.targetsPerLevel; index += 1) {
			tasks.push(createRecursiveGridControl(random, nextControlId(), safeConfig, level));
		}
	}

	return {
		mode: 'rgrid',
		panels: [],
		horizontalTokens: [],
		menuControls: [],
		tasks,
	};
}

export function generateClickGame(seed: string): GameModel {
	const random = new Random(seed);
	const controls: GameControl[] = [];
	let controlNumber = 0;
	const nextControlId = () => `control-${controlNumber++}`;

	for (let index = 0; index < defaultConfig.taskCount; index += 1) {
		controls.push({
			id: nextControlId(),
			type: 'overlay',
			text: '',
			x: random.int(10, 90),
			y: random.int(10, 90),
			width: random.int(12, 64),
			height: random.int(12, 64),
		});
	}

	return {
		mode: 'click',
		panels: [],
		horizontalTokens: [],
		menuControls: [],
		tasks: shuffle(random, controls),
	};
}

function clampInteger(value: number, limit: { min: number; max: number }) {
	if (!Number.isFinite(value)) return limit.min;
	return Math.min(Math.max(Math.trunc(value), limit.min), limit.max);
}

function createRecursiveGridControl(
	random: Random,
	id: string,
	config: RecursiveGridConfig,
	level: number,
): RecursiveGridGameControl {
	let left = 0;
	let top = 0;
	let width = 100;
	let height = 100;

	for (let depth = 0; depth < level; depth += 1) {
		const cellWidth = width / config.cols;
		const cellHeight = height / config.rows;
		left += random.int(0, config.cols - 1) * cellWidth;
		top += random.int(0, config.rows - 1) * cellHeight;
		width = cellWidth;
		height = cellHeight;
	}

	return {
		id,
		type: 'rgrid',
		text: '',
		x: left,
		y: top,
		width,
		height,
	};
}

export function generateMenusGame(seed: string): GameModel {
	const random = new Random(seed);
	const menuControls = createMenuControls(random, createControlIdFactory());
	const tasks = [
		...menuControls.map((control) => createMenuTask(random, control)),
		...Array.from({ length: defaultConfig.taskCount - menuControls.length }, () =>
			createMenuTask(random, random.pick(menuControls)),
		),
	];

	return {
		mode: 'menus',
		panels: [],
		horizontalTokens: [],
		menuControls,
		tasks: shuffle(random, tasks),
	};
}

export function generateScrollGame(seed: string, words: readonly string[]): GameModel {
	const random = new Random(seed);
	const panels: GamePanel[] = [];
	const controls: GameControl[] = [];
	const nextControlId = createControlIdFactory();
	const addControl = <T extends GameControl>(control: T) => {
		controls.push(control);
		return control;
	};
	const createPanels = createPanelFactory(random, words, panels);

	createPanels(
		(count) => Math.ceil(count * 2.2),
		(panelId) =>
			addControl({
				id: nextControlId(),
				panelId,
				type: 'scroll',
				axis: 'vertical',
				text: 'center me',
				guidePosition: random.next(),
			}),
	);

	const horizontalTokens: GameToken[] = [];
	const horizontalControl = addControl({
		id: nextControlId(),
		panelId: 'horizontal',
		type: 'scroll',
		axis: 'horizontal',
		text: 'center me',
		guidePosition: random.next(),
	});

	for (let index = 0; index < 180; index += 1) {
		if (index === 90) {
			horizontalTokens.push({ kind: 'control', control: horizontalControl });
		}

		horizontalTokens.push({ kind: 'word', text: random.pick(words) });
	}

	const verticalControls = controls.filter(
		(control): control is ScrollGameControl =>
			control.type === 'scroll' && control.axis === 'vertical',
	);
	const taskControls = shuffle(random, verticalControls).slice(0, defaultConfig.taskCount - 1);
	taskControls.splice(random.int(0, taskControls.length), 0, horizontalControl);

	return {
		mode: 'scroll',
		panels,
		horizontalTokens,
		menuControls: [],
		tasks: taskControls,
	};
}

export function generateDefaultGame(seed: string, words: readonly string[]): GameModel {
	const random = new Random(seed);
	const panels: GamePanel[] = [];
	const controls: GameControl[] = [];
	const nextControlId = createControlIdFactory();
	const addControl = <T extends GameControl>(control: T) => {
		controls.push(control);
		return control;
	};
	const createPanels = createPanelFactory(random, words, panels);

	createPanels(
		(count) => count,
		(panelId) => {
			const type = random.chance(defaultConfig.writeChance) ? 'write' : 'click';
			return addControl({
				id: nextControlId(),
				panelId,
				type,
				text: type === 'write' ? createWriteText(random, words) : '',
			});
		},
	);

	const defaultMenuControls = createDefaultMenuControls(random, nextControlId);
	const taskCounts = getTaskCounts(defaultConfig.taskCount - defaultMenuControls.length);

	for (let index = 0; index < taskCounts.overlay; index += 1) {
		addControl({
			id: nextControlId(),
			type: 'overlay',
			text: '',
			x: random.int(10, 90),
			y: random.int(10, 90),
		});
	}

	const clickControls = controls.filter(
		(control): control is InlineGameControl => control.type === 'click',
	);
	const writeControls = controls.filter(
		(control): control is InlineGameControl => control.type === 'write',
	);
	const overlayControls = controls.filter((control) => control.type === 'overlay');
	const taskControls = shuffle(random, [
		...pickTaskControls(random, overlayControls, taskCounts.overlay, false),
		...pickTaskControls(random, clickControls, taskCounts.click, true),
		...pickTaskControls(random, writeControls, taskCounts.write, true),
		...defaultMenuControls.map((control) => createMenuTask(random, control)),
	]);

	return {
		mode: 'default',
		panels,
		horizontalTokens: [],
		menuControls: defaultMenuControls,
		tasks: taskControls,
	};
}

function createControlIdFactory() {
	let controlNumber = 0;
	return () => `control-${controlNumber++}`;
}

function createPanelFactory(random: Random, words: readonly string[], panels: GamePanel[]) {
	return (
		wordCount: (count: number) => number,
		createControl: (panelId: PanelId) => PanelGameControl,
	) => {
		for (const panelConfig of defaultConfig.panels) {
			const tokens = createPanelTokens(random, words, wordCount(panelConfig.wordCount), () =>
				createControl(panelConfig.id),
			);
			panels.push({ id: panelConfig.id, title: panelConfig.title, tokens });
		}
	};
}

function createDefaultMenuControls(random: Random, nextControlId: () => string) {
	return [
		createNestedMenuControl(random, nextControlId),
		{
			id: nextControlId(),
			type: 'menu',
			menuType: 'scrollable',
			x: 50,
			y: 0,
			unfold: 'down-right',
			targetIndex: random.int(0, 19),
		},
	] satisfies MenuGameControl[];
}

function createMenuControls(random: Random, nextControlId: () => string) {
	const dropdownPositions: Pick<MenuGameControl, 'x' | 'y' | 'unfold'>[] = [
		{ x: 100, y: 0, unfold: 'down-left' },
		{ x: 0, y: 100, unfold: 'up-right' },
		{ x: 100, y: 100, unfold: 'up-left' },
	];
	const controls: MenuGameControl[] = dropdownPositions.map((control) => ({
		id: nextControlId(),
		type: 'menu',
		menuType: 'dropdown',
		targetIndex: random.int(0, 5),
		...control,
	}));
	const scrollablePositions: Pick<MenuGameControl, 'x' | 'y' | 'unfold'>[] = [
		{ x: 50, y: 50, unfold: 'down-right' },
		{ x: 50, y: 0, unfold: 'down-right' },
		{ x: 0, y: 50, unfold: 'down-right' },
		{ x: 100, y: 50, unfold: 'down-left' },
		{ x: 50, y: 100, unfold: 'up-right' },
	];

	for (const control of scrollablePositions) {
		controls.push({
			id: nextControlId(),
			type: 'menu',
			menuType: 'scrollable',
			targetIndex: random.int(0, 19),
			...control,
		});
	}
	controls.push(createNestedMenuControl(random, nextControlId));

	return shuffle(random, controls);
}

function createNestedMenuControl(random: Random, nextControlId: () => string): MenuGameControl {
	const columns = Array.from({ length: 4 }, () => ({
		itemCount: random.int(4, 7),
	}));

	return {
		id: nextControlId(),
		type: 'menu',
		menuType: 'nested',
		x: 0,
		y: 0,
		unfold: 'down-right',
		navigation: 'hover',
		targetPath: columns.map((column) => random.int(0, column.itemCount - 1)),
		columns,
	};
}

function createMenuTask(random: Random, control: MenuGameControl): MenuGameControl {
	if (control.menuType === 'nested') {
		return {
			...control,
			targetPath: control.columns.map((column) => random.int(0, column.itemCount - 1)),
		};
	}

	return {
		...control,
		targetIndex: random.int(0, control.menuType === 'scrollable' ? 19 : 5),
	};
}

function createPanelTokens(
	random: Random,
	words: readonly string[],
	wordCount: number,
	createControl: () => PanelGameControl,
) {
	const tokens: GameToken[] = [];
	let nextControlAt = random.int(
		defaultConfig.controlSpacing.min,
		defaultConfig.controlSpacing.max,
	);

	for (let index = 0; index < wordCount; index += 1) {
		if (index > 0 && index % defaultConfig.paragraphSize === 0) tokens.push({ kind: 'break' });

		if (index === nextControlAt) {
			const control = createControl();
			tokens.push({ kind: 'control', control });
			nextControlAt += random.int(
				defaultConfig.controlSpacing.min,
				defaultConfig.controlSpacing.max,
			);
			continue;
		}

		tokens.push({ kind: 'word', text: random.pick(words) });
	}

	return tokens;
}

function createWriteText(random: Random, words: readonly string[]) {
	return Array.from({ length: defaultConfig.writeWordCount }, () =>
		random.pick(words).toLowerCase(),
	).join(' ');
}

function getTaskCounts(taskCount: number) {
	const overlay = Math.round(taskCount * 0.5);
	const write = Math.round(taskCount * 0.25);
	return { overlay, write, click: taskCount - overlay - write };
}

function pickTaskControls<T extends GameControl>(
	random: Random,
	controls: readonly T[],
	count: number,
	preferContent: boolean,
) {
	const picked: T[] = [];
	let pool = [...controls];

	if (count > 0 && controls.length === 0) {
		throw new Error('No controls available for task type');
	}

	for (let index = 0; index < count; index += 1) {
		if (pool.length === 0) {
			pool = [...controls];
		}

		const control = preferContent
			? pickInlineTaskControl(random, pool as InlineGameControl[])
			: random.pick(pool);
		picked.push(control as T);
		pool = pool.filter((item) => item.id !== control.id);
	}

	return picked;
}

function pickInlineTaskControl(random: Random, controls: readonly InlineGameControl[]) {
	const contentControls = controls.filter((control) => control.panelId === 'content');

	if (contentControls.length > 0 && random.chance(defaultConfig.mainPanelTargetChance)) {
		return random.pick(contentControls);
	}

	return random.pick(controls);
}

function shuffle<T>(random: Random, items: readonly T[]) {
	const shuffled = [...items];

	for (let index = shuffled.length - 1; index > 0; index -= 1) {
		const nextIndex = random.int(0, index);
		[shuffled[index], shuffled[nextIndex]] = [shuffled[nextIndex], shuffled[index]];
	}

	return shuffled;
}
