/**
 * Infrastructure Layer: Site Configuration
 *
 * Central source of truth for site-level settings.
 * Consumed by Application (SEO service) and Presentation layers.
 */

export const siteConfig = {
	name: '宋子杰',
	nameEn: 'Song Zijie',
	title: '宋子杰 - AI 人文艺术创作者',
	description:
		'宋子杰是一位AI人文艺术创作者，关注人工智能、当代艺术与游戏文化的交叉地带。通过生成式工具、视觉叙事和数字实验，探索技术时代的人文表达。',
	url: 'https://songzijie.art',
	locale: 'zh_CN',
	language: 'zh',
	author: '宋子杰',
	keywords: [
		'宋子杰',
		'Song Zijie',
		'AI艺术家',
		'AI人文艺术',
		'生成式艺术',
		'数字艺术',
		'当代艺术',
		'游戏文化',
		'视觉叙事',
		'创意编程',
		'generative art',
		'digital art',
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
