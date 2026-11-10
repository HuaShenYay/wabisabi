/** Server-only content access. Local seeds are used only before a project is configured. */
import { getSanityClient, isSanityConfigured, sanityImageUrl, sanityContentScope } from './sanity.js';
import { error } from '@sveltejs/kit';
import { siteConfig, type SiteConfig } from '$lib/config/site.js';
import { imageAspectRatio, mapArticleBody, safeLink, type PortableBlock, type ContentImage } from '$lib/domain/content.js';
import type { Locale } from '$lib/i18n';
import { englishArticleBody, publishedTranslation, siteText, textInLanguage, translatePublishedBlocks } from './localized-content.js';
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
	roleEn,
	summary,
	summaryEn,
	"cover": coalesce(cover, mainImage, body[_type == "image"][0]),
	aspect,
	externalUrl,
	publishedAt,
	_createdAt,
	"categoryTitles": categories[]->title,
	"categorySlugs": categories[]->slug.current,
	"legacyCategories": categories[]->title,
	"excerpt": body[_type == "block" && coalesce(style, "normal") == "normal" && count(children[defined(text) && text != ""]) > 0][0].children[].text,
	"excerptEn": bodyEn[_type == "block" && coalesce(style, "normal") == "normal" && count(children[defined(text) && text != ""]) > 0][0].children[].text,
	"order": coalesce(order, 0)
`;

interface SanityProject {
	_type?: 'project' | 'post';
	slug: string;
	index: string;
	title: string;
	titleEn: string;
	year: string;
	category: string;
	role: string;
	roleEn?: string;
	summary: string;
	summaryEn?: string;
	cover: ContentImage | null;
	aspect: Project['aspect'];
	externalUrl?: string;
	order: number;
	publishedAt?: string;
	_createdAt?: string;
	categoryTitles?: string[];
	categorySlugs?: string[];
	legacyCategories?: string[];
	excerpt?: string[];
	excerptEn?: string[];
}

function postCategory(p: SanityProject): ProjectCategory {
	const raw = [
		...(p.categoryTitles ?? []),
		...(p.categorySlugs ?? []),
		...(p.legacyCategories ?? [])
	].map(s => (typeof s === 'string' ? s.trim().toLowerCase() : ''));

	if (raw.some(t => t === 'photograph' || t === 'photography' || t === 'photo' || t === '摄影映像' || t === '摄影' || t === 'aigc影片' || t === 'movie')) {
		return '摄影映像';
	}
	if (raw.some(t => t === 'essay' || t === 'essays' || t === '知识杂文' || t === '随笔' || t === '杂文')) {
		return '知识杂文';
	}
	if (raw.some(t => t === 'literature' || t === '文学艺术' || t === '文学' || t === '诗歌' || t === '散文')) {
		return '文学艺术';
	}
	if (raw.some(t => t === 'websites' || t === 'website' || t === '网站')) {
		return '网站';
	}
	if (raw.some(t => t === 'digital-humanities' || t === '数字人文')) {
		return '数字人文';
	}

	return '文学艺术';
}

function normalizeProjectCategory(category: string | undefined, p: SanityProject): ProjectCategory {
	if (!category) return postCategory(p);
	const lower = category.trim().toLowerCase();
	if (lower === 'photograph' || lower === 'photography' || lower === '摄影映像' || lower === 'aigc影片') return '摄影映像';
	if (lower === 'essay' || lower === 'essays' || lower === '知识杂文' || lower === '随笔') return '知识杂文';
	if (lower === 'literature' || lower === '文学艺术') return '文学艺术';
	if (lower === 'websites' || lower === 'website' || lower === '网站') return '网站';
	if (lower === 'digital-humanities' || lower === '数字人文') return '数字人文';
	if ((categoryOrder as readonly string[]).includes(category)) return category as ProjectCategory;
	return postCategory(p);
}

const isAllowedCategory = (c: unknown): boolean => {
	if (typeof c !== 'string') return false;
	const norm = c.trim().toLowerCase();
	return (categoryOrder as readonly string[]).includes(c) ||
		['photograph', 'photography', 'photo', 'essay', 'essays', 'literature', 'websites', 'website', 'digital-humanities', 'aigc影片'].includes(norm);
};

function mapProject(p: SanityProject, position: number, locale: Locale): Project {
	const ratio = p.cover ? imageAspectRatio(p.cover) : undefined;
	const aspect = ['portrait_4_3', 'landscape_4_3', 'landscape_16_9'].includes(p.aspect) ? p.aspect
		: ratio && ratio < 1 ? 'portrait_4_3' : ratio && ratio < 1.5 ? 'landscape_4_3' : 'landscape_16_9';
	const excerpt = Array.isArray(p.excerpt) ? p.excerpt.filter(text => typeof text === 'string').join('').trim() : '';
	const excerptEn = Array.isArray(p.excerptEn) ? p.excerptEn.filter(text => typeof text === 'string').join('').trim() : '';
	const english = locale === 'en';
	const translation = english ? publishedTranslation(p.slug) : undefined;
	const sourceTitle = p.title.trim();
	const sourceSummary = p.summary || excerpt;
	const curatedTitle = translation?.sourceTitle === sourceTitle ? translation.en.title : undefined;
	const curatedSummary = translation?.sourceSummary === sourceSummary ? translation.en.summary : undefined;
	const title = english ? textInLanguage(p.titleEn, 'en') || curatedTitle || textInLanguage(sourceTitle, 'en') || 'Work' : sourceTitle;
	const authoredSummary = english ? textInLanguage(p.summaryEn, 'en') : p.summary;
	const localizedExcerpt = english ? textInLanguage(excerptEn || sourceSummary, 'en') : excerpt;
	const summary = authoredSummary || curatedSummary || (localizedExcerpt.length > 120 ? `${Array.from(localizedExcerpt).slice(0, 120).join('')}…` : localizedExcerpt);
	return {
		slug: p.slug,
		index: p.index || String(position + 1).padStart(2, '0'),
		title,
		titleEn: p.titleEn ?? '',
		year: p.year || p.publishedAt?.slice(0, 4) || '',
		publishedAt: p.publishedAt,
		createdAt: p._createdAt,
		category: p._type === 'post' ? postCategory(p) : normalizeProjectCategory(p.category, p),
		role: english ? siteText(p.role, 'en', p.roleEn) : p.role ?? '',
		summary,
		cover: sanityImageUrl(p.cover, { w: 1600, h: aspect === 'portrait_4_3' ? 2133 : aspect === 'landscape_4_3' ? 1200 : 900, fit: 'crop' }) ?? '',
		aspect,
		externalUrl: safeLink(p.externalUrl)
	};
}

export async function getProjects(locale: Locale = 'zh'): Promise<Project[]> {
	return withFallback(
		async () => {
			const raw = await getSanityClient().fetch<SanityProject[]>(
				`*[_type in ["project", "post"]] | order(coalesce(order, 0) asc, coalesce(year, publishedAt, _createdAt) desc, _id asc) { ${PROJECT_FIELDS} }`
			);
			const valid = raw.filter(p => p && typeof p.slug === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug) && (p._type === 'post' || isAllowedCategory(p.category)) && typeof p.title === 'string' && p.title.trim());
			// New Project documents take precedence if an old Post has the same URL.
			const projectSlugs = new Set(valid.filter(p => p._type !== 'post').map(p => p.slug));
			return valid.filter(p => p._type !== 'post' || !projectSlugs.has(p.slug)).map((p, i) => mapProject(p, i, locale));
		},
		seedProjects.map(p => ({
			...p,
			title: locale === 'en' ? p.titleEn : p.title,
			summary: locale === 'en' ? p.summaryEn ?? '' : p.summary,
			role: siteText(p.role, locale)
		})),
		`projects:${locale}`,
		'works'
	);
}

/** Recent work follows publication time, independently of the directory's manual order. */
export async function getLatestProject(locale: Locale = 'zh'): Promise<Project | null> {
	const items = await getProjects(locale);
	const timestamp = (item: Project) => {
		for (const value of [item.publishedAt, item.createdAt, /^\d{4}$/.test(item.year) ? `${item.year}-01-01T00:00:00Z` : undefined]) {
			const time = value ? Date.parse(value) : NaN;
			if (Number.isFinite(time)) return time;
		}
		return -Infinity;
	};
	return items.reduce<Project | null>((latest, item) => {
		if (!latest) return item;
		const currentTime = timestamp(item);
		const latestTime = timestamp(latest);
		return currentTime > latestTime || (currentTime === latestTime && item.slug < latest.slug) ? item : latest;
	}, null);
}

/* ============================================================
   Profile
   ============================================================ */

export async function getProfile(locale: Locale = 'zh'): Promise<Profile> {
	const profile = await withFallback<Profile & { bioEn?: string }>(
		async () => {
			const raw = await getSanityClient().fetch<Profile & { bioEn?: string }>(
				`*[_type == "profile" && _id == "profile"][0] {
					name, nameEn, title, role, bio, bioEn, email, location
				}`
			);
			const field = (key: keyof Profile) => typeof raw?.[key] === 'string' ? raw[key] : seedProfile[key];
			return { name: field('name'), nameEn: field('nameEn'), title: field('title'), role: field('role'), bio: field('bio'), bioEn: raw?.bioEn, email: field('email'), location: field('location') };
		},
		seedProfile,
		'profile'
	);
	return {
		...profile,
		name: textInLanguage(profile.name, 'zh') || seedProfile.name,
		nameEn: textInLanguage(profile.nameEn, 'en') || seedProfile.nameEn,
		title: siteText(profile.title, locale, profile.role),
		bio: siteText(profile.bio, locale, profile.bioEn),
		location: siteText(profile.location, locale)
	};
}

type SiteSettingsCopy = SiteConfig & { titleEn?: string; descriptionEn?: string };

export async function getSiteSettings(locale?: Locale): Promise<SiteConfig> {
	const settings = await withFallback<SiteSettingsCopy>(async () => {
		const raw = await getSanityClient().fetch<(Partial<Omit<SiteSettingsCopy, 'ogImage'>> & { ogImage?: ContentImage }) | null>(
			`*[_type == "siteSettings" && _id == "siteSettings"][0] { name, nameEn, title, titleEn, description, descriptionEn, url, locale, language, author, keywords, ogImage, themeColor }`
		);
		if (!raw) return siteConfig;
		const text = (key: 'name'|'nameEn'|'title'|'description'|'locale'|'language'|'author'|'themeColor') => typeof raw[key] === 'string' && raw[key].trim() ? raw[key] : siteConfig[key];
		return {
			...siteConfig, name: text('name'), nameEn: text('nameEn'), title: text('title'), description: text('description'),
			titleEn: raw.titleEn, descriptionEn: raw.descriptionEn,
			locale: text('locale'), language: text('language'), author: text('author'), themeColor: text('themeColor'),
			url: (safeLink(raw.url) ?? siteConfig.url).replace(/\/$/, ''),
			keywords: Array.isArray(raw.keywords) ? raw.keywords.filter(k => typeof k === 'string') : siteConfig.keywords,
			ogImage: sanityImageUrl(raw.ogImage, { w: 1200, h: 630 }) ?? siteConfig.ogImage
		};
	}, siteConfig, 'siteSettings');
	if (!locale) return settings;
	const en = locale === 'en';
	const name = textInLanguage(en ? settings.nameEn : settings.name, locale) || (en ? siteConfig.nameEn : siteConfig.name);
	const title = siteText(settings.title, locale, settings.titleEn)
		|| (en ? `${name} — Digital Humanities & Creative Work` : `${name} · 数字人文与创作`);
	const description = siteText(settings.description, locale, settings.descriptionEn)
		|| (en ? 'A portfolio and journal on digital humanities, literature, images and creative coding.' : '记录数字人文、文学、影像与创意编程的个人博客和作品集。');
	return {
		...settings, name, title, description,
		author: en ? name : textInLanguage(settings.author, locale) || name,
		locale: en ? 'en_GB' : 'zh_CN',
		language: en ? 'en' : 'zh-CN',
		keywords: [...new Set(settings.keywords.map(keyword => textInLanguage(keyword, locale)).filter(Boolean))]
	};
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
	labelEn?: string;
	descEn?: string;
	order: number;
}

export async function getFocusAreas(locale: Locale = 'zh'): Promise<FocusItem[]> {
	const items = await withFallback<(FocusItem & Partial<SanityFocusItem>)[]>(
		async () => {
			const raw = await getSanityClient().fetch<SanityFocusItem[]>(
				`*[_type == "focusArea"] | order(order asc) { label, desc, labelEn, descEn, "order": coalesce(order, 0) }`
			);
			return raw;
		},
		[...seedFocus],
		'focusAreas'
	);
	return items.map(item => ({
		label: siteText(item.label, locale, item.labelEn),
		desc: siteText(item.desc, locale, item.descEn)
	})).filter(item => item.label);
}

interface SanityEducationEntry {
	school: string;
	major: string;
	note: string;
	schoolEn?: string;
	majorEn?: string;
	noteEn?: string;
	order: number;
}

export async function getEducation(locale: Locale = 'zh'): Promise<EducationEntry[]> {
	const items = await withFallback<(EducationEntry & Partial<SanityEducationEntry>)[]>(
		async () => {
			const raw = await getSanityClient().fetch<SanityEducationEntry[]>(
				`*[_type == "education"] | order(order asc) { school, major, note, schoolEn, majorEn, noteEn, "order": coalesce(order, 0) }`
			);
			return raw;
		},
		[...seedEducation],
		'education'
	);
	return items.map(item => ({
		school: siteText(item.school, locale, item.schoolEn),
		major: siteText(item.major, locale, item.majorEn),
		note: siteText(item.note, locale, item.noteEn)
	})).filter(item => item.school);
}

interface SanityPhilosophyItem {
	label: string;
	desc: string;
	labelEn?: string;
	descEn?: string;
	order: number;
}

export async function getPhilosophy(locale: Locale = 'zh'): Promise<PhilosophyItem[]> {
	const items = await withFallback<(PhilosophyItem & Partial<SanityPhilosophyItem>)[]>(
		async () => {
			const raw = await getSanityClient().fetch<SanityPhilosophyItem[]>(
				`*[_type == "philosophy"] | order(order asc) { label, desc, labelEn, descEn, "order": coalesce(order, 0) }`
			);
			return raw;
		},
		[...seedPhilosophy],
		'philosophy'
	);
	return items.map(item => ({
		label: siteText(item.label, locale, item.labelEn),
		desc: siteText(item.desc, locale, item.descEn)
	})).filter(item => item.label);
}

/* ============================================================
   Legacy aggregate loader
   Retained as a compatibility entry point (DESIGN.md §21). After the About
   split, `/` loads the latest work and `/about` uses getAboutData();
   neither page pulls the full aggregate any more.
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
   About Page Loader (DESIGN.md §21)
   ============================================================ */

export interface AboutData {
	focusAreas: FocusItem[];
	education: EducationEntry[];
	philosophy: PhilosophyItem[];
}

/**
 * Only the four-leaf content. `profile` and `socialLinks` are already provided
 * by +layout.server.ts and are merged into the page's `data` by SvelteKit.
 * Kept separate from getHomeData() so the landing page stops loading the whole
 * biography/education payload after the About split.
 */
export async function getAboutData(locale: Locale = 'zh'): Promise<AboutData> {
	const [focusAreas, education, philosophy] = await Promise.all([
		getFocusAreas(locale),
		getEducation(locale),
		getPhilosophy(locale)
	]);
	return { focusAreas, education, philosophy };
}

/* ============================================================
   Projects Page Aggregate Loader
   ============================================================ */

export interface ProjectsPageData {
	profile: Profile;
	projects: Project[];
}

export async function getProjectsPageData(locale: Locale = 'zh'): Promise<ProjectsPageData> {
	const [profile, projects] = await Promise.all([getProfile(locale), getProjects(locale)]);
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
export async function getCategoryPageData(slug: string, locale: Locale = 'zh'): Promise<CategoryPageData | null> {
	const category = categoryFromSlug(slug);
	if (!category) return null;

	const [profile, all] = await Promise.all([getProfile(locale), getProjects(locale)]);
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
export async function getArticlePageData(slug: string, locale: Locale = 'zh'): Promise<ArticlePageData | null> {
	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
	const [all, profile, remoteContent] = await Promise.all([
		getProjects(locale),
		getProfile(locale),
		withFallback<{ body: ArticleBlock[]; showCover: boolean } | null>(
			async () => {
				const raw = await getSanityClient().fetch<{ body?: PortableBlock[]; bodyEn?: PortableBlock[]; showCover?: boolean } | null>(
					`*[_type in ["project", "post"] && slug.current == $slug] | order((_type == "project") desc, _createdAt desc)[0] { body, bodyEn, "showCover": defined(cover) || defined(mainImage) }`,
					{ slug }
				);
				const source = locale === 'en'
					? (raw?.bodyEn?.length ? raw.bodyEn : translatePublishedBlocks(raw?.body, slug))
					: raw?.body;
				const body = mapArticleBody(source, image => sanityImageUrl(image, { w: 1600 }));
				return { body: locale === 'en' ? englishArticleBody(body) : body, showCover: raw?.showCover === true };
			},
			null,
			`article:${locale}:${slug}`,
			'works'
		)
	]);
	const idx = all.findIndex((p) => p.slug === slug);
	if (idx === -1) return null;
	const project = all[idx];
	const content = remoteContent ?? { body: seedArticleBody(project, locale), showCover: Boolean(project.cover) };

	return {
		profile,
		article: { ...project, ...content },
		categoryMeta: categoryMeta[project.category],
		prevWork: workLink(all[idx - 1]),
		nextWork: workLink(all[idx + 1])
	};
}
