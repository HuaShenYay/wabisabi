import { getProjectsPageData } from '$lib/server/cms.js';

// Published CMS updates are read on the server, without rebuilding the site.
export const prerender = false;

export async function load() {
	const data = await getProjectsPageData();
	return data;
}
