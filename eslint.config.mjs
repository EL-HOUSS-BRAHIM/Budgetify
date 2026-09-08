import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    // legacy/ is archived. It is never linted, built, or imported.
    // .github/skills/ is vendored agent tooling, not application source.
    ignores: [
      'legacy/**',
      '.github/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.expo/**',
      '**/node_modules/**',
      'packages/types/src/database.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/legacy/**', 'legacy/**'],
              message:
                'legacy/ is archived and must never be imported. If this capability is worth keeping, find its row in docs/REUSE-LEDGER.md and re-express it in packages/core with tests.',
            },
          ],
        },
      ],
      // Default exports break rename refactors and make the assistant's tool
      // registry harder to enumerate. See docs/SPEC-platform-foundation.md.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportDefaultDeclaration',
          message: 'Use named exports.',
        },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
    },
  },
  {
    // packages/core is pure: no I/O, no platform APIs, no network.
    files: ['packages/core/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'node:fs', message: 'packages/core must stay free of I/O.' },
            { name: 'node:http', message: 'packages/core must stay free of I/O.' },
            {
              name: '@supabase/supabase-js',
              message: 'packages/core must not know about the database.',
            },
            { name: 'react', message: 'packages/core must stay framework-free.' },
            { name: 'react-native', message: 'packages/core must stay framework-free.' },
          ],
          patterns: [
            {
              group: ['**/legacy/**', 'legacy/**'],
              message: 'legacy/ is archived and must never be imported.',
            },
          ],
        },
      ],
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'packages/core must stay free of I/O.' },
      ],
    },
  },
  {
    // expo-router requires default exports for route and layout files.
    files: ['apps/mobile/app/**/*.tsx', 'apps/mobile/app/**/*.ts', '**/*.config.{js,mjs,ts}'],
    rules: { 'no-restricted-syntax': 'off' },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    rules: { '@typescript-eslint/no-non-null-assertion': 'off' },
  },
  {
    // Build and tooling config files sit outside the tsconfig projects, so
    // type-aware rules cannot run against them.
    files: ['**/*.config.{js,mjs,cjs,ts}', 'eslint.config.mjs', '**/*.cjs'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { parserOptions: { projectService: false, project: false } },
    rules: { 'no-restricted-syntax': 'off' },
  },
  prettier,
);
