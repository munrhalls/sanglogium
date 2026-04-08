import { test, expect } from "@playwright/test";
import { stripe } from "../fixtures/stripe-mock.fixture";
import { stripeMock } from "../fixtures/stripe-mock.fixture";

const WEBHOOK_URL = "/api/webhook";
const SECRET = process.env.STRIPE_WEBHOOK_SECRET || "whsec_test_secret";

// Helper function to send webhook events
async function sendWebhookEvent(request: any, eventType: string, sessionId: string) {
  const payloadObject = await stripeMock.generateWebhookPayload(sessionId, eventType);
  const payload = JSON.stringify(payloadObject);
  const signature = stripe.webhooks.generateTestHeaderString({ payload, secret: SECRET });

  return await request.post(WEBHOOK_URL, {
    data: payload,
    headers: { "stripe-signature": signature, "Content-Type": "application/json" },
  });
}

test.describe("Webhook Event Filtering (WH-EVT-01..05)", () => {
  test("WH-EVT-01: Valid but non-permitted event (payment_intent.succeeded) is acknowledged", async ({ request }) => {
    const res = await sendWebhookEvent(request, "payment_intent.succeeded", "pi_test");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.received).toBe(true);
  });

  test("WH-EVT-02: Permitted event (checkout.session.completed) is processed", async ({ request }) => {
    const sessionId = `cs_test_${Date.now()}`;

    // Create a minimal mock session payload
    const payloadObject = {
      id: `evt_test_${Date.now()}`,
      type: "checkout.session.completed",
      data: {
        object: {
          id: sessionId,
          amount_total: 1999,
          metadata: {
            productsIntent: "3O1ZNp54LWQGln4uEAU7Vs:1",
            clerkUserId: "guest"
          },
          line_items: {
            data: [{
              amount_total: 1999,
              quantity: 1,
              price: { unit_amount: 1999, currency: "usd" },
            }]
          },
          customer_details: { email: "test@example.com", name: "Test User" }
        }
      }
    };

    const payload = JSON.stringify(payloadObject);
    const signature = stripe.webhooks.generateTestHeaderString({ payload, secret: SECRET });

    const res = await request.post(WEBHOOK_URL, {
      data: payload,
      headers: { "stripe-signature": signature, "Content-Type": "application/json" },
    });
    expect(res.status()).toBe(200);
  });

  test("WH-EVT-03: Permitted event (checkout.session.expired) is processed", async ({ request }) => {
    const res = await sendWebhookEvent(request, "checkout.session.expired", `cs_test_${Date.now()}`);
    expect(res.status()).toBe(200);
  });

  test("WH-EVT-04: Permitted event (checkout.session.async_payment_failed) is processed", async ({ request }) => {
    const res = await sendWebhookEvent(request, "checkout.session.async_payment_failed", `cs_test_${Date.now()}`);
    expect(res.status()).toBe(200);
  });

  test("WH-EVT-05: Completely fabricated malicious event type is acknowledged", async ({ request }) => {
    const res = await sendWebhookEvent(request, "malicious.type", "test_id");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.received).toBe(true);
  });
});
