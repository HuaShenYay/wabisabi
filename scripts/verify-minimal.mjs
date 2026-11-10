import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { useLocalResources } from './browser-fixtures.mjs';

const base = (process.env.WABI_TEST_URL ?? 'http://127.0.0.1:4173').replace(/\/$/, '');
const screenshots = process.env.WABI_SCREENSHOT_DIR;
if (screenshots) await mkdir(screenshots, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.WABI_BROWSER_EXECUTABLE });
const results = [], errors = [];
const check = (name, passed) => results.push({ name, passed: Boolean(passed) });
const categories = [
	['literature', '文学艺术'], ['photograph', '摄影映像'], ['essay', '知识杂文'],
	['websites', '网站'], ['digital-humanities', '数字人文']
];
try {
	const context = await browser.newContext();
	await useLocalResources(context, base);
	const page = await context.newPage();
	page.on('pageerror', error => errors.push(error.message));
	const fits = () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
	const shell = async () => await page.locator('main').count() === 1
		&& await page.locator('.site-header').count() === 1 && await page.locator('.site-footer').count() === 1;
	for (const width of [1440, 390, 320]) {
		await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
		await page.goto(base, { waitUntil: 'networkidle' });
		check(`Home has one shared header, main and footer at ${width}px`, await shell());
		check(`Home fits ${width}px`, await fits());
		check(`Home headline and actions remain separate at ${width}px`, await page.evaluate(() => document.querySelector('h1').getBoundingClientRect().bottom < document.querySelector('.hero-actions').getBoundingClientRect().top));
		check(`No decorative scene or custom cursor at ${width}px`, await page.locator('canvas, .wabi-scene, .world-backdrop, .cursor-ring, .interval-section').count() === 0);
		check(`Home never downloads scene assets at ${width}px`, await page.evaluate(() => !performance.getEntriesByType('resource').some(r => /\/(landscape|models)\//.test(r.name))));
		check(`Display font and simple works link remain readable at ${width}px`, await page.locator('h1').evaluate(node => getComputedStyle(node).fontFamily.includes('KingHwa'))
			&& await page.locator('.work-link').evaluate(node => getComputedStyle(node, '::before').maskImage === 'none' && node.getBoundingClientRect().height >= 44));
		check(`Navigation follows Project then About at ${width}px`, (await page.locator('.site-header nav a').allTextContents()).join(',') === '作品,关于');
		const recent = page.locator('.latest-work');
		check(`Only one recent work follows the introduction at ${width}px`, await recent.count() === 1 && await recent.locator('article').count() === 1
			&& await recent.evaluate(node => node.getBoundingClientRect().top >= document.querySelector('.hero-intro').getBoundingClientRect().bottom));
		await page.locator('.latest-link').click();
		await page.waitForURL(/\/projects\/[^/]+\/[^/]+$/);
		check(`Recent work opens its full article at ${width}px`, await page.locator('.body-flow').count() === 1 && await fits());
		await page.goto(base, { waitUntil: 'networkidle' });
		if (screenshots && width !== 320) await page.screenshot({ path: `${screenshots}/home-${width}.png` });
		await page.getByRole('link', { name: '作品', exact: true }).click();
		await page.waitForURL(`${base}/projects`);
		check(`Works index and all five categories fit ${width}px`, await fits() && await page.locator('.category-entry').count() === 5);
		check(`Works rows have 44px touch targets at ${width}px`, await page.locator('.category-entry').evaluateAll(nodes => nodes.every(node => node.getBoundingClientRect().height >= 44)));
		if (screenshots && width !== 320) await page.screenshot({ path: `${screenshots}/projects-${width}.png` });
		for (const [slug, title] of categories) {
			await page.locator(`${slug === 'literature' ? '.category-entries' : '.volume-switcher'} a[href='/projects/${slug}']`).click();
			await page.waitForURL(`${base}/projects/${slug}`);
			check(`${slug} updates its heading and shared shell at ${width}px`, await page.locator('h1').innerText() === title && await shell());
			check(`${slug} content fits ${width}px`, await fits());
			check(`${slug} navigation is accessible at ${width}px`, await page.locator('.volume-switcher a').evaluateAll(nodes => nodes.length === 5 && nodes.filter(n => n.getAttribute('aria-current') === 'page').length === 1 && nodes.every(n => n.getBoundingClientRect().height >= 44)));
			if (screenshots && width !== 320) await page.screenshot({ path: `${screenshots}/${slug}-${width}.png` });
			if (slug === 'literature') {
				await page.locator(`.vol-content a[href^='/projects/${slug}/']`).first().click();
				await page.waitForURL(/\/projects\/literature\/[^/]+$/);
				check(`Article remains readable at ${width}px`, await shell() && await fits() && (await page.locator('.body-flow').innerText()).trim().length > 0);
				check(`Article has no background scene or reveal at ${width}px`, await page.locator('.world-backdrop, .cursor-ring, .reveal-hidden').count() === 0);
				if (screenshots && width !== 320) await page.screenshot({ path: `${screenshots}/article-${width}.png` });
				await page.goBack();
				await page.waitForURL(`${base}/projects/literature`);
			}
		}
	}
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto(base, { waitUntil: 'networkidle' });
	check('Reduced-motion home has no running animations', await page.evaluate(() => document.getAnimations().every(animation => animation.playState !== 'running')));
	await page.keyboard.press('Tab');
	check('Keyboard skip link is available', await page.evaluate(() => document.activeElement?.getAttribute('href') === '#main-content'));
	await page.goto(`${base}/copyright`, { waitUntil: 'networkidle' });
	check('Copyright fits and uses one shared shell', await fits() && await shell());
	await page.goto(`${base}/about`, { waitUntil: 'networkidle' });
	check('About uses continuous paper without section overlays', await fits() && await page.locator('.note-section, .contact-inner').evaluateAll(nodes => nodes.length >= 4 && nodes.every(node => getComputedStyle(node).backgroundColor === 'rgba(0, 0, 0, 0)')));
	const response = await page.goto(`${base}/missing-page`, { waitUntil: 'networkidle' });
	check('404 remains usable with one shared shell', response.status() === 404 && await shell() && await page.getByRole('link', { name: '返回首页', exact: true }).isVisible());
	const noJs = await browser.newContext({ javaScriptEnabled: false });
	await useLocalResources(noJs, base);
	const staticPage = await noJs.newPage();
	await staticPage.goto(base, { waitUntil: 'networkidle' });
	check('Home content and works link render without JavaScript', await staticPage.locator('h1').isVisible() && await staticPage.locator('.work-link').isVisible());
	check('No browser exceptions', errors.length === 0);
	console.log(JSON.stringify({ results, errors }, null, 2));
	assert.ok(results.every(result => result.passed), 'Minimal design regressions detected');
} finally {
	await browser.close();
}
