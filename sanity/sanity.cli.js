/**
 * Sanity CLI Configuration
 *
 * Optional CLI configuration. Studio itself is served by its own Vite config.
 */
import { defineCliConfig } from 'sanity/cli';
import { loadEnv } from 'vite';
import { fileURLToPath } from 'node:url';
const env = { ...loadEnv('development', fileURLToPath(new URL('..', import.meta.url)), ''), ...process.env };

export default defineCliConfig({
	api: {
		projectId: env.PUBLIC_SANITY_PROJECT_ID || '',
		dataset: env.PUBLIC_SANITY_DATASET || 'production'
	},
	studioHost: 'monji',
	deployment: {
		appId: 'h1u8i35avyns0x3wsf9rj5tt',
		autoUpdates: false
	}
});
