import { test, expect } from "@playwright/test";

test.describe("API: /api/checkout Validation (SAN-INJ-01..14)", () => {
  const validId = "validId123";

  test("SAN-INJ-01: SQL injection in ID -> 400", async ({ request }) => {
    const res = await request.post("/api/checkout", { headers: { "x-forwarded-for": `test-ip-${Date.now()}-${Math.random()}` },
      data: { publicBasket: [{ _id: "'; DROP TABLE--", quantity: 1 }] }
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toContain("Product no longer exists");
  });

  test("SAN-INJ-02: Path traversal in ID -> 400", async ({ request }) => {
    const res = await request.post("/api/checkout", { headers: { "x-forwarded-for": `test-ip-${Date.now()}-${Math.random()}` },
      data: { publicBasket: [{ _id: "../../../etc/passwd", quantity: 1 }] }
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toContain("Product no longer exists");
  });

  test("SAN-INJ-03: Quantity too high -> 400", async ({ request }) => {
    const res = await request.post("/api/checkout", { headers: { "x-forwarded-for": `test-ip-${Date.now()}-${Math.random()}` },
      data: { publicBasket: [{ _id: validId, quantity: 999999 }] }
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe("Invalid basket data");
  });

  test("SAN-INJ-04: Negative quantity -> 400", async ({ request }) => {
    const res = await request.post("/api/checkout", { headers: { "x-forwarded-for": `test-ip-${Date.now()}-${Math.random()}` },
      data: { publicBasket: [{ _id: validId, quantity: -5 }] }
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe("Invalid basket data");
  });

  test("SAN-INJ-05: Decimal quantity floored -> 400 (not found)", async ({ request }) => {
    const res = await request.post("/api/checkout", { headers: { "x-forwarded-for": `test-ip-${Date.now()}-${Math.random()}` },
      data: { publicBasket: [{ _id: validId, quantity: 1.5 }] }
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toContain("Product no longer exists");
  });

  test("SAN-INJ-06: String quantity parsed -> 400 (not found)", async ({ request }) => {
    const res = await request.post("/api/checkout", { headers: { "x-forwarded-for": `test-ip-${Date.now()}-${Math.random()}` },
      data: { publicBasket: [{ _id: validId, quantity: "2" }] }
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toContain("Product no longer exists");
  });

  test("SAN-INJ-07: Empty array -> 400", async ({ request }) => {
    const res = await request.post("/api/checkout", { headers: { "x-forwarded-for": `test-ip-${Date.now()}-${Math.random()}` },
      data: { publicBasket: [] }
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe("Invalid basket data");
  });

  test("SAN-INJ-08: Not an array -> 400", async ({ request }) => {
    const res = await request.post("/api/checkout", { headers: { "x-forwarded-for": `test-ip-${Date.now()}-${Math.random()}` },
      data: { publicBasket: "not an array" }
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe("Invalid basket data");
  });

  test("SAN-INJ-09: > 50 items -> 400", async ({ request }) => {
    const massiveBasket = Array.from({ length: 51 }, (_, i) => ({
      _id: `${validId}${i}`,
      quantity: 1
    }));
    const res = await request.post("/api/checkout", { headers: { "x-forwarded-for": `test-ip-${Date.now()}-${Math.random()}` },
      data: { publicBasket: massiveBasket }
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe("Invalid basket data");
  });

  test("SAN-INJ-10: Duplicate IDs -> 400", async ({ request }) => {
    const res = await request.post("/api/checkout", { headers: { "x-forwarded-for": `test-ip-${Date.now()}-${Math.random()}` },
      data: { publicBasket: [{ _id: validId, quantity: 1 }, { _id: validId, quantity: 2 }] }
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe("Invalid basket data");
  });

  test("SAN-INJ-11: NaN quantity -> 400", async ({ request }) => {
    const res = await request.post("/api/checkout", { headers: { "x-forwarded-for": `test-ip-${Date.now()}-${Math.random()}` },
      data: { publicBasket: [{ _id: validId, quantity: NaN }] }
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe("Invalid basket data");
  });

  test("SAN-INJ-12: Infinity quantity -> 400", async ({ request }) => {
    const res = await request.post("/api/checkout", { headers: { "x-forwarded-for": `test-ip-${Date.now()}-${Math.random()}` },
      data: { publicBasket: [{ _id: validId, quantity: Infinity }] }
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe("Invalid basket data");
  });

  test("SAN-INJ-13: Invalid JSON body -> 400", async ({ request }) => {
    const res = await request.post("/api/checkout", {
      data: "{ invalid json",
      headers: { "Content-Type": "application/json" }
    });
    expect(res.status()).toBe(400);
    // Next.js app router parses JSON internally and throws native 400 instead of reaching our try/catch 500
  });

  test("SAN-INJ-14: Missing publicBasket -> 400", async ({ request }) => {
    const res = await request.post("/api/checkout", { headers: { "x-forwarded-for": `test-ip-${Date.now()}-${Math.random()}` },
      data: { someOtherKey: 123 }
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe("Invalid basket data");
  });
});
