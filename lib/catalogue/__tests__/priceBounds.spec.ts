import { describe, it, expect } from "vitest";
import { resolvePriceBounds, DEFAULT_PRICE_CEILING } from "@/lib/catalogue/priceBounds";

describe("resolvePriceBounds (B6 / T5.3)", () => {
  it("derives max from real category data", () => {
    expect(resolvePriceBounds({ minPrice: 0, maxPrice: 250000 }).max).toBe(2500);
  });
  it("honors a 0 minimum bound (no falsy bug)", () => {
    expect(resolvePriceBounds({ minPrice: 0, maxPrice: 100000 }).min).toBe(0);
  });
  it("falls back to the default ceiling when max is null", () => {
    expect(resolvePriceBounds({ minPrice: null, maxPrice: null }).max).toBe(DEFAULT_PRICE_CEILING);
  });
});
