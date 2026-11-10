import type { PageServerLoadEvent } from './$types';
import { getLocale, localeCookie } from '$lib/i18n';
import { getProjectsPageData } from '$lib/server/cms.js';

// Published CMS updates are read on the server, without rebuilding the site.
export const prerender = false;

export async function load({ cookies }: PageServerLoadEvent) {
	const data = await getProjectsPageData(getLocale(cookies.get(localeCookie)));
	return data;
}
