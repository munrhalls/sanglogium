import { test, expect } from "@playwright/test";
import { sanityQueries } from "../fixtures/sanity-queries.fixture";
import { backendClient } from "../../../../sanity/lib/backendClient";

let validProductId: string = "";
let insufficientStockId: string = "";

test.describe("API: /api/checkout Stock Checks", () => {
  test.beforeAll(async () => {
    // 1. Find a product with available stock
    const validProduct = await backendClient.fetch(
      `*[_type == "product" && !(_id in path("drafts.**")) && stock > coalesce(reservedStock, 0)][0]{_id}`
    );
    if (!validProduct) throw new Error("No product with available stock found in Sanity");
    validProductId = validProduct._id;

    // 2. Find a product to simulate insufficient stock
    const anyProduct = await backendClient.fetch(
      `*[_type == "product" && !(_id in path("drafts.**"))][0]{_id}`
    );
    if (!anyProduct) throw new Error("No products found in Sanity DB");
    insufficientStockId = anyProduct._id;
  });

  test("Test A: Product exists, sufficient stock -> 200", async ({ request }) => {
    const res = await request.post("/api/checkout", { headers: { "x-forwarded-for": `test-ip-${Date.now()}-${Math.random()}` },
      data: { publicBasket: [{ _id: validProductId, quantity: 1 }] }
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.client_secret).toBeTruthy();
  });

  test("Test B: Product exists, insufficient stock -> 409", async ({ request }) => {
    // Current stock levels
    const product = await sanityQueries.getProductStock(insufficientStockId);
    const available = product.stock - (product.reservedStock || 0);

    const res = await request.post("/api/checkout", { headers: { "x-forwarded-for": `test-ip-${Date.now()}-${Math.random()}` },
      data: { publicBasket: [{ _id: insufficientStockId, quantity: available + 1 }] }
    });
    expect(res.status()).toBe(409);
    expect((await res.json()).error).toContain("Insufficient stock");
  });

  test("Test C: Product does not exist -> 400", async ({ request }) => {
    const res = await request.post("/api/checkout", { headers: { "x-forwarded-for": `test-ip-${Date.now()}-${Math.random()}` },
      data: { publicBasket: [{ _id: "fake_id_that_never_exists", quantity: 1 }] }
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toContain("Product no longer exists");
  });
});
