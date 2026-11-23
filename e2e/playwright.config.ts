import { defineConfig, devices } from '@playwright/test'

/**
 * Each test starts its own backend instance (see `src/fixtures.ts`),
 * which serves the production build of the frontend.
 *
 * Run `yarn build` in the root before running the tests.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
