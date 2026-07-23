/**
 * Domain Entities: ClientCluster, Award, SpeakingEngagement
 *
 * Represents the portfolio's professional work history.
 */

export interface ClientCluster {
	readonly label: string;
	readonly items: readonly string[];
}

export interface Award {
	readonly name: string;
	readonly count: number;
}

export interface SpeakingEngagement {
	readonly event: string;
	readonly year: string;
	readonly location: string;
}

export const clientClusters: readonly ClientCluster[] = [
	{
		label: 'Art & Exhibition',
		items: [
			'数字艺术平台',
			'当代艺术空间',
			'独立策展人',
			'虚拟展览项目',
			'文化基金会',
			'科技艺术实验室'
		]
	},
	{
		label: 'Games & Interactive',
		items: [
			'独立游戏工作室',
			'游戏发行商',
			'XR 体验团队',
			'独立开发者'
		]
	},
	{
		label: 'Brand & Education',
		items: [
			'品牌创意合作',
			'设计咨询公司',
			'线上文化媒体',
			'高校数字艺术课程',
			'音乐节视觉艺术',
			'AI 研究社区'
		]
	}
] as const;

export const awards: readonly Award[] = [
	{ name: 'AI Art Competition', count: 2 },
	{ name: '独立游戏节视觉奖', count: 1 },
	{ name: '数字人文奖学金', count: 1 },
	{ name: '生成艺术展览入选', count: 3 },
	{ name: '游戏摄影大赛', count: 1 },
	{ name: '新媒体艺术提名', count: 2 },
	{ name: '线上创作马拉松', count: 1 }
] as const;

export const speakingEngagements: readonly SpeakingEngagement[] = [
	{ event: 'AI 与艺术工作坊', year: '2024', location: '上海' },
	{ event: '独立游戏文化沙龙', year: '2023', location: '线上' },
	{ event: '数字人文讲座', year: '2024', location: '杭州' },
	{ event: '生成艺术分享会', year: '2025', location: '北京' }
] as const;
