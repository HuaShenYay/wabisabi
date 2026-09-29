import { beforeEach, describe, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({ configured: true, fetch: vi.fn() }));
vi.mock('../src/lib/server/sanity.js', () => ({
	sanityContentScope: 'all',
	get isSanityConfigured() { return state.configured; },
	getSanityClient: () => ({ fetch: state.fetch }),
	sanityImageUrl: () => null
}));
import { getProjects, getProfile, getArticlePageData, getCategoryPageData, getSiteSettings, getSocialLinks } from '../src/lib/server/cms';

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
});
