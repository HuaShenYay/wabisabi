import type { PageServerLoadEvent } from './$types';
import { getLocale, localeCookie } from '$lib/i18n';
import { getAboutData } from '$lib/server/cms.js';

export const prerender = false;

export async function load({ cookies }: PageServerLoadEvent) {
	return await getAboutData(getLocale(cookies.get(localeCookie)));
}
