module.exports = {
  collectCoverageFrom: ['backend/src/**/*.ts', 'frontend/src/**/*.ts'],
  preset: 'ts-jest',
  setupTestFrameworkScriptFile: '<rootDir>/config/jest.setup.ts',
}
