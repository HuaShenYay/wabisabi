/**
 * Sanity Schema - Site Settings
 *
 * Top-level site config: title, description, URL, keywords, etc.
 * Mirrors src/lib/config/site.ts so SEO can be edited from Studio.
 */

export const siteSettingsSchema = {
	name: 'siteSettings',
	title: '站点设置 · Site Settings',
	type: 'document',
	singleton: true,
	fields: [
		{ name: 'name', title: 'Site Name', type: 'string' },
		{ name: 'nameEn', title: 'Site Name (EN)', type: 'string' },
		{ name: 'title', title: 'SEO Title', type: 'string' },
		{ name: 'description', title: 'SEO Description', type: 'text', rows: 3 },
		{ name: 'url', title: 'Site URL', type: 'url', validation: Rule => Rule.uri({ scheme: ['http', 'https'] }) },
		{ name: 'locale', title: 'Locale', type: 'string', initialValue: 'zh_CN' },
		{ name: 'language', title: 'Language', type: 'string', initialValue: 'zh' },
		{ name: 'author', title: 'Author', type: 'string' },
		{
			name: 'keywords',
			title: 'Keywords',
			type: 'array',
			of: [{ type: 'string' }]
		},
		{ name: 'ogImage', title: 'OG Image', type: 'image' },
		{ name: 'themeColor', title: 'Theme Color', type: 'string', initialValue: '#e8e5de' }
	],
	preview: {
		select: { title: 'name', subtitle: 'title' }
	}
};
