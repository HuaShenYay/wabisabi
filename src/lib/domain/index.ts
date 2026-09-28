/**
 * Domain Layer - Re-exports
 *
 * Single entry point for all domain entities.
 * Presentation and Application layers import from here.
 */

export { profile, type Profile } from './profile.js';
export { socialLinks, type SocialLink, type SocialPlatform } from './social.js';
export {
	focusAreas,
	education,
	designPhilosophy,
	type FocusItem,
	type EducationEntry,
	type PhilosophyItem
} from './portfolio.js';
export {
	projects,
	categoryOrder,
	groupByCategory,
	type Project,
	type ProjectCategory
} from './projects.js';
