export type PanelId = 'nav' | 'content' | 'meta';
export type ScrollPanelId = PanelId | 'horizontal';
export type GameMode = 'default' | 'click' | 'scroll';

export type GameToken =
	| { kind: 'word'; text: string }
	| { kind: 'control'; control: PanelGameControl }
	| { kind: 'break' };

export type InlineGameControl = {
	id: string;
	panelId: PanelId;
	type: 'click' | 'write';
	text: string;
};

export type OverlayGameControl = {
	id: string;
	type: 'overlay';
	text: '';
	x: number;
	y: number;
	width?: number;
	height?: number;
};

export type ScrollGameControl = {
	id: string;
	panelId: ScrollPanelId;
	type: 'scroll';
	axis: 'vertical' | 'horizontal';
	text: 'center me';
	guidePosition: number;
};

export type PanelGameControl = InlineGameControl | ScrollGameControl;
export type GameControl = InlineGameControl | OverlayGameControl | ScrollGameControl;

export type GamePanel = {
	id: PanelId;
	title: string;
	tokens: GameToken[];
};

export type GameModel = {
	mode: GameMode;
	panels: GamePanel[];
	horizontalTokens: GameToken[];
	tasks: GameControl[];
};
