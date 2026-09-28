/** Keep the original Post fields and references compatible with production. */
export const postSchema = {
	name: 'post', title: '文章 · Post', type: 'document',
	fields: [
		{ name: 'title', title: '标题', type: 'string', validation: Rule => Rule.required() },
		{ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title', maxLength: 96 }, validation: Rule => Rule.required().custom(value => !value?.current || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.current) || '请使用小写英文字母、数字和连字符') },
		{ name: 'author', title: '作者', type: 'reference', to: [{ type: 'author' }] },
		{ name: 'mainImage', title: '封面', type: 'image', options: { hotspot: true }, fields: [{ name: 'alt', title: '替代文字', type: 'string' }] },
		{ name: 'categories', title: '标签', type: 'array', of: [{ type: 'reference', to: [{ type: 'category' }] }] },
		{ name: 'publishedAt', title: '发布日期', type: 'datetime' },
		{ name: 'summary', title: '简介', type: 'text', rows: 3, description: '留空时使用正文首段。' },
		{ name: 'body', title: '正文', type: 'blockContent' },
		{ name: 'order', title: '显示顺序', type: 'number', description: '数值越小越靠前，留空按日期排序。' }
	],
	preview: {
		select: { title: 'title', author: 'author.name', media: 'mainImage' },
		prepare: ({ title, author, media }) => ({ title, subtitle: author, media })
	}
};
