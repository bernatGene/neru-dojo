export type PanelId = 'nav' | 'content' | 'meta';
export type ControlType = 'click' | 'write';

export type GameToken =
	| { kind: 'word'; text: string }
	| { kind: 'control'; controlId: string }
	| { kind: 'break' };

export type GameControl = {
	id: string;
	panelId: PanelId;
	type: ControlType;
	text: string;
};

export type GamePanel = {
	id: PanelId;
	title: string;
	tokens: GameToken[];
};

export type GameTask = {
	controlId: string;
};

export type GameModel = {
	seed: string;
	preset: string;
	panels: GamePanel[];
	controls: GameControl[];
	controlById: Record<string, GameControl>;
	tasks: GameTask[];
};

export type PanelConfig = {
	id: PanelId;
	title: string;
	wordCount: number;
};

export type GameConfig = {
	taskCount: number;
	paragraphSize: number;
	writeChance: number;
	writeWordCount: number;
	mainPanelTargetChance: number;
	controlSpacing: {
		min: number;
		max: number;
	};
	panels: PanelConfig[];
};
