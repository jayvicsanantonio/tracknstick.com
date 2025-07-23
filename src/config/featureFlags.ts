/**
 * Feature flags configuration
 *
 * This file contains feature flags that control the rollout of new features.
 * These flags allow for gradual rollout and easy rollback if needed.
 */

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FeatureFlags {
  // Add new feature flags here as needed
  // Example: enableNewFeature?: boolean;
}

/**
 * Get feature flags from environment variables or defaults
 */
export const getFeatureFlags = (): FeatureFlags => {
  return {
    // Add new feature flags here as needed
  };
};

/**
 * Global feature flags instance
 */
export const featureFlags = getFeatureFlags();
