import { redirect } from '@sveltejs/kit';
import { getLocale, localeCookie } from '$lib/i18n';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const requested = event.url.searchParams.get('lang');
	if (requested === 'zh' || requested === 'en') {
		event.cookies.set(localeCookie, requested, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax', httpOnly: true, secure: event.url.protocol === 'https:' });
		const next = new URL(event.url);
		next.searchParams.delete('lang');
		redirect(303, next.href);
	}
	const locale = getLocale(event.cookies.get(localeCookie));
	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace('<html lang="zh-CN">', `<html lang="${locale === 'en' ? 'en' : 'zh-CN'}">`)
	});
	response.headers.append('Vary', 'Cookie');
	response.headers.set('Content-Language', locale === 'en' ? 'en' : 'zh-CN');
	return response;
}

/**
 * Server-side hooks - Error handling and operations troubleshooting.
 *
 * handleError runs when an unexpected error occurs during navigation
 * or server-side rendering. It logs the error context for debugging
 * and returns a sanitized message to the client.
 */

/** @type {import('@sveltejs/kit').HandleServerError} */
export function handleError({ error, event, message, status }) {
	// Log structured error context for operations troubleshooting
	console.error('[Server Error]', {
		status,
		message,
		path: event.url.pathname,
		method: event.request.method,
		timestamp: new Date().toISOString(),
		errorName: error instanceof Error ? error.name : 'UnknownError',
		stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5).join('\n') : undefined
	});

	return {
		message: status === 404 ? '页面未找到' : '服务器内部错误，请稍后再试'
	};
}
