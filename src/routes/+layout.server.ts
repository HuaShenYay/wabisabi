import { getProfile, getSiteSettings, getSocialLinks } from '$lib/server/cms';

export async function load() {
	const [profile, settings, socialLinks] = await Promise.all([getProfile(), getSiteSettings(), getSocialLinks()]);
	return { profile, settings, socialLinks };
}
