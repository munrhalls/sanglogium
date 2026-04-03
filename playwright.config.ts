import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testIgnore: "**/jest/**",
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4, // Use 4 workers locally, 2 in CI
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  use: {
    baseURL: "http://localhost:3000/",
    trace: "retain-on-failure", // Only trace on failure
    screenshot: "only-on-failure", // Only screenshot on failure
  },

  projects: [
    // Desktop Chromium
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        headless: true,
      },
    },
    // Mobile Viewports
    {
      name: "Mobile Chrome",
      use: {
        ...devices["Pixel 5"],
        headless: true,
      },
    },
    {
      name: "Mobile Safari",
      use: {
        ...devices["iPhone 13"],
        headless: true,
      },
    },
  ],
});
