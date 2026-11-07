import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { useLocalResources } from './browser-fixtures.mjs';

const base = (process.env.WABI_TEST_URL ?? 'http://127.0.0.1:4173').replace(/\/$/, '');
const browser = await chromium.launch({ headless: true, executablePath: process.env.WABI_BROWSER_EXECUTABLE });
const results = [];
const check = (name, value) => { results.push({ name, passed: Boolean(value) }); assert.ok(value, name); };
try {
	const context = await browser.newContext();
	await useLocalResources(context, base);
	const page = await context.newPage();
	const errors = [];
	page.on('pageerror', error => errors.push(error.message));
	await page.goto(`${base}/?ref=language-check`, { waitUntil: 'networkidle' });
	check('Default language is Chinese', await page.locator('html').getAttribute('lang') === 'zh-CN');
	check('Home no longer shows status or location', !/劳累啊|上海/.test(await page.locator('.hero-intro').innerText()));
	await page.getByRole('link', { name: 'Switch to English', exact: true }).click();
	await page.waitForLoadState('networkidle');
	check('Flag changes the actual page language', await page.locator('html').getAttribute('lang') === 'en' && (await page.locator('h1').innerText()).includes('poetry'));
	check('Switch keeps the current query without leaving a language parameter', page.url() === `${base}/?ref=language-check`);
	check('Selected language is marked accessibly', await page.locator('.language-link[aria-current]').getAttribute('lang') === 'en');
	await page.reload({ waitUntil: 'networkidle' });
	check('Preference survives reload', await page.locator('html').getAttribute('lang') === 'en');
	await page.getByRole('link', { name: 'Project', exact: true }).click();
	await page.waitForURL(`${base}/projects`);
	check('Preference survives client navigation', await page.locator('h1').innerText() === 'Works');
	for (const width of [1440, 390, 320]) {
		await page.setViewportSize({ width, height: 844 });
		for (const path of ['/', '/about', '/projects', '/projects/photograph', '/projects/digital-humanities', '/copyright', '/missing-page']) {
			await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
			check(`English ${path} fits ${width}px`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
			check(`Language controls remain usable on ${path} at ${width}px`, await page.locator('.language-link').evaluateAll(nodes => nodes.length === 2 && nodes.every(n => n.getBoundingClientRect().width >= 44 && n.getBoundingClientRect().height >= 44)));
		}
	}
	await page.goto(base, { waitUntil: 'networkidle' });
	await page.locator('.latest-link').click();
	await page.waitForURL(/\/projects\/[^/]+\/[^/]+$/);
	check('Article labels are translated while the work remains in its original language', await page.locator('.original-language-note').isVisible() && await page.locator('.body-flow').getAttribute('lang') === 'zh-CN');
	const independent = await browser.newContext({ javaScriptEnabled: false });
	await useLocalResources(independent, base);
	const staticPage = await independent.newPage();
	await staticPage.goto(`${base}/projects`, { waitUntil: 'networkidle' });
	check('One visitor does not change another visitor’s language', await staticPage.locator('h1').innerText() === '作品');
	await page.getByRole('link', { name: '切换为中文', exact: true }).click();
	await page.waitForLoadState('networkidle');
	check('Chinese can be restored on the same article', await page.locator('html').getAttribute('lang') === 'zh-CN' && /\/projects\/[^/]+\/[^/]+$/.test(page.url()));
	await staticPage.getByRole('link', { name: 'Switch to English', exact: true }).click();
	await staticPage.waitForLoadState('networkidle');
	check('Language switching also works without JavaScript', await staticPage.locator('html').getAttribute('lang') === 'en' && await staticPage.locator('h1').innerText() === 'Works');
	const response = await independent.request.get(`${base}/about`);
	check('Server returns English directly with cookie-aware caching', response.headers()['content-language'] === 'en' && /cookie/i.test(response.headers()['vary']) && (await response.text()).includes('<html lang="en">'));
	check('No browser exceptions', errors.length === 0);
	console.log(JSON.stringify({ passed: results.length, results, errors }, null, 2));
} finally {
	await browser.close();
}
