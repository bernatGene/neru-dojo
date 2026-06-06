export type FullscreenMetrics = {
	screenWidth: number;
	screenHeight: number;
	viewportLeft: number;
	viewportTop: number;
	cssPerScreenX: number;
	cssPerScreenY: number;
	hasReservedArea: boolean;
};

export function getFullscreenMetrics(): FullscreenMetrics {
	const screenWidth = Math.round(window.screen.width);
	const screenHeight = Math.round(window.screen.height);
	const viewportCssWidth = window.visualViewport?.width ?? window.innerWidth;
	const viewportCssHeight = window.visualViewport?.height ?? window.innerHeight;
	const visibleScreenWidth = getVisibleScreenSize(screenWidth, viewportCssWidth, [
		window.screen.availWidth,
		window.outerWidth,
	]);
	const visibleScreenHeight = getVisibleScreenSize(screenHeight, viewportCssHeight, [
		window.screen.availHeight,
		window.outerHeight,
	]);
	const viewportLeft = Math.max(0, screenWidth - visibleScreenWidth);
	const viewportTop = Math.max(0, screenHeight - visibleScreenHeight);

	return {
		screenWidth,
		screenHeight,
		viewportLeft,
		viewportTop,
		cssPerScreenX: getScale(viewportCssWidth, visibleScreenWidth),
		cssPerScreenY: getScale(viewportCssHeight, visibleScreenHeight),
		hasReservedArea: viewportLeft > 0 || viewportTop > 0,
	};
}

function getVisibleScreenSize(screenSize: number, viewportCssSize: number, candidates: number[]) {
	for (const candidate of candidates) {
		const size = Math.round(candidate);
		if (Number.isFinite(size) && size > 0 && size < screenSize) return size;
	}

	if (
		Number.isFinite(viewportCssSize) &&
		viewportCssSize > 0 &&
		viewportCssSize < screenSize
	) {
		return Math.round(viewportCssSize);
	}

	return screenSize;
}

function getScale(cssSize: number, screenSize: number) {
	if (!Number.isFinite(cssSize) || !Number.isFinite(screenSize) || cssSize <= 0 || screenSize <= 0) {
		return 1;
	}

	return cssSize / screenSize;
}
