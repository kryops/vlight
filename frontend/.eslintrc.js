module.exports = {
  rules: {
    'no-restricted-imports': [
      'error',
      { patterns: ['**/shared/src/**', '@mdi/js'] },
    ],
    'import/no-nodejs-modules': 'error',
    '@typescript-eslint/no-unnecessary-type-constraint': 'off',
  },
}
