/**
 * Sanity Schema - Profile
 *
 * Singleton document representing the portfolio owner's identity.
 */

export const profileSchema = {
	name: 'profile',
	title: '个人资料 · Profile',
	type: 'document',
	singleton: true,
	fields: [
		{ name: 'name', title: '姓名 · Name (CN)', type: 'string', validation: (Rule) => Rule.required() },
		{ name: 'nameEn', title: 'Name (EN)', type: 'string' },
		{ name: 'title', title: 'Title', type: 'string', description: 'e.g. 数字人文研究者 · AIGC 创作者' },
		{ name: 'role', title: 'Role (EN)', type: 'string', description: 'e.g. Digital Humanist & Creative Technologist' },
		{ name: 'bio', title: 'Bio', type: 'text', rows: 6 },
		{ name: 'email', title: 'Email', type: 'string' },
		{ name: 'location', title: 'Location', type: 'string' }
	],
	preview: {
		select: { title: 'name', subtitle: 'title' }
	}
};
