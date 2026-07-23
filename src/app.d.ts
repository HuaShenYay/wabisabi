// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// Custom error shape for structured error handling
		interface Error {
			message: string;
			code?: string;
		}

		// interface Locals {}

		interface PageData {
			// SEO metadata can be augmented per-page
			title?: string;
			description?: string;
		}

		// interface PageState {}
		// interface Platform {}
	}
}

export {};
