/**
 * Domain Entities: FocusArea, EducationEntry, DesignPhilosophy
 *
 * Represents the portfolio owner's research interests, education, and
 * the design philosophy behind this site.
 */

export interface FocusItem {
	readonly label: string;
	readonly desc: string;
}

export const focusAreas: readonly FocusItem[] = [
	{ label: 'AIGC艺术创作', desc: '研究具有美学质感的生成式图像、影像' },
	{ label: '数字人文', desc: '计算机技术与人文学研究的结合' },
	{ label: '精神分析', desc: '关注人的无意识，创伤，爱欲等' }
] as const;

export interface EducationEntry {
	readonly school: string;
	readonly major: string;
	readonly note: string;
}

export const education: readonly EducationEntry[] = [
	{
		school: '上海杉达学院',
		major: '软件工程（本科）',
		note: ''
	},
	{
		school: '上海电子信息职业技术学院',
		major: '信息安全（专科）',
		note: ''
	}
] as const;

export interface PhilosophyItem {
	readonly label: string;
	readonly desc: string;
}

export const designPhilosophy: readonly PhilosophyItem[] = [
	{
		label: 'Neo-Wabi-Sabi',
		desc: '在数字介质中寻找残缺与不完美的诗意 - 拒绝对称的秩序让每次会话都有独特偏移，深邃幽暗的意境在模糊与揭示之间缓缓浮现，高粘滞的流动如墨晕开归于宁静'
	}
] as const;
