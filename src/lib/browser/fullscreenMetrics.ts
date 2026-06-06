export type FullscreenMetrics = {
	screenHeight: number;
	topInset: number;
	hasReservedTopArea: boolean;
};

export function getFullscreenMetrics(): FullscreenMetrics {
	const screenHeight = window.screen.height;
	const topInset = Math.max(0, screenHeight - window.innerHeight);

	return {
		screenHeight,
		topInset,
		hasReservedTopArea: document.fullscreenElement !== null && topInset > 0,
	};
}
