export function getScrollHint(panel: HTMLElement, target: HTMLElement) {
	return getAxisScrollHint(panel, target, 'vertical');
}

export function getHorizontalScrollHint(panel: HTMLElement, target: HTMLElement) {
	return getAxisScrollHint(panel, target, 'horizontal');
}

function getAxisScrollHint(
	panel: HTMLElement,
	target: HTMLElement,
	axis: 'vertical' | 'horizontal',
) {
	const panelRect = panel.getBoundingClientRect();
	const targetRect = target.getBoundingClientRect();
	const vertical = axis === 'vertical';
	const start = vertical ? targetRect.top : targetRect.left;
	const end = vertical ? targetRect.bottom : targetRect.right;
	const panelStart = vertical ? panelRect.top : panelRect.left;
	const panelEnd = vertical ? panelRect.bottom : panelRect.right;

	if (start >= panelStart && end <= panelEnd) return null;

	const targetStart = start - panelStart + (vertical ? panel.scrollTop : panel.scrollLeft);
	const targetSize = vertical ? target.offsetHeight : target.offsetWidth;
	const panelSize = vertical ? panel.clientHeight : panel.clientWidth;
	const scrollSize = vertical ? panel.scrollHeight : panel.scrollWidth;
	const percent = clamp(Math.round(((targetStart + targetSize / 2) / scrollSize) * 100), 0, 100);
	const maxScroll = scrollSize - panelSize;

	if (targetStart + targetSize <= panelSize)
		return `scroll ${vertical ? 'top' : 'left'} ${percent}%`;

	if (targetStart >= maxScroll) return `scroll ${vertical ? 'bottom' : 'right'} ${percent}%`;

	return `scroll ${start < panelStart ? (vertical ? 'up' : 'left') : vertical ? 'down' : 'right'} ${percent}%`;
}

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}
