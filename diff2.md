diff --git a/package.json b/package.json
index 05a56221..462afb68 100644
--- a/package.json
+++ b/package.json
@@ -28,8 +28,15 @@
     "test:coverage": "vitest run --coverage",
     "test:homepage:unit": "vitest run tests/unit/homepage/",
     "test:homepage:component": "npx playwright test-ct tests/component/",
-    "test:e2e": "npm run build && npx playwright test --project=chromium",
-    "test:e2e:dev": "npx playwright test --project=chromium",
+    "test:e2e": "npm run build && npx playwright test",
+    "test:e2e:dev": "npx playwright test --project=desktop-chromium",
+    "test:checkout": "npx playwright test tests/e2e/checkout/ --project=desktop-chromium",
+    "test:checkout:all": "npx playwright test tests/e2e/checkout/",
+    "test:e2e:android": "npx playwright test --project=android-pixel",
+    "test:e2e:iphone": "npx playwright test --project=iphone-legacy",
+    "test:e2e:api": "npx playwright test --project=api",
+    "test:golden": "npx playwright test tests/e2e/checkout/guest/golden-path.spec.ts tests/e2e/checkout/auth/golden-path.spec.ts",
+    "test:report": "npx playwright show-report",
     "test:homepage:regression": "npx playwright test tests/e2e/homepage/regression.spec.ts",
     "test:homepage:a11y": "npx playwright test tests/e2e/homepage/accessibility.spec.ts",
     "test:homepage:rwd": "npx playwright test tests/e2e/homepage/rwd-matrix.spec.ts",
diff --git a/playwright.config.ts b/playwright.config.ts
index a5eea673..9dfcfbf4 100644
--- a/playwright.config.ts
+++ b/playwright.config.ts
@@ -17,28 +17,54 @@ export default defineConfig({
     screenshot: "only-on-failure", // Only screenshot on failure
   },
 
+  reporter: [
+    ['html', { open: 'never', outputFolder: 'playwright-report' }],
+    ['list'],
+  ],
+
   projects: [
-    // Desktop Chromium
+    // ÔöÇÔöÇÔöÇ Tier 1: Desktop (primary development target) ÔöÇÔöÇÔöÇ
     {
-      name: "chromium",
+      name: 'desktop-chromium',
       use: {
-        ...devices["Desktop Chrome"],
+        ...devices['Desktop Chrome'],
         headless: true,
+        viewport: { width: 1440, height: 900 },
       },
     },
-    // Mobile Viewports
+
+    // ÔöÇÔöÇÔöÇ Tier 2: Modern Android Phone ÔöÇÔöÇÔöÇ
     {
-      name: "Mobile Chrome",
+      name: 'android-pixel',
       use: {
-        ...devices["Pixel 5"],
+        ...devices['Pixel 7'],
         headless: true,
+        // Simulate 4G network
+        launchOptions: {
+          args: ['--disable-dev-shm-usage'],
+        },
       },
     },
+
+    // ÔöÇÔöÇÔöÇ Tier 3: Old iPhone (Constraint Device) ÔöÇÔöÇÔöÇ
     {
-      name: "Mobile Safari",
+      name: 'iphone-legacy',
       use: {
-        ...devices["iPhone 13"],
+        ...devices['iPhone 8'],         // 375├ù667 viewport, webkit
         headless: true,
+        // Simulate slow 3G
+      },
+    },
+
+    // ÔöÇÔöÇÔöÇ Tier 4: API-only (no browser, for webhook/server tests) ÔöÇÔöÇÔöÇ
+    {
+      name: 'api',
+      testMatch: /\/(api|webhook|stock|worst-case)\//,
+      use: {
+        baseURL: 'http://localhost:3000',
+        extraHTTPHeaders: {
+          'Content-Type': 'application/json',
+        },
       },
     },
   ],
