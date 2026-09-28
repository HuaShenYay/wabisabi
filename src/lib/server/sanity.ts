/** Server-only Sanity access. Tokens never enter browser bundles. */
import { createClient, type SanityClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';
import type { ContentImage } from '$lib/domain/content';

export const sanityProjectId = env.PUBLIC_SANITY_PROJECT_ID ?? '';
export const sanityDataset = env.PUBLIC_SANITY_DATASET || 'production';
export const sanityContentScope = privateEnv.SANITY_CONTENT_SCOPE === 'posts' ? 'posts' : 'all';
export const isSanityConfigured = /^[a-z0-9-]+$/.test(sanityProjectId) && sanityProjectId !== 'your_project_id_here';
let client: SanityClient | undefined;

export function getSanityClient(): SanityClient {
	if (!isSanityConfigured) throw new Error('Sanity project is not configured');
	return client ??= createClient({
		projectId: sanityProjectId,
		dataset: sanityDataset,
		apiVersion: '2024-10-01',
		useCdn: false,
		token: privateEnv.SANITY_API_READ_TOKEN || undefined,
		timeout: 8000,
		maxRetries: 1,
		perspective: 'published'
	});
}

/** Respect the editor's crop/hotspot, keep intrinsic proportions unless both dimensions are supplied. */
export function sanityImageUrl(
	ref: ContentImage | string | null | undefined,
	opts: { w?: number; h?: number; fit?: 'crop' | 'max'; q?: number } = {}
): string | null {
	if (!ref || !isSanityConfigured) return null;
	const id = typeof ref === 'string' ? ref : ref.asset?._ref;
	if (!id || !/^image-[a-zA-Z0-9]+-\d+x\d+-[a-zA-Z0-9]+$/.test(id)) return null;
	try {
		let image = createImageUrlBuilder({ projectId: sanityProjectId, dataset: sanityDataset }).image(ref).auto('format');
		if (opts.w) image = image.width(opts.w);
		if (opts.h) image = image.height(opts.h);
		if (opts.fit) image = image.fit(opts.fit);
		return image.quality(opts.q ?? 82).url();
	} catch { return null; }
}
