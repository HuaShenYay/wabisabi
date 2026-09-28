import { describe, expect, it, vi } from 'vitest';
vi.mock('$env/dynamic/public', () => ({ env: { PUBLIC_SANITY_PROJECT_ID:'test1234', PUBLIC_SANITY_DATASET:'production' } }));
vi.mock('$env/dynamic/private', () => ({ env: { SANITY_API_READ_TOKEN:'test-only-private-token' } }));
import { getSanityClient, sanityImageUrl } from '../src/lib/server/sanity';

describe('Sanity infrastructure', () => {
	it('reads only published documents with a server-side token and bounded timeout', () => {
		expect(getSanityClient().config()).toMatchObject({ perspective:'published',token:'test-only-private-token',useCdn:false,timeout:8000 });
	});
	it('honors editor cropping and negotiates a modern image format', () => {
		const url = sanityImageUrl({asset:{_ref:'image-abcdef1234567890-1200x800-jpg'},crop:{top:0,bottom:0,left:.2,right:0},hotspot:{x:.75,y:.5,width:.2,height:.5}}, {w:600,h:800,fit:'crop'});
		expect(url).toContain('cdn.sanity.io/images/test1234/production/');
		expect(url).toContain('rect=');
		expect(url).toContain('auto=format');
		expect(url).not.toContain('token');
	});
	it('does not produce broken URLs for missing assets', () => {
		expect(sanityImageUrl(null)).toBeNull();
		expect(sanityImageUrl({asset:{_ref:'not-an-image'}})).toBeNull();
	});
});
