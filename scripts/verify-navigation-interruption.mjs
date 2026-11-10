import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { useLocalResources } from './browser-fixtures.mjs';

const base = (process.env.WABI_TEST_URL ?? 'http://127.0.0.1:4173').replace(/\/$/, '');
const browser = await chromium.launch({ headless: true, executablePath: process.env.WABI_BROWSER_EXECUTABLE });
try {
	const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
	await useLocalResources(page.context(), base);
	for (let attempt = 0; attempt < 5; attempt++) {
		await page.goto(base, { waitUntil: 'networkidle' });
		await page.getByRole('link', { name: '作品', exact: true }).click();
		await page.waitForURL(`${base}/projects`);
		const historyLength = await page.evaluate(() => history.length);
		await page.goBack();
		await page.waitForURL(`${base}/`);
		await page.waitForFunction(() => document.querySelector('.hero-intro') && location.pathname === '/' && !document.documentElement.dataset.worldNavigation,
			undefined, { timeout: 5000 });
		assert.equal(await page.locator('main').count(), 1);
		assert.equal(await page.evaluate(() => history.length), historyLength, 'Recovery must not add a history entry');
	}
	console.log('5 immediate browser-back navigations restored the home content without adding history entries.');
} finally {
	await browser.close();
}
