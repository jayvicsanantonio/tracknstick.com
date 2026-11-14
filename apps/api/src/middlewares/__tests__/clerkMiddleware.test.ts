// Unit tests for secure Clerk JWT authentication middleware
// Tests proper token verification and error handling scenarios

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createClerkClient } from '@clerk/backend';
import { clerkMiddleware } from '../clerkMiddleware.js';
import { UnauthorizedError } from '../../utils/errors.js';
import logger from '../../utils/logger.js';

// Mock Clerk client with new authenticateRequest API
const mockClerkClient = {
  authenticateRequest: vi.fn(),
};

vi.mock('@clerk/backend', () => ({
  createClerkClient: vi.fn(() => mockClerkClient),
}));

// Mock logger to prevent console output during tests
vi.mock('../../utils/logger.js', () => ({
  default: {
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('clerkMiddleware', () => {
  let mockContext: any;
  let mockNext: any;
  let middleware: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockNext = vi.fn();
    middleware = clerkMiddleware();

    // Set up mock context
    mockContext = {
      req: {
        header: vi.fn(),
        path: '/api/test',
        method: 'GET',
        raw: new Request('https://example.com/api/test', {
          headers: { Authorization: 'Bearer valid.token' },
        }),
      },
      set: vi.fn(),
      env: {
        CLERK_SECRET_KEY: 'test-secret-key',
      },
    };
  });

  describe('successful authentication', () => {
    it('should authenticate valid request and set auth context', async () => {
      const mockAuth = {
        userId: 'user_123',
        sessionId: 'session_456',
        sessionClaims: {
          iss: 'https://clerk.dev',
          aud: 'test-audience',
          exp: Math.floor(Date.now() / 1000) + 3600,
          iat: Math.floor(Date.now() / 1000),
          nbf: Math.floor(Date.now() / 1000),
        },
      };

      const mockRequestState = {
        isAuthenticated: true,
        toAuth: () => mockAuth,
      };

      mockClerkClient.authenticateRequest.mockResolvedValue(mockRequestState);
      mockContext.env.ENVIRONMENT = 'production';

      await middleware(mockContext, mockNext);

      // Tokens are only accepted when issued to an origin this environment
      // serves. An empty list would switch Clerk's check off.
      expect(mockClerkClient.authenticateRequest).toHaveBeenCalledWith(
        mockContext.req.raw,
        { authorizedParties: ['https://tracknstick.com'] }
      );

      expect(mockContext.set).toHaveBeenCalledWith('auth', {
        userId: 'user_123',
        requestId: expect.stringMatching(/^req_\d+_/),
      });

      // 'userId' is no longer set as a separate context variable
      expect(mockContext.set).not.toHaveBeenCalledWith(
        'userId',
        expect.anything()
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it('accepts the local development origins outside production', async () => {
      mockClerkClient.authenticateRequest.mockResolvedValue({
        isAuthenticated: true,
        toAuth: () => ({ userId: 'user_123' }),
      });
      mockContext.env.ENVIRONMENT = 'development';

      await middleware(mockContext, mockNext);

      expect(mockClerkClient.authenticateRequest).toHaveBeenCalledWith(
        mockContext.req.raw,
        {
          authorizedParties: [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:5174',
          ],
        }
      );
    });

    it('authenticates when the token carries no session id', async () => {
      const mockAuth = {
        userId: 'user_123',
        sessionClaims: {
          iss: 'https://clerk.dev',
          aud: 'test-audience',
          exp: Math.floor(Date.now() / 1000) + 3600,
          iat: Math.floor(Date.now() / 1000),
          nbf: Math.floor(Date.now() / 1000),
        },
      };

      const mockRequestState = {
        isAuthenticated: true,
        toAuth: () => mockAuth,
      };

      mockClerkClient.authenticateRequest.mockResolvedValue(mockRequestState);

      await middleware(mockContext, mockNext);

      expect(mockContext.set).toHaveBeenCalledWith(
        'auth',
        expect.objectContaining({ userId: 'user_123' })
      );
    });
  });

  describe('authentication failures', () => {
    it('should reject request when user is not signed in', async () => {
      const mockRequestState = {
        isAuthenticated: false,
        reason: 'invalid-token',
      };

      mockClerkClient.authenticateRequest.mockResolvedValue(mockRequestState);

      await expect(middleware(mockContext, mockNext)).rejects.toThrow(
        UnauthorizedError
      );
      await expect(middleware(mockContext, mockNext)).rejects.toThrow(
        'Authentication required'
      );

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request when Clerk secret key is missing', async () => {
      mockContext.env.CLERK_SECRET_KEY = undefined;

      await expect(middleware(mockContext, mockNext)).rejects.toThrow(
        'Service configuration error'
      );

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request when auth has no user ID', async () => {
      const mockAuth = {
        sessionClaims: {
          iss: 'https://clerk.dev',
          aud: 'test-audience',
        },
      };

      const mockRequestState = {
        isAuthenticated: true,
        toAuth: () => mockAuth,
      };

      mockClerkClient.authenticateRequest.mockResolvedValue(mockRequestState);

      await expect(middleware(mockContext, mockNext)).rejects.toThrow(
        UnauthorizedError
      );
      await expect(middleware(mockContext, mockNext)).rejects.toThrow(
        'Authentication required'
      );

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle Clerk authentication errors', async () => {
      const authError = new Error('Token signature verification failed');
      mockClerkClient.authenticateRequest.mockRejectedValue(authError);

      await expect(middleware(mockContext, mockNext)).rejects.toThrow(
        UnauthorizedError
      );
      await expect(middleware(mockContext, mockNext)).rejects.toThrow(
        'Authentication required'
      );

      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle unexpected errors gracefully', async () => {
      const unexpectedError = new Error('Database connection failed');
      mockClerkClient.authenticateRequest.mockRejectedValue(unexpectedError);

      await expect(middleware(mockContext, mockNext)).rejects.toThrow(
        UnauthorizedError
      );
      await expect(middleware(mockContext, mockNext)).rejects.toThrow(
        'Authentication required'
      );

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('logs an unexpected failure with the error and the request', async () => {
      const failure = new Error('Clerk client could not be created');
      vi.mocked(createClerkClient).mockImplementationOnce(() => {
        throw failure;
      });

      await expect(middleware(mockContext, mockNext)).rejects.toThrow(
        UnauthorizedError
      );

      expect(logger.error).toHaveBeenCalledWith(
        'Authentication middleware error',
        failure,
        { path: '/api/test', method: 'GET' }
      );
    });

    it('should propagate UnauthorizedError instances without wrapping', async () => {
      mockContext.env.CLERK_SECRET_KEY = undefined;

      const error = await middleware(mockContext, mockNext).catch(
        (e: unknown) => e as Error
      );

      expect(error.message).toBe('Service configuration error');
    });
  });
});
