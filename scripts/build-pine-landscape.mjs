import sharp from 'sharp';
import { mkdir, stat } from 'node:fs/promises';

const input = new URL('../artwork/landscape/', import.meta.url);
const output = new URL('../static/landscape/', import.meta.url);
await mkdir(output, { recursive: true });
const files = [];
for (const name of ['pine-day', 'pine-night', 'pine-trunk', 'pine-bough']) {
	for (const mobile of [false, true]) {
		const photographic = name === 'pine-day' || name === 'pine-night';
		const portrait = name === 'pine-trunk' || (mobile && photographic);
		// Day and dusk share the supplied landscape; the scene composes the dusk lighting.
		const sourceName = photographic ? `pine-day${mobile ? '-mobile' : ''}` : name;
		const source = new URL(`${sourceName}.png`, input);
		if (!photographic && !(await sharp(source.pathname).metadata()).hasAlpha) {
			throw new Error(`${sourceName} must have real alpha transparency, not a drawn checkerboard`);
		}
		const width = name === 'pine-bough' ? (mobile ? 360 : 600) : mobile ? (name === 'pine-trunk' ? 320 : 780) : (portrait ? 720 : 1536);
		const height = portrait ? Math.round(width * 1.5) : Math.round(width / 1.5);
		for (const format of ['avif', 'webp']) {
			const destination = new URL(`${name}${mobile ? '-mobile' : ''}.${format}`, output);
			await sharp(source.pathname).resize(width, height, { fit: 'inside', withoutEnlargement: true })
				.toFormat(format, { quality: format === 'avif' ? 55 : 76, effort: format === 'avif' ? 6 : 5 }).toFile(destination.pathname);
			files.push({ name: destination.pathname.split('/').pop(), bytes: (await stat(destination)).size });
		}
	}
}
console.table(files);
for (const format of ['avif', 'webp']) {
	for (const mobile of [false, true]) {
		const suffix = `${mobile ? '-mobile' : ''}.${format}`;
		const bytes = files.filter(f => ['pine-day', 'pine-trunk', 'pine-bough'].some(n => f.name === `${n}${suffix}`)).reduce((sum, f) => sum + f.bytes, 0);
		if (bytes > (mobile ? 500_000 : 1_000_000)) throw new Error(`First-scene ${suffix} exceeds budget: ${bytes}`);
	}
}
