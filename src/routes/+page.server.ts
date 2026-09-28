import { getHomeData } from '$lib/server/cms.js';

export const prerender = false;

export async function load() {
	const data = await getHomeData();
	return data;
}
