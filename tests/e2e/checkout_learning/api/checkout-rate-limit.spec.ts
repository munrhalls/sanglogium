import { test, expect } from "@playwright/test";

test.describe.serial("API: /api/checkout Rate Limit (SG-08, SG-09, V-22)", () => {
  const uniqueIp = `10.0.0.${Math.floor(Math.random() * 255)}`;

  test("Test A: 5 requests in <60s return valid error", async ({ request }) => {
    const payload = { publicBasket: [] };
    for (let i = 0; i < 5; i++) {
        const res = await request.post("/api/checkout", {
            data: payload,
            headers: { "x-forwarded-for": uniqueIp }
        });
        // We use an invalid basket because it triggers 400 BEFORE DB and prevents Stripe calls, 
        // effectively testing rate limiting logic efficiently.
        expect(res.status()).toBe(400);
    }
  });

  test("Test B: 6th request returns 429", async ({ request }) => {
    const payload = { publicBasket: [] };
    const res = await request.post("/api/checkout", {
        data: payload,
        headers: { "x-forwarded-for": uniqueIp }
    });
    expect(res.status()).toBe(429);
    expect((await res.json()).error).toBe("Rate limit exceeded. Please try again later.");
  });
});
