// Test environment setup for the web app: jest-dom matchers, browser APIs jsdom lacks,
// and a guard that fails any test which writes a warning or error to the console.
import '@testing-library/jest-dom';

// Global *environment* setup only.
//
// Component and page mocks live in ./mocks and are opt-in: a test that wants
// the routing stubs imports '@testing/mocks' itself. Applying them here made
// every suite render stubs, so a test could not exercise a real component.
import { expect, afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Test output stays clean: a warning or error a test does not expect, such
// as React's act() warning, fails that test with the message. A test that
// expects one spies on console itself, which keeps the call from reaching
// this guard.
let unexpectedOutput: string[] = [];

for (const level of ['warn', 'error'] as const) {
  console[level] = (...args: unknown[]) => {
    unexpectedOutput.push(`console.${level}: ${args.map(String).join(' ')}`);
  };
}

beforeEach(() => {
  unexpectedOutput = [];
});

afterEach(() => {
  // Unmount first, so a failing check below cannot leave this test's DOM
  // behind for the next one.
  cleanup();

  if (unexpectedOutput.length > 0) {
    throw new Error(
      `The test wrote to the console:\n${unexpectedOutput.join('\n')}`,
    );
  }
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// jsdom has no scrolling, and reports window.scrollTo as not implemented.
// The layout restores each tab's scroll position with it on every route.
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

// Mock ResizeObserver. A class, because libraries construct it with `new`
// (Radix radio groups inside a form, Recharts' ResponsiveContainer), which
// an arrow-function mock does not support.
global.ResizeObserver = class {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
