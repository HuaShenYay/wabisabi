/** Shared Portable Text schema, including the existing Post formats. */
export const blockContentSchema = {
	name: 'blockContent',
	title: '正文 · Body',
	type: 'array',
	of: [
		{
			type: 'block',
			styles: [
				{ title: '正文', value: 'normal' },
				{ title: '标题 1', value: 'h1' },
				{ title: '标题 2', value: 'h2' },
				{ title: '标题 3', value: 'h3' },
				{ title: '标题 4', value: 'h4' },
				{ title: '引文', value: 'blockquote' }
			],
			lists: [{ title: '项目列表', value: 'bullet' }, { title: '编号列表', value: 'number' }],
			marks: {
				decorators: [{ title: '强调', value: 'strong' }, { title: '斜体', value: 'em' }],
				annotations: [{
					name: 'link', type: 'object', title: '链接',
					fields: [{ name: 'href', type: 'url', title: '地址', validation: Rule => Rule.required().uri({ scheme: ['http', 'https', 'mailto'] }) }]
				}]
			}
		},
		{
			type: 'image', options: { hotspot: true },
			fields: [
				{ name: 'alt', title: '替代文字', type: 'string', description: '说明图片内容，供读屏和图片无法加载时使用。' },
				{ name: 'caption', title: '图注', type: 'string' }
			]
		},
		{
			name: 'quotation', type: 'object', title: '带出处的引文',
			fields: [{ name: 'text', type: 'text', title: '引文', validation: Rule => Rule.required() }, { name: 'cite', type: 'string', title: '出处' }]
		}
	]
};
