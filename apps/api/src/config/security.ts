// Security configuration module with environment-aware policies
// Provides centralized configuration for all security-related settings

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface CorsConfig {
  origins: string[];
  methods: string[];
  allowedHeaders: string[];
  credentials: boolean;
}

export interface ErrorConfig {
  showStackTrace: boolean;
  showErrorDetails: boolean;
  logLevel: LogLevel;
}

export interface SecurityHeadersConfig {
  enableHsts: boolean;
  enableContentTypeOptions: boolean;
  enableFrameOptions: boolean;
  enableXssProtection: boolean;
}

export interface SecurityConfig {
  cors: CorsConfig;
  errorHandling: ErrorConfig;
  headers: SecurityHeadersConfig;
}

export type Environment = 'development' | 'production' | 'test';

/**
 * Detects the current environment from various sources
 * @param providedEnv - Optional explicit environment string to use
 */
export function detectEnvironment(providedEnv?: string): Environment {
  // 1. Check explicitly provided environment first
  if (
    providedEnv === 'development' ||
    providedEnv === 'production' ||
    providedEnv === 'test'
  ) {
    return providedEnv as Environment;
  }

  // 2. Check ENVIRONMENT variable from globalThis (compatibility)
  const envVar = (globalThis as { ENVIRONMENT?: unknown }).ENVIRONMENT;
  if (
    envVar === 'development' ||
    envVar === 'production' ||
    envVar === 'test'
  ) {
    return envVar as Environment;
  }

  // Check NODE_ENV as fallback
  const nodeEnv = process?.env?.NODE_ENV;
  if (
    nodeEnv === 'development' ||
    nodeEnv === 'production' ||
    nodeEnv === 'test'
  ) {
    return nodeEnv;
  }

  // Default to production for security
  return 'production';
}

/**
 * Development security configuration - more permissive for debugging
 */
const developmentConfig: SecurityConfig = {
  cors: {
    origins: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
  errorHandling: {
    showStackTrace: true,
    showErrorDetails: true,
    logLevel: 'debug',
  },
  headers: {
    enableHsts: false,
    enableContentTypeOptions: true,
    enableFrameOptions: true,
    enableXssProtection: true,
  },
};

/**
 * Production security configuration - restrictive for security
 */
const productionConfig: SecurityConfig = {
  cors: {
    origins: ['https://tracknstick.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
  errorHandling: {
    showStackTrace: false,
    showErrorDetails: false,
    logLevel: 'warn',
  },
  headers: {
    enableHsts: true,
    enableContentTypeOptions: true,
    enableFrameOptions: true,
    enableXssProtection: true,
  },
};

/**
 * Test security configuration - minimal restrictions for testing
 */
const testConfig: SecurityConfig = {
  cors: {
    origins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
  errorHandling: {
    showStackTrace: true,
    showErrorDetails: true,
    logLevel: 'error',
  },
  headers: {
    enableHsts: false,
    enableContentTypeOptions: true,
    enableFrameOptions: true,
    enableXssProtection: true,
  },
};

/**
 * Gets security configuration based on current environment
 * @param env - Optional explicit environment string
 */
export function getSecurityConfig(env?: string): SecurityConfig {
  const environment = detectEnvironment(env);

  switch (environment) {
    case 'development':
      return developmentConfig;
    case 'test':
      return testConfig;
    case 'production':
    default:
      return productionConfig;
  }
}
