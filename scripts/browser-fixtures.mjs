// Optional deterministic checks against a separate, unconfigured preview.
// Production preview and its CMS settings are never modified by this helper.
export async function useLocalResources(context, base) {
	if (process.env.WABI_OFFLINE !== '1') return;
	const origin = new URL(base).origin;
	await context.route('**/*', route => new URL(route.request().url()).origin === origin
		? route.continue() : route.abort());
}
