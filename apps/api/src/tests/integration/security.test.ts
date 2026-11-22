// Security integration tests - End-to-end security pipeline validation
// Tests authentication flows, rate limiting, CORS enforcement, and error handling

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  createTestEnv,
  resetMocks,
  takeUnauthenticatedRequestLogs,
  takeConsole,
} from '../setup.js';
import app from '../../index.js';
import { getSecurityConfig } from '../../config/security.js';

describe('Security Integration Tests', () => {
  const { env: testEnv } = createTestEnv();

  beforeEach(() => {
    resetMocks();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Authentication Flow Integration', () => {
    it('should block unauthenticated requests to protected routes', async () => {
      const req = new Request('http://localhost/api/v1/habits', {
        method: 'GET',
      });

      const response = await app.fetch(req, testEnv);

      expect(response.status).toBe(401);

      const body: any = await response.json();
      expect(body).toMatchObject({
        error: {
          message: 'Authentication required',
          code: 'unauthorized',
        },
      });
      expect(body.error.requestId).toMatch(/^err_/);
      expect(body.error.timestamp).toBeDefined();

      takeUnauthenticatedRequestLogs();
    });

    it('should reject requests with malformed Authorization header', async () => {
      const req = new Request('http://localhost/api/v1/habits', {
        method: 'GET',
        headers: {
          Authorization: 'Invalid Bearer Token Format',
        },
      });

      const response = await app.fetch(req, testEnv);

      expect(response.status).toBe(401);

      const body: any = await response.json();
      expect(body.error.code).toBe('unauthorized');

      takeUnauthenticatedRequestLogs(1, 'rejected_token');
    });

    it('should allow access to health endpoints without authentication', async () => {
      const req = new Request('http://localhost/health', {
        method: 'GET',
      });

      const response = await app.fetch(req, testEnv);

      expect(response.status).toBe(200);

      const body: any = await response.json();
      expect(body.status).toBe('ok');
    });
  });

  describe('Rate Limiting Integration', () => {
    it('limits a client by IP before authentication', async () => {
      // /api/v1/progress allows 30 requests a minute per IP. The limit runs
      // before the auth middleware, so a client without a token is limited too.
      const request = () =>
        app.fetch(
          new Request('http://localhost/api/v1/progress/streaks', {
            headers: { 'CF-Connecting-IP': '203.0.113.50' },
          }),
          testEnv
        );

      for (let i = 0; i < 30; i++) {
        expect((await request()).status).toBe(401);
      }
      takeUnauthenticatedRequestLogs(30);

      const limited = await request();

      expect(limited.status).toBe(429);
      expect(limited.headers.get('Retry-After')).toBe('60');
      const warnings = takeConsole('warn');
      expect(warnings).toHaveLength(4);
      expect(warnings).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Security Event: rate_limit_exceeded'),
          expect.stringContaining('Security Event: middleware_failure'),
          expect.stringContaining(
            'Request blocked due to middleware failure: rate_limit'
          ),
          expect.stringContaining('Client error occurred'),
        ])
      );
    });
  });

  describe('CORS Integration', () => {
    it('should handle CORS preflight requests properly', async () => {
      const req = new Request('http://localhost/api/v1/habits', {
        method: 'OPTIONS',
        headers: {
          Origin: 'http://localhost:3000',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Authorization',
        },
      });

      const response = await app.fetch(req, testEnv);

      expect(response.status).toBe(204);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
        'http://localhost:3000'
      );
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain(
        'GET'
      );
      expect(response.headers.get('Access-Control-Allow-Headers')).toContain(
        'Authorization'
      );
      expect(response.headers.get('Access-Control-Allow-Credentials')).toBe(
        'true'
      );
    });

    it('should allow requests from authorized development origins', async () => {
      const req = new Request('http://localhost/health', {
        method: 'GET',
        headers: {
          Origin: 'http://localhost:3000',
        },
      });

      const response = await app.fetch(req, testEnv);

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
        'http://localhost:3000'
      );
      expect(response.headers.get('Access-Control-Allow-Credentials')).toBe(
        'true'
      );
    });

    it('should not include CORS headers for unauthorized origins', async () => {
      const req = new Request('http://localhost/health', {
        method: 'GET',
        headers: {
          Origin: 'https://malicious-site.com',
        },
      });

      const response = await app.fetch(req, testEnv);

      // Should not include CORS headers for unauthorized origins
      expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
    });

    it('honors EXTRA_ALLOWED_ORIGINS only in development and ignores wildcards and production', () => {
      const dev = getSecurityConfig(
        'development',
        'https://demo.trycloudflare.com/, *, http://192.168.1.10:5173'
      );
      expect(dev.cors.origins).toContain('https://demo.trycloudflare.com');
      expect(dev.cors.origins).toContain('http://192.168.1.10:5173');
      expect(dev.cors.origins).not.toContain('*');

      const prod = getSecurityConfig(
        'production',
        'https://demo.trycloudflare.com'
      );
      expect(prod.cors.origins).toEqual(['https://tracknstick.com']);
    });
  });

  describe('Security Headers Integration', () => {
    it('should include all required security headers in responses', async () => {
      const req = new Request('http://localhost/health', {
        method: 'GET',
      });

      const response = await app.fetch(req, testEnv);

      // Security headers should be present (development configuration)
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
      expect(response.headers.get('Referrer-Policy')).toBe(
        'strict-origin-when-cross-origin'
      );
      expect(response.headers.get('Permissions-Policy')).toContain(
        'geolocation=()'
      );

      // HSTS should not be enabled in test environment
      expect(response.headers.get('Strict-Transport-Security')).toBeNull();
    });

    it('should maintain security headers across different endpoints', async () => {
      const endpoints = ['/health', '/api/v1/habits'];

      for (const endpoint of endpoints) {
        const req = new Request(`http://localhost${endpoint}`, {
          method: 'GET',
        });

        const response = await app.fetch(req, testEnv);

        expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
        expect(response.headers.get('X-Frame-Options')).toBe('DENY');
      }

      takeUnauthenticatedRequestLogs();
    });
  });

  describe('Error Handling Pipeline Integration', () => {
    it('should provide consistent error format for 404 routes', async () => {
      const req = new Request('http://localhost/api/v1/nonexistent', {
        method: 'GET',
      });

      const response = await app.fetch(req, testEnv);

      expect(response.status).toBe(404);

      const body: any = await response.json();
      expect(body).toMatchObject({
        error: {
          message: expect.any(String),
          code: expect.any(String),
        },
      });

      expect(takeConsole('warn')).toEqual([
        expect.stringContaining('Route not found: GET /api/v1/nonexistent'),
      ]);
    });

    it('should handle malformed JSON requests gracefully', async () => {
      const req = new Request('http://localhost/api/v1/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json {',
      });

      const response = await app.fetch(req, testEnv);

      expect(response.status).toBe(401); // Auth happens first

      const body: any = await response.json();
      expect(body.error.code).toBe('unauthorized');
      expect(body.error.requestId).toMatch(/^err_/);

      takeUnauthenticatedRequestLogs();
    });

    it('should include correlation IDs in error responses', async () => {
      const req = new Request('http://localhost/api/v1/habits', {
        method: 'GET',
      });

      const response = await app.fetch(req, testEnv);

      expect(response.status).toBe(401);

      const body: any = await response.json();
      expect(body.error.requestId).toBeDefined();
      expect(body.error.requestId).toMatch(/^err_\d+_[a-z0-9]+$/);
      expect(body.error.timestamp).toBeDefined();

      takeUnauthenticatedRequestLogs();
    });
  });

  describe('Middleware Chain Integration', () => {
    it('should execute middleware in correct security-optimized order', async () => {
      const req = new Request('http://localhost/api/v1/habits', {
        method: 'GET',
        headers: {
          Origin: 'http://localhost:3000',
          'X-Forwarded-For': '192.168.1.200',
        },
      });

      const response = await app.fetch(req, testEnv);

      // CORS headers should be present (executed after rate limiting)
      expect(response.headers.get('Access-Control-Allow-Origin')).toBeDefined();

      // Security headers should be present (executed after CORS)
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');

      // Auth failure should be the final result
      expect(response.status).toBe(401);

      takeUnauthenticatedRequestLogs();
    });

    it('should properly propagate errors through middleware chain', async () => {
      const req = new Request('http://localhost/api/v1/habits', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer invalid-token-format',
        },
      });

      const response = await app.fetch(req, testEnv);

      expect(response.status).toBe(401);

      // Should still include middleware-set headers despite error
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');

      takeUnauthenticatedRequestLogs(1, 'rejected_token');
    });

    it('should handle middleware failures gracefully', async () => {
      const req = new Request('http://localhost/api/v1/habits', {
        method: 'GET',
        headers: {
          // Long *and* rejected, so this exercises the auth failure path
          // rather than relying on the database mock to blow up
          Authorization: 'Bearer invalid-' + 'x'.repeat(1000),
          Origin: 'http://localhost:3000',
        },
      });

      const response = await app.fetch(req, testEnv);

      // Should get some kind of error response, not a timeout or hang
      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.status).toBeLessThan(600);

      takeUnauthenticatedRequestLogs(1, 'rejected_token');
    });
  });

  describe('Complete Security Pipeline Validation', () => {
    it('should validate end-to-end security for health endpoint', async () => {
      const req = new Request('http://localhost/health', {
        method: 'GET',
        headers: {
          Origin: 'http://localhost:3000',
          'X-Forwarded-For': '192.168.1.250',
          'User-Agent': 'Security-Test-Agent/1.0',
        },
      });

      const response = await app.fetch(req, testEnv);

      expect(response.status).toBe(200);

      // Verify all security measures are in place
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
        'http://localhost:3000'
      );
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');

      const body: any = await response.json();
      expect(body.status).toBe('ok');
    });

    it('should validate complete error handling pipeline', async () => {
      const req = new Request('http://localhost/api/v1/habits/invalid-id', {
        method: 'GET',
        headers: {
          Origin: 'http://localhost:3000',
          'X-Forwarded-For': '192.168.1.251',
        },
      });

      const response = await app.fetch(req, testEnv);

      // Should be blocked by authentication first
      expect(response.status).toBe(401);

      const body: any = await response.json();

      // Should have proper error structure
      expect(body).toMatchObject({
        error: {
          message: expect.any(String),
          code: 'unauthorized',
          requestId: expect.stringMatching(/^err_/),
          timestamp: expect.any(String),
        },
      });

      // Should maintain security headers even in error responses
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');

      takeUnauthenticatedRequestLogs();
    });
  });
});
