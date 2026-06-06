import { error, redirect } from '@sveltejs/kit';
import { isGameMode, modeHref } from '$lib/game/modes';
import { isValidSeed } from '$lib/game/seed';

export const prerender = false;

export const load = ({ params }: { params: { mode: string; seed: string } }) => {
	if (!isGameMode(params.mode) || !isValidSeed(params.seed)) error(404, 'Invalid game URL');

	redirect(308, modeHref(params.mode, params.seed));
};
