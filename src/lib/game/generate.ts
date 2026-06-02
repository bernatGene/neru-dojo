import { defaultConfig } from './config';
import { Random } from './random';
import type {
	GameControl,
	GameMode,
	GameModel,
	GamePanel,
	GameToken,
	InlineGameControl,
	PanelGameControl,
	PanelId,
	ScrollGameControl,
} from './types';

export function generateGame(
	seed: string,
	words: readonly string[],
	mode: GameMode = 'default',
): GameModel {
	const random = new Random(seed);
	const panels: GamePanel[] = [];
	const controls: GameControl[] = [];
	let controlNumber = 0;
	const nextControlId = () => `control-${controlNumber++}`;
	const addControl = <T extends GameControl>(control: T) => {
		controls.push(control);
		return control;
	};
	const createPanels = (
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

	if (mode === 'click') {
		for (let index = 0; index < defaultConfig.taskCount; index += 1) {
			addControl({
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
			mode,
			panels,
			horizontalTokens: [],
			tasks: shuffle(random, controls),
		};
	}

	if (mode === 'scroll') {
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
			mode,
			panels,
			horizontalTokens,
			tasks: taskControls,
		};
	}

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

	const taskCounts = getTaskCounts(defaultConfig.taskCount);

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
	]);

	return {
		mode,
		panels,
		horizontalTokens: [],
		tasks: taskControls,
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
