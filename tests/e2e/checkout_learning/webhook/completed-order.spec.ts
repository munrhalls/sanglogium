import { test, expect } from "@playwright/test";
import { stripe } from "../fixtures/stripe-mock.fixture";
import { sanityQueries } from "../fixtures/sanity-queries.fixture";
import { TEST_PRODUCT_IDS, TEST_ADDRESSES } from "../fixtures/test-data";

const WEBHOOK_URL = "/api/webhook";
const CHECKOUT_URL = "/api/checkout";
const SECRET = process.env.STRIPE_WEBHOOK_SECRET || "whsec_test_secret";

test.describe("Webhook Completed Order (V-19, V-20, SG-07, SG-11)", () => {
  test("WH-COMP-01: Order created correctly and stock decremented (V-19, V-20)", async ({ request }) => {
    const sessionId = `cs_test_${Date.now()}`;

    // Get original stock for this test
    const stockInfo = await sanityQueries.getProductStock(TEST_PRODUCT_IDS[0]);
    const originalStock = stockInfo?.stock || 0;

    // Create a complete mock session payload
    const payloadObject = {
      id: `evt_test_${Date.now()}`,
      type: "checkout.session.completed",
      data: {
        object: {
          id: sessionId,
          amount_total: 1999,
          amount_subtotal: 1999,
          total_details: { amount_shipping: 0, amount_tax: 0 },
          currency: "usd",
          payment_intent: `pi_test_${Date.now()}`,
          customer: `cus_test_${Date.now()}`,
          metadata: {
            productsIntent: `${TEST_PRODUCT_IDS[0]}:1`,
            clerkUserId: "guest"
          },
          line_items: {
            data: [{
              id: `li_test_${Date.now()}`,
              amount_total: 1999,
              quantity: 1,
              price: {
                unit_amount: 1999,
                currency: "usd",
                product: {
                  id: TEST_PRODUCT_IDS[0],
                  name: "Test Product"
                }
              }
            }]
          },
          shipping_details: {
            name: "Test User",
            address: {
              line1: "Test Street",
              city: "Test City",
              state: "TS",
              postal_code: "12345",
              country: "US"
            }
          },
          customer_details: {
            email: "test@example.com",
            name: "Test User"
          }
        }
      }
    };

    const payload = JSON.stringify(payloadObject);
    const signature = stripe.webhooks.generateTestHeaderString({
      payload: JSON.stringify(payloadObject),
      secret: SECRET,
    });

    const res = await request.post(WEBHOOK_URL, {
      data: payload,
      headers: { "stripe-signature": signature, "Content-Type": "application/json" },
    });

    // Some logic handles async, we wait for a bit
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Assert 200
    expect(res.status()).toBe(200);

    // Verify order in Sanity (V-19)
    const order = await sanityQueries.getOrderBySession(sessionId);
    expect(order).toBeTruthy();
    expect(order.status).toBe("paid");
    expect(order.items.length).toBeGreaterThan(0);

    // Verify stock decremented correctly (V-20)
    const newStockInfo = await sanityQueries.getProductStock(TEST_PRODUCT_IDS[0]);
    expect(newStockInfo.stock).toBe(originalStock - 1);
  });

  test("WH-COMP-02: Order number is unique (SG-11)", async ({ request }) => {
    const session1Id = `cs_test_${Date.now()}_1`;
    const session2Id = `cs_test_${Date.now()}_2`;

    // Create first order with product 0
    const payload1 = {
      id: `evt_test_${Date.now()}_1`,
      type: "checkout.session.completed",
      data: {
        object: {
          id: session1Id,
          amount_total: 1999,
          metadata: { productsIntent: `${TEST_PRODUCT_IDS[0]}:1`, clerkUserId: "guest" },
          line_items: {
            data: [{
              amount_total: 1999,
              quantity: 1,
              price: { unit_amount: 1999, currency: "usd" },
            }]
          },
          shipping_details: {
            name: "Test User 1",
            address: { line1: "Test Street", city: "Test City", state: "TS", postal_code: "12345", country: "US" }
          },
          customer_details: { email: "test1@example.com", name: "Test User 1" }
        }
      }
    };

    const signature1 = stripe.webhooks.generateTestHeaderString({
      payload: JSON.stringify(payload1),
      secret: SECRET,
    });

    await request.post(WEBHOOK_URL, {
      data: JSON.stringify(payload1),
      headers: { "stripe-signature": signature1, "Content-Type": "application/json" },
    });

    // Create second order with product 1
    const payload2 = {
      id: `evt_test_${Date.now()}_2`,
      type: "checkout.session.completed",
      data: {
        object: {
          id: session2Id,
          amount_total: 1999,
          metadata: { productsIntent: `${TEST_PRODUCT_IDS[1]}:1`, clerkUserId: "guest" },
          line_items: {
            data: [{
              amount_total: 1999,
              quantity: 1,
              price: { unit_amount: 1999, currency: "usd" },
            }]
          },
          shipping_details: {
            name: "Test User 2",
            address: { line1: "Test Street", city: "Test City", state: "TS", postal_code: "12345", country: "US" }
          },
          customer_details: { email: "test2@example.com", name: "Test User 2" }
        }
      }
    };

    const signature2 = stripe.webhooks.generateTestHeaderString({
      payload: JSON.stringify(payload2),
      secret: SECRET,
    });

    await request.post(WEBHOOK_URL, {
      data: JSON.stringify(payload2),
      headers: { "stripe-signature": signature2, "Content-Type": "application/json" },
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    const order1 = await sanityQueries.getOrderBySession(session1Id);
    const order2 = await sanityQueries.getOrderBySession(session2Id);

    expect(order1).toBeTruthy();
    expect(order2).toBeTruthy();
    expect(order1.orderNumber).not.toBe(order2.orderNumber);
  });

  test("WH-COMP-03: Empty state field doesn't break creation (SG-07)", async ({ request }) => {
    const sessionId = `cs_test_${Date.now()}_3`;

    const payloadObject = {
      id: `evt_test_${Date.now()}_3`,
      type: "checkout.session.completed",
      data: {
        object: {
          id: sessionId,
          amount_total: 1999,
          metadata: { productsIntent: `${TEST_PRODUCT_IDS[0]}:1`, clerkUserId: "guest" },
          line_items: {
            data: [{
              amount_total: 1999,
              quantity: 1,
              price: { unit_amount: 1999, currency: "usd" },
            }]
          },
          // Shipping address with empty state
          shipping_details: {
            name: "Test User",
            address: {
              line1: "Test Street",
              city: "Test City",
              state: "", // Empty state
              postal_code: "12345",
              country: "US"
            }
          },
          customer_details: { email: "test3@example.com", name: "Test User 3" }
        }
      }
    };

    const signature = stripe.webhooks.generateTestHeaderString({
      payload: JSON.stringify(payloadObject),
      secret: SECRET,
    });

    const res = await request.post(WEBHOOK_URL, {
      data: JSON.stringify(payloadObject),
      headers: { "stripe-signature": signature, "Content-Type": "application/json" },
    });

    expect(res.status()).toBe(200);

    await new Promise(resolve => setTimeout(resolve, 2000));
    const order3 = await sanityQueries.getOrderBySession(sessionId);
    expect(order3).toBeTruthy();
    // Validate we didn't require state
    expect(order3.status).toBe("paid");
  });
});
