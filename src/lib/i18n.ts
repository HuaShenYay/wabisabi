import { categoryMeta, type ProjectCategory } from './domain/projects';

export type Locale = 'zh' | 'en';
export const localeCookie = 'site-language';
export function getLocale(value: unknown): Locale { return value === 'en' ? 'en' : 'zh'; }
export function translator(locale: Locale) {
	return (zh: string, en: string) => locale === 'en' ? en : zh;
}
export function languageHref(url: URL, locale: Locale) {
	const next = new URL(url);
	next.searchParams.set('lang', locale);
	return `${next.pathname}${next.search}${next.hash}`;
}
export function categoryLabel(locale: Locale, category: ProjectCategory) {
	return locale === 'en' ? categoryMeta[category].en : category;
}
