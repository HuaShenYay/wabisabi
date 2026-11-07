import { getAboutData } from '$lib/server/cms.js';

export const prerender = false;

export async function load() {
	return await getAboutData();
}
