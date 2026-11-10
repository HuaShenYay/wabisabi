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
	check('Language choices are tucked away initially', !(await page.locator('.language-switch').evaluate(node => node.open)) && !(await page.getByRole('link', { name: '切换为英文', exact: true }).isVisible()));
	await page.locator('.language-switch summary').click();
	await page.getByRole('link', { name: '切换为英文', exact: true }).click();
	await page.waitForLoadState('networkidle');
	check('Flag changes the actual page language', await page.locator('html').getAttribute('lang') === 'en' && (await page.locator('h1').innerText()).includes('Make it real'));
	check('Switch keeps the current query without leaving a language parameter', page.url() === `${base}/?ref=language-check`);
	check('Selected language is marked accessibly', await page.locator('.language-link[aria-current]').getAttribute('hreflang') === 'en');
	await page.reload({ waitUntil: 'networkidle' });
	check('Preference survives reload', await page.locator('html').getAttribute('lang') === 'en');
	await page.getByRole('link', { name: 'Works', exact: true }).click();
	await page.waitForURL(`${base}/projects`);
	check('Preference survives client navigation', await page.locator('h1').innerText() === 'Works');
	for (const width of [1440, 390, 320]) {
		await page.setViewportSize({ width, height: 844 });
		for (const path of ['/', '/about', '/projects', '/projects/photograph', '/projects/digital-humanities', '/copyright', '/missing-page']) {
			await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
			check(`English ${path} fits ${width}px`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
			if (path === '/') {
				check(`English headline stays inside the viewport at ${width}px`, await page.locator('.hero-line').evaluateAll(lines => lines.every(line => {
					const range = document.createRange();
					range.selectNodeContents(line);
					const bounds = range.getBoundingClientRect();
					return bounds.left >= 0 && bounds.right <= innerWidth;
				})));
			}
			check(`Language trigger remains usable on ${path} at ${width}px`, await page.locator('.language-switch summary').evaluate(node => node.getBoundingClientRect().width >= 44 && node.getBoundingClientRect().height >= 44));
			await page.locator('.language-switch summary').click();
			check(`Language choices remain usable on ${path} at ${width}px`, await page.locator('.language-link').evaluateAll(nodes => nodes.length === 2 && nodes.every(n => n.getBoundingClientRect().width >= 44 && n.getBoundingClientRect().height >= 44 && n.getBoundingClientRect().left >= 0 && n.getBoundingClientRect().right <= innerWidth)));
			await page.keyboard.press('Escape');
			check(`Escape closes language choices on ${path} at ${width}px`, !(await page.locator('.language-switch').evaluate(node => node.open)));
		}
	}
	await page.goto(base, { waitUntil: 'networkidle' });
	await page.locator('.latest-link').click();
	await page.waitForURL(/\/projects\/[^/]+\/[^/]+$/);
	check('The English article includes body text in English', /[A-Za-z]/.test(await page.locator('.body-flow').innerText()) && !/\p{Script=Han}/u.test(await page.locator('.body-flow').innerText()));
	const independent = await browser.newContext({ javaScriptEnabled: false });
	await useLocalResources(independent, base);
	const staticPage = await independent.newPage();
	await staticPage.goto(`${base}/projects`, { waitUntil: 'networkidle' });
	check('One visitor does not change another visitor’s language', await staticPage.locator('h1').innerText() === '作品');
	await page.locator('.language-switch summary').click();
	await page.getByRole('link', { name: 'Switch to Chinese', exact: true }).click();
	await page.waitForLoadState('networkidle');
	check('Chinese can be restored on the same article', await page.locator('html').getAttribute('lang') === 'zh-CN' && /\/projects\/[^/]+\/[^/]+$/.test(page.url()));
	await staticPage.locator('.language-switch summary').click();
	await staticPage.getByRole('link', { name: '切换为英文', exact: true }).click();
	await staticPage.waitForLoadState('networkidle');
	check('Language switching also works without JavaScript', await staticPage.locator('html').getAttribute('lang') === 'en' && await staticPage.locator('h1').innerText() === 'Works');
	const response = await independent.request.get(`${base}/about`);
	check('Server returns English directly with cookie-aware caching', response.headers()['content-language'] === 'en' && /cookie/i.test(response.headers()['vary']) && (await response.text()).includes('<html lang="en">'));
	// Chinese navigation and interface are localized. Published work copy keeps the author's language.
	const categories = ['/projects/literature', '/projects/photograph', '/projects/essay', '/projects/websites', '/projects/digital-humanities'];
	const works = new Set();
	for (const path of categories) {
		await page.goto(`${base}${path}`);
		for (const href of await page.locator('.vol-content a[href^="/projects/"]').evaluateAll(links => links.map(link => link.getAttribute('href')))) {
			if (href.split('/').length === 4) works.add(href);
		}
	}
	await page.setViewportSize({ width: 390, height: 844 });
	for (const locale of ['zh', 'en']) {
		await page.goto(`${base}/?lang=${locale}`);
		const wrongScript = locale === 'zh' ? /\p{Script=Latin}/u : /\p{Script=Han}/u;
		for (const path of ['/', '/about', '/projects', ...categories, ...works, '/copyright', '/missing-page']) {
			const response = await page.goto(`${base}${path}`);
			check(`${locale} ${path} returns the expected status`, response.status() === (path === '/missing-page' ? 404 : 200));
			await page.locator('.language-switch summary').click();
			const copy = await page.evaluate(({ locale, article }) => {
				const preserveSource = locale === 'zh';
				const workCopy = '.latest-copy h3, .latest-summary, .catalog-main h2, .work-caption h2, .work-summary, .work-title, .work-spec dd:not(:has(a)), .body-flow, .work-nav-title, .artwork';
				const isWorkCopy = el => preserveSource && el?.closest(workCopy);
				const text = [];
				const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
				for (let node = walker.nextNode(); node; node = walker.nextNode()) {
					const el = node.parentElement;
					if (!isWorkCopy(el) && !el?.closest('script, style, noscript')) text.push(node.textContent);
				}
				if (!preserveSource || !article) text.push(document.title);
				const elements = document.querySelectorAll('[aria-label], img[alt], meta[name="description"], meta[name="author"], meta[name="keywords"], meta[property="og:site_name"]');
				for (const el of elements) {
					if (isWorkCopy(el) || (preserveSource && article && el.matches('meta[name="description"]'))) continue;
					text.push(el.getAttribute('aria-label') ?? el.getAttribute('alt') ?? el.getAttribute('content') ?? '');
				}
				return text.join('\n');
			}, { locale, article: works.has(path) });
			const mixed = copy.split('\n').filter(line => wrongScript.test(line));
			check(`${locale} ${path} has correctly localized copy: ${mixed.join(' | ')}`, mixed.length === 0);
			await page.locator('.language-switch summary').click();
		}
	}
	check('No browser exceptions', errors.length === 0);
	console.log(JSON.stringify({ passed: results.length, results, errors }, null, 2));
} finally {
	await browser.close();
}
