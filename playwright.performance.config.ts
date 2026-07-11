import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e/performance',
  /* Maximum time one test can run for. */
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only to handle true network flakiness */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* HTML Reporter for clear visual debugging */
  reporter: 'html',
  
  use: {
    /* Base URL mapped to the Next.js production server */
    baseURL: 'http://localhost:3000',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Use data-testid attributes for robust element targeting */
    testIdAttribute: 'data-testid',
  },

  /* Configure projects for major browsers. Keeping it simple: Chromium is the robust standard for core logic. */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Run the production build before starting the tests */
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
