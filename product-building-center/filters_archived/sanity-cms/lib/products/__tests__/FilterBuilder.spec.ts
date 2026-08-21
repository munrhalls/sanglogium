import { describe, it, expect } from "vitest";
import { FilterBuilder } from "@/sanity-cms/lib/products/FilterBuilder";

describe("FilterBuilder stock (B7 / T5.4)", () => {
  it("matches availableStock (stock - reservedStock)", () => {
    expect(FilterBuilder.buildClause(["stockMin:5"])).toContain("(stock - reservedStock) >= 5");
  });
  it("ignores a non-integer stock value", () => {
    expect(FilterBuilder.buildClause(["stockMin:abc"])).not.toContain("stock - reservedStock");
  });
});

describe("FilterBuilder priceRange (B5 / T5.2)", () => {
  it("builds a normal range clause", () => {
    const c = FilterBuilder.buildClause(["priceRange:min:1000", "priceRange:max:5000"]);
    expect(c).toContain("price_data.unit_amount >= 1000");
    expect(c).toContain("price_data.unit_amount <= 5000");
  });
  it("ignores an inverted range (min > max) instead of a contradiction", () => {
    const c = FilterBuilder.buildClause(["priceRange:min:5000", "priceRange:max:1000"]);
    expect(c).not.toContain("price_data.unit_amount");
  });
});
