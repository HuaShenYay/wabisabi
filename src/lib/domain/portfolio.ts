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
	{ label: '数字人文', desc: '计算机技术与文学、影视研究的结合' },
	{ label: 'AIGC 与创作', desc: '生成式图像、三维交互与美育影像' },
	{ label: '诗歌分析系统', desc: '古典诗歌情感智能分析与推荐' },
	{ label: '影视与视觉', desc: '镜头语言、节奏与实验影像表达' },
	{ label: '精神分析', desc: '弗洛伊德、拉康作为人文研究视角' }
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
		note: '专升本，原信息安全专业'
	}
] as const;

export interface PhilosophyItem {
	readonly label: string;
	readonly desc: string;
}

export const designPhilosophy: readonly PhilosophyItem[] = [
	{ label: '侘寂 · Wabi-Sabi', desc: '残缺、质朴、不完美之美' },
	{ label: '幽玄 · Yugen', desc: '深邃幽暗的神秘意境' },
	{ label: '素简 · Kanso', desc: '去除冗余的纯净表达' },
	{ label: '静寂 · Seijaku', desc: '安宁内敛的视觉气质' }
] as const;
