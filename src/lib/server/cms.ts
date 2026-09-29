/** Server-only content access. Local seeds are used only before a project is configured. */
import { getSanityClient, isSanityConfigured, sanityImageUrl, sanityContentScope } from './sanity.js';
import { error } from '@sveltejs/kit';
import { siteConfig, type SiteConfig } from '$lib/config/site.js';
import { imageAspectRatio, mapArticleBody, safeLink, type PortableBlock, type ContentImage } from '$lib/domain/content.js';
import {
	projects as seedProjects,
	categoryOrder,
	categoryMeta,
	categoryFromSlug,
	seedArticleBody,
	type Project,
	type ProjectCategory,
	type CategoryMeta,
	type ArticleBlock,
	type ProjectArticle
} from '$lib/domain/projects.js';
import { profile as seedProfile, type Profile } from '$lib/domain/profile.js';
import { socialLinks as seedSocial, type SocialLink, type SocialPlatform } from '$lib/domain/social.js';
import {
	focusAreas as seedFocus,
	education as seedEducation,
	designPhilosophy as seedPhilosophy,
	type FocusItem,
	type EducationEntry,
	type PhilosophyItem
} from '$lib/domain/portfolio.js';

const inflight = new Map<string, Promise<unknown>>();

/** Never silently republish demo content when a configured CMS is unavailable. */
async function withFallback<T>(query: () => Promise<T>, fallback: T, label: string, scope: 'site' | 'works' = 'site'): Promise<T> {
	// An existing Post-only Studio does not own the site's biography or education yet.
	if (!isSanityConfigured || (scope === 'site' && sanityContentScope === 'posts')) return fallback;
	const existing = inflight.get(label) as Promise<T> | undefined;
	if (existing) return existing;
	const pending = (async () => {
		try {
			return await query();
		} catch (err) {
			console.error(`[cms] Unable to read published ${label}`);
			error(503, '内容暂时无法读取，请稍后重试。');
		} finally {
			inflight.delete(label);
		}
	})();
	inflight.set(label, pending);
	return pending;
}

/* ============================================================
   Projects
   ============================================================ */

const PROJECT_FIELDS = `
	_type,
	"slug": slug.current,
	index,
	title,
	titleEn,
	year,
	category,
	role,
	summary,
	"cover": coalesce(cover, mainImage, body[_type == "image"][0]),
	aspect,
	externalUrl,
	publishedAt,
	"legacyCategories": categories[]->title,
	"excerpt": body[_type == "block" && style == "normal"][0].children[].text,
	"order": coalesce(order, 0)
`;

interface SanityProject {
	_type?: 'project' | 'post';
	slug: string;
	index: string;
	title: string;
	titleEn: string;
	year: string;
	category: ProjectCategory;
	role: string;
	summary: string;
	cover: ContentImage | null;
	aspect: Project['aspect'];
	externalUrl?: string;
	order: number;
	publishedAt?: string;
	legacyCategories?: string[];
	excerpt?: string[];
}

function postCategory(p: SanityProject): ProjectCategory {
	const tags = p.legacyCategories ?? [];
	// Existing literature, photograph, essay and portfolio posts share the art volume.
	return categoryOrder.find(category => tags.includes(category) || tags.includes(categoryMeta[category].slug)) ?? '文学艺术';
}

function mapProject(p: SanityProject, position: number): Project {
	const ratio = p.cover ? imageAspectRatio(p.cover) : undefined;
	const aspect = ['portrait_4_3', 'landscape_4_3', 'landscape_16_9'].includes(p.aspect) ? p.aspect
		: ratio && ratio < 1 ? 'portrait_4_3' : ratio && ratio < 1.5 ? 'landscape_4_3' : 'landscape_16_9';
	const excerpt = Array.isArray(p.excerpt) ? p.excerpt.filter(text => typeof text === 'string').join('').trim() : '';
	return {
		slug: p.slug,
		index: p.index || String(position + 1).padStart(2, '0'),
		title: p.title.trim(),
		titleEn: p.titleEn ?? '',
		year: p.year || p.publishedAt?.slice(0, 4) || '',
		category: p._type === 'post' ? postCategory(p) : p.category,
		role: p.role ?? '',
		summary: p.summary || (excerpt.length > 120 ? `${Array.from(excerpt).slice(0, 120).join('')}…` : excerpt),
		cover: sanityImageUrl(p.cover, { w: 1600, h: aspect === 'portrait_4_3' ? 2133 : aspect === 'landscape_4_3' ? 1200 : 900, fit: 'crop' }) ?? '',
		aspect,
		externalUrl: safeLink(p.externalUrl)
	};
}

export async function getProjects(): Promise<Project[]> {
	return withFallback(
		async () => {
			const raw = await getSanityClient().fetch<SanityProject[]>(
				`*[_type in ["project", "post"]] | order(coalesce(order, 0) asc, coalesce(year, publishedAt, _createdAt) desc, _id asc) { ${PROJECT_FIELDS} }`
			);
			const valid = raw.filter(p => p && typeof p.slug === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug) && (p._type === 'post' || categoryOrder.includes(p.category)) && typeof p.title === 'string' && p.title.trim());
			// New Project documents take precedence if an old Post has the same URL.
			const projectSlugs = new Set(valid.filter(p => p._type !== 'post').map(p => p.slug));
			return valid.filter(p => p._type !== 'post' || !projectSlugs.has(p.slug)).map(mapProject);
		},
		[...seedProjects],
		'projects',
		'works'
	);
}

/* ============================================================
   Profile
   ============================================================ */

export async function getProfile(): Promise<Profile> {
	return withFallback(
		async () => {
			const raw = await getSanityClient().fetch<Profile>(
				`*[_type == "profile" && _id == "profile"][0] {
					name, nameEn, title, role, bio, email, location
				}`
			);
			const field = (key: keyof Profile) => typeof raw?.[key] === 'string' ? raw[key] : seedProfile[key];
			return { name: field('name'), nameEn: field('nameEn'), title: field('title'), role: field('role'), bio: field('bio'), email: field('email'), location: field('location') };
		},
		seedProfile,
		'profile'
	);
}

export async function getSiteSettings(): Promise<SiteConfig> {
	return withFallback(async () => {
		const raw = await getSanityClient().fetch<(Partial<Omit<SiteConfig, 'ogImage'>> & { ogImage?: ContentImage }) | null>(
			`*[_type == "siteSettings" && _id == "siteSettings"][0] { name, nameEn, title, description, url, locale, language, author, keywords, ogImage, themeColor }`
		);
		if (!raw) return siteConfig;
		const text = (key: 'name'|'nameEn'|'title'|'description'|'locale'|'language'|'author'|'themeColor') => typeof raw[key] === 'string' && raw[key].trim() ? raw[key] : siteConfig[key];
		return {
			...siteConfig, name: text('name'), nameEn: text('nameEn'), title: text('title'), description: text('description'),
			locale: text('locale'), language: text('language'), author: text('author'), themeColor: text('themeColor'),
			url: (safeLink(raw.url) ?? siteConfig.url).replace(/\/$/, ''),
			keywords: Array.isArray(raw.keywords) ? raw.keywords.filter(k => typeof k === 'string') : siteConfig.keywords,
			ogImage: sanityImageUrl(raw.ogImage, { w: 1200, h: 630 }) ?? siteConfig.ogImage
		};
	}, siteConfig, 'siteSettings');
}

/* ============================================================
   Social Links
   ============================================================ */

interface SanitySocialLink {
	label: string;
	url: string;
	platform: SocialPlatform;
	order: number;
}

export async function getSocialLinks(): Promise<SocialLink[]> {
	return withFallback(
		async () => {
			const raw = await getSanityClient().fetch<SanitySocialLink[]>(
				`*[_type == "socialLink"] | order(order asc) { label, url, platform, "order": coalesce(order, 0) }`
			);
			return raw.filter(s => s && safeLink(s.url, true)).map((s) => ({
				label: s.label,
				url: safeLink(s.url, true)!,
				platform: s.platform
			}));
		},
		[...seedSocial],
		'socialLinks'
	);
}

/* ============================================================
   Focus Areas, Education, Philosophy
   ============================================================ */

interface SanityFocusItem {
	label: string;
	desc: string;
	order: number;
}

export async function getFocusAreas(): Promise<FocusItem[]> {
	return withFallback(
		async () => {
			const raw = await getSanityClient().fetch<SanityFocusItem[]>(
				`*[_type == "focusArea"] | order(order asc) { label, desc, "order": coalesce(order, 0) }`
			);
			return raw.map((f) => ({ label: f.label, desc: f.desc }));
		},
		[...seedFocus],
		'focusAreas'
	);
}

interface SanityEducationEntry {
	school: string;
	major: string;
	note: string;
	order: number;
}

export async function getEducation(): Promise<EducationEntry[]> {
	return withFallback(
		async () => {
			const raw = await getSanityClient().fetch<SanityEducationEntry[]>(
				`*[_type == "education"] | order(order asc) { school, major, note, "order": coalesce(order, 0) }`
			);
			return raw.map((e) => ({
				school: e.school,
				major: e.major,
				note: e.note ?? ''
			}));
		},
		[...seedEducation],
		'education'
	);
}

interface SanityPhilosophyItem {
	label: string;
	desc: string;
	order: number;
}

export async function getPhilosophy(): Promise<PhilosophyItem[]> {
	return withFallback(
		async () => {
			const raw = await getSanityClient().fetch<SanityPhilosophyItem[]>(
				`*[_type == "philosophy"] | order(order asc) { label, desc, "order": coalesce(order, 0) }`
			);
			return raw.map((p) => ({ label: p.label, desc: p.desc }));
		},
		[...seedPhilosophy],
		'philosophy'
	);
}

/* ============================================================
   Aggregate Loader (for home page)
   ============================================================ */

export interface HomeData {
	profile: Profile;
	socialLinks: SocialLink[];
	focusAreas: FocusItem[];
	education: EducationEntry[];
	philosophy: PhilosophyItem[];
}

export async function getHomeData(): Promise<HomeData> {
	const [profile, socialLinks, focusAreas, education, philosophy] = await Promise.all([
		getProfile(),
		getSocialLinks(),
		getFocusAreas(),
		getEducation(),
		getPhilosophy()
	]);

	return { profile, socialLinks, focusAreas, education, philosophy };
}

/* ============================================================
   Projects Page Aggregate Loader
   ============================================================ */

export interface ProjectsPageData {
	profile: Profile;
	projects: Project[];
}

export async function getProjectsPageData(): Promise<ProjectsPageData> {
	const [profile, projects] = await Promise.all([getProfile(), getProjects()]);
	return { profile, projects };
}

/* ============================================================
   Category Page Aggregate Loader
   ============================================================ */

export interface CategoryLink {
	slug: string;
	numeral: string;
	title: ProjectCategory;
	en: string;
}

export interface CategoryPageData {
	profile: Profile;
	category: ProjectCategory;
	meta: CategoryMeta;
	items: Project[];
	prev: CategoryLink | null;
	next: CategoryLink | null;
}

function categoryLinkAt(idx: number): CategoryLink | null {
	const c = categoryOrder[idx];
	if (!c) return null;
	const m = categoryMeta[c];
	return { slug: m.slug, numeral: m.numeral, title: c, en: m.en };
}

/**
 * Load everything the /projects/[category] page needs.
 * Returns null when the slug does not name a category (page 404s).
 */
export async function getCategoryPageData(slug: string): Promise<CategoryPageData | null> {
	const category = categoryFromSlug(slug);
	if (!category) return null;

	const [profile, all] = await Promise.all([getProfile(), getProjects()]);
	const idx = categoryOrder.indexOf(category);

	return {
		profile,
		category,
		meta: categoryMeta[category],
		items: all.filter((p) => p.category === category),
		prev: categoryLinkAt(idx - 1),
		next: categoryLinkAt(idx + 1)
	};
}

/* ============================================================
   Article Page Aggregate Loader
   ============================================================ */

export interface WorkLink {
	slug: string;
	title: string;
	categorySlug: string;
}

export interface ArticlePageData {
	profile: Profile;
	article: ProjectArticle;
	categoryMeta: CategoryMeta;
	prevWork: WorkLink | null;
	nextWork: WorkLink | null;
}

function workLink(p: Project | undefined): WorkLink | null {
	if (!p) return null;
	return { slug: p.slug, title: p.title, categorySlug: categoryMeta[p.category].slug };
}

/**
 * Load everything the /projects/[category]/[slug] article page needs.
 * Body comes from Sanity Portable Text once configured; until then
 * local demo mode uses seed text. Published empty bodies stay empty.
 * Returns null when the slug does not match a project.
 */
export async function getArticlePageData(slug: string): Promise<ArticlePageData | null> {
	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
	const [all, profile, remoteContent] = await Promise.all([
		getProjects(),
		getProfile(),
		withFallback<{ body: ArticleBlock[]; showCover: boolean } | null>(
			async () => {
				const raw = await getSanityClient().fetch<{ body?: PortableBlock[]; showCover?: boolean } | null>(
					`*[_type in ["project", "post"] && slug.current == $slug] | order((_type == "project") desc, _createdAt desc)[0] { body, "showCover": defined(cover) || defined(mainImage) }`,
					{ slug }
				);
				return { body: mapArticleBody(raw?.body, image => sanityImageUrl(image, { w: 1600 })), showCover: raw?.showCover === true };
			},
			null,
			`article:${slug}`,
			'works'
		)
	]);
	const idx = all.findIndex((p) => p.slug === slug);
	if (idx === -1) return null;
	const project = all[idx];
	const content = remoteContent ?? { body: seedArticleBody(project), showCover: Boolean(project.cover) };

	return {
		profile,
		article: { ...project, ...content },
		categoryMeta: categoryMeta[project.category],
		prevWork: workLink(all[idx - 1]),
		nextWork: workLink(all[idx + 1])
	};
}
