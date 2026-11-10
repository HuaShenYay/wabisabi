import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { useLocalResources } from './browser-fixtures.mjs';

const base = (process.env.WABI_TEST_URL ?? 'http://127.0.0.1:4173').replace(/\/$/, '');
const screenshots = process.env.WABI_SCREENSHOT_DIR;
if (screenshots) await mkdir(screenshots, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.WABI_BROWSER_EXECUTABLE });
const results = [];
const errors = [];
const check = (name, condition) => results.push({ name, passed: Boolean(condition) });
const volumes = [
	['literature', '文学艺术'], ['photograph', '摄影映像'], ['essay', '知识杂文'],
	['websites', '网站'], ['digital-humanities', '数字人文']
];
try {
	const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
	await useLocalResources(page.context(), base);
	page.on('pageerror', e => errors.push(e.message));
	await page.addInitScript(() => {
		window.__turns = [];
		const start = document.startViewTransition.bind(document);
		document.startViewTransition = callback => {
			const record = { direction: document.documentElement.dataset.worldNavigation, ready: false, settled: false, animations: [] };
			window.__turns.push(record);
			const transition = start(callback);
			transition.ready.then(() => {
				record.ready = true;
				record.animations = document.getAnimations().map(a => a.animationName).filter(Boolean);
			}).catch(e => record.error = e.message);
			transition.finished.then(() => record.settled = true, () => record.settled = true);
			return transition;
		};
	});
	await page.goto(base, { waitUntil: 'networkidle' });
	await page.getByRole('link', { name: '作品', exact: true }).click();
	await page.waitForURL(`${base}/projects`);
	await page.waitForFunction(() => window.__turns.length > 0 && window.__turns.every(turn => turn.settled));
	check('Project enters with a horizontal dissolve', await page.evaluate(() => window.__turns[0].direction === 'forward' && ['folio-in', 'folio-out'].every(name => window.__turns[0].animations.includes(name))));
	check('Only one main and five volume entries', await page.locator('main').count() === 1 && await page.locator('.category-entry').count() === 5);
	await page.getByRole('link', { name: '关于', exact: true }).click();
	await page.waitForURL(`${base}/`);
	await page.waitForFunction(() => window.__turns.length === 2 && window.__turns.every(turn => turn.settled));
	check('Return to About reverses the horizontal turn', await page.evaluate(() => window.__turns[1].direction === 'backward'));
	check('Transition state is released', await page.evaluate(() => !document.documentElement.dataset.worldNavigation));
	await page.getByRole('link', { name: '作品', exact: true }).click();
	await page.waitForURL(`${base}/projects`);
	await page.goBack();
	await page.waitForURL(`${base}/`);
	await page.waitForFunction(() => !document.documentElement.dataset.worldNavigation && document.querySelector('.wabi-scene')?.dataset.view === 'home');
	check('Rapid browser back leaves one composed home scene', await page.locator('main').count() === 1 && await page.locator('.wabi-scene').count() === 1);
	await page.getByRole('link', { name: '作品', exact: true }).click();
	await page.waitForURL(`${base}/projects`);
	await page.waitForFunction(() => window.__turns.every(turn => turn.settled));

	for (const width of [1440, 390, 320]) {
		await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
		await page.goto(`${base}/projects`, { waitUntil: 'networkidle' });
		check(`Index fits ${width}px`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
		check(`All index rows have full touch targets at ${width}px`, await page.locator('.category-entry').evaluateAll(nodes => nodes.every(node => node.getBoundingClientRect().height >= 44)));
		if (screenshots && width !== 320) await page.screenshot({ path: `${screenshots}/projects-${width}.png` });
		for (const [slug, title] of volumes) {
			if (slug === 'literature') await page.locator(`.category-entry[href='/projects/${slug}']`).click();
			else {
				// Return from the footer to the visible volume switcher before clicking.
				await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
				await page.locator(`.volume-switcher a[href='/projects/${slug}']`).click();
			}
			await page.waitForURL(`${base}/projects/${slug}`);
			await page.waitForFunction(title => document.querySelector('h1')?.textContent === title, title);
			check(`${slug} title and active navigation update at ${width}px`, await page.locator('.volume-switcher a[aria-current="page"]').innerText().then(text => text.includes(title)));
			check(`${slug} layout fits ${width}px`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
			await page.locator('.vol-nav').scrollIntoViewIfNeeded();
			check(`${slug} previous/next links fit ${width}px`, await page.locator('.vol-nav a').evaluateAll(nodes => nodes.every(node => { const b = node.getBoundingClientRect(); return b.left >= 0 && b.right <= innerWidth && b.height >= 44; })));
			if (screenshots && width !== 320) {
				await page.waitForFunction(() => [...document.querySelectorAll('.artwork img')].every(img => img.complete), undefined, { timeout: 10000 }).catch(() => {});
				await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
				await page.screenshot({ path: `${screenshots}/${slug}-${width}.png` });
				await page.locator('.vol-works').evaluate(node => window.scrollTo({ top: node.getBoundingClientRect().top + scrollY - 40, behavior: 'instant' }));
				await page.screenshot({ path: `${screenshots}/${slug}-${width}-works.png` });
			}
		}
	}
	check('Category changes never create a full-screen transition', await page.evaluate(() => window.__turns.length === 0));

	for (const mode of ['reduced', 'unsupported']) {
		const fallback = await browser.newPage({ reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference' });
		await useLocalResources(fallback.context(), base);
		if (mode === 'unsupported') await fallback.addInitScript(() => document.startViewTransition = undefined);
		fallback.on('pageerror', e => errors.push(e.message));
		await fallback.goto(base, { waitUntil: 'networkidle' });
		await fallback.getByRole('link', { name: '作品', exact: true }).click();
		await fallback.waitForURL(`${base}/projects`);
		check(`${mode} motion navigates immediately without an overlay`, await fallback.locator('.category-entry').count() === 5 && await fallback.evaluate(() => !document.documentElement.dataset.worldNavigation));
		await fallback.close();
	}
	check('No browser exceptions', errors.length === 0);
	console.log(JSON.stringify({ results, errors }, null, 2));
	assert.ok(results.every(result => result.passed), 'Archive experience regressions detected');
} finally {
	await browser.close();
}
