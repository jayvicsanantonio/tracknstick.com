// Covers the console capture in setup.ts that keeps test output clean.
// Warnings and errors reach the test through takeConsole(); nothing is printed.

import { describe, expect, it } from 'vitest';
import { takeConsole } from './setup.js';

describe('console capture', () => {
  it('hands a test the warnings and errors it logged', () => {
    console.warn('first warning');
    console.error('an error', new Error('boom'));

    expect(takeConsole('warn')).toEqual(['first warning']);
    expect(takeConsole('error')).toEqual(['an error Error: boom']);
  });

  it('returns only lines logged since the previous call', () => {
    console.warn('before');
    takeConsole('warn');
    console.warn('after');

    expect(takeConsole('warn')).toEqual(['after']);
  });

  it('does not make a test assert on routine info and debug lines', () => {
    console.info('routine');
    console.debug('detail');

    // Nothing is taken: setup.ts's afterEach passes because neither line is
    // a warning or an error.
    expect(takeConsole('warn')).toEqual([]);
  });
});
