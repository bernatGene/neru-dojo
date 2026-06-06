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
	const cssPerScreenX = getScale(viewportCssWidth, screenWidth);
	const visibleScreenHeight = getVisibleScreenHeight(
		screenHeight,
		viewportCssHeight,
		cssPerScreenX,
	);
	const viewportLeft = 0;
	const viewportTop = Math.max(0, screenHeight - visibleScreenHeight);

	return {
		screenWidth,
		screenHeight,
		viewportLeft,
		viewportTop,
		cssPerScreenX,
		cssPerScreenY: getScale(viewportCssHeight, visibleScreenHeight),
		hasReservedArea: viewportLeft > 0 || viewportTop > 0,
	};
}

function getVisibleScreenHeight(
	screenHeight: number,
	viewportCssHeight: number,
	cssPerScreenX: number,
) {
	const height = Math.round(viewportCssHeight / cssPerScreenX);
	if (Number.isFinite(height) && height > 0) {
		return Math.min(screenHeight, height);
	}

	return screenHeight;
}

function getScale(cssSize: number, screenSize: number) {
	if (
		!Number.isFinite(cssSize) ||
		!Number.isFinite(screenSize) ||
		cssSize <= 0 ||
		screenSize <= 0
	) {
		return 1;
	}

	return cssSize / screenSize;
}
