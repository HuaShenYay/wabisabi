/**
 * Infrastructure Layer: Site Configuration
 *
 * Central source of truth for site-level settings.
 * Consumed by Application (SEO service) and Presentation layers.
 */

export const siteConfig = {
	name: '宋子杰',
	nameEn: 'Song Zijie',
	title: '宋子杰 - 数字人文研究者 · AIGC 创作者',
	description:
		'宋子杰来自上海，软件工程背景，专注数字人文、AIGC、文学研究与创作技术的结合。探索诗歌分析、影视研究、AI 创作与生成式视觉，寻找技术参与人文表达的新型路径。',
	url: 'https://songzijie.art',
	locale: 'zh_CN',
	language: 'zh',
	author: '宋子杰',
	keywords: [
		'宋子杰',
		'Song Zijie',
		'数字人文',
		'Digital Humanities',
		'AIGC',
		'生成式AI',
		'文学研究',
		'诗歌分析',
		'影视研究',
		'视觉文化',
		'精神分析',
		'Three.js',
		'创意编程',
		'AI创作',
		'digital humanities',
		'AI art creator'
	],
	ogImage: '/og-image.png',
	themeColor: '#e8e5de',
	pages: [
		{ path: '/', label: 'Home', changefreq: 'monthly', priority: '1.0' },
		{ path: '/copyright', label: 'Copyright', changefreq: 'yearly', priority: '0.3' }
	]
} as const;

export type SiteConfig = typeof siteConfig;
