import { beforeEach, describe, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({ configured: true, fetch: vi.fn() }));
vi.mock('../src/lib/server/sanity.js', () => ({
	sanityContentScope: 'all',
	get isSanityConfigured() { return state.configured; },
	getSanityClient: () => ({ fetch: state.fetch }),
	sanityImageUrl: () => null
}));
import { getProjects, getLatestProject, getProfile, getArticlePageData, getCategoryPageData, getSiteSettings, getSocialLinks } from '../src/lib/server/cms';

const project = { slug:'fresh-work',title:'新作',category:'文学艺术',year:'2026',index:'01',summary:'新作品简介',aspect:'portrait_4_3' };
beforeEach(() => { state.configured = true; state.fetch.mockReset(); });
describe('CMS source of truth', () => {
	it('uses local seeds only before configuration', async () => {
		state.configured = false;
		expect((await getProjects()).length).toBeGreaterThan(0);
		expect(state.fetch).not.toHaveBeenCalled();
	});
	it('does not resurrect seed projects in an empty published dataset', async () => {
		state.fetch.mockResolvedValue([]);
		expect(await getProjects()).toEqual([]);
	});
	it('selects the most recently published work independently of directory order and later edits', async () => {
		state.fetch.mockResolvedValue([
			{ ...project, slug: 'pinned-old', publishedAt: '2026-01-01T00:00:00Z', _createdAt: '2026-11-07T00:00:00Z' },
			{ ...project, slug: 'newest', publishedAt: '2026-11-06T12:00:00Z' },
			{ ...project, slug: 'earlier', publishedAt: '2026-11-06T08:00:00Z' }
		]);
		expect((await getLatestProject())?.slug).toBe('newest');
	});
	it('uses creation time when publication time is missing or invalid, and year for local works', async () => {
		state.fetch.mockResolvedValue([
			{ ...project, slug: 'year-only' },
			{ ...project, slug: 'created-later', publishedAt: 'invalid', _createdAt: '2026-10-01T00:00:00Z' },
			{ ...project, slug: 'no-date', year: '' }
		]);
		expect((await getLatestProject())?.slug).toBe('created-later');
		state.configured = false;
		expect((await getLatestProject())?.year).toBe('2026');
	});
	it('leaves an empty latest-work slot empty and resolves equal dates consistently', async () => {
		state.fetch.mockResolvedValueOnce([]);
		expect(await getLatestProject()).toBeNull();
		state.fetch.mockResolvedValueOnce([{ ...project, slug: 'b-work' }, { ...project, slug: 'a-work' }]);
		expect((await getLatestProject())?.slug).toBe('a-work');
		state.fetch.mockResolvedValueOnce([{ ...project, slug: 'a-work' }, { ...project, slug: 'b-work' }]);
		expect((await getLatestProject())?.slug).toBe('a-work');
	});
	it('ignores invalid routes/categories and safely normalizes optional fields', async () => {
		state.fetch.mockResolvedValue([project,{...project,slug:'../invalid'},{...project,category:'invalid'},null]);
		expect(await getProjects()).toEqual([expect.objectContaining({slug:'fresh-work',titleEn:'',role:'',cover:'',aspect:'portrait_4_3'})]);
	});
	it('fails honestly on a CMS outage instead of substituting demo content', async () => {
		state.fetch.mockRejectedValue(new Error('network unavailable'));
		const log = vi.spyOn(console,'error').mockImplementation(() => {});
		await expect(getProjects()).rejects.toMatchObject({status:503});
		log.mockRestore();
	});
	it('loads newly published slugs and leaves an unpublished body empty', async () => {
		state.fetch.mockImplementation(async (query: string) => query.includes('{ body,') ? {body:[]} : query.includes('_type == "profile"') ? {name:'新作者'} : [project]);
		const result = await getArticlePageData('fresh-work');
		expect(result?.article.title).toBe('新作');
		expect(result?.article.body).toEqual([]);
		expect(result?.profile.name).toBe('新作者');
		expect(await getArticlePageData('removed-work')).toBeNull();
	});
	it('rejects unknown categories before querying', async () => {
		expect(await getCategoryPageData('unknown')).toBeNull();
		expect(state.fetch).not.toHaveBeenCalled();
	});
	it('retains the published copy on Chinese pages and uses English fields on English pages', async () => {
		const post = {
			...project,
			title: '用 WordPress 写作',
			summary: '记录在 WordPress 上写作的体验。',
			titleEn: 'Writing on WordPress',
			summaryEn: 'Notes on writing with WordPress.'
		};
		const body = [{
			_type: 'block', children: [{ text: '我用 ' }, { text: 'WordPress', marks: ['link'] }, { text: ' 写作。' }],
			markDefs: [{ _key: 'link', _type: 'link', href: 'https://wordpress.org/' }]
		}];
		const bodyEn = [{ _type: 'block', children: [{ text: 'I write on WordPress.' }] }];
		state.fetch.mockImplementation(async (query: string) => {
			if (query.includes('{ body,')) return { body, bodyEn };
			if (query.includes('_type == "profile"')) return {};
			return [post];
		});
		const [zh, en] = await Promise.all([getArticlePageData(post.slug), getArticlePageData(post.slug, 'en')]);
		expect(zh?.article).toMatchObject({
			title: post.title, summary: post.summary, body: [{
				text: '我用 WordPress 写作。',
				content: [{ text: '我用 ' }, { text: 'WordPress', href: 'https://wordpress.org/' }, { text: ' 写作。' }]
			}]
		});
		expect(en?.article).toMatchObject({ title: post.titleEn, summary: post.summaryEn, body: [{ text: 'I write on WordPress.' }] });
	});
	it('loads partial singletons and their SEO settings', async () => {
		state.fetch.mockResolvedValueOnce({name:'作者'}).mockResolvedValueOnce({title:'创作档案',url:'https://example.com/',keywords:['研究']});
		expect((await getProfile()).name).toBe('作者');
		expect(await getSiteSettings()).toMatchObject({title:'创作档案',url:'https://example.com',keywords:['研究']});
	});
	it('does not expose unsafe social URLs', async () => {
		state.fetch.mockResolvedValue([{label:'bad',url:'javascript:alert(1)',platform:'github'},{label:'mail',url:'mailto:hello@example.com',platform:'email'}]);
		expect(await getSocialLinks()).toEqual([{label:'mail',url:'mailto:hello@example.com',platform:'email'}]);
	});
	it('deduplicates concurrent in-flight queries and skips malformed article slugs', async () => {
		state.fetch.mockResolvedValue({ name: '并发作者' });
		const [a, b] = await Promise.all([getProfile(), getProfile()]);
		expect(a.name).toBe('并发作者');
		expect(b.name).toBe('并发作者');
		expect(state.fetch).toHaveBeenCalledTimes(1);

		state.fetch.mockClear();
		expect(await getArticlePageData('../invalid')).toBeNull();
		expect(state.fetch).not.toHaveBeenCalled();
	});
	it('maps sanity photograph to 摄影映像, essay to 知识杂文, and literature to 文学艺术', async () => {
		state.fetch.mockResolvedValue([
			{ _type: 'post', slug: 'photo-one', title: '摄影一', legacyCategories: ['portfolio', 'photograph'] },
			{ _type: 'post', slug: 'essay-one', title: '杂文一', legacyCategories: ['essay'] },
			{ _type: 'post', slug: 'poem-one', title: '诗歌一', legacyCategories: ['portfolio', 'literature'] },
			{ _type: 'project', slug: 'proj-photo', title: '影像项目', category: 'photograph' },
			{ _type: 'project', slug: 'proj-essay', title: '杂文项目', category: '知识杂文' }
		]);
		const projects = await getProjects();
		expect(projects).toEqual([
			expect.objectContaining({ slug: 'photo-one', category: '摄影映像' }),
			expect.objectContaining({ slug: 'essay-one', category: '知识杂文' }),
			expect.objectContaining({ slug: 'poem-one', category: '文学艺术' }),
			expect.objectContaining({ slug: 'proj-photo', category: '摄影映像' }),
			expect.objectContaining({ slug: 'proj-essay', category: '知识杂文' })
		]);
	});
});
