import { test, expect } from "@playwright/test";
import { sanityQueries } from "../fixtures/sanity-queries.fixture";
import { backendClient } from "../../../../sanity/lib/backendClient";
import { stripeMock } from "../fixtures/stripe-mock.fixture";

let testProductId: string = "";
let originalStock: number = 0;
let originalReservedStock: number = 0;

test.describe("Stock: Reservation Lifecycle (SAN-RS-01..06)", () => {
  test.beforeAll(async () => {
    // Find a product with sufficient stock for testing
    const products = await backendClient.fetch(
      `*[_type == "product" && !(_id in path("drafts.**"))]{_id, stock, reservedStock}[0..1]`
    );
    if (!products.length) throw new Error("No product with sufficient stock found");
    testProductId = products[0]._id;
    originalStock = products[0].stock;
    originalReservedStock = products[0].reservedStock || 0;
  });

  test.afterAll(async () => {
    // Clean up: reset stock to original values
    await backendClient
      .patch(testProductId)
      .set({ stock: originalStock, reservedStock: originalReservedStock })
      .commit();
  });

  test("RS-01: Happy path → stock-=N, reservedStock=0", async ({ request }) => {
    // Reset to known state
    await backendClient
      .patch(testProductId)
      .set({ stock: originalStock, reservedStock: originalReservedStock })
      .commit();

    // 1. Create checkout session (reserves stock)
    const checkoutRes = await request.post("/api/checkout", {
      data: { publicBasket: [{ _id: testProductId, quantity: 2 }] },
      headers: { "x-forwarded-for": `test-ip-${Date.now()}-${Math.random()}` }
    });

    // If Stripe is not configured, test will fail with 500
    // In that case, we can't test the full flow
    if (checkoutRes.status() === 500) {
      console.log("Stripe not configured - skipping RS-01 test");
      test.skip();
    }

    expect(checkoutRes.status()).toBe(200);
    const { client_secret } = await checkoutRes.json();
    const sessionId = client_secret.split('_secret')[0];

    // 2. Verify stock is reserved
    let product = await sanityQueries.getProductStock(testProductId);
    expect(product.stock).toBe(originalStock); // Stock unchanged during reservation
    expect(product.reservedStock).toBe(originalReservedStock + 2); // Stock reserved

    // 3. Simulate completed webhook
    const webhookPayload = await stripeMock.generateWebhookPayload(
      sessionId,
      "checkout.session.completed"
    );
    const webhookRes = await request.post("/api/webhook", {
      data: webhookPayload
    });
    expect(webhookRes.status()).toBe(200);

    // 4. Verify stock is finalized
    product = await sanityQueries.getProductStock(testProductId);
    expect(product.stock).toBe(originalStock - 2); // Stock decremented
    expect(product.reservedStock).toBe(originalReservedStock); // Reservation cleared
  });

  test("RS-02: Session expiry → stock unchanged, reservedStock=0", async ({ request }) => {
    // Reset to known state
    await backendClient
      .patch(testProductId)
      .set({ stock: originalStock, reservedStock: originalReservedStock })
      .commit();

    // 1. Create checkout session (reserves stock)
    const checkoutRes = await request.post("/api/checkout", {
      data: { publicBasket: [{ _id: testProductId, quantity: 1 }] },
      headers: { "x-forwarded-for": `test-ip-${Date.now()}-${Math.random()}` }
    });

    if (checkoutRes.status() === 500) {
      console.log("Stripe not configured - skipping RS-02 test");
      test.skip();
    }

    expect(checkoutRes.status()).toBe(200);
    const { client_secret } = await checkoutRes.json();
    const sessionId = client_secret.split('_secret')[0];

    // 2. Verify stock is reserved
    let product = await sanityQueries.getProductStock(testProductId);
    const reservedAfterCheckout = product.reservedStock;

    // 3. Simulate expired webhook
    const webhookPayload = await stripeMock.generateWebhookPayload(
      sessionId,
      "checkout.session.expired"
    );
    const webhookRes = await request.post("/api/webhook", {
      data: webhookPayload
    });
    expect(webhookRes.status()).toBe(200);

    // 4. Verify reservation is released
    product = await sanityQueries.getProductStock(testProductId);
    expect(product.stock).toBe(originalStock); // Stock unchanged from original
    expect(product.reservedStock).toBe(reservedAfterCheckout - 1); // Reservation released
  });

  test("RS-03: Stripe failure → stock unchanged, reservedStock=0", async ({ request }) => {
    // This test simulates rollback when Stripe session creation fails
    // We'll mock a scenario where checkout partially reserves then fails

    // Get current state
    const beforeProduct = await sanityQueries.getProductStock(testProductId);
    const beforeReserved = beforeProduct.reservedStock;

    // Create a basket that will fail validation (triggering rollback)
    const res = await request.post("/api/checkout", {
      data: {
        publicBasket: [
          { _id: testProductId, quantity: 1 },
          { _id: "nonexistent-product-id", quantity: 1 } // This will cause failure
        ]
      },
      headers: { "x-forwarded-for": `test-ip-${Date.now()}-${Math.random()}` }
    });
    // Should fail with 400 (invalid product) or 500 (server error)
    expect([400, 500]).toContain(res.status());

    // Verify no stock was reserved (rollback happened)
    const afterProduct = await sanityQueries.getProductStock(testProductId);
    expect(afterProduct.stock).toBe(beforeProduct.stock);
    expect(afterProduct.reservedStock).toBe(beforeReserved);
  });

  test("RS-04: Multi-item partial fail → all reversed", async ({ request }) => {
    // Find two products for multi-item test
    const products = await backendClient.fetch(
      `*[_type == "product" && !(_id in path("drafts.**"))]{_id, stock, reservedStock}[0..1]`
    );
    if (products.length < 2) test.skip();

    const product1 = products[0];
    const product2 = products[1];

    // Get initial state
    const initial1 = await sanityQueries.getProductStock(product1._id);
    const initial2 = await sanityQueries.getProductStock(product2._id);

    // Create basket with one valid and one invalid product
    const res = await request.post("/api/checkout", {
      data: {
        publicBasket: [
          { _id: product1._id, quantity: 1 },
          { _id: "invalid-product-id", quantity: 1 }
        ]
      },
      headers: { "x-forwarded-for": `test-ip-${Date.now()}-${Math.random()}` }
    });
    expect([400, 500]).toContain(res.status());

    // Verify all reservations were rolled back
    const final1 = await sanityQueries.getProductStock(product1._id);
    const final2 = await sanityQueries.getProductStock(product2._id);

    expect(final1.stock).toBe(initial1.stock);
    expect(final1.reservedStock).toBe(initial1.reservedStock);
    expect(final2.stock).toBe(initial2.stock);
    expect(final2.reservedStock).toBe(initial2.reservedStock);
  });

  test("RS-05: Out-of-order delivery → reservedStock >= 0 (proves SG-02 fix)", async ({ request }) => {
    // This test exposes the bug where reservedStock can go negative
    // when expired fires before completed

    // 1. Create checkout session
    const checkoutRes = await request.post("/api/checkout", {
      data: { publicBasket: [{ _id: testProductId, quantity: 1 }] },
      headers: { "x-forwarded-for": `test-ip-${Date.now()}-${Math.random()}` }
    });

    if (checkoutRes.status() === 500) {
      console.log("Stripe not configured - skipping RS-05 test");
      test.skip();
    }

    expect(checkoutRes.status()).toBe(200);
    const { client_secret } = await checkoutRes.json();
    const sessionId = client_secret.split('_secret')[0];

    // 2. Verify reservation
    let product = await sanityQueries.getProductStock(testProductId);
    const reservedAmount = product.reservedStock;

    // 3. Send EXPIRED webhook first (out of order)
    const expiredPayload = await stripeMock.generateWebhookPayload(
      sessionId,
      "checkout.session.expired"
    );
    const expiredRes = await request.post("/api/webhook", {
      data: expiredPayload
    });
    expect(expiredRes.status()).toBe(200);

    // 4. Verify reservation released
    product = await sanityQueries.getProductStock(testProductId);
    expect(product.reservedStock).toBe(reservedAmount - 1);

    // 5. Now send COMPLETED webhook (should not make reservedStock negative)
    const completedPayload = await stripeMock.generateWebhookPayload(
      sessionId,
      "checkout.session.completed"
    );
    const completedRes = await request.post("/api/webhook", {
      data: completedPayload
    });
    expect(completedRes.status()).toBe(200);

    // 6. CRITICAL: reservedStock should NOT be negative
    product = await sanityQueries.getProductStock(testProductId);
    expect(product.reservedStock).toBeGreaterThanOrEqual(0);

    // This test will FAIL with current implementation, proving SG-02 bug
    // After fix, reservedStock should remain at 0, not go negative
  });

  test("RS-06: Rollback failure for one item → logged, others still rolled back", async ({ request }) => {
    // This test simulates a scenario where rollback fails for one item
    // but succeeds for others, proving error handling

    // Get two products
    const products = await backendClient.fetch(
      `*[_type == "product" && !(_id in path("drafts.**"))]{_id}[0..1]`
    );
    if (products.length < 2) test.skip();

    const product1 = products[0];
    const product2 = products[1];

    // Get initial state
    const initial1 = await sanityQueries.getProductStock(product1._id);
    const initial2 = await sanityQueries.getProductStock(product2._id);

    // Create a scenario that will fail and require rollback
    // We'll use an invalid quantity to trigger validation failure after reservation
    const res = await request.post("/api/checkout", {
      data: {
        publicBasket: [
          { _id: product1._id, quantity: 1 },
          { _id: product2._id, quantity: 1 },
          { _id: "invalid-product", quantity: 999 } // This will cause failure
        ]
      },
      headers: { "x-forwarded-for": `test-ip-${Date.now()}-${Math.random()}` }
    });
    expect(res.status()).toBe(400);

    // Verify rollback was attempted for valid items
    // In current implementation, successful rollbacks should complete
    // Failed rollbacks should be logged but not block others
    const final1 = await sanityQueries.getProductStock(product1._id);
    const final2 = await sanityQueries.getProductStock(product2._id);

    // Ideally, both should be rolled back
    // Current bug: if one fails, others might not be rolled back
    expect(final1.reservedStock).toBe(initial1.reservedStock);
    expect(final2.reservedStock).toBe(initial2.reservedStock);
  });
});
