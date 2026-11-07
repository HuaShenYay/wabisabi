import { getProfile, getSiteSettings, getSocialLinks } from '$lib/server/cms';
import { getLocale, localeCookie } from '$lib/i18n';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const [profile, settings, socialLinks] = await Promise.all([getProfile(), getSiteSettings(), getSocialLinks()]);
	return { profile, settings, socialLinks, locale: getLocale(cookies.get(localeCookie)) };
};
