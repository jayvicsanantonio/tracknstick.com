/**
 * Feature flags configuration
 *
 * This file contains feature flags that control the rollout of new features.
 * These flags allow for gradual rollout and easy rollback if needed.
 */

export interface FeatureFlags {
  isUrlRoutingEnabled: boolean;
}

/**
 * Get feature flags from environment variables or defaults
 */
export const getFeatureFlags = (): FeatureFlags => {
  return {
    // Feature flag to control React Router rollout
    // Set VITE_URL_ROUTING_ENABLED=true in environment to enable
    isUrlRoutingEnabled: import.meta.env.VITE_URL_ROUTING_ENABLED === 'true',
  };
};

/**
 * Global feature flags instance
 */
export const featureFlags = getFeatureFlags();
