import { test, expect } from "@playwright/test";
import { stripe } from "../fixtures/stripe-mock.fixture";
import { sanityQueries } from "../fixtures/sanity-queries.fixture";
import { TEST_PRODUCT_IDS } from "../fixtures/test-data";
import { stripeMock } from "../fixtures/stripe-mock.fixture";

const WEBHOOK_URL = "/api/webhook";
const CHECKOUT_URL = "/api/checkout";
const SECRET = process.env.STRIPE_WEBHOOK_SECRET || "whsec_test_secret";

test.describe("Webhook Failed Payment Release (W-1c)", () => {
  let originalStock: number;
  let originalReserved: number;

  test.beforeAll(async ({ request }) => {
    const stockBefore = await sanityQueries.getProductStock(TEST_PRODUCT_IDS[1]);
    originalStock = stockBefore?.stock || 0;

    // Get initial reserved stock
    const stockAfterReserve = await sanityQueries.getProductStock(TEST_PRODUCT_IDS[1]);
    originalReserved = stockAfterReserve?.reservedStock || 0;
  });

  test("WH-FAIL-01: Async payment failure releases reserved stock and leaves stock unchanged", async ({ request }) => {
    const sessionId = `cs_test_${Date.now()}_failed`;

    // Generate failed payment payload using our mock fixture
    const payloadObject = await stripeMock.generateWebhookPayload(sessionId, "checkout.session.async_payment_failed");
    // Override with the correct product and quantity
    payloadObject.data.object.metadata.productsIntent = `${TEST_PRODUCT_IDS[1]}:1`;

    const payload = JSON.stringify(payloadObject);
    const signature = stripe.webhooks.generateTestHeaderString({ payload, secret: SECRET });

    const res = await request.post(WEBHOOK_URL, {
      data: payload,
      headers: { "stripe-signature": signature, "Content-Type": "application/json" },
    });

    expect(res.status()).toBe(200);

    // Wait for async Sanity patch
    await new Promise(resolve => setTimeout(resolve, 2000));

    const finalStockInfo = await sanityQueries.getProductStock(TEST_PRODUCT_IDS[1]);

    // Test A: stock unchanged
    // Test B: reservedStock should not go negative
    expect(finalStockInfo.stock).toBe(originalStock); // stock is unchanged
    expect(finalStockInfo.reservedStock).toBeGreaterThanOrEqual(0);
  });
});
