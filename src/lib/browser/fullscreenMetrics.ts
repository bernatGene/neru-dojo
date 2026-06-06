export type FullscreenMetrics = {
	screenHeight: number;
	topInset: number;
	hasReservedTopArea: boolean;
};

export function getFullscreenMetrics(): FullscreenMetrics {
	const screenHeight = window.screen.height;
	const viewportHeight = window.innerHeight;
	const topInset = Math.max(0, screenHeight - viewportHeight);

	return {
		screenHeight,
		topInset,
		hasReservedTopArea: document.fullscreenElement !== null && topInset > 0,
	};
}
