import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testIgnore: "**/jest/**",
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  use: {
    baseURL: "http://localhost:3000/",
    trace: "on",
  },

  projects: [
    /* --- DESKTOP BROWSERS --- */
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit", // This is Safari
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "Microsoft Edge",
      use: { ...devices["Desktop Edge"], channel: "msedge" },
    },
    {
      name: "Google Chrome",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },

    /* --- MOBILE --- */
    {
      name: "Mobile Chrome", // Android
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari", // iOS
      use: { ...devices["iPhone 12"] },
    },
  ],
});
