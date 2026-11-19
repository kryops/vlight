import { join } from 'node:path'

import { defineConfig } from 'vite-plus'

export default defineConfig({
  resolve: {
    alias: {
      '@vlight/controls': join(
        import.meta.dirname,
        'shared/controls/src/index.ts'
      ),
      '@vlight/utils': join(import.meta.dirname, 'shared/utils/src/index.ts'),
    },
  },
  test: {
    setupFiles: ['./shared/vitest.setup.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      include: [
        'backend/src/**/*.ts',
        'frontend/src/**/*.ts',
        'shared/*/src/**/*.ts',
      ],
    },
  },
  staged: {
    '*': 'vp check --fix',
  },
  lint: {
    plugins: ['oxc', 'typescript', 'unicorn', 'react', 'import', 'vitest'],
    ignorePatterns: ['**/dist'],
    options: {
      typeAware: true,
      typeCheck: true,
      reportUnusedDisableDirectives: 'warn',
    },
    rules: {
      'no-restricted-imports': ['error', { patterns: ['**/shared/**'] }],
      'import/no-duplicates': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'vite-plus/prefer-vite-plus-imports': 'error',
    },
    jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
    overrides: [
      {
        files: ['frontend/**'],
        rules: {
          'no-restricted-imports': [
            'error',
            { patterns: ['**/shared/src/**', '@mdi/js'] },
          ],
          'import/no-nodejs-modules': 'error',
        },
      },
      {
        files: ['shared/**'],
        rules: { 'import/no-nodejs-modules': 'error' },
      },
    ],
  },
  fmt: {
    trailingComma: 'es5',
    tabWidth: 2,
    semi: false,
    singleQuote: true,
    arrowParens: 'avoid',
    printWidth: 80,
    sortPackageJson: false,
    ignorePatterns: [
      'package.json',
      '.yarn',
      '.yarnrc.yml',
      '*.md',
      '*.json',
      '*.html',
      'dist',
      '/config',
      'node_modules',
      '.linaria-cache',
    ],
  },
})
