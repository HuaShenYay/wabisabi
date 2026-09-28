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

import { profile, type Profile } from '$lib/domain/profile.js';
import { socialLinks, type SocialLink } from '$lib/domain/social.js';
import { siteConfig, type SiteConfig } from '$lib/config/site.js';

/** Safe for a JSON-LD script element, including CMS-authored strings. */
export function serializeJsonLd(value: object): string {
	return JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

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

export function generatePersonJsonLd(person: Profile = profile, links: readonly SocialLink[] = socialLinks, settings: SiteConfig = siteConfig) {
	const sameAs = links
		.filter((link) => link.platform !== 'email')
		.map((link) => link.url);

	return {
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: `${person.name} (${person.nameEn})`,
		jobTitle: person.title,
		description: person.bio,
		email: `mailto:${person.email}`,
		address: {
			'@type': 'PostalAddress',
			addressLocality: person.location,
			addressCountry: 'CN'
		},
		knowsAbout: [
			'Digital Humanities',
			'AIGC',
			'Literary Research',
			'Poetry Analysis',
			'Film & Visual Studies',
			'Generative AI',
			'Psychoanalysis',
			'Three.js',
			'Creative Coding'
		],
		sameAs,
		url: settings.url
	};
}

export function generateWebsiteJsonLd(settings: SiteConfig = siteConfig) {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: settings.name,
		url: settings.url,
		description: settings.description,
		inLanguage: settings.language,
		author: {
			'@type': 'Person',
			name: settings.author
		}
	};
}
