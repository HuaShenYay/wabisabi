/**
 * Application Layer: SEO Service
 *
 * Orchestrates domain entities into SEO artifacts:
 * - Meta tag generation
 * - JSON-LD structured data (schema.org Person)
 * - Open Graph / Twitter Card data
 *
 * This is the bridge between Domain (profile, links) and
 * Presentation (SvelteKit svelte:head).
 */

import { profile } from '$lib/domain/profile.js';
import { socialLinks } from '$lib/domain/social.js';
import { siteConfig } from '$lib/config/site.js';

export interface SeoMeta {
	title: string;
	description: string;
	canonical: string;
	ogTitle: string;
	ogDescription: string;
	ogType: 'website' | 'profile' | 'article';
	ogImage: string;
	ogUrl: string;
	ogSiteName: string;
	ogLocale: string;
	twitterCard: 'summary_large_image' | 'summary';
	twitterTitle: string;
	twitterDescription: string;
	twitterImage: string;
	keywords: string;
}

export function generateSeoMeta(path: string = '/'): SeoMeta {
	const url = `${siteConfig.url}${path}`;

	return {
		title: siteConfig.title,
		description: siteConfig.description,
		canonical: url,
		ogTitle: siteConfig.title,
		ogDescription: siteConfig.description,
		ogType: 'website',
		ogImage: `${siteConfig.url}${siteConfig.ogImage}`,
		ogUrl: url,
		ogSiteName: siteConfig.name,
		ogLocale: siteConfig.locale,
		twitterCard: 'summary_large_image',
		twitterTitle: siteConfig.title,
		twitterDescription: siteConfig.description,
		twitterImage: `${siteConfig.url}${siteConfig.ogImage}`,
		keywords: siteConfig.keywords.join(', ')
	};
}

export function generatePersonJsonLd() {
	const sameAs = socialLinks
		.filter((link) => link.platform !== 'email')
		.map((link) => link.url);

	return {
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: `${profile.name} (${profile.nameEn})`,
		jobTitle: profile.title,
		description: profile.bio,
		email: `mailto:${profile.email}`,
		address: {
			'@type': 'PostalAddress',
			addressLocality: profile.location,
			addressCountry: 'CN'
		},
		knowsAbout: [
			'AI Art',
			'Generative Art',
			'Digital Art',
			'Game Culture',
			'Visual Storytelling',
			'Creative Coding'
		],
		sameAs,
		url: siteConfig.url
	};
}

export function generateWebsiteJsonLd() {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: siteConfig.name,
		url: siteConfig.url,
		description: siteConfig.description,
		inLanguage: siteConfig.language,
		author: {
			'@type': 'Person',
			name: siteConfig.author
		}
	};
}
