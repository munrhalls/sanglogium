import { test, expect } from "@playwright/test";
import { stripe } from "../../../../lib/stripe/stripe.js";

const WEBHOOK_URL = "/api/webhook";
const SECRET = process.env.STRIPE_WEBHOOK_SECRET || "whsec_test_secret";

test.describe("Webhook Signature Validation (WH-SIG-01..05)", () => {
  test("WH-SIG-01: Rejects missing stripe-signature header", async ({ request }) => {
    const res = await request.post(WEBHOOK_URL, {
      data: { type: "checkout.session.completed" },
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Missing stripe-signature header");
  });

  test("WH-SIG-02: Rejects invalid signature (tampered body)", async ({ request }) => {
    const validBody = JSON.stringify({ id: "evt_test" });
    const tamperedBody = JSON.stringify({ id: "evt_test", tampered: true });
    
    // Generate signature for the VALID body
    const signature = stripe.webhooks.generateTestHeaderString({
      payload: validBody,
      secret: SECRET,
    });

    const res = await request.post(WEBHOOK_URL, {
      data: tamperedBody, // Send the tampered body instead
      headers: { 
        "stripe-signature": signature, 
        "Content-Type": "application/json" 
      },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Webhook Error");
  });

  test("WH-SIG-03: Rejects invalid signature (wrong secret)", async ({ request }) => {
    const payload = JSON.stringify({ id: "evt_test", type: "some_event" });
    const signature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: "wrong_secret",
    });

    const res = await request.post(WEBHOOK_URL, {
      data: payload,
      headers: { 
        "stripe-signature": signature, 
        "Content-Type": "application/json" 
      },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Webhook Error");
  });

  test("WH-SIG-04: Accepts valid signature and valid body", async ({ request }) => {
    const payload = JSON.stringify({ 
      id: "evt_test", 
      type: "checkout.session.completed", 
      data: { object: { id: "cs_test" } }
    });
    const signature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: SECRET,
    });

    const res = await request.post(WEBHOOK_URL, {
      data: payload,
      headers: { 
        "stripe-signature": signature, 
        "Content-Type": "application/json" 
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.received).toBe(true);
  });

  test("WH-SIG-05: Rejects empty body with valid signature format", async ({ request }) => {
    const payload = "";
    const signature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: SECRET,
    });

    const res = await request.post(WEBHOOK_URL, {
      data: payload,
      headers: { 
        "stripe-signature": signature, 
        "Content-Type": "application/json" 
      },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Webhook Error");
  });
});
