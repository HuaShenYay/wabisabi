import { describe, expect, it } from 'vitest';
import { imageAspectRatio, mapArticleBody, safeLink } from '../src/lib/domain/content';

describe('published article content', () => {
	it('reserves the cropped image ratio, including portrait work', () => {
		const image = { _type: 'image', asset: { _ref: 'image-abc123-1200x1800-jpg' }, crop: { top: .1, bottom: .1, left: .2, right: .2 } };
		expect(imageAspectRatio(image)).toBeCloseTo(.5);
		const block = mapArticleBody([image], () => 'https://example.com/portrait.webp')[0];
		expect(block.type).toBe('image');
		if (block.type === 'image') expect(block.aspectRatio).toBeCloseTo(.5);
		expect(imageAspectRatio({ asset: { _ref: 'invalid' } })).toBeUndefined();
		expect(imageAspectRatio({ ...image, crop: { top: .5, bottom: .5, left: 0, right: 0 } })).toBeUndefined();
	});
	it('preserves inline emphasis and safe links without generating HTML', () => {
		const body = mapArticleBody([{ _type:'block', children:[{text:'文字',marks:['strong','em','link1']},{text:'<script>alert(1)</script>',marks:['link2']}], markDefs:[{_key:'link1',_type:'link',href:'https://example.com/read'},{_key:'link2',_type:'link',href:'javascript:alert(1)'}] }], () => null);
		expect(body).toEqual([{type:'paragraph',text:'文字<script>alert(1)</script>',content:[{text:'文字',strong:true,em:true,href:'https://example.com/read'},{text:'<script>alert(1)</script>',strong:false,em:false,href:undefined}]}]);
	});
	it('preserves heading levels, attributed quotes and image alt text', () => {
		const body = mapArticleBody([{_type:'block',style:'h3',children:[{text:'方法'}]},{_type:'quotation',text:'手记',cite:'作者'},{_type:'image',asset:{_ref:'photo'},alt:'湖边',caption:'图一'}], () => 'https://example.com/photo.webp');
		expect(body).toEqual([{type:'heading',text:'方法',level:3},{type:'quote',text:'手记',cite:'作者'},{type:'image',src:'https://example.com/photo.webp',alt:'湖边',caption:'图一'}]);
	});
	it('keeps empty content empty and omits invalid assets', () => {
		expect(mapArticleBody(null, () => null)).toEqual([]);
		expect(mapArticleBody([{_type:'image'},{_type:'unknown'},{_type:'block',children:[{text:' '}]}], () => null)).toEqual([]);
	});
	it('rejects unsafe navigation protocols', () => {
		for (const value of ['javascript:alert(1)','data:text/html,test','file:///etc/passwd','//evil.test',null]) expect(safeLink(value)).toBeUndefined();
		expect(safeLink('mailto:hello@example.com',true)).toBe('mailto:hello@example.com');
		expect(safeLink('mailto:hello@example.com')).toBeUndefined();
	});
});
