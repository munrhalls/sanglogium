import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testIgnore: ["**/jest/**", "**/component/**", "**/checkout/**"],
  fullyParallel: true,
  workers: process.env.CI ? 1 : 2, // Use 2 workers locally, 1 in CI
  // webServer: {
  //   command: "npm run start",
  //   url: "http://localhost:3000",
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,
  // },
  use: {
    baseURL: "http://localhost:3000/",
    trace: "retain-on-failure", // Only trace on failure
    screenshot: "only-on-failure", // Only screenshot on failure
  },

  timeout: 10000, // 10s per test
  expect: {
    timeout: 5000, // 5s per assertion
  },

  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['list'],
  ],

  projects: [
    // ─── Browser tests (Desktop Chrome) ───
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        viewport: { width: 1440, height: 900 },
      },
    },

    // ─── API-only (no browser, for webhook/server tests) ───
    {
      name: 'api',
      testMatch: /\/(api|webhook|stock|worst-case)\//,
      use: {
        baseURL: 'http://localhost:3000',
        extraHTTPHeaders: {
          'Content-Type': 'application/json',
        },
      },
    },
  ],
});
