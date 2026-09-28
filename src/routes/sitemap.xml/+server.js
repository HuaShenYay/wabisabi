import { getProjects, getSiteSettings } from '$lib/server/cms.js';
import { categoryMeta } from '$lib/domain/projects.js';

/** @param {string} text */
const escapeXml = text => text.replace(/[<>&"']/g, char => ({'<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;', "'":'&apos;'}[char] ?? char));

export async function GET() {
	const [settings, projects] = await Promise.all([getSiteSettings(), getProjects()]);
	const urls = new Set([
		...settings.pages.map(page => new URL(page.path, settings.url).href),
		...projects.map(project => new URL(`/projects/${categoryMeta[project.category].slug}/${project.slug}`, settings.url).href)
	]);
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...urls].map(url => `<url><loc>${escapeXml(url)}</loc></url>`).join('\n')}
</urlset>`;
	return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=60' } });
}
export const prerender = false;
