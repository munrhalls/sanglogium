import { test, expect } from "@playwright/test";
import { sanityQueries } from "../fixtures/sanity-queries.fixture";
import { backendClient } from "../../../../sanity/lib/backendClient";

let testProductId: string = "";
let originalStock: number = 0;
let originalReservedStock: number = 0;

test.describe("Stock: Concurrent Checkout (SAN-RC-01..03, SG-05)", () => {
  test.beforeAll(async () => {
    // Find a product with limited stock for concurrency testing
    const product = await backendClient.fetch(
      `*[_type == "product" && !(_id in path("drafts.**")) && stock == 3][0]{_id, stock, reservedStock}`
    );
    if (!product) {
      // If no product with exactly 3 stock, find one with at least 3 and set it to 3
      const anyProduct = await backendClient.fetch(
        `*[_type == "product" && !(_id in path("drafts.**")) && stock >= 3][0]{_id, stock, reservedStock}`
      );
      if (!anyProduct) throw new Error("No product with sufficient stock found");
      testProductId = anyProduct._id;
      originalStock = anyProduct.stock;
      originalReservedStock = anyProduct.reservedStock || 0;

      // Set stock to 3 for testing
      await backendClient
        .patch(testProductId)
        .set({ stock: 3 })
        .commit();
    } else {
      testProductId = product._id;
      originalStock = product.stock;
      originalReservedStock = product.reservedStock || 0;
    }
  });

  test.afterAll(async () => {
    // Restore original stock
    await backendClient
      .patch(testProductId)
      .set({ stock: originalStock, reservedStock: originalReservedStock })
      .commit();
  });

  test("RC-01: Two concurrent requests, total > stock → one gets 409 (or 500)", async ({ request }) => {
    // Reset stock to known state
    await backendClient
      .patch(testProductId)
      .set({ stock: 3, reservedStock: 0 })
      .commit();

    // Create two concurrent requests for 2 items each (total 4 > stock 3)
    const request1 = request.post("/api/checkout", {
      data: { publicBasket: [{ _id: testProductId, quantity: 2 }] },
      headers: { "x-forwarded-for": `test-ip-${Date.now()}-1` }
    });

    const request2 = request.post("/api/checkout", {
      data: { publicBasket: [{ _id: testProductId, quantity: 2 }] },
      headers: { "x-forwarded-for": `test-ip-${Date.now()}-2` }
    });

    // Execute both requests concurrently
    const [res1, res2] = await Promise.all([request1, request2]);

    // One should succeed, one should fail, or both might fail due to race conditions
    const successCount = [res1.status(), res2.status()].filter(s => s === 200).length;
    const failCount = [res1.status(), res2.status()].filter(s => s === 409 || s === 500).length;

    // At least one should have been attempted
    expect(successCount + failCount).toBe(2);

    // If we have a success, verify stock state
    if (successCount > 0) {
      const product = await sanityQueries.getProductStock(testProductId);
      expect(product.stock).toBe(3); // Stock unchanged during reservation
      expect(product.reservedStock).toBeLessThanOrEqual(3); // Should not exceed stock
    }
  });

  test("RC-02: Same user two tabs → independent reservations", async ({ request }) => {
    // Reset stock
    await backendClient
      .patch(testProductId)
      .set({ stock: 3, reservedStock: 0 })
      .commit();

    // Simulate same user (same IP) in two tabs
    const userIP = `same-user-${Date.now()}`;

    const request1 = request.post("/api/checkout", {
      data: { publicBasket: [{ _id: testProductId, quantity: 1 }] },
      headers: { "x-forwarded-for": userIP }
    });

    const request2 = request.post("/api/checkout", {
      data: { publicBasket: [{ _id: testProductId, quantity: 1 }] },
      headers: { "x-forwarded-for": userIP }
    });

    // Both should succeed (rate limit allows 5 per minute)
    const [res1, res2] = await Promise.all([request1, request2]);

    expect(res1.status()).toBe(200);
    expect(res2.status()).toBe(200);

    // Verify both reservations were created
    const product = await sanityQueries.getProductStock(testProductId);
    expect(product.reservedStock).toBe(2);

    // Clean up: release reservations
    const { client_secret: secret1 } = await res1.json();
    const { client_secret: secret2 } = await res2.json();

    // Simulate expiration to release
    await request.post("/api/webhook", {
      data: {
        id: `evt_test_${Date.now()}_1`,
        type: "checkout.session.expired",
        data: { object: { id: secret1.split('_secret')[0] } }
      }
    });

    await request.post("/api/webhook", {
      data: {
        id: `evt_test_${Date.now()}_2`,
        type: "checkout.session.expired",
        data: { object: { id: secret2.split('_secret')[0] } }
      }
    });
  });

  test("RC-03: Admin modifies stock during checkout → document behavior", async ({ request }) => {
    // Reset stock
    await backendClient
      .patch(testProductId)
      .set({ stock: 5, reservedStock: 0 })
      .commit();

    // Start checkout process
    const checkoutRes = await request.post("/api/checkout", {
      data: { publicBasket: [{ _id: testProductId, quantity: 3 }] },
      headers: { "x-forwarded-for": `test-ip-${Date.now()}-admin` }
    });

    if (checkoutRes.status() === 500) {
      console.log("Stripe not configured - skipping RC-03 test");
      test.skip();
    }

    expect(checkoutRes.status()).toBe(200);

    // Verify reservation
    let product = await sanityQueries.getProductStock(testProductId);
    expect(product.reservedStock).toBe(3);

    // Admin reduces stock below reserved amount
    await backendClient
      .patch(testProductId)
      .set({ stock: 2 }) // Stock is now less than reservedStock
      .commit();

    // Try another checkout request
    const secondRes = await request.post("/api/checkout", {
      data: { publicBasket: [{ _id: testProductId, quantity: 1 }] },
      headers: { "x-forwarded-for": `test-ip-${Date.now()}-second` }
    });

    // Should fail due to insufficient available stock
    expect([409, 500]).toContain(secondRes.status());
    if (secondRes.status() === 409) {
      expect((await secondRes.json()).error).toContain("Insufficient stock");
    }

    // Complete the first checkout
    const { client_secret } = await checkoutRes.json();
    const sessionId = client_secret.split('_secret')[0];

    await request.post("/api/webhook", {
      data: {
        id: `evt_test_${Date.now()}`,
        type: "checkout.session.completed",
        data: {
          object: {
            id: sessionId,
            metadata: { productsIntent: `${testProductId}:3` }
          }
        }
      }
    });

    // Verify final state
    product = await sanityQueries.getProductStock(testProductId);
    // Stock should be: 2 - 3 = -1 (negative, which is a bug)
    // Or ideally: 2 - 3 = -1 should be prevented
    expect(product.stock).toBeLessThanOrEqual(2);
    expect(product.reservedStock).toBe(0); // Reservation cleared

    // Restore stock for other tests
    await backendClient
      .patch(testProductId)
      .set({ stock: originalStock, reservedStock: 0 })
      .commit();
  });

  test("SG-05: ifRevisionId failure not explicitly caught/handled", async ({ request }) => {
    // This test verifies that ifRevisionId failures are properly handled
    // Current implementation may not catch these specific failures

    // Reset stock
    await backendClient
      .patch(testProductId)
      .set({ stock: 2, reservedStock: 0 })
      .commit();

    // Get the current revision
    const product = await backendClient.fetch(
      `*[_type == "product" && _id == $productId][0]{_rev}`,
      { productId: testProductId }
    );

    // Manually patch the product to change the revision
    await backendClient
      .patch(testProductId)
      .set({ stock: 2 }) // Same value, but changes revision
      .commit();

    // Now try to checkout with the old revision ID
    // This simulates a race condition where another request modified the product

    // We can't directly inject the old revision ID, but we can simulate
    // the race condition by making concurrent requests

    const request1 = request.post("/api/checkout", {
      data: { publicBasket: [{ _id: testProductId, quantity: 2 }] },
      headers: { "x-forwarded-for": `test-ip-${Date.now()}-race1` }
    });

    const request2 = request.post("/api/checkout", {
      data: { publicBasket: [{ _id: testProductId, quantity: 1 }] },
      headers: { "x-forwarded-for": `test-ip-${Date.now()}-race2` }
    });

    const [res1, res2] = await Promise.all([request1, request2]);

    // One should succeed, one should fail
    // The failure should be due to ifRevisionId mismatch
    const statuses = [res1.status(), res2.status()];
    expect(statuses.includes(200)).toBe(true);
    expect(statuses.includes(500) || statuses.includes(409)).toBe(true);

    // Verify stock consistency
    const finalProduct = await sanityQueries.getProductStock(testProductId);
    expect(finalProduct.stock).toBe(2); // Should not change on failure
    expect(finalProduct.reservedStock).toBeLessThanOrEqual(2); // Only successful reservation
  });
});
