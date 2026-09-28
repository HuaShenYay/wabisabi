import { error } from '@sveltejs/kit';
import { getCategoryPageData } from '$lib/server/cms.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const data = await getCategoryPageData(params.category);
	if (!data) throw error(404, '此分卷不存在');
	return data;
};
