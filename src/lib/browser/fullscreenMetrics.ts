export type FullscreenMetrics = {
	screenHeight: number;
	topInset: number;
	hasReservedTopArea: boolean;
};

export function getFullscreenMetrics(): FullscreenMetrics {
	const screenHeight = Math.round(window.screen.height);
	const viewportHeight = Math.round(window.innerHeight);
	const topInset = Math.max(0, screenHeight - viewportHeight);

	return {
		screenHeight,
		topInset,
		hasReservedTopArea: topInset > 0,
	};
}
