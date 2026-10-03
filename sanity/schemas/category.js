export const categorySchema = {
	name: 'category', title: '标签 · Category', type: 'document',
	fields: [
		{ name: 'title', title: '名称', type: 'string', validation: Rule => Rule.required() },
		{ name: 'description', title: '说明', type: 'text', description: '文学艺术对应 literature；摄影映像对应 photograph；知识杂文对应 essay；网站对应 websites；数字人文对应 digital-humanities。' }
	],
	preview: { select: { title: 'title' } }
};
