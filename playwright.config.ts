import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: ".env.local" });

export default defineConfig({
  testDir: "./tests",
  testIgnore: "**/jest/**",
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4, // Use 4 workers locally, 2 in CI
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

  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['list'],
  ],

  projects: [
    // ─── Tier 1: Desktop (primary development target) ───
    {
      name: 'desktop-chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        viewport: { width: 1440, height: 900 },
      },
    },

    // ─── Tier 2: Modern Android Phone ───
    {
      name: 'android-pixel',
      use: {
        ...devices['Pixel 7'],
        headless: true,
        // Simulate 4G network
        launchOptions: {
          args: ['--disable-dev-shm-usage'],
        },
      },
    },

    // ─── Tier 3: Old iPhone (Constraint Device) ───
    {
      name: 'iphone-legacy',
      use: {
        ...devices['iPhone 8'],         // 375×667 viewport, webkit
        headless: true,
        // Simulate slow 3G
      },
    },

    // ─── Tier 4: API-only (no browser, for webhook/server tests) ───
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
