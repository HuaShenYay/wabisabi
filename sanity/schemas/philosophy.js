/**
 * Sanity Schema - Philosophy
 *
 * One design philosophy entry in the home About section.
 */

export const philosophySchema = {
	name: 'philosophy',
	title: '设计哲学 · Philosophy',
	type: 'document',
	fields: [
		{ name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required() },
		{ name: 'labelEn', title: '英文名称', type: 'string' },
		{ name: 'desc', title: 'Description', type: 'text', rows: 3 },
		{ name: 'descEn', title: '英文说明', type: 'text' },
		{ name: 'order', title: 'Order', type: 'number', initialValue: 0 }
	],
	orderings: [
		{ title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }
	],
	preview: {
		select: { title: 'label', subtitle: 'desc' }
	}
};
