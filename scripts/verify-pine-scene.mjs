import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { useLocalResources } from './browser-fixtures.mjs';

const base = (process.env.WABI_TEST_URL ?? 'http://127.0.0.1:4173').replace(/\/$/, '');
const browser = await chromium.launch({ headless: true, executablePath: process.env.WABI_BROWSER_EXECUTABLE });
const results = [];
const screenshots = process.env.WABI_SCREENSHOT_DIR;
if (screenshots) await mkdir(screenshots, { recursive: true });
const errors = [];
const check = (name, passed) => results.push({ name, passed });
try {
	const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
	await useLocalResources(context, base);
	const page = await context.newPage();
	page.on('pageerror', error => errors.push(error.message));
	await page.goto(base, { waitUntil: 'networkidle' });
	check('Initial home does not download the night plate', await page.evaluate(() => !performance.getEntriesByType('resource').some(r => r.name.includes('/pine-night'))));
	check('Scene assets decode successfully', await page.locator('.wabi-scene img').evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0)));
	await page.waitForFunction(() => document.querySelector('.wabi-scene')?.dataset.wind === 'settled', undefined, { timeout: 10000 });
	check('Ambient motion finishes and releases animations', await page.locator('.wabi-scene').evaluate(node => node.getAnimations({ subtree: true }).length === 0));
	if (screenshots) await page.screenshot({ path: `${screenshots}/home-1440.png` });
	await page.evaluate(() => window.scrollTo({ top: innerHeight * .8, behavior: 'instant' }));
	await page.waitForTimeout(100);
	check('Foreground moves more than middle and far ground', await page.evaluate(() => {
		const y = selector => Math.abs(new DOMMatrix(getComputedStyle(document.querySelector(selector)).transform).m42);
		return y('.scene-foreground') > y('.scene-day') && y('.scene-day') > y('.scene-distance') && y('.scene-distance') > 0;
	}));
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.waitForFunction(() => document.querySelector('.wabi-scene')?.dataset.wind === 'settled', undefined, { timeout: 1000 });
	check('Motion preference stops ambient animations', await page.locator('.wabi-scene').evaluate(node => node.getAnimations({ subtree: true }).length === 0));
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	await page.locator('.mv-edu').scrollIntoViewIfNeeded();
	await page.waitForTimeout(150);
	check('Night is prepared before the night chapter', await page.locator('.night-photograph img').count() === 1);
	await page.locator('.mv-creed').scrollIntoViewIfNeeded();
	await page.evaluate(() => {
		Object.defineProperty(document, 'hidden', { configurable: true, value: true });
		document.dispatchEvent(new Event('visibilitychange'));
	});
	check('Hidden document stops scene motion', await page.locator('.wabi-scene').evaluate(node => node.getAnimations({ subtree: true }).length === 0));
	await page.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });
	await page.goto(`${base}/projects`, { waitUntil: 'networkidle' });
	check('Direct Project loads only its own photographic scene', await page.evaluate(() => {
		const urls = performance.getEntriesByType('resource').map(r => r.name);
		return urls.some(url => url.includes('/pine-night')) && !urls.some(url => url.includes('/pine-day'));
	}));
	check('Night scene is ready on direct entry', await page.locator('.scene-night').evaluate(node => node.dataset.ready === 'true' && getComputedStyle(node).opacity === '1'));
	if (screenshots) await page.screenshot({ path: `${screenshots}/projects-1440.png` });
	for (const width of [320, 390, 768]) {
		await page.setViewportSize({ width, height: 844 });
		await page.goto(base, { waitUntil: 'networkidle' });
		check(`Portrait asset selected at ${width}px`, await page.locator('.scene-day img').evaluate(img => img.currentSrc.includes('pine-day-mobile.')));
		check(`No horizontal overflow at ${width}px`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
		check(`Headline and action do not overlap at ${width}px`, await page.evaluate(() => document.querySelector('.hero-copy').getBoundingClientRect().bottom < document.querySelector('.hero-actions').getBoundingClientRect().top));
		if (screenshots && width === 390) await page.screenshot({ path: `${screenshots}/home-390.png` });
	}
	await page.setViewportSize({ width: 844, height: 390 });
	await page.goto(base, { waitUntil: 'networkidle' });
	check('Short landscape viewport allows natural page height', await page.locator('.hero-intro').evaluate(node => node.scrollHeight >= 700));
	const fallback = await context.newPage();
	await fallback.route('**/landscape/pine-*', route => route.abort());
	await fallback.goto(base, { waitUntil: 'networkidle' });
	check('Failed image keeps readable static composition', await fallback.locator('.wabi-scene').evaluate(node => node.dataset.day === 'fallback'));
	check('Failed image keeps navigation and content available', await fallback.getByRole('heading', { level: 1 }).isVisible() && await fallback.locator('.work-link').isVisible());
	check('No browser exceptions', errors.length === 0);
	console.log(JSON.stringify({ results, errors }, null, 2));
	assert.ok(results.every(r => r.passed), 'Pine landscape regressions detected');
} finally { await browser.close(); }
