/**
 * Sanity Schema - Focus Area
 *
 * One of the research focus areas shown on the home About section.
 */

export const focusAreaSchema = {
	name: 'focusArea',
	title: '研究方向 · Focus Area',
	type: 'document',
	fields: [
		{ name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required() },
		{ name: 'labelEn', title: '英文名称', type: 'string' },
		{ name: 'desc', title: 'Description', type: 'string' },
		{ name: 'descEn', title: '英文说明', type: 'string' },
		{ name: 'order', title: 'Order', type: 'number', initialValue: 0 }
	],
	orderings: [
		{ title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }
	],
	preview: {
		select: { title: 'label', subtitle: 'desc' }
	}
};
