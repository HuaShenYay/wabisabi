/**
 * Sanity Studio Configuration
 *
 * Run locally:  `npm run studio:dev`
 * Build static: `npm run studio:build`  -> outputs to /dist
 *
 * Uses process.env which is auto-loaded from .env by both Vite and Sanity CLI.
 */
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemas/index.js';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'y6sc85uh';
const dataset = process.env.SANITY_STUDIO_DATASET || 'production';
const singletonTypes = new Set(['profile', 'siteSettings']);

export default defineConfig({
	name: 'default',
	title: 'my-portfolio',
	projectId,
	dataset,
	plugins: [
		structureTool({
			structure: (S) =>
				S.list()
					.id('content')
					.title('内容管理')
					.items([
						S.listItem()
							.id('profile')
							.title('个人资料 · Profile')
							.child(S.document().schemaType('profile').documentId('profile')),
						S.listItem()
							.id('siteSettings')
							.title('站点设置 · Site Settings')
							.child(
								S.document()
									.schemaType('siteSettings')
									.documentId('siteSettings')
							),
						S.divider(),
						S.documentTypeListItem('post').title('文章 · Post'),
						S.documentTypeListItem('project').title('项目 · Project'),
						S.documentTypeListItem('author').title('作者 · Author'),
						S.documentTypeListItem('category').title('标签 · Category'),
						S.divider(),
						S.documentTypeListItem('focusArea').title('研究方向 · Focus Areas'),
						S.documentTypeListItem('education').title('教育经历 · Education'),
						S.documentTypeListItem('philosophy').title('设计理念 · Philosophy'),
						S.documentTypeListItem('socialLink').title('社交链接 · Social Links')
					])
		}),
		visionTool()
	],
	schema: {
		types: schemaTypes,
		templates: templates => templates.filter(template => !singletonTypes.has(template.schemaType))
	},
	document: {
		actions: (actions, context) => singletonTypes.has(context.schemaType)
			? actions.filter(({ action }) => action !== 'duplicate' && action !== 'delete') : actions
	}
});
