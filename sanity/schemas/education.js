/**
 * Sanity Schema - Education
 *
 * One education entry in the home About section.
 */

export const educationSchema = {
	name: 'education',
	title: '教育 · Education',
	type: 'document',
	fields: [
		{ name: 'school', title: 'School', type: 'string', validation: (Rule) => Rule.required() },
		{ name: 'schoolEn', title: '英文院校', type: 'string' },
		{ name: 'major', title: 'Major', type: 'string' },
		{ name: 'majorEn', title: '英文专业', type: 'string' },
		{ name: 'note', title: 'Note', type: 'string' },
		{ name: 'noteEn', title: '英文备注', type: 'string' },
		{ name: 'order', title: 'Order', type: 'number', initialValue: 0 }
	],
	orderings: [
		{ title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }
	],
	preview: {
		select: { title: 'school', subtitle: 'major' }
	}
};
