import { defineConfig, devices } from "@playwright/test";

/**
 * FAST checkout test config — NO webServer, assumes dev server running
 * Use this for rapid iteration during development
 */
export default defineConfig({
  testDir: "./tests/checkout",
  testMatch: "**/*.test.ts",

  // CRITICAL: Single worker for checkout tests (shared Redis/Sanity)
  workers: 1,
  fullyParallel: false,

  // NO webServer — assumes `npm run dev` already running on :3000
  // This saves 30-60 seconds per test run

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry", // Only trace on retry, not every run
    screenshot: "only-on-failure",
    headless: true,
  },

  reporter: [['list']], // Minimal reporter for speed

  projects: [
    {
      name: 'checkout-api',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],

  // Fast timeout for quick feedback
  timeout: 30000, // 30s per test
  expect: {
    timeout: 10000, // 10s per assertion
  },
});
