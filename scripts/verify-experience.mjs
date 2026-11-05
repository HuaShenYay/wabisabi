import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { useLocalResources } from './browser-fixtures.mjs';

// Run against a complete production preview; never rebuild while it is running.
const base = (process.env.WABI_TEST_URL ?? 'http://127.0.0.1:4173').replace(/\/$/, '');
const browser = await chromium.launch({ headless: true, executablePath: process.env.WABI_BROWSER_EXECUTABLE });
const errors = [];
const results = [];

try {
	const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
	await useLocalResources(context, base);
	await context.addInitScript(() => {
		window.__wabiFrames = 0;
		const request = window.requestAnimationFrame;
		window.requestAnimationFrame = callback => request.call(window, time => {
			window.__wabiFrames++;
			callback(time);
		});
	});
	const page = await context.newPage();
	page.on('pageerror', error => errors.push(error.message));
	const requireCheck = (name, condition) => {
		results.push({ name, passed: condition });
	};
	await page.goto(base, { waitUntil: 'networkidle' });
	await page.waitForTimeout(1600);
	requireCheck('Background uses responsive cached artwork', await page.locator('.wabi-scene picture source[type="image/avif"]').count() >= 2);
	requireCheck('Both scene layers load successfully', await page.locator('.scene-plane img').evaluateAll(nodes => nodes.every(node => node.complete && node.naturalWidth > 0)));
	requireCheck('Initial scene artwork loads successfully', await page.locator('.wabi-scene img').evaluateAll(nodes => nodes.length >= 2 && nodes.every(node => node.complete && node.naturalWidth > 0)));
	requireCheck('Night is deferred on initial home load', await page.locator('.night-photograph img').count() === 0);
	requireCheck('No WebGL canvas', await page.locator('canvas').count() === 0);
	requireCheck('No downloaded 3D models', await page.evaluate(() => !performance.getEntriesByType('resource').some(entry => /\/models\//.test(entry.name))));
	const frames = await page.evaluate(() => window.__wabiFrames);
	await page.waitForTimeout(800);
	requireCheck('No idle animation loop', await page.evaluate(start => window.__wabiFrames === start, frames));
	await page.locator('.work-link').hover();
	await page.waitForTimeout(1000);
	requireCheck('Ink lens expands without animating layout', await page.locator('.cursor-ring').evaluate(node => getComputedStyle(node).transitionProperty === 'opacity' && getComputedStyle(node, '::before').transform === 'matrix(1, 0, 0, 1, 0, 0)'));
	const cursorFrames = await page.evaluate(() => window.__wabiFrames);
	await page.waitForTimeout(300);
	requireCheck('Cursor stops rendering when pointer rests', await page.evaluate(start => window.__wabiFrames === start, cursorFrames));
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.locator('.mv-creed').scrollIntoViewIfNeeded();
	await page.waitForTimeout(200);
	requireCheck('Reduced motion still tracks scroll', await page.evaluate(() => Number(document.querySelector('.wabi-scene').dataset.progress) > 0.6));
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	await page.getByRole('link', { name: 'Project', exact: true }).first().click();
	await page.waitForURL(`${base}/projects`);
	await page.locator('.wabi-scene[data-view="projects"]').waitFor({ state: 'attached' });
	requireCheck('One main during navigation', await page.locator('#main-content').count() === 1);
	requireCheck('Night scene on the works index', await page.locator('.wabi-scene[data-view="projects"]').count() === 1);
	await page.locator('.category-entry[href="/projects/essay"]').first().click();
	await page.waitForURL(`${base}/projects/essay`);
	await page.locator('a[href^="/projects/essay/"]').first().click();
	await page.waitForURL(/\/projects\/essay\/[^/]+$/);
	await page.waitForTimeout(200);
	const articleUrl = page.url();
	requireCheck('Article has no full-screen scene', await page.locator('.world-backdrop').count() === 0);
	requireCheck('Article has no custom cursor', await page.locator('.cursor-ring').count() === 0);
	requireCheck('Article has static paper texture', await page.evaluate(() => getComputedStyle(document.body, '::before').animationName === 'none'));
	requireCheck('Article text has no reveal blur', await page.locator('.reading-page .reveal-hidden').count() === 0);
	await page.mouse.move(600, 400);
	requireCheck('Article uses native cursor', await page.evaluate(() => !document.documentElement.classList.contains('has-custom-cursor')));
	await page.goBack();
	await page.goBack();
	await page.getByRole('link', { name: 'About', exact: true }).click();
	await page.waitForURL(`${base}/`);
	requireCheck('Scene returns after back navigation', await page.locator('.wabi-scene .scene-plane').count() === 1);
	await page.setViewportSize({ width: 390, height: 844 });
	await page.waitForTimeout(250);
	requireCheck('Home fits a narrow viewport', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
	for (const width of [390, 1440]) {
		await page.setViewportSize({ width, height: 844 });
		await page.waitForTimeout(150);
		await page.locator('.mv-edu').evaluate(node => window.scrollTo({ top: node.getBoundingClientRect().top + scrollY, behavior: 'instant' }));
		await page.waitForTimeout(100);
		requireCheck(`Education stays on light paper at ${width}px`, await page.locator('.scene-night').evaluate(node => Number(getComputedStyle(node).opacity) < .05));
		await page.locator('.mv-creed').evaluate(node => window.scrollTo({ top: node.getBoundingClientRect().top + scrollY + innerHeight * .4, behavior: 'instant' }));
		await page.waitForTimeout(100);
		requireCheck(`Night follows the creed chapter at ${width}px`, await page.locator('.scene-night').evaluate(node => Number(getComputedStyle(node).opacity) > .95));
	}
	await page.setViewportSize({ width: 390, height: 844 });
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
	await page.waitForTimeout(150);
	const stillComposition = await page.locator('.scene-plane').first().evaluate(node => getComputedStyle(node).transform);
	await page.locator('.mv-edu').scrollIntoViewIfNeeded();
	await page.waitForTimeout(150);
	requireCheck('Reduced motion preserves a still mobile composition', await page.locator('.scene-plane').first().evaluate((node, initial) => getComputedStyle(node).transform === initial, stillComposition));
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	await page.goto(articleUrl, { waitUntil: 'networkidle' });
	requireCheck('Article fits a narrow viewport', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
	for (const width of [320, 600, 768, 900]) {
		await page.setViewportSize({ width, height: 844 });
		await page.goto(base, { waitUntil: 'networkidle' });
		await page.waitForTimeout(1500);
		requireCheck(`Home controls fit at ${width}px`, await page.locator('.work-link').evaluate(node => {
			const box = node.getBoundingClientRect();
			const title = node.querySelector('.work-cn');
			const titleBox = title.getBoundingClientRect();
			return box.left >= 0 && box.right <= innerWidth && titleBox.height < parseFloat(getComputedStyle(title).fontSize) * 1.8;
		}));
		if (width <= 768) {
			requireCheck(`About uses one column at ${width}px`, await page.locator('.preface').evaluate(node => getComputedStyle(node).gridTemplateColumns.split(' ').length === 1));
			requireCheck(`Mobile paragraphs do not wait for a reveal at ${width}px`, await page.locator('.preface-body').evaluate(node => getComputedStyle(node).opacity === '1' && getComputedStyle(node).clipPath === 'none'));
		}
		await page.goto(articleUrl, { waitUntil: 'networkidle' });
		await page.locator('.work-nav').scrollIntoViewIfNeeded();
		requireCheck(`Reading navigation fits at ${width}px`, await page.locator('.work-nav-inner').evaluate(node => [...node.children].every(child => {
			const box = child.getBoundingClientRect();
			return box.left >= 0 && box.right <= innerWidth;
		})));
	}
	const touchContext = await browser.newContext({ viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true });
	await useLocalResources(touchContext, base);
	const touchPage = await touchContext.newPage();
	await touchPage.goto(base, { waitUntil: 'networkidle' });
	requireCheck('Touch navigation has 44px targets', await touchPage.locator('.site-header .nav-link').evaluateAll(nodes => nodes.every(node => node.getBoundingClientRect().height >= 44)));
	await touchPage.goto(articleUrl, { waitUntil: 'networkidle' });
	requireCheck('Touch reading has no cursor or scene', await touchPage.locator('.cursor-ring, .world-backdrop').count() === 0);

	// The composition must remain visible without hydration or GPU support.
	const staticContext = await browser.newContext({ javaScriptEnabled: false });
	await useLocalResources(staticContext, base);
	const staticPage = await staticContext.newPage();
	await staticPage.goto(base, { waitUntil: 'domcontentloaded' });
	requireCheck('Artwork is present before JavaScript', await staticPage.locator('.scene-plane img').count() === 1);
	requireCheck('No browser exceptions', errors.length === 0);
	console.log(JSON.stringify({ results, errors }, null, 2));
	assert.ok(results.every(result => result.passed), 'Experience regressions detected');
} finally {
	await browser.close();
}
