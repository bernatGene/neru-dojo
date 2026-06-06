export type FullscreenMetrics = {
	screenWidth: number;
	screenHeight: number;
	leftInset: number;
	topInset: number;
	hasReservedArea: boolean;
};

export function getFullscreenMetrics(): FullscreenMetrics {
	const screenWidth = window.screen.width;
	const screenHeight = window.screen.height;
	const viewportWidth = window.innerWidth;
	const viewportHeight = window.innerHeight;
	const leftInset = Math.max(0, screenWidth - viewportWidth);
	const topInset = Math.max(0, screenHeight - viewportHeight);

	return {
		screenWidth,
		screenHeight,
		leftInset,
		topInset,
		hasReservedArea: document.fullscreenElement !== null && (leftInset > 0 || topInset > 0),
	};
}
