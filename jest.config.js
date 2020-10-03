module.exports = {
  collectCoverageFrom: [
    'backend/src/**/*.ts',
    'frontend/src/**/*.ts',
    'shared/*/src**/*.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/shared/jest.setup.ts'],
  testPathIgnorePatterns: ['node_modules', 'dist'],
  moduleNameMapper: {
    '^@vlight/(.+)$': '<rootDir>/shared/$1/src/index.ts',
  },
}
