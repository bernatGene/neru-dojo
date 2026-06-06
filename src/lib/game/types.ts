export type PanelId = 'nav' | 'content' | 'meta';
export type ScrollPanelId = PanelId | 'horizontal';
export type GameMode = 'default' | 'click' | 'scroll' | 'menus' | 'rgrid';
export type MenuUnfold = 'down-right' | 'down-left' | 'up-right' | 'up-left';
export type NestedMenuNavigation = 'hover' | 'click';

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

export type ChoiceMenuGameControl = {
	id: string;
	type: 'menu';
	menuType: 'dropdown' | 'scrollable';
	x: number;
	y: number;
	unfold: MenuUnfold;
	targetIndex: number;
};

export type RecursiveGridGameControl = {
	id: string;
	type: 'rgrid';
	text: '';
	path: { row: number; col: number }[];
	rows: number;
	cols: number;
	x: number;
	y: number;
	width: number;
	height: number;
};

export type NestedMenuGameControl = {
	id: string;
	type: 'menu';
	menuType: 'nested';
	x: number;
	y: number;
	unfold: MenuUnfold;
	navigation: NestedMenuNavigation;
	targetPath: number[];
	columns: { itemCount: number }[];
};

export type MenuGameControl = ChoiceMenuGameControl | NestedMenuGameControl;

export type PanelGameControl = InlineGameControl | ScrollGameControl;
export type GameControl =
	| InlineGameControl
	| OverlayGameControl
	| ScrollGameControl
	| MenuGameControl
	| RecursiveGridGameControl;

export type GamePanel = {
	id: PanelId;
	title: string;
	tokens: GameToken[];
};

export type GameModel = {
	mode: GameMode;
	panels: GamePanel[];
	horizontalTokens: GameToken[];
	menuControls: MenuGameControl[];
	tasks: GameControl[];
};
