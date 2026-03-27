import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testIgnore: ['**/jest/**', '**/e2e/**'],
  
  // Component testing setup
  use: {
    trace: 'on',
  },

  projects: [
    {
      name: 'component-chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/component/**/*.spec.ts',
    },
    {
      name: 'component-firefox', 
      use: { ...devices['Desktop Firefox'] },
      testMatch: '**/component/**/*.spec.ts',
    },
    {
      name: 'component-webkit',
      use: { ...devices['Desktop Safari'] },
      testMatch: '**/component/**/*.spec.ts',
    },
  ],

  webServer: {
    command: 'npm run dev:test',
    port: 3001,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
