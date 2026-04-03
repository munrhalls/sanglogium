diff --git a/tests/e2e/checkout/fixtures/checkout.fixture.ts b/tests/e2e/checkout/fixtures/checkout.fixture.ts
new file mode 100644
index 00000000..4d88701b
--- /dev/null
+++ b/tests/e2e/checkout/fixtures/checkout.fixture.ts
@@ -0,0 +1,71 @@
+import { test as base, Page } from "@playwright/test";
+import { TEST_PRODUCT_IDS } from "./test-data";
+
+/**
+ * Extended Playwright Test Fixture for Checkout
+ * Provides pre-configured pages and stateful basket seeding/cleaning
+ */
+export const test = base.extend<{
+  authenticatedPage: Page;
+  guestPage: Page;
+  seededBasket: void;
+  cleanBasket: void;
+}>({
+  /**
+   * Authenticated Page
+   * TODO: Implement Clerk test-token injection in SC-7
+   */
+  authenticatedPage: async ({ page }, use) => {
+    await page.goto("/");
+    await use(page);
+  },
+
+  /**
+   * Guest Page
+   * Standard fresh session
+   */
+  guestPage: async ({ page }, use) => {
+    await page.goto("/");
+    await use(page);
+  },
+
+  /**
+   * Seeded Basket
+   * Decouples checkout tests from manual basket interaction logic
+   */
+  seededBasket: async ({ page }, use) => {
+    await page.goto("/");
+    await page.evaluate((productId) => {
+      const basketItem = {
+        _id: productId,
+        name: "Test Product",
+        displayPrice: 99.99,
+        stock: 10,
+        quantity: 1,
+        image: "image-test",
+        slug: "test-product"
+      };
+
+      localStorage.setItem("basket-storage", JSON.stringify({
+        state: { basket: [basketItem] },
+        version: 1
+      }));
+    }, TEST_PRODUCT_IDS[0]);
+    
+    await page.reload();
+    await use();
+  },
+
+  /**
+   * Clean Basket
+   * Ensures clean slate for guard validation tests
+   */
+  cleanBasket: async ({ page }, use) => {
+    await page.goto("/");
+    await page.evaluate(() => localStorage.removeItem("basket-storage"));
+    await page.reload();
+    await use();
+  }
+});
+
+export { expect } from "@playwright/test";
diff --git a/tests/e2e/checkout/fixtures/sanity-queries.fixture.ts b/tests/e2e/checkout/fixtures/sanity-queries.fixture.ts
new file mode 100644
index 00000000..0c36e41e
--- /dev/null
+++ b/tests/e2e/checkout/fixtures/sanity-queries.fixture.ts
@@ -0,0 +1,34 @@
+import { backendClient } from "../../../../sanity/lib/backendClient";
+
+/**
+ * Sanity Query Fixture
+ * Provides direct data verification for test assertions
+ */
+export const sanityQueries = {
+  /**
+   * Traces actual Sanity stock values (stock + reservedStock)
+   */
+  async getProductStock(productId: string) {
+    return await backendClient.fetch(
+      `*[_type == "product" && _id == $productId][0] { stock, reservedStock }`,
+      { productId }
+    );
+  },
+
+  /**
+   * Retrieves an order by its Stripe Session ID
+   */
+  async getOrderBySession(sessionId: string) {
+    return await backendClient.fetch(
+      `*[_type == "order" && payment.stripeCheckoutSessionId == $sessionId][0]`,
+      { sessionId }
+    );
+  },
+
+  /**
+   * Counts total orders for idempotency and baseline checks
+   */
+  async getOrderCount() {
+    return await backendClient.fetch(`count(*[_type == "order"])`);
+  }
+};
diff --git a/tests/e2e/checkout/fixtures/stripe-mock.fixture.ts b/tests/e2e/checkout/fixtures/stripe-mock.fixture.ts
new file mode 100644
index 00000000..2b95b8bf
--- /dev/null
+++ b/tests/e2e/checkout/fixtures/stripe-mock.fixture.ts
@@ -0,0 +1,41 @@
+import { stripe } from "../../../../lib/stripe/stripe.js";
+import { STRIPE_TEST_CARDS } from "./test-data";
+
+/**
+ * Stripe Test Fixture
+ * Provides helpers for webhook construction and session inspection
+ */
+export const stripeMock = {
+  /**
+   * Returns the primary success test card
+   */
+  getSuccessCard() {
+    return STRIPE_TEST_CARDS.SUCCESS;
+  },
+
+  /**
+   * Generates a mock webhook payload for testing internal API endpoints
+   * Supports 'checkout.session.completed', 'checkout.session.expired', etc.
+   */
+  async generateWebhookPayload(sessionId: string, type: string) {
+    return {
+      id: `evt_test_${Date.now()}`,
+      type: type,
+      data: {
+        object: {
+          id: sessionId,
+          metadata: {
+            productsIntent: "id_test_product_1:1"
+          }
+        }
+      }
+    };
+  },
+
+  /**
+   * Retrieves a real Stripe Session for state verification
+   */
+  async retrieveSession(sessionId: string) {
+    return await stripe.checkout.sessions.retrieve(sessionId);
+  }
+};
diff --git a/tests/e2e/checkout/fixtures/test-data.ts b/tests/e2e/checkout/fixtures/test-data.ts
new file mode 100644
index 00000000..08f2f6b3
--- /dev/null
+++ b/tests/e2e/checkout/fixtures/test-data.ts
@@ -0,0 +1,26 @@
+/**
+ * Test Data Constants
+ * Provides shared product IDs, addresses, and test cards across all E2E suites
+ */
+
+export const TEST_PRODUCT_IDS = [
+  "id_test_product_1",
+  "id_test_product_2"
+];
+
+export const TEST_ADDRESSES = {
+  POLAND: {
+    fullName: "John Doe",
+    email: "john.doe@example.com",
+    phone: "+48123456789",
+    street: "Rynek 1",
+    city: "Wroc┼éaw",
+    postalCode: "50-100",
+    country: "PL"
+  }
+};
+
+export const STRIPE_TEST_CARDS = {
+  SUCCESS: "4242 4242 4242 4242",
+  // Reserved for future use: DECLINED, EXPIRED, etc.
+};
diff --git a/tests_list.txt b/tests_list.txt
new file mode 100644
index 00000000..b2f91d70
Binary files /dev/null and b/tests_list.txt differ
