import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { serializeJsonLd } from '../src/lib/services/seo';

describe('safe, readable presentation', () => {
	it('serializes CMS text without allowing a JSON-LD script breakout', () => {
		const content = { '@type': 'Person', name: '</script><script>alert(1)</script>', description: '纸\u2028墨\u2029山' };
		const json = serializeJsonLd(content);
		expect(json).not.toContain('<');
		expect(JSON.parse(json)).toEqual(content);
	});

	it('keeps primary and secondary text above AA contrast on every paper surface', () => {
		const css = readFileSync(new URL('../src/app.css', import.meta.url), 'utf8');
		const tokens = new Map([...css.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(match => [match[1], match[2].trim()]));
		const resolve = (key: string): string => {
			const value = tokens.get(key)!;
			const reference = value.match(/^var\((--[\w-]+)\)$/);
			return reference ? resolve(reference[1]) : value;
		};
		const luminance = (hex: string) => {
			const channels = hex.slice(1).match(/../g)!.map(value => parseInt(value, 16) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
			return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
		};
		for (const ink of ['--color-text', '--color-text-muted']) {
			for (const paper of ['--color-bg', '--color-bg-alt', '--color-bg-deep']) {
				const contrast = (luminance(resolve(paper)) + .05) / (luminance(resolve(ink)) + .05);
				expect(contrast, `${ink} on ${paper}`).toBeGreaterThanOrEqual(4.5);
			}
		}
	});
});
