/**
 * Vite config for Sanity Studio (React app).
 * Kept separate from SvelteKit's vite.config.js to avoid SSR + React conflicts.
 *
 * loadEnv exposes PUBLIC_* vars to the Studio app via process.env polyfill.
 */
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig(({ mode }) => {
	// Load env from project root so Studio and SvelteKit share the same .env
	const env = loadEnv(mode, process.cwd(), '');

	return {
		root: fileURLToPath(new URL('.', import.meta.url)),
		cacheDir: fileURLToPath(new URL('../node_modules/.vite-studio', import.meta.url)),
		envDir: fileURLToPath(new URL('..', import.meta.url)),
		plugins: [react()],
		build: { outDir: 'dist' },
		server: {
			port: 3333,
			fs: { allow: [fileURLToPath(new URL('..', import.meta.url))] }
		},
		define: {
			'process.env.SANITY_STUDIO_PROJECT_ID': JSON.stringify(
				env.PUBLIC_SANITY_PROJECT_ID || ''
			),
			'process.env.SANITY_STUDIO_DATASET': JSON.stringify(
				env.PUBLIC_SANITY_DATASET || 'production'
			)
		}
	};
});
