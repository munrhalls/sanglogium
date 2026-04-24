import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/component',

  // Component testing setup
  use: {
    trace: 'on',
  },

  projects: [
    {
      name: 'component-chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/component/**/*.spec.tsx',
    },
    {
      name: 'component-firefox',
      use: { ...devices['Desktop Firefox'] },
      testMatch: '**/component/**/*.spec.tsx',
    },
    {
      name: 'component-webkit',
      use: { ...devices['Desktop Safari'] },
      testMatch: '**/component/**/*.spec.tsx',
    },
  ],

  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  // Next.js module resolution and setup
  moduleResolution: 'node',
  setupFiles: ['./tests/component/setup.ts'],

  // Module aliases for Next.js
  resolve: {
    alias: {
      'next/link': 'next/link.js',
      'next/image': 'next/image.js',
      'next/navigation': 'next/navigation.js',
    },
  },
});
