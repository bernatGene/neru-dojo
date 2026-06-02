export function getScrollHint(panel: HTMLElement, target: HTMLElement) {
	const panelRect = panel.getBoundingClientRect();
	const targetRect = target.getBoundingClientRect();
	const visible = targetRect.top >= panelRect.top && targetRect.bottom <= panelRect.bottom;

	if (visible) {
		return null;
	}

	const targetTop = targetRect.top - panelRect.top + panel.scrollTop;
	const targetMiddle = targetTop + target.offsetHeight / 2;
	const percent = clamp(Math.round((targetMiddle / panel.scrollHeight) * 100), 0, 100);
	const maxScroll = panel.scrollHeight - panel.clientHeight;

	if (targetTop + target.offsetHeight <= panel.clientHeight) {
		return `scroll top ${percent}%`;
	}

	if (targetTop >= maxScroll) {
		return `scroll bottom ${percent}%`;
	}

	return targetRect.top < panelRect.top ? `scroll up ${percent}%` : `scroll down ${percent}%`;
}

export function getHorizontalScrollHint(panel: HTMLElement, target: HTMLElement) {
	const panelRect = panel.getBoundingClientRect();
	const targetRect = target.getBoundingClientRect();
	const visible = targetRect.left >= panelRect.left && targetRect.right <= panelRect.right;

	if (visible) {
		return null;
	}

	const targetLeft = targetRect.left - panelRect.left + panel.scrollLeft;
	const targetMiddle = targetLeft + target.offsetWidth / 2;
	const percent = clamp(Math.round((targetMiddle / panel.scrollWidth) * 100), 0, 100);
	const maxScroll = panel.scrollWidth - panel.clientWidth;

	if (targetLeft + target.offsetWidth <= panel.clientWidth) {
		return `scroll left ${percent}%`;
	}

	if (targetLeft >= maxScroll) {
		return `scroll right ${percent}%`;
	}

	return targetRect.left < panelRect.left ? `scroll left ${percent}%` : `scroll right ${percent}%`;
}

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}
