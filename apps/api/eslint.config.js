// ESLint configuration for the API: type-checked rules for the Worker source and its tests.
// Follows apps/web/eslint.config.js; scripts run in Node or k6 and get untyped rules.

import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

const TEST_FILES = ['src/**/__tests__/**/*.ts', 'src/tests/**/*.ts'];

export default tseslint.config(
  { ignores: ['dist', 'coverage', '.wrangler'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      prettierConfig,
    ],
    files: ['src/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.serviceworker,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { prettier },
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // For a string, number or boolean, `||` and `??` differ on '', 0 and
      // false, so swapping one for the other changes what the code does.
      // The rule is kept for objects, where the two behave the same.
      '@typescript-eslint/prefer-nullish-coalescing': [
        'error',
        { ignorePrimitives: { string: true, number: true, boolean: true } },
      ],
    },
  },
  {
    // Tests read untyped JSON bodies and build loose fixtures, so the rules
    // about `any` flowing through code are off here and only here.
    files: TEST_FILES,
    languageOptions: {
      globals: { ...globals.serviceworker, ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      // expect(logger.error) passes a mocked method as a value, which is how
      // vitest's assertions work; it is not a method losing its `this`.
      '@typescript-eslint/unbound-method': 'off',
    },
  },
  {
    extends: [js.configs.recommended, prettierConfig],
    files: ['*.js', 'scripts/**/*.js'],
    languageOptions: { ecmaVersion: 2022, globals: globals.node },
    plugins: { prettier },
    rules: { 'prettier/prettier': 'error' },
  },
  {
    // A k6 load test: k6 provides __ENV to the script.
    files: ['scripts/performance-test.js'],
    languageOptions: { globals: { __ENV: 'readonly' } },
  },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      prettierConfig,
    ],
    files: ['*.ts', 'scripts/**/*.ts'],
    languageOptions: { ecmaVersion: 2022, globals: globals.node },
    plugins: { prettier },
    rules: { 'prettier/prettier': 'error' },
  }
);
