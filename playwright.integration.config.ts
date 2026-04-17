import { defineConfig, devices } from '@playwright/test'
import { config } from 'dotenv'

// Load environment variables from .env.test
config({ path: '.env.test' })

export default defineConfig({
  // Use existing project configuration
  testDir: './tests/checkout/guest-checkout-inventory-reservation/integration',

  // Run tests in files matching *.spec.ts pattern
  testMatch: '**/*.spec.ts',

  // Global setup for all tests
  globalSetup: undefined,

  // Use the dev server that's already running
  webServer: {
    command: 'echo "Dev server should already be running on port 3002"',
    port: 3002,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  // Test timeout
  timeout: 30000,

  // Expect timeout
  expect: {
    timeout: 10000,
  },

  // Retry configuration
  retries: process.env.CI ? 2 : 0,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['line'],
    ['junit', { outputFile: 'test-results.xml' }]
  ],

  // Projects
  projects: [
    {
      name: 'integration',
      use: {
        ...devices['Desktop Chrome'],
        // Viewport size
        viewport: { width: 1280, height: 720 },
        // Ignore HTTPS errors
        ignoreHTTPSErrors: true,
        // Video recording for failed tests
        video: 'retain-on-failure',
        // Screenshot on failure
        screenshot: 'only-on-failure',
        // Trace on failure
        trace: 'retain-on-failure',
      },
    },
  ],

  // Output directory
  outputDir: 'test-results/',

  // Global teardown
  globalTeardown: undefined,
})
