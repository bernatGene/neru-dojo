import { defaultConfig } from './config';
import { Random } from './random';
import type {
	GameControl,
	GameMode,
	GameModel,
	GamePanel,
	GameTask,
	GameToken,
	InlineControlType,
	InlineGameControl,
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
	const controlById: Record<string, GameControl> = {};
	let controlNumber = 0;

	if (mode === 'click') {
		for (let index = 0; index < defaultConfig.taskCount; index += 1) {
			const control: GameControl = {
				id: `control-${controlNumber}`,
				type: 'overlay',
				text: '',
				x: random.int(10, 90),
				y: random.int(10, 90),
				width: random.int(12, 64),
				height: random.int(12, 64),
			};

			controls.push(control);
			controlById[control.id] = control;
			controlNumber += 1;
		}

		return {
			seed,
			mode,
			panels,
			horizontalTokens: [],
			controls,
			controlById,
			tasks: shuffle(random, controls).map((control) => ({ controlId: control.id })),
		};
	}

	if (mode === 'scroll') {
		for (const panelConfig of defaultConfig.panels) {
			const tokens: GameToken[] = [];
			let nextControlAt = random.int(
				defaultConfig.controlSpacing.min,
				defaultConfig.controlSpacing.max,
			);

			for (let index = 0; index < Math.ceil(panelConfig.wordCount * 2.2); index += 1) {
				if (index > 0 && index % defaultConfig.paragraphSize === 0) {
					tokens.push({ kind: 'break' });
				}

				if (index === nextControlAt) {
					const control: ScrollGameControl = {
						id: `control-${controlNumber}`,
						panelId: panelConfig.id,
						type: 'scroll',
						axis: 'vertical',
						text: 'center me',
						guidePosition: random.next(),
					};

					controls.push(control);
					controlById[control.id] = control;
					tokens.push({ kind: 'control', controlId: control.id });
					controlNumber += 1;
					nextControlAt += random.int(
						defaultConfig.controlSpacing.min,
						defaultConfig.controlSpacing.max,
					);
					continue;
				}

				tokens.push({ kind: 'word', text: random.pick(words) });
			}

			panels.push({ id: panelConfig.id, title: panelConfig.title, tokens });
		}

		const horizontalTokens: GameToken[] = [];
		const horizontalControl: ScrollGameControl = {
			id: `control-${controlNumber}`,
			panelId: 'horizontal',
			type: 'scroll',
			axis: 'horizontal',
			text: 'center me',
			guidePosition: random.next(),
		};

		for (let index = 0; index < 180; index += 1) {
			if (index === 90) {
				horizontalTokens.push({ kind: 'control', controlId: horizontalControl.id });
			}

			horizontalTokens.push({ kind: 'word', text: random.pick(words) });
		}

		controls.push(horizontalControl);
		controlById[horizontalControl.id] = horizontalControl;
		const verticalControls = controls.filter(
			(control): control is ScrollGameControl => control.type === 'scroll' && control.axis === 'vertical',
		);
		const taskControls = shuffle(random, verticalControls).slice(0, defaultConfig.taskCount - 1);
		taskControls.splice(random.int(0, taskControls.length), 0, horizontalControl);

		return {
			seed,
			mode,
			panels,
			horizontalTokens,
			controls,
			controlById,
			tasks: taskControls.map((control) => ({ controlId: control.id })),
		};
	}

	for (const panelConfig of defaultConfig.panels) {
		const tokens: GameToken[] = [];
		let nextControlAt = random.int(
			defaultConfig.controlSpacing.min,
			defaultConfig.controlSpacing.max,
		);

		for (let index = 0; index < panelConfig.wordCount; index += 1) {
			if (index > 0 && index % defaultConfig.paragraphSize === 0) {
				tokens.push({ kind: 'break' });
			}

			if (index === nextControlAt) {
				const type: InlineControlType = random.chance(defaultConfig.writeChance)
					? 'write'
					: 'click';
				const control: InlineGameControl = {
					id: `control-${controlNumber}`,
					panelId: panelConfig.id,
					type,
					text: type === 'write' ? createWriteText(random, words) : '',
				};

				controls.push(control);
				controlById[control.id] = control;
				tokens.push({ kind: 'control', controlId: control.id });
				controlNumber += 1;
				nextControlAt += random.int(
					defaultConfig.controlSpacing.min,
					defaultConfig.controlSpacing.max,
				);
				continue;
			}

			tokens.push({ kind: 'word', text: random.pick(words) });
		}

		panels.push({ id: panelConfig.id, title: panelConfig.title, tokens });
	}

	const taskCounts = getTaskCounts(defaultConfig.taskCount);

	for (let index = 0; index < taskCounts.overlay; index += 1) {
		const control: GameControl = {
			id: `control-${controlNumber}`,
			type: 'overlay',
			text: '',
			x: random.int(10, 90),
			y: random.int(10, 90),
		};

		controls.push(control);
		controlById[control.id] = control;
		controlNumber += 1;
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
	const tasks: GameTask[] = taskControls.map((control) => ({ controlId: control.id }));

	return { seed, mode, panels, horizontalTokens: [], controls, controlById, tasks };
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
