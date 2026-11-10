import type { PageServerLoadEvent } from './$types';
import { getLocale, localeCookie } from '$lib/i18n';
import { getLatestProject } from '$lib/server/cms.js';

export const prerender = false;

/** Profile and social links are inherited from the shared layout. */
export async function load({ cookies }: PageServerLoadEvent) {
	return { latestProject: await getLatestProject(getLocale(cookies.get(localeCookie))) };
}
