import { createClient } from '@sanity/client';
import { loadEnv } from 'vite';
import { profile } from '../src/lib/domain/profile.ts';
import { projects } from '../src/lib/domain/projects.ts';
import { socialLinks } from '../src/lib/domain/social.ts';
import { focusAreas, education, designPhilosophy } from '../src/lib/domain/portfolio.ts';
import { siteConfig } from '../src/lib/config/site.ts';

const env = { ...loadEnv('development', process.cwd(), ''), ...process.env };
const doc = (id, type, fields) => ({ _id: `drafts.${id}`, _type: type, ...fields });
const { ogImage, pages, ...settings } = siteConfig;
const documents = [
	doc('profile','profile',profile), doc('siteSettings','siteSettings',settings),
	...projects.map((project, order) => {
		const { cover, slug, ...fields } = project;
		return doc(`project-${slug}`,'project',{...fields,slug:{_type:'slug',current:slug},order,
			body:[{_type:'block',_key:'intro',style:'normal',markDefs:[],children:[{_type:'span',_key:'text',text:project.summary,marks:[]}]}]});
	}),
	...socialLinks.map((fields,order) => doc(`social-${fields.platform}`,'socialLink',{...fields,order})),
	...focusAreas.map((fields,order) => doc(`focus-${order}`,'focusArea',{...fields,order})),
	...education.map((fields,order) => doc(`education-${order}`,'education',{...fields,order})),
	...designPhilosophy.map((fields,order) => doc(`philosophy-${order}`,'philosophy',{...fields,order}))
];

console.log(`Target: ${env.PUBLIC_SANITY_PROJECT_ID || '(not configured)'}/${env.PUBLIC_SANITY_DATASET || 'production'}`);
console.log(`Prepared ${documents.length} DRAFT documents. External placeholder images are not imported. Nothing is published.`);
if (!process.argv.includes('--apply')) {
	console.log('Dry run only. Review the demo content, then use npm run sanity:seed -- --apply to create missing drafts.');
} else {
	if (!/^[a-z0-9-]+$/.test(env.PUBLIC_SANITY_PROJECT_ID ?? '') || !env.SANITY_API_WRITE_TOKEN) throw new Error('Set PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN in .env.local first.');
	const client = createClient({projectId:env.PUBLIC_SANITY_PROJECT_ID,dataset:env.PUBLIC_SANITY_DATASET || 'production',apiVersion:'2024-10-01',token:env.SANITY_API_WRITE_TOKEN,useCdn:false});
	const existing = await client.getDocuments(documents.flatMap(d => [d._id,d._id.replace(/^drafts\./,'')]));
	const missing = documents.filter((_, i) => !existing[i * 2] && !existing[i * 2 + 1]);
	if (missing.length) {
		const transaction = missing.reduce((tx, document) => tx.createIfNotExists(document), client.transaction());
		await transaction.commit();
	}
	console.log(`Created ${missing.length} drafts; existing drafts and published documents were preserved. Review and publish in Studio.`);
}
