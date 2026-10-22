// ESLint for Astro + TypeScript + the plain browser scripts. Run with `npm run lint`.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

export default [
  { ignores: ['dist/**', '.vercel/**', '.astro/**', 'node_modules/**', 'public/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  { files: ['src/scripts/**/*.js'], languageOptions: { globals: globals.browser } },
  { files: ['scripts/**/*.mjs', 'eslint.config.js', 'astro.config.mjs'], languageOptions: { globals: globals.node } },
  {
    rules: {
      // The data layer talks to PostgREST rows; typing every row would add noise without safety.
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
];
