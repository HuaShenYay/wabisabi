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
	readonly bio: string;
	readonly email: string;
	readonly location: string;
	readonly role: string;
}

export const profile: Profile = {
	name: '宋子杰',
	nameEn: 'Song Zijie',
	title: 'AI 人文艺术创作者',
	bio: '宋子杰是一位AI人文艺术创作者，长期关注人工智能与当代艺术、游戏文化的交叉地带。他通过生成式工具、视觉叙事和数字实验，探索技术时代的人文表达。他也是一名游戏爱好者，从独立作品到3A大作中寻找灵感与叙事语言。',
	email: 'bigdickgod@icloud.com',
	location: '上海',
	role: 'AI Artist & Creative Explorer'
};
