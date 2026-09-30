// Golden cases for the one shared search scorer (searchScoring.ts). Pure and
// synchronous: no Sanity, no mocks. Each case encodes a defect seen in QA.

import { describe, it, expect } from "vitest";
import { scoreProduct, type ScorableProduct } from "../domain/searchScoring";

const p = (name: string, brand: string, extra: Partial<ScorableProduct> = {}): ScorableProduct => ({
  name,
  brand: { name: brand },
  ...extra,
});

/** Names of `products` ordered best-first for `query`. */
function rank(query: string, products: ScorableProduct[]): string[] {
  return products
    .map((product) => ({ product, score: scoreProduct(product, query) }))
    .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name))
    .map(({ product }) => product.name);
}

const HD800S = p("HD 800 S Dynamic Open-back Headphones", "Sennheiser");
const HD600 = p("HD 600 Open-back Headphones", "Sennheiser");
const DS200 = p("DS200 Streaming DAC", "McIntosh");
const DX3 = p("DX3 Pro+ Bluetooth DAC/Amp", "Topping");
const CAMPFIRE = p("Andromeda IEM", "Campfire Audio");
const AMP = p("L50 Headphone Amp", "Topping");
const OTHER_800 = p("800 Series Cable", "Acme");

describe("scoreProduct", () => {
  it("does not match across the brand/name seam ('hd' vs McIntosh + DS200)", () => {
    const order = rank("hd", [DS200, HD800S, HD600]);
    expect(order.indexOf(DS200.name)).toBe(2);
  });

  it("finds the same model however the shopper spaces it", () => {
    for (const query of ["hd800s", "hd 800 s", "HD-800-S"]) {
      expect(rank(query, [HD600, DS200, HD800S])[0]).toBe(HD800S.name);
    }
  });

  it("ranks a full 'brand model' query by prefix", () => {
    expect(rank("sennheiser hd 6", [DX3, HD800S, HD600])[0]).toBe(HD600.name);
  });

  it("scores every word of a multi-word query, in any order", () => {
    expect(rank("sennheiser 800", [OTHER_800, HD800S])[0]).toBe(HD800S.name);
    expect(rank("800 sennheiser", [OTHER_800, HD800S])[0]).toBe(HD800S.name);
  });

  it("prefers a word-prefix hit over a mid-word substring", () => {
    expect(rank("amp", [CAMPFIRE, AMP])[0]).toBe(AMP.name);
  });

  it("ranks an exact SKU first", () => {
    const withSku = p("Some Product", "Brand", { sku: "ABC-123" });
    expect(rank("abc123", [HD800S, withSku])[0]).toBe("Some Product");
  });

  it("puts spec-only matches last", () => {
    const specOnly = p("Unrelated Thing", "Nobody");
    expect(rank("hd", [specOnly, HD600])[1]).toBe("Unrelated Thing");
  });

  it("breaks ties toward in-stock items", () => {
    const inStock = p("HD 650", "Sennheiser", { availableStock: 3 });
    const outOfStock = p("HD 650", "Sennheiser", { availableStock: 0 });
    expect(scoreProduct(inStock, "hd 650")).toBeGreaterThan(scoreProduct(outOfStock, "hd 650"));
  });
});
