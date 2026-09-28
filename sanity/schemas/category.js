export const categorySchema = {
	name: 'category', title: '标签 · Category', type: 'document',
	fields: [
		{ name: 'title', title: '名称', type: 'string', validation: Rule => Rule.required() },
		{ name: 'description', title: '说明', type: 'text', description: '文学类现有标签继续使用；其他分卷可填写 aigc-films、websites、digital-humanities 作为名称。' }
	],
	preview: { select: { title: 'title' } }
};
