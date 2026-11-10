import type { Locale } from '$lib/i18n';
import type { PortableBlock } from '$lib/domain/content';
import type { ArticleBlock } from '$lib/domain/projects';
import publishedTranslations from './published-translations.json';

const otherScript = { zh: /\p{Script=Latin}/u, en: /\p{Script=Han}/u };

export function textInLanguage(value: unknown, locale: Locale): string {
	return typeof value === 'string' && !otherScript[locale].test(value) ? value.trim() : '';
}

type BlockTranslation = {
	source: string;
	translation: string | string[] | { text: string; href: string };
};
type WorkCopy = { title: string; summary: string; blocks: Record<string, BlockTranslation> };
type WorkTranslation = { sourceTitle: string; sourceSummary: string; en: WorkCopy };
const translations: Record<string, WorkTranslation | undefined> = publishedTranslations;

export function publishedTranslation(slug: string) {
	return Object.hasOwn(translations, slug) ? translations[slug] : undefined;
}

/** Match the published text as well as the block key so edits cannot display stale translations. */
export function translatePublishedBlocks(body: PortableBlock[] | undefined, slug: string) {
	const copy = publishedTranslation(slug)?.en;
	if (!Array.isArray(body) || !copy) return body;
	return body.map(block => {
		const entry = block?._key && copy.blocks[block._key];
		const children = block?.children;
		if (!entry || !children || children.map(child => child.text ?? '').join('') !== entry.source) return block;
		const { translation } = entry;
		if (Array.isArray(translation)) {
			if (translation.length !== children.length) return block;
			return { ...block, children: children.map((child, i) => ({ ...child, text: translation[i] })) };
		}
		if (typeof translation === 'string') {
			return { ...block, children: [{ ...children[0], text: translation }] };
		}
		const link = 'translated-source-link';
		return {
			...block,
			markDefs: [{ _key: link, _type: 'link', href: translation.href }],
			children: [{ text: translation.text, marks: [link] }]
		};
	});
}

export function englishArticleBody(body: ArticleBlock[]): ArticleBlock[] {
	const fits = (text: string) => !otherScript.en.test(text);
	if (!body.every(block => {
		if (block.type === 'image') return true;
		if (block.type === 'list') return block.items.every(item => fits(item.text));
		return fits(block.text);
	})) return [];
	return body.map(block => {
		if (block.type === 'image') return { ...block, alt: textInLanguage(block.alt, 'en'), caption: textInLanguage(block.caption, 'en') };
		if (block.type === 'quote') return { ...block, cite: textInLanguage(block.cite, 'en') };
		return block;
	});
}

const siteCopy = new Map<string, { zh: string; en: string }>([
	['宋子杰来自上海，中专生，计算机背景，目前的研究方向有：数字人文、AIGC、人文研究与创作技术的结合。', {
		zh: '宋子杰来自上海，是一名有计算机背景的中专生。目前关注数字人文、人工智能生成内容，以及人文研究与创作技术的结合。',
		en: 'Song Zijie is a vocational school student from Shanghai with a background in computing. His interests include digital humanities, generative AI, and the ways creative tools can inform research in the humanities.'
	}],
	['AIGC艺术创作', { zh: '生成式艺术创作', en: 'Generative Art' }],
	['研究具有美学质感的生成式图像、影像', { zh: '探索生成式图像与影像的审美和质感', en: 'Exploring the visual qualities of generative images and moving images.' }],
	['数字人文', { zh: '数字人文', en: 'Digital Humanities' }],
	['计算机技术与人文学研究的结合', { zh: '计算机技术与人文学研究的结合', en: 'Using computational methods to explore questions in the humanities.' }],
	['精神分析', { zh: '精神分析', en: 'Psychoanalysis' }],
	['关注人的无意识，创伤，爱欲等', { zh: '关注人的无意识、创伤与爱欲', en: 'An interest in the unconscious, trauma and desire.' }],
	['上海杉达学院', { zh: '上海杉达学院', en: 'Sanda University, Shanghai' }],
	['软件工程（本科）', { zh: '软件工程（本科）', en: 'Software Engineering, Undergraduate Studies' }],
	['上海电子信息职业技术学院', { zh: '上海电子信息职业技术学院', en: 'Shanghai Technical Institute of Electronics and Information' }],
	['信息安全（专科）', { zh: '信息安全（专科）', en: 'Information Security, Vocational Diploma' }],
	['Neo-Wabi-Sabi', { zh: '新侘寂', en: 'Neo-wabi-sabi' }],
	['在数字介质中寻找残缺与不完美的诗意 - 拒绝对称的秩序让每次会话都有独特偏移，深邃幽暗的意境在模糊与揭示之间缓缓浮现，高粘滞的流动如墨晕开归于宁静', {
		zh: '在数字介质中寻找残缺与不完美的诗意。打破对称，让每次浏览都有细微的偏移。深幽的意境在模糊与显现之间浮现，流动如墨晕开，最终归于宁静。',
		en: 'Finding poetry in imperfection and incompleteness in digital media. Asymmetry lets each visit unfold a little differently. Forms emerge slowly from obscurity, and movement settles into stillness like ink spreading on paper.'
	}],
	['上海', { zh: '上海', en: 'Shanghai' }],
	['宋子杰来自上海，软件工程背景，专注数字人文、AIGC、文学研究与创作技术的结合。探索诗歌分析、影视研究、AI 创作与生成式视觉，寻找技术参与人文表达的新型路径。', {
		zh: '宋子杰的作品集，记录数字人文、文学与影视研究，以及人工智能与生成式视觉创作。',
		en: 'A portfolio by Song Zijie spanning digital humanities, literary and film studies, and creative work with generative AI.'
	}],
	['宋子杰来自上海，软件工程背景，长期关注数字人文、AIGC、文学研究与创作技术的结合。他的工作围绕"技术如何参与人文表达"展开，横跨诗歌分析、影视研究、AI 创作与生成式视觉。', {
		zh: '宋子杰来自上海，有软件工程背景，长期关注数字人文、文学研究与创作技术的结合。他探索技术如何参与人文表达，涉及诗歌分析、影视研究与生成式视觉创作。',
		en: 'Song Zijie is a Shanghai-based creative technologist with a background in software engineering. He explores how technology can inform humanistic expression through poetry analysis, film studies and generative visual work.'
	}],
	['AIGC Visual Director', { zh: '生成式视觉导演', en: 'Generative Art Director' }],
	['Essayist', { zh: '随笔作者', en: 'Essayist' }],
	['Creative Technologist', { zh: '创意技术创作者', en: 'Creative Technologist' }],
	['AIGC Creator', { zh: '生成式艺术创作者', en: 'Generative Artist' }],
	['Writer', { zh: '作者', en: 'Writer' }],
	['Designer & Developer', { zh: '设计与开发', en: 'Designer and Developer' }],
	['Researcher', { zh: '研究者', en: 'Researcher' }]
]);

export function siteText(value: unknown, locale: Locale, english?: string): string {
	return (locale === 'en' ? textInLanguage(english, locale) : '')
		|| (typeof value === 'string' ? siteCopy.get(value)?.[locale] : '')
		|| textInLanguage(value, locale);
}
