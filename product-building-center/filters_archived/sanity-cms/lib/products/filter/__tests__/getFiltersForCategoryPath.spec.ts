// # Execution Specs: getFiltersForCategoryPath — Resilience & Performance
//
// Phase 2 of `filters-sorting-gap-closure-plan.md`:
//   T2.1 (B2) graceful degradation, T2.2 (A5) concurrent queries,
//   T2.3 (A5) distinct brands derived without fetching every product.
//
// The Promise.all order is:
//   [cmsFilters, minPrice, maxPrice, maxStock, count, facetData]

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/sanity-cms/lib/client", () => ({
  sanityFetch: vi.fn(),
}));

import { sanityFetch } from "@/sanity-cms/lib/client";
import {
  getFiltersForCategoryPath,
  getValidFilterFields,
} from "@/sanity-cms/lib/products/filter/getFiltersForCategoryPath";

const mockSanityFetch = sanityFetch as ReturnType<typeof vi.fn>;

const EMPTY = {
  filters: [],
  priceRange: { minPrice: null, maxPrice: null },
  maxStock: null,
};

describe("getFiltersForCategoryPath", () => {
  beforeEach(() => {
    mockSanityFetch.mockReset();
  });

  describe("when no catalogue keys are provided", () => {
    it("returns an empty result without querying", async () => {
      const result = await getFiltersForCategoryPath([]);
      expect(result).toEqual(EMPTY);
      expect(mockSanityFetch).not.toHaveBeenCalled();
    });
  });

  describe("performance", () => {
    it("dispatches all independent queries concurrently (A5)", async () => {
      // First query hangs; if queries ran sequentially only one would dispatch.
      let resolveFirst: (value: unknown) => void = () => {};
      mockSanityFetch.mockImplementationOnce(
        () => new Promise((resolve) => { resolveFirst = resolve; })
      );
      mockSanityFetch.mockImplementation(() => Promise.resolve(null));

      const promise = getFiltersForCategoryPath(["k"]);

      // All six fetches are dispatched during the synchronous Promise.all build.
      expect(mockSanityFetch).toHaveBeenCalledTimes(6);

      resolveFirst(null);
      await promise;
    });

    it("derives distinct brands and per-option counts from the facet-data query", async () => {
      mockSanityFetch
        .mockResolvedValueOnce(null) // cmsFilters
        .mockResolvedValueOnce({ price_data: { unit_amount: 29900 } }) // minPrice
        .mockResolvedValueOnce({ price_data: { unit_amount: 399900 } }) // maxPrice
        .mockResolvedValueOnce({ stock: 20 }) // maxStock
        .mockResolvedValueOnce(5) // count
        .mockResolvedValueOnce([
          { brandName: "Focal", overviewFields: [], specifications: [] },
          { brandName: "Sennheiser", overviewFields: [], specifications: [] },
        ]); // facetData

      const result = await getFiltersForCategoryPath(["k"]);

      const facetDataQuery = mockSanityFetch.mock.calls[5][0].query;
      expect(facetDataQuery).not.toContain("array::unique");

      expect(result.priceRange).toEqual({ minPrice: 29900, maxPrice: 399900 });
      expect(result.maxStock).toBe(20);
      const brandGroup = result.filters.find((f) => f.field === "brand");
      expect(brandGroup?.options).toEqual([
        { value: "Focal", label: "Focal", count: 1 },
        { value: "Sennheiser", label: "Sennheiser", count: 1 },
      ]);
    });

    it("returns no filters when the category has no products", async () => {
      mockSanityFetch
        .mockResolvedValueOnce(null) // cmsFilters
        .mockResolvedValueOnce(null) // minPrice
        .mockResolvedValueOnce(null) // maxPrice
        .mockResolvedValueOnce(null) // maxStock
        .mockResolvedValueOnce(0) // count
        .mockResolvedValueOnce([]); // facetData

      const result = await getFiltersForCategoryPath(["k"]);
      expect(result.filters).toEqual([]);
    });
  });

  describe("adaptive bounds (G1)", () => {
    it("applies the active-filter clause to min-price, max-price and max-stock queries", async () => {
      mockSanityFetch
        .mockResolvedValueOnce(null) // cmsFilters
        .mockResolvedValueOnce({ price_data: { unit_amount: 100 } }) // minPrice
        .mockResolvedValueOnce({ price_data: { unit_amount: 200 } }) // maxPrice
        .mockResolvedValueOnce({ stock: 5 }) // maxStock
        .mockResolvedValueOnce(1) // count
        .mockResolvedValueOnce([]); // facetData

      await getFiltersForCategoryPath(["k"], ["brand:Focal"]);

      const clause = 'lower(brand->name) == lower("Focal")';
      // min-price (index 1), max-price (index 2), max-stock (index 3)
      expect(mockSanityFetch.mock.calls[1][0].query).toContain(clause);
      expect(mockSanityFetch.mock.calls[2][0].query).toContain(clause);
      expect(mockSanityFetch.mock.calls[3][0].query).toContain(clause);
    });
  });

  describe("brand casing (B9 / T5.5)", () => {
    it("intersects CMS brand options case-insensitively, filtering out non-matching brands", async () => {
      mockSanityFetch
        .mockResolvedValueOnce({
          filterItems: [
            { name: "Brand", type: "checkbox", field: "brand", options: ["sennheiser", "Sony"], defaultValue: null, min: null, max: null, isMinOnly: false, step: 1 },
          ],
        }) // cmsFilters
        .mockResolvedValueOnce(null) // minPrice
        .mockResolvedValueOnce(null) // maxPrice
        .mockResolvedValueOnce(null) // maxStock
        .mockResolvedValueOnce(3) // count
        .mockResolvedValueOnce([{ brandName: "Sennheiser", overviewFields: [], specifications: [] }]); // facetData (no Sony)

      const result = await getFiltersForCategoryPath(["k"]);

      const brandGroup = result.filters.find((f) => f.field === "brand");
      expect(brandGroup?.options).toHaveLength(1);
      expect(brandGroup?.options[0].value).toBe("sennheiser");
      expect(brandGroup?.options.find((o: { value: string }) => o.value === "Sony")).toBeUndefined();
    });
  });

  describe("getValidFilterFields (G3)", () => {
    it("always includes the built-in slider fields and brand, without querying, when there are no keys", async () => {
      const valid = await getValidFilterFields([]);
      expect(valid.has("priceRange")).toBe(true);
      expect(valid.has("stockMin")).toBe(true);
      expect(valid.has("brand")).toBe(true);
      expect(mockSanityFetch).not.toHaveBeenCalled();
    });

    it("includes CMS-declared filter fields from the categoryFilters doc (falling back to name)", async () => {
      mockSanityFetch.mockResolvedValueOnce({
        filterItems: [
          { field: "brand", name: "Brand" },
          { field: "driverType", name: "Driver Type" },
          { field: null, name: "Impedance" },
        ],
      });

      const valid = await getValidFilterFields(["k"]);
      expect(valid.has("brand")).toBe(true);
      expect(valid.has("driverType")).toBe(true);
      expect(valid.has("Impedance")).toBe(true); // falls back to name when field is absent
      expect(valid.has("priceRange")).toBe(true);
      expect(valid.has("stockMin")).toBe(true);
    });

    it("keeps the built-in + brand fields when the doc is missing or Sanity fails", async () => {
      mockSanityFetch.mockResolvedValueOnce(null);
      const valid = await getValidFilterFields(["k"]);
      expect(valid.has("priceRange")).toBe(true);
      expect(valid.has("stockMin")).toBe(true);
      expect(valid.has("brand")).toBe(true);

      mockSanityFetch.mockReset();
      mockSanityFetch.mockRejectedValueOnce(new Error("boom"));
      const validOnError = await getValidFilterFields(["k"]);
      expect(validOnError.has("priceRange")).toBe(true);
      expect(validOnError.has("brand")).toBe(true);
    });
  });

  describe("brand count ordering (G14)", () => {
    it("orders derived brand options by count desc, ties alphabetical", async () => {
      mockSanityFetch
        .mockResolvedValueOnce(null) // cmsFilters
        .mockResolvedValueOnce({ price_data: { unit_amount: 100 } }) // minPrice
        .mockResolvedValueOnce({ price_data: { unit_amount: 200 } }) // maxPrice
        .mockResolvedValueOnce({ stock: 5 }) // maxStock
        .mockResolvedValueOnce(4) // count
        .mockResolvedValueOnce([
          { brandName: "Focal", overviewFields: [], specifications: [] },
          { brandName: "Focal", overviewFields: [], specifications: [] },
          { brandName: "Sennheiser", overviewFields: [], specifications: [] },
          { brandName: "Sony", overviewFields: [], specifications: [] },
        ]); // facetData

      const result = await getFiltersForCategoryPath(["k"]);
      const brandGroup = result.filters.find((f) => f.field === "brand");
      expect(brandGroup?.options.map((o) => o.value)).toEqual(["Focal", "Sennheiser", "Sony"]);
      // Focal (count 2) first; Sennheiser and Sony tie at 1 → alphabetical.
      expect(brandGroup?.options.map((o) => o.count)).toEqual([2, 1, 1]);
    });

    it("orders CMS-intersected brand options by count desc, ties alphabetical", async () => {
      mockSanityFetch
        .mockResolvedValueOnce({
          filterItems: [
            { name: "Brand", type: "checkbox", field: "brand", options: ["Zebra", "Focal", "Alpha"], defaultValue: null, min: null, max: null, isMinOnly: false, step: 1 },
          ],
        }) // cmsFilters
        .mockResolvedValueOnce(null) // minPrice
        .mockResolvedValueOnce(null) // maxPrice
        .mockResolvedValueOnce(null) // maxStock
        .mockResolvedValueOnce(4) // count
        .mockResolvedValueOnce([
          { brandName: "Focal", overviewFields: [], specifications: [] },
          { brandName: "Focal", overviewFields: [], specifications: [] },
          { brandName: "Zebra", overviewFields: [], specifications: [] },
          { brandName: "Alpha", overviewFields: [], specifications: [] },
        ]); // facetData

      const result = await getFiltersForCategoryPath(["k"]);
      const brandGroup = result.filters.find((f) => f.field === "brand");
      expect(brandGroup?.options.map((o) => o.value)).toEqual(["Focal", "Alpha", "Zebra"]);
      // Focal (count 2) first; Alpha and Zebra tie at 1 → alphabetical.
    });
  });

  describe("resilience", () => {
    it("returns a safe empty result when Sanity fails (B2)", async () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockSanityFetch.mockRejectedValue(new Error("boom"));

      const result = await getFiltersForCategoryPath(["k"]);

      expect(result).toEqual(EMPTY);
      errorSpy.mockRestore();
    });
  });
});
