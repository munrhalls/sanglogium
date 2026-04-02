import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testIgnore: "**/jest/**",
  fullyParallel: true,
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
    // Single browser for fast testing
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        headless: true, // Run headless by default
      },
    },
  ],
});
