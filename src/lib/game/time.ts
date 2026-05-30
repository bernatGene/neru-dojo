export function formatElapsed(milliseconds: number) {
	const totalTenths = Math.floor(milliseconds / 100);
	const tenths = totalTenths % 10;
	const totalSeconds = Math.floor(totalTenths / 10);
	const seconds = totalSeconds % 60;
	const minutes = Math.floor(totalSeconds / 60);

	return `${minutes.toString().padStart(2, '0')}:${seconds
		.toString()
		.padStart(2, '0')}.${tenths}`;
}
