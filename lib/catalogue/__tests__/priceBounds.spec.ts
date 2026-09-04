import { describe, it, expect } from "vitest";
import {
  resolvePriceBounds,
  DEFAULT_PRICE_CEILING,
  NORMAL_PRICE_CEILING,
} from "@/lib/catalogue/priceBounds";

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

describe("resolvePriceBounds — premium tier categories (yzg.1)", () => {
  /** 99 products between $50 and $2,000, plus one $38,000 luxury outlier. */
  const withLuxuryTail = () => {
    const prices = Array.from({ length: 99 }, (_, i) => (50 + i * 20) * 100);
    return { minPrice: 5000, maxPrice: 3_800_000, prices: [...prices, 3_800_000] };
  };

  it("caps the slider at the priciest product still under the ceiling and flags premium", () => {
    const bounds = resolvePriceBounds(withLuxuryTail());
    expect(bounds.premium).toBe(true);
    expect(bounds.max).toBeLessThan(NORMAL_PRICE_CEILING);
    expect(bounds.max).toBe(2010); // $50 + 98 * $20
  });

  it("shows only the normal slider when every product is under the ceiling", () => {
    const prices = Array.from({ length: 100 }, (_, i) => (50 + i * 20) * 100);
    const bounds = resolvePriceBounds({ minPrice: 5000, maxPrice: 203_000, prices });
    expect(bounds.premium).toBe(false);
    expect(bounds.max).toBe(2030);
  });

  it("falls back to the ceiling as the cap when no distribution is available", () => {
    expect(resolvePriceBounds({ minPrice: 5000, maxPrice: 3_800_000 })).toEqual({
      min: 50,
      max: NORMAL_PRICE_CEILING,
      premium: true,
    });
  });
});
