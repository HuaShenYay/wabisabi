/**
 * Sanity Schema - Project
 *
 * Represents a single creative / research work in the portfolio.
 * Maps 1:1 to the Project domain entity in src/lib/domain/projects.ts.
 */

export const projectSchema = {
	name: 'project',
	title: '项目 · Project',
	type: 'document',
	fields: [
		{
			name: 'slug',
			title: 'Slug',
			type: 'slug',
			description: 'URL-safe identifier, e.g. "night-rain-anthology"',
			options: { source: 'title' },
			validation: (Rule) => Rule.required().custom(value => !value?.current || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.current) || '请使用小写英文字母、数字和连字符')
		},
		{
			name: 'index',
			title: 'Index',
			type: 'string',
			description: 'Display index in the project list, e.g. "01"',
			validation: (Rule) => Rule.required().max(4)
		},
		{
			name: 'title',
			title: '标题 · Title (CN)',
			type: 'string',
			validation: (Rule) => Rule.required()
		},
		{
			name: 'titleEn',
			title: 'Title (EN)',
			type: 'string'
		},
		{
			name: 'year',
			title: 'Year',
			type: 'string',
			validation: (Rule) => Rule.required().max(4)
		},
		{
			name: 'category',
			title: '分类 · Category',
			type: 'string',
			description:
				'Project sub-category. Determines which section the project appears in on /projects.',
			options: {
				list: [
					{ title: '文学艺术 · Literature & Art', value: '文学艺术' },
					{ title: '摄影映像 · Photography & Visuals', value: '摄影映像' },
					{ title: '知识杂文 · Essays & Notes', value: '知识杂文' },
					{ title: '网站 · Website', value: '网站' },
					{ title: '数字人文 · Digital Humanities', value: '数字人文' }
				]
			},
			validation: (Rule) => Rule.required()
		},
		{
			name: 'role',
			title: 'Role',
			type: 'string'
		},
		{
			name: 'summary',
			title: 'Summary',
			type: 'text',
			rows: 4,
			description: 'A short, literary description of the work.'
		},
		{
			name: 'cover',
			title: 'Cover Image',
			type: 'image',
			description: '用于作品封面和所属分卷。焦点裁切会同步到前台。',
			options: { hotspot: true }
		},
		{
			name: 'aspect',
			title: 'Aspect Ratio',
			type: 'string',
			options: {
				list: [
					{ title: 'Landscape 16:9', value: 'landscape_16_9' },
					{ title: 'Landscape 4:3', value: 'landscape_4_3' },
					{ title: 'Portrait 4:3', value: 'portrait_4_3' }
				]
			},
			validation: (Rule) => Rule.required()
		},
		{
			name: 'externalUrl',
			title: 'External URL',
			type: 'url',
			description: 'Optional link to the live project, repository, or writeup.'
		},
		{
			name: 'body', title: '正文 · Article', type: 'blockContent',
			description: '发布后即在作品详情中显示。未填写时只展示作品简介。'
		},
		{
			name: 'order',
			title: 'Order',
			type: 'number',
			description: 'Sort order within the category (lower comes first).',
			initialValue: 0
		}
	],
	orderings: [
		{
			title: 'Index order',
			name: 'indexAsc',
			by: [{ field: 'order', direction: 'asc' }]
		}
	],
	preview: {
		select: { title: 'title', subtitle: 'category', media: 'cover' },
		prepare: ({ title, subtitle, media }) => ({
			title: title || 'Untitled',
			subtitle: subtitle || '',
			media
		})
	}
};
