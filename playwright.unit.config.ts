import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

/**
 * Unit test config - NO webServer required
 * For tests using mock implementations (Redis, Sanity, etc.)
 */
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/guest-checkout-inventory-reservation/**/*.test.ts",

  // NO webServer - these are unit tests with mocks
  workers: 1,
  fullyParallel: false,

  use: {
    // No baseURL needed for unit tests
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    headless: true,
  },

  reporter: [['list']],

  projects: [
    {
      name: 'unit-tests',
      use: {
        // No device needed for unit tests
      },
    },
  ],

  timeout: 30000,
  expect: {
    timeout: 10000,
  },
});
