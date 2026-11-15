// Unit tests for security configuration system
// Tests environment detection and configuration loading

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { detectEnvironment, getSecurityConfig } from '../security.js';

describe('Security Configuration', () => {
  beforeEach(() => {
    // Clear any mocked globals before each test
    vi.clearAllMocks();
  });

  describe('detectEnvironment', () => {
    it('should detect production from ENVIRONMENT global', () => {
      (globalThis as any).ENVIRONMENT = 'production';

      const result = detectEnvironment();

      expect(result).toBe('production');
    });

    it('should detect development from ENVIRONMENT global', () => {
      (globalThis as any).ENVIRONMENT = 'development';

      const result = detectEnvironment();

      expect(result).toBe('development');
    });

    it('should detect test from ENVIRONMENT global', () => {
      (globalThis as any).ENVIRONMENT = 'test';

      const result = detectEnvironment();

      expect(result).toBe('test');
    });

    it('should fall back to NODE_ENV when ENVIRONMENT is not set', () => {
      delete (globalThis as any).ENVIRONMENT;
      process.env.NODE_ENV = 'development';

      const result = detectEnvironment();

      expect(result).toBe('development');
    });

    it('should default to production when no environment variables are set', () => {
      delete (globalThis as any).ENVIRONMENT;
      delete process.env.NODE_ENV;

      const result = detectEnvironment();

      expect(result).toBe('production');
    });

    it('should default to production for invalid environment values', () => {
      (globalThis as any).ENVIRONMENT = 'invalid';

      const result = detectEnvironment();

      expect(result).toBe('production');
    });

    it('should prioritize explicitly provided environment', () => {
      (globalThis as any).ENVIRONMENT = 'production';

      const result = detectEnvironment('development');

      expect(result).toBe('development');
    });
  });

  describe('getSecurityConfig', () => {
    it('should return development config for development environment', () => {
      (globalThis as any).ENVIRONMENT = 'development';

      const config = getSecurityConfig();

      expect(config.cors.origins).toContain('http://localhost:3000');
      expect(config.cors.origins).toContain('http://localhost:5173');
      expect(config.errorHandling.showStackTrace).toBe(true);
      expect(config.errorHandling.showErrorDetails).toBe(true);
      expect(config.headers.enableHsts).toBe(false);
    });

    it('should return production config for production environment', () => {
      (globalThis as any).ENVIRONMENT = 'production';

      const config = getSecurityConfig();

      expect(config.cors.origins).toEqual(['https://tracknstick.com']);
      expect(config.errorHandling.showStackTrace).toBe(false);
      expect(config.errorHandling.showErrorDetails).toBe(false);
      expect(config.headers.enableHsts).toBe(true);
    });

    it('should return test config for test environment', () => {
      (globalThis as any).ENVIRONMENT = 'test';

      const config = getSecurityConfig();

      expect(config.cors.origins).toContain('http://localhost:3000');
      expect(config.headers.enableHsts).toBe(false);
    });

    it('should return config for explicitly provided environment', () => {
      const config = getSecurityConfig('production');

      expect(config.cors.origins).toEqual(['https://tracknstick.com']);
      expect(config.headers.enableHsts).toBe(true);
    });
  });

  describe('environment-specific configurations', () => {
    it('should have stricter production CORS settings', () => {
      (globalThis as any).ENVIRONMENT = 'production';
      const prodConfig = getSecurityConfig();

      (globalThis as any).ENVIRONMENT = 'development';
      const devConfig = getSecurityConfig();

      expect(prodConfig.cors.origins).toHaveLength(1);
      expect(prodConfig.cors.origins[0]).toMatch(/^https:/);
      expect(devConfig.cors.origins.length).toBeGreaterThan(1);
      expect(
        devConfig.cors.origins.some((origin) => origin.includes('localhost'))
      ).toBe(true);
    });

    it('should have different error handling per environment', () => {
      (globalThis as any).ENVIRONMENT = 'production';
      const prodConfig = getSecurityConfig();

      (globalThis as any).ENVIRONMENT = 'development';
      const devConfig = getSecurityConfig();

      expect(prodConfig.errorHandling.showStackTrace).toBe(false);
      expect(prodConfig.errorHandling.showErrorDetails).toBe(false);
      expect(devConfig.errorHandling.showStackTrace).toBe(true);
      expect(devConfig.errorHandling.showErrorDetails).toBe(true);
    });

    it('should enable HSTS only in production', () => {
      (globalThis as any).ENVIRONMENT = 'production';
      const prodConfig = getSecurityConfig();

      (globalThis as any).ENVIRONMENT = 'development';
      const devConfig = getSecurityConfig();

      expect(prodConfig.headers.enableHsts).toBe(true);
      expect(devConfig.headers.enableHsts).toBe(false);
    });
  });

  // Nothing checks the configs at runtime, so an empty origin list fails here
  // in CI instead of shipping.
  it.each(['development', 'production', 'test'])(
    'the shipped %s config has CORS origins',
    (env) => {
      expect(getSecurityConfig(env).cors.origins.length).toBeGreaterThan(0);
    }
  );
});
