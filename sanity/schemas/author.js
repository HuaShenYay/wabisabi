export const authorSchema = {
	name: 'author', title: '作者 · Author', type: 'document',
	fields: [
		{ name: 'name', title: '姓名', type: 'string' },
		{ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name', maxLength: 96 } },
		{ name: 'image', title: '头像', type: 'image', options: { hotspot: true } },
		{ name: 'bio', title: '简介', type: 'array', of: [{ type: 'block', styles: [{ title: '正文', value: 'normal' }], lists: [] }] }
	],
	preview: { select: { title: 'name', media: 'image' } }
};
