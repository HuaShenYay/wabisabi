/**
 * Domain Entity: Profile
 *
 * Represents the core identity of the portfolio owner.
 * This is a pure domain model - no framework dependencies.
 */

export interface Profile {
	readonly name: string;
	readonly nameEn: string;
	readonly title: string;
	readonly role: string;
	readonly bio: string;
	readonly email: string;
	readonly location: string;
}

export const profile: Profile = {
	name: '宋子杰',
	nameEn: 'Song Zijie',
	title: '数字人文研究者 · AIGC 创作者',
	role: 'Digital Humanist & Creative Technologist',
	bio: '宋子杰来自上海，软件工程背景，长期关注数字人文、AIGC、文学研究与创作技术的结合。他的工作围绕"技术如何参与人文表达"展开，横跨诗歌分析、影视研究、AI 创作与生成式视觉。',
	email: 'bigdickgod@icloud.com',
	location: '上海'
};
