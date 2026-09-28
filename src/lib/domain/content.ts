import type { ArticleBlock, RichTextSpan } from './projects.js';

/** Only navigation protocols intended for portfolio content are accepted. */
export function safeLink(value: unknown, allowEmail = false): string | undefined {
	if (typeof value !== 'string' || !value.trim()) return;
	try {
		const url = new URL(value);
		if (url.protocol === 'https:' || url.protocol === 'http:' || (allowEmail && url.protocol === 'mailto:')) return url.href;
	} catch { /* Invalid links remain plain text. */ }
}

export interface ContentImage {
	asset?: { _ref?: string };
	crop?: { top: number; bottom: number; left: number; right: number };
	hotspot?: { x: number; y: number; height: number; width: number };
}

/** Sanity asset refs contain original dimensions; crop changes the displayed ratio. */
export function imageAspectRatio(image: ContentImage): number | undefined {
	const dimensions = image.asset?._ref?.match(/^image-[a-zA-Z0-9]+-(\d+)x(\d+)-[a-zA-Z0-9]+$/);
	if (!dimensions) return;
	const { top = 0, bottom = 0, left = 0, right = 0 } = image.crop ?? {};
	if (![top, bottom, left, right].every(n => Number.isFinite(n) && n >= 0 && n <= 1)) return;
	const width = Number(dimensions[1]) * (1 - left - right);
	const height = Number(dimensions[2]) * (1 - top - bottom);
	if (width > 0 && height > 0) return width / height;
}

export interface PortableBlock extends ContentImage {
	_type: string;
	style?: string;
	listItem?: 'bullet' | 'number';
	children?: { text?: string; marks?: string[] }[];
	markDefs?: { _key: string; _type: string; href?: string }[];
	caption?: string;
	alt?: string;
	cite?: string;
	text?: string;
}

export function mapArticleBody(body: PortableBlock[] | null | undefined, imageUrl: (image: ContentImage) => string | null): ArticleBlock[] {
	if (!Array.isArray(body)) return [];
	const blocks = body.flatMap((block): ArticleBlock[] => {
		if (!block || typeof block !== 'object') return [];
		if (block._type === 'image') {
			const src = imageUrl(block);
			const aspectRatio = imageAspectRatio(block);
			return src ? [{ type: 'image', src, caption: block.caption, alt: block.alt, ...(aspectRatio ? { aspectRatio } : {}) }] : [];
		}
		if (block._type === 'quotation' && block.text) return [{ type: 'quote', text: block.text, cite: block.cite }];
		if (block._type !== 'block' || !Array.isArray(block.children)) return [];
		const content: RichTextSpan[] = block.children.filter(c => typeof c.text === 'string').map(c => {
			const marks = Array.isArray(c.marks) ? c.marks : [];
			const link = block.markDefs?.find(m => m._type === 'link' && marks.includes(m._key));
			return { text: c.text ?? '', strong: marks.includes('strong'), em: marks.includes('em'), href: safeLink(link?.href, true) };
		});
		const text = content.map(c => c.text).join('');
		if (!text.trim()) return [];
		if (block.listItem === 'bullet' || block.listItem === 'number') return [{ type: 'list', ordered: block.listItem === 'number', items: [{ text, content }] }];
		if (['h1', 'h2', 'h3', 'h4'].includes(block.style ?? '')) return [{ type: 'heading', text, level: block.style === 'h3' || block.style === 'h4' ? 3 : 2 }];
		if (block.style === 'blockquote') return [{ type: 'quote', text, content }];
		return [{ type: 'paragraph', text, content }];
	});
	return blocks.reduce<ArticleBlock[]>((result, block) => {
		const previous = result.at(-1);
		if (block.type === 'list' && previous?.type === 'list' && previous.ordered === block.ordered) previous.items.push(...block.items);
		else result.push(block);
		return result;
	}, []);
}
