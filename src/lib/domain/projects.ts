/**
 * Domain Entity: Project
 *
 * Represents a single creative / research work in the portfolio,
 * grouped by one of four categories.
 */

export type ProjectCategory = '文学艺术' | '摄影映像' | '知识杂文' | '网站' | '数字人文';

export interface Project {
	readonly slug: string;
	readonly index: string;
	readonly title: string;
	readonly titleEn: string;
	readonly year: string;
	readonly publishedAt?: string;
	readonly createdAt?: string;
	readonly category: ProjectCategory;
	readonly role: string;
	readonly summary: string;
	readonly summaryEn?: string;
	readonly cover: string;
	readonly aspect: 'landscape_16_9' | 'landscape_4_3' | 'portrait_4_3';
	readonly externalUrl?: string;
}

/**
 * The five categories in fixed display order.
 * Used by the page to iterate sections in a stable sequence.
 */
export const categoryOrder: readonly ProjectCategory[] = [
	'文学艺术',
	'摄影映像',
	'知识杂文',
	'网站',
	'数字人文'
] as const;

export const projects: readonly Project[] = [
	// ===== 文学艺术 =====
	{
		slug: 'night-rain-anthology',
		index: '01',
		title: '夜雨诗集',
		titleEn: 'Night Rain Anthology',
		year: '2025',
		category: '文学艺术',
		role: 'AIGC Visual Director',
		summary:
			'以扩散模型重写唐宋诗境，把「夜雨剪春韭」的意象拆解为可调度的视觉参数，雨声、灯影、墨痕在潜空间中相互渗透。',
		summaryEn: 'Diffusion models reimagine scenes from Tang and Song poetry. The image of cutting spring chives on a rainy night becomes a set of visual parameters, bringing rain, lamplight and ink together in latent space.',
		cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cinematic%20moody%20scene%20of%20a%20rainy%20night%20in%20an%20ancient%20chinese%20courtyard%2C%20warm%20paper%20tones%2C%20desaturated%20clay%20and%20ink%20palette%2C%20soft%20lamplight%20through%20paper%20window%2C%20misty%2C%20wabisabi%20aesthetic%2C%20film%20grain&image_size=landscape_16_9',
		aspect: 'landscape_16_9'
	},
	{
		slug: 'subconscious-lens',
		index: '02',
		title: '镜头的潜意识',
		titleEn: 'Subconscious of the Lens',
		year: '2023',
		category: '文学艺术',
		role: 'Essayist',
		summary:
			'一组关于电影镜头与精神分析的札记，把希区柯克的推镜、塔可夫斯基的凝视读作无意识的投影装置。',
		summaryEn: 'Notes on film and psychoanalysis, reading Hitchcock’s tracking shots and Tarkovsky’s gaze as ways of projecting the unconscious.',
		cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cinematic%20film%20still%2C%20single%20figure%20in%20a%20dark%20room%2C%20warm%20light%20leak%2C%20desaturated%20clay%20tones%2C%20paper%20texture%2C%20wabisabi%2C%20hitchcock%20mood&image_size=portrait_4_3',
		aspect: 'portrait_4_3'
	},

	// ===== 摄影映像 =====
	{
		slug: 'mirror-stage',
		index: '03',
		title: '镜像阶段',
		titleEn: 'Mirror Stage',
		year: '2024',
		category: '摄影映像',
		role: 'Creative Technologist',
		summary:
			'以浏览器三维绘图重述拉康的「镜像阶段」。观者的轮廓在水面上缓慢成形又溶解，构成一段关于自我认同的交互叙事。',
		summaryEn: 'An interactive interpretation of Lacan’s mirror stage in Three.js. The viewer’s silhouette slowly forms and dissolves in water, asking how we come to recognise ourselves.',
		cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=still%20water%20surface%20reflecting%20a%20fragmented%20silhouette%2C%20warm%20paper%20background%2C%20clay%20and%20ink%20tones%2C%20subtle%20mist%2C%20minimalist%2C%20cinematic%20depth%2C%20wabisabi&image_size=landscape_16_9',
		aspect: 'landscape_16_9'
	},
	{
		slug: 'rubbing-diffusion',
		index: '04',
		title: '碑拓生成器',
		titleEn: 'Rubbing Diffusion',
		year: '2023',
		category: '摄影映像',
		role: 'AIGC Creator',
		summary:
			'训练一个仅生成拓片质感的小型扩散模型，让石头风化的肌理成为可书写的笔触，模糊了「拓」与「作」之间的界限。',
		summaryEn: 'A small diffusion model trained to generate the texture of stone rubbings. Weathered stone becomes a stroke you can write with, blurring the line between taking an impression and making one.',
		cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=close-up%20of%20a%20chinese%20stone%20rubbing%20on%20aged%20paper%2C%20ink%20texture%2C%20warm%20paper%20background%2C%20desaturated%2C%20wabisabi%2C%20film%20grain%2C%20museum%20lighting&image_size=landscape_16_9',
		aspect: 'landscape_16_9'
	},

	// ===== 知识杂文 =====
	{
		slug: 'reading-typography-notes',
		index: '05',
		title: '阅读字体与心得',
		titleEn: 'Notes on Typography & Reading',
		year: '2026',
		category: '知识杂文',
		role: 'Writer',
		summary:
			'关于长时间屏幕阅读体验的字体排印札记，探讨衬线曲度、行气呼吸与灰度平衡对阅读心流的幽微影响。',
		summaryEn: 'Notes on reading from screens for long stretches, and on how serifs, spacing and the overall colour of a page shape the rhythm of reading.',
		cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20typography%20book%2C%20open%20pages%20with%20elegant%20chinese%20typesetting%2C%20warm%20ambient%20light%2C%20minimalist%2C%20wabisabi%20paper%20texture&image_size=landscape_16_9',
		aspect: 'landscape_16_9'
	},

	// ===== 网站 =====
	{
		slug: 'wabisabi-site',
		index: '06',
		title: '侘寂个人站',
		titleEn: 'Wabi-Sabi Portfolio',
		year: '2025',
		category: '网站',
		role: 'Designer & Developer',
		summary:
			'本站以网页框架与浏览器三维绘图实践数字侘寂。纸面纹理、缓慢的动势与生成变化，让它像一件在数字介质中呼吸的旧物。',
		summaryEn: 'This site experiments with digital wabi-sabi using SvelteKit and Three.js. Paper texture, slow motion and generative variation give it the feel of an old object still breathing in a digital medium.',
		cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimalist%20portfolio%20website%20screenshot%2C%20warm%20paper%20background%2C%20editorial%20typography%2C%20clay%20accent%2C%20asymmetric%20grid%2C%20wabisabi%20design%2C%20desktop%20view&image_size=landscape_16_9',
		aspect: 'landscape_16_9',
		externalUrl: 'https://songzijie.art'
	},

	// ===== 数字人文 =====
	{
		slug: 'classical-poetry-atlas',
		index: '07',
		title: '古典诗歌情感图谱',
		titleEn: 'Classical Poetry Atlas',
		year: '2024',
		category: '数字人文',
		role: 'Researcher',
		summary:
			'对《全唐诗》中近五万首作品做情感向量编码，构建可漫游的语义地形，让「孤」「远」「归」三字在二维平面上呈现唐人的情绪地理。',
		summaryEn: 'An explorable map of emotional patterns in nearly fifty thousand poems from the Complete Tang Poems, tracing the geography of solitude, distance and return.',
		cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=abstract%20topographic%20map%20made%20of%20chinese%20calligraphy%20strokes%2C%20warm%20paper%2C%20ink%20wash%20gradient%2C%20clay%20accent%2C%20minimalist%20data%20visualization%2C%20wabisabi&image_size=landscape_4_3',
		aspect: 'landscape_4_3'
	}
] as const;

/**
 * Group projects by category, preserving the order defined in `categoryOrder`.
 * Categories with zero projects are still returned (empty array) so the
 * page can render a stable section skeleton.
 */
export function groupByCategory(
	items: readonly Project[]
): Record<ProjectCategory, Project[]> {
	const groups: Record<ProjectCategory, Project[]> = {
		'文学艺术': [],
		'摄影映像': [],
		'知识杂文': [],
		'网站': [],
		'数字人文': []
	};
	for (const p of items) {
		if (groups[p.category]) {
			groups[p.category].push(p);
		}
	}
	return groups;
}

/* ============================================================
   Category metadata: routing slug + scroll colophon fields
   ============================================================ */

/**
 * Layout family per DESIGN.md Part VI:
 * catalog - 手写目录 (typography-only rows)
 * stills  - 装裱剧照 (stacked mounted landscape images)
 * draft   - 图稿研究 (meta left, mounted image right)
 * plate   - 研究图版 (image left with CN figure label, caption right)
 */
export type CategoryLayout = 'catalog' | 'stills' | 'draft' | 'plate';

export interface CategoryMeta {
	readonly slug: string;
	readonly numeral: string;
	readonly en: string;
	readonly subtag: string;
	readonly intro: string;
	readonly introEn: string;
	readonly layout: CategoryLayout;
}

export const categoryMeta: Record<ProjectCategory, CategoryMeta> = {
	'文学艺术': {
		slug: 'literature',
		numeral: '壹',
		en: 'Literature & Art',
		subtag: '诗文创作',
		intro: '文学与艺术创作。诗境、影像与精神分析在此交织，以文字为底，以图像为墨。',
		introEn: 'Creative work where poetry, images and psychoanalysis meet, with words as the ground and images as the ink.',
		layout: 'catalog'
	},
	'摄影映像': {
		slug: 'photograph',
		numeral: '贰',
		en: 'Photography & Visuals',
		subtag: '光影定格',
		intro: '摄影与动态影像创作。以镜头凝固时间，在光影流转中捕捉刹那的永恒。',
		introEn: 'Photography and moving images that follow the way light and shadow change from one moment to the next.',
		layout: 'stills'
	},
	'知识杂文': {
		slug: 'essay',
		numeral: '叁',
		en: 'Essays & Notes',
		subtag: '思辨札记',
		intro: '思维碎片、阅读笔记与技术随笔。在杂记与漫谈中沉淀认知的涟漪。',
		introEn: 'Reading notes, technical essays and thoughts that take shape in the course of writing.',
		layout: 'catalog'
	},
	'网站': {
		slug: 'websites',
		numeral: '肆',
		en: 'Websites',
		subtag: '界面空间',
		intro: '数字空间的营造。以代码构建可栖居的界面，让浏览成为一种居住。',
		introEn: 'Making places on the web, with code as a way to build interfaces people can spend time in.',
		layout: 'draft'
	},
	'数字人文': {
		slug: 'digital-humanities',
		numeral: '伍',
		en: 'Digital Humanities',
		subtag: '数据诗学',
		intro: '技术与人文的交汇。让古典文本与计算方法互文，在数据中读出诗学。',
		introEn: 'Classical texts and computational methods in conversation, with data as another way to read poetry.',
		layout: 'plate'
	}
};

export const categorySlugs: readonly string[] = categoryOrder.map((c) => categoryMeta[c].slug);

export function categoryFromSlug(slug: string): ProjectCategory | null {
	for (const c of categoryOrder) {
		if (categoryMeta[c].slug === slug) return c;
	}
	return null;
}

/* ============================================================
   Article body: skeleton contract for Sanity Portable Text
   ============================================================ */

/**
 * The four block shapes the article template renders. When Sanity is
 * wired, Portable Text is mapped down to these in the CMS service; the
 * template itself never needs to know about Sanity.
 */
export interface RichTextSpan { readonly text: string; readonly strong?: boolean; readonly em?: boolean; readonly href?: string }
export type ArticleBlock =
	| { readonly type: 'paragraph'; readonly text: string; readonly content?: RichTextSpan[] }
	| { readonly type: 'heading'; readonly text: string; readonly level?: 2 | 3 }
	| { readonly type: 'quote'; readonly text: string; readonly content?: RichTextSpan[]; readonly cite?: string }
	| { readonly type: 'list'; readonly ordered: boolean; readonly items: { text: string; content: RichTextSpan[] }[] }
	| { readonly type: 'image'; readonly src: string; readonly caption?: string; readonly alt?: string; readonly aspectRatio?: number };

export interface ProjectArticle extends Project {
	readonly body: readonly ArticleBlock[];
	readonly showCover?: boolean;
}

/**
 * Placeholder article body used until Sanity provides real Portable Text.
 * Exercises every block shape so typography and rhythm can be validated.
 */
export function seedArticleBody(p: Project, locale: 'zh' | 'en' = 'zh'): ArticleBlock[] {
	const en = locale === 'en';
	return [
		{ type: 'paragraph', text: p.summary },
		{ type: 'heading', text: en ? 'Origins' : '缘起' },
		{
			type: 'paragraph',
			text: en ? 'Further notes on how this work began are being prepared.' : '关于作品缘起的手记正在整理中。'
		},
		{ type: 'quote', text: en ? 'There is a deep order in imperfection.' : '不完满是一种深刻的秩序。', cite: en ? 'Notebook' : '手记' },
		{ type: 'image', src: p.cover, caption: p.title },
		{ type: 'heading', text: en ? 'Method' : '方法' },
		{
			type: 'paragraph',
			text: en ? 'Notes on the materials, methods and abandoned experiments are in progress.' : '关于材料、方法与未能走通的尝试，手记仍在整理中。'
		}
	];
}
