/**
 * Domain Layer - Re-exports
 *
 * Single entry point for all domain entities.
 * Presentation and Application layers import from here.
 */

export { profile, type Profile } from './profile.js';
export { socialLinks, type SocialLink, type SocialPlatform } from './social.js';
export {
	clientClusters,
	awards,
	speakingEngagements,
	type ClientCluster,
	type Award,
	type SpeakingEngagement
} from './portfolio.js';
