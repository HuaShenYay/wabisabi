/**
 * Infrastructure Layer: Site Configuration
 *
 * Central source of truth for site-level settings.
 * Consumed by Application (SEO service) and Presentation layers.
 */

export const siteConfig = {
	name: '宋子杰',
	nameEn: 'Song Zijie',
	title: '宋子杰 - 数字人文研究与创作',
	description:
		'宋子杰的个人博客与作品集，记录数字人文、AIGC、文学与影像研究，以及创意编程实践。',
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
	themeColor: '#F3EFE6',
	pages: [
		{ path: '/', label: 'Home', changefreq: 'monthly', priority: '1.0' },
		{ path: '/projects', label: 'Project', changefreq: 'monthly', priority: '0.9' },
		{ path: '/projects/literature', label: 'Literature & Art', changefreq: 'monthly', priority: '0.8' },
		{ path: '/projects/aigc-films', label: 'AIGC Films', changefreq: 'monthly', priority: '0.8' },
		{ path: '/projects/websites', label: 'Websites', changefreq: 'monthly', priority: '0.8' },
		{ path: '/projects/digital-humanities', label: 'Digital Humanities', changefreq: 'monthly', priority: '0.8' },
		{ path: '/copyright', label: 'Copyright', changefreq: 'yearly', priority: '0.3' }
	]
} as const;

export type SiteConfig = { [K in Exclude<keyof typeof siteConfig, 'keywords' | 'pages'>]: string } & {
	keywords: readonly string[];
	pages: typeof siteConfig.pages;
};
