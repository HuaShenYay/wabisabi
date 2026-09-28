import { error } from '@sveltejs/kit';
import { getArticlePageData } from '$lib/server/cms.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const data = await getArticlePageData(params.slug);
	if (!data) throw error(404, '此作品不存在');
	// Guard against a URL whose category segment mismatches the work
	if (data.categoryMeta.slug !== params.category) throw error(404, '此作品不存在');
	return data;
};
