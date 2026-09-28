/**
 * Sanity Schema Registry
 *
 * Aggregates all document schemas for Sanity Studio.
 */
import { projectSchema } from './project.js';
import { profileSchema } from './profile.js';
import { socialLinkSchema } from './socialLink.js';
import { focusAreaSchema } from './focusArea.js';
import { educationSchema } from './education.js';
import { philosophySchema } from './philosophy.js';
import { siteSettingsSchema } from './siteSettings.js';
import { blockContentSchema } from './blockContent.js';
import { postSchema } from './post.js';
import { authorSchema } from './author.js';
import { categorySchema } from './category.js';

export const schemaTypes = [
	blockContentSchema,
	postSchema,
	authorSchema,
	categorySchema,
	projectSchema,
	profileSchema,
	socialLinkSchema,
	focusAreaSchema,
	educationSchema,
	philosophySchema,
	siteSettingsSchema
];
