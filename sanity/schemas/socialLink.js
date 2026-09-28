/**
 * Sanity Schema - Social Link
 *
 * A social / contact link in the home page LinksSection.
 */

export const socialLinkSchema = {
	name: 'socialLink',
	title: '社交链接 · Social Link',
	type: 'document',
	fields: [
		{ name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required() },
		{ name: 'url', title: 'URL', type: 'string', validation: (Rule) => Rule.required() },
		{
			name: 'platform',
			title: 'Platform',
			type: 'string',
			options: {
				list: ['email', 'bilibili', 'github', 'rednote', 'twitter', 'instagram', 'itch', 'arena']
			},
			validation: (Rule) => Rule.required()
		},
		{
			name: 'order',
			title: 'Order',
			type: 'number',
			initialValue: 0
		}
	],
	orderings: [
		{ title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }
	],
	preview: {
		select: { title: 'label', subtitle: 'platform' }
	}
};
