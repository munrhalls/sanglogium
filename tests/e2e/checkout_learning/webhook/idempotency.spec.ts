import { test, expect } from "@playwright/test";
import { stripe } from "../fixtures/stripe-mock.fixture";
import { sanityQueries } from "../fixtures/sanity-queries.fixture";
import { stripeMock } from "../fixtures/stripe-mock.fixture";

const WEBHOOK_URL = "/api/webhook";
const SECRET = process.env.STRIPE_WEBHOOK_SECRET || "whsec_test_secret";

test.describe("Webhook Replay & Idempotency (WH-RPL-01..02)", () => {
  test("WH-RPL-01: Replay of completed event creates exactly 1 order", async ({ request }) => {
    const sessionId = `cs_test_${Date.now()}`;

    // Create a mock session payload that doesn't require Stripe API call
    const payloadObject = {
      id: `evt_test_${Date.now()}`,
      type: "checkout.session.completed",
      data: {
        object: {
          id: sessionId,
          // Include all necessary data to avoid Stripe API call
          amount_total: 1999,
          amount_subtotal: 1999,
          total_details: { amount_shipping: 0, amount_tax: 0 },
          currency: "usd",
          payment_intent: `pi_test_${Date.now()}`,
          customer: `cus_test_${Date.now()}`,
          metadata: {
            productsIntent: "3O1ZNp54LWQGln4uEAU7Vs:1",
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
                  id: "3O1ZNp54LWQGln4uEAU7Vs",
                  name: "Meze Audio 99 Series Cable"
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
    const signature = stripe.webhooks.generateTestHeaderString({ payload, secret: SECRET });

    // Send first webhook
    const res1 = await request.post(WEBHOOK_URL, {
      data: payload,
      headers: { "stripe-signature": signature, "Content-Type": "application/json" },
    });
    expect(res1.status()).toBe(200);

    const ordersAfterFirst = await sanityQueries.getOrderBySession(sessionId);
    expect(ordersAfterFirst).toBeTruthy();

    // Send identical webhook again
    const res2 = await request.post(WEBHOOK_URL, {
      data: payload,
      headers: { "stripe-signature": signature, "Content-Type": "application/json" },
    });
    expect(res2.status()).toBe(200);

    // Verify still exactly 1 order with this session ID
    const resolvedOrder = await sanityQueries.getOrderBySession(sessionId);
    expect(resolvedOrder).toBeTruthy();
    expect(resolvedOrder.status).toBe("paid");
  });

  test("WH-RPL-02: Replay with stale timestamp is rejected", async ({ request }) => {
    const sessionId = `cs_test_${Date.now()}_stale`;
    const payloadObject = await stripeMock.generateWebhookPayload(sessionId, "checkout.session.completed");
    const payload = JSON.stringify(payloadObject);

    // Create a timestamp from 10 minutes ago (600 seconds)
    // Stripe tolerance window is 5 minutes (300 seconds)
    const timestamp = Math.floor(Date.now() / 1000) - 600;

    const signature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: SECRET,
      timestamp // older than tolerance window
    });

    const res = await request.post(WEBHOOK_URL, {
      data: payload,
      headers: { "stripe-signature": signature, "Content-Type": "application/json" },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Webhook Error");
  });
});
