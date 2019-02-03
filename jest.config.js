module.exports = {
  collectCoverageFrom: ['backend/src/**/*.ts', 'frontend/src/**/*.ts'],
  setupFilesAfterEnv: ['<rootDir>/shared/jest.setup.ts'],
  testPathIgnorePatterns: ['node_modules', 'dist'],
}
