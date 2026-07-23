/**
 * Domain Entity: SocialLink
 *
 * Represents a social media or contact link.
 */

export interface SocialLink {
	readonly label: string;
	readonly url: string;
	readonly platform: SocialPlatform;
}

export type SocialPlatform =
	| 'email'
	| 'bilibili'
	| 'github'
	| 'rednote'
	| 'twitter'
	| 'instagram'
	| 'itch'
	| 'arena';

export const socialLinks: readonly SocialLink[] = [
	{
		label: 'Email',
		url: 'mailto:bigdickgod@icloud.com',
		platform: 'email'
	},
	{
		label: 'BiliBili',
		url: 'https://bilibili.com/',
		platform: 'bilibili'
	},
	{
		label: 'GitHub',
		url: 'https://github.com/',
		platform: 'github'
	},
	{
		label: 'RedNote',
		url: 'https://www.xiaohongshu.com/',
		platform: 'rednote'
	}
] as const;
