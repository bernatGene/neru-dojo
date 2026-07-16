import { error, redirect } from '@sveltejs/kit';
import { isGameMode, modeHref } from '$lib/game/modes';

export const prerender = false;

export const load = ({ params }: { params: { mode: string; seed: string } }) => {
	if (!isGameMode(params.mode)) error(404, 'Invalid game URL');

	redirect(308, modeHref(params.mode, params.seed));
};
