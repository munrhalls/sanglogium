const { defineConfig } = require('lighthouse');

/**
 * Lighthouse CI Configuration - Mobile
 * 
 * Run locally with:
 *   npm install -g @lhci/cli
 *   lhci autorun --config=lighthouserc.mobile.cjs
 * 
 * Run on CI:
 *   lhci autorun --config=lighthouserc.mobile.cjs
 */

module.exports = {
  ci: {
    // Collect configuration
    collect: {
      // Start production build server for stable measurements
      startServerCommand: 'npm run start',
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/product/test-64-audio-premium-pearl-cable-3-5mm',
        'http://localhost:3000/products/headphones',
      ],
      numberOfRuns: 3, // Run multiple times for stable metrics
      
      // Puppeteer options for more realistic testing
      puppeteerScript: undefined,
      puppeteerLaunchOptions: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
      
      // Settings for mobile testing (throttled)
      settings: {
        preset: 'mobile', // Mobile preset
        formFactor: 'mobile',
        throttling: {
          // Simulate slow 4G
          rttMs: 150,
          throughputKbps: 1.6 * 1024,
          cpuSlowdownMultiplier: 4,
        },
        screenEmulation: {
          mobile: true,
          width: 360,
          height: 640,
          deviceScaleFactor: 1,
          disabled: false,
        },
        emulatedUserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        skipAudits: ['uses-http2'], // Vercel handles HTTP/2 automatically
      },
    },

    // Assert configuration - FAILS if these thresholds aren't met
    assert: {
      assertions: {
        // Performance categories
        'categories:performance': ['warn', { minScore: 0.7 }], // Warn if below 70
        'categories:accessibility': ['error', { minScore: 0.9 }], // Error if below 90
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.9 }],

        // Core Web Vitals - ERROR if these fail
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }], // FCP < 2s
        'largest-contentful-paint': ['error', { maxNumericValue: 3000 }], // LCP < 3s
        'total-blocking-time': ['warn', { maxNumericValue: 300 }], // TBT < 300ms
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }], // CLS < 0.1
        'speed-index': ['warn', { maxNumericValue: 4300 }], // Speed Index < 4.3s
        'server-response-time': ['error', { maxNumericValue: 600 }], // TTFB < 600ms

        // Resource budgets
        'total-byte-weight': ['error', { maxNumericValue: 2.5 * 1024 * 1024 }], // < 2.5MB
        'unused-javascript': ['error', { maxNumericValue: 150 * 1024 }], // < 150KB unused
        'uses-long-cache-ttl': ['warn', { minScore: 0.8 }],
        'uses-responsive-images': ['warn', { minScore: 0.8 }],
      },
    },

    // Upload configuration
    upload: {
      target: 'temporary-public-storage', // Or 'lhci' for Lighthouse CI server
      // githubAppToken: process.env.LHCI_GITHUB_APP_TOKEN,
    },

    // Server configuration
    server: {
      // Storage for historical data
      storage: {
        storageMethod: 'sql',
        sqlDialect: 'sqlite',
        sqlDatabasePath: './lighthouse-ci.db',
      },
    },

    // Wizard configuration
    wizard: {
      // Skip wizard prompts in CI
    },
  },

  // Custom audit configuration
  // extends: 'lighthouse:default',
};
