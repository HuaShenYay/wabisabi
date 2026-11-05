import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { useLocalResources } from './browser-fixtures.mjs';

const base = (process.env.WABI_TEST_URL ?? 'http://127.0.0.1:4173').replace(/\/$/, '');
const browser = await chromium.launch({ headless: true, executablePath: process.env.WABI_BROWSER_EXECUTABLE });
const results = [];
try {
	for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
		const page = await browser.newPage({ viewport });
		await useLocalResources(page.context(), base);
		await page.addInitScript(() => {
			window.__wabiFrames = 0;
			window.__nativeFrame = requestAnimationFrame.bind(window);
			window.requestAnimationFrame = callback => window.__nativeFrame(time => { window.__wabiFrames++; callback(time); });
		});
		await page.goto(base, { waitUntil: 'networkidle' });
		await page.waitForTimeout(600);
		const initialFrames = await page.evaluate(() => window.__wabiFrames);
		await page.waitForTimeout(400);
		const idleFrames = await page.evaluate(start => window.__wabiFrames - start, initialFrames);
		results.push(await page.evaluate(async ({ viewport, idleFrames }) => {
			let styleWrites = 0;
			const observer = new MutationObserver(records => styleWrites += records.length);
			observer.observe(document.querySelector('.page-root'), { attributes: true, subtree: true, attributeFilter: ['style'] });
			const intervals = [];
			const max = document.documentElement.scrollHeight - innerHeight;
			let previous = performance.now();
			const start = previous;
			await new Promise(resolve => {
				function sample(now) {
					intervals.push(now - previous); previous = now;
					window.scrollTo({ top: Math.min(1, (now - start) / 1200) * max, behavior: 'instant' });
					if (now - start < 1200) window.__nativeFrame(sample); else resolve();
				}
				window.__nativeFrame(sample);
			});
			observer.disconnect(); intervals.sort((a,b) => a-b);
			return { viewport, idleFrames, styleWrites, p95FrameMs: intervals[Math.floor(intervals.length * .95)], sceneRequests: performance.getEntriesByType('resource').filter(r => /\/(landscape|models)\//.test(r.name)).length };
		}, { viewport, idleFrames }));
		await page.close();
	}
	console.log(JSON.stringify(results, null, 2));
	assert.ok(results.every(result => result.idleFrames === 0 && result.styleWrites === 0 && result.sceneRequests === 0), 'Static pages should not render scene loops or rewrite styles while scrolling');
} finally { await browser.close(); }
