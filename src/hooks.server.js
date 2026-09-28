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
