/** Copy the existing home-page content into missing CMS documents only. */
import { getCliClient } from 'sanity/cli';
import { profile } from '../src/lib/domain/profile.ts';
import { socialLinks } from '../src/lib/domain/social.ts';
import { focusAreas, education, designPhilosophy } from '../src/lib/domain/portfolio.ts';
import { siteConfig } from '../src/lib/config/site.ts';

const document = (_id, _type, fields) => ({ _id, _type, ...fields });
const { ogImage, pages, ...settings } = siteConfig;
const documents = [
	document('profile', 'profile', profile),
	document('siteSettings', 'siteSettings', settings),
	...socialLinks.map((fields, order) => document(`social-${fields.platform}`, 'socialLink', { ...fields, order })),
	...focusAreas.map((fields, order) => document(`focus-${order}`, 'focusArea', { ...fields, order })),
	...education.map((fields, order) => document(`education-${order}`, 'education', { ...fields, order })),
	...designPhilosophy.map((fields, order) => document(`philosophy-${order}`, 'philosophy', { ...fields, order }))
];

const client = getCliClient({ apiVersion: '2024-10-01' }).withConfig({ useCdn: false, perspective: 'raw' });
const config = client.config();
if (config.projectId !== 'y6sc85uh' || config.dataset !== 'production') {
	throw new Error('This site-content import is restricted to y6sc85uh/production.');
}
const existing = await client.fetch('*[_type in $types]{_id,_type}', { types: [...new Set(documents.map(d => d._type))] });
const missing = documents.filter(d =>
	!existing.some(e => e._id === d._id || e._id === `drafts.${d._id}` || (e._type === d._type && !['profile', 'siteSettings'].includes(d._type)))
);
console.log(`Target: ${config.projectId}/${config.dataset}`);
console.log(`Existing site documents: ${existing.length}. Missing documents: ${missing.length}.`);
console.log(missing.map(d => `${d._type}: ${d._id}`).join('\n'));
if (!process.argv.includes('--apply')) {
	console.log('Read-only plan. --apply copies the currently displayed home-page content; existing documents are preserved.');
} else {
	if (missing.length) {
		await missing.reduce((tx, d) => tx.createIfNotExists(d), client.transaction()).commit();
	}
	console.log(`Created ${missing.length} published site documents. Post, Author and Category were not changed.`);
}
