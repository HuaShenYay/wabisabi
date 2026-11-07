import { getLatestProject } from '$lib/server/cms.js';

export const prerender = false;

/** Profile and social links are inherited from the shared layout. */
export async function load() {
	return { latestProject: await getLatestProject() };
}
