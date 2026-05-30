import { defaultPreset } from './config';
import { Random } from './random';
import type { ControlType, GameControl, GameModel, GamePanel, GameTask, GameToken } from './types';

export function generateGame(seed: string, words: readonly string[], preset = 'default'): GameModel {
	const random = new Random(seed);
	const panels: GamePanel[] = [];
	const controls: GameControl[] = [];
	const controlById: Record<string, GameControl> = {};
	let controlNumber = 0;

	for (const panelConfig of defaultPreset.panels) {
		const tokens: GameToken[] = [];
		let nextControlAt = random.int(
			defaultPreset.controlSpacing.min,
			defaultPreset.controlSpacing.max
		);

		for (let index = 0; index < panelConfig.wordCount; index += 1) {
			if (index > 0 && index % defaultPreset.paragraphSize === 0) {
				tokens.push({ kind: 'break' });
			}

			if (index === nextControlAt) {
				const type: ControlType = random.chance(defaultPreset.writeChance) ? 'write' : 'click';
				const control: GameControl = {
					id: `control-${controlNumber}`,
					panelId: panelConfig.id,
					type,
					text: type === 'write' ? createWriteText(random, words) : ''
				};

				controls.push(control);
				controlById[control.id] = control;
				tokens.push({ kind: 'control', controlId: control.id });
				controlNumber += 1;
				nextControlAt += random.int(
					defaultPreset.controlSpacing.min,
					defaultPreset.controlSpacing.max
				);
				continue;
			}

			tokens.push({ kind: 'word', text: random.pick(words) });
		}

		panels.push({ id: panelConfig.id, title: panelConfig.title, tokens });
	}

	const tasks: GameTask[] = [];

	for (let index = 0; index < defaultPreset.taskCount; index += 1) {
		let control = pickTaskControl(random, controls);

		while (index > 0 && controls.length > 1 && control.id === tasks[index - 1].controlId) {
			control = pickTaskControl(random, controls);
		}

		tasks.push({ controlId: control.id });
	}

	return { seed, preset, panels, controls, controlById, tasks };
}

export function getControlType(game: GameModel, controlId: string): ControlType {
	return game.controlById[controlId].type;
}

function createWriteText(random: Random, words: readonly string[]) {
	return Array.from({ length: defaultPreset.writeWordCount }, () =>
		random.pick(words).toLowerCase()
	).join(' ');
}

function pickTaskControl(random: Random, controls: readonly GameControl[]) {
	const contentControls = controls.filter((control) => control.panelId === 'content');

	if (contentControls.length > 0 && random.chance(defaultPreset.mainPanelTargetChance)) {
		return random.pick(contentControls);
	}

	return random.pick(controls);
}
