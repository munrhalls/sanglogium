// # Execution Specs: getFiltersForCategoryPath — Resilience & Performance
//
// Phase 2 of `filters-sorting-gap-closure-plan.md`:
//   T2.1 (B2) graceful degradation, T2.2 (A5) concurrent queries,
//   T2.3 (A5) distinct brands derived without fetching every product.
//
// The Promise.all order is:
//   [cmsFilters, minPrice, maxPrice, maxStock, count, brands]

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/sanity-cms/lib/client", () => ({
  sanityFetch: vi.fn(),
}));

import { sanityFetch } from "@/sanity-cms/lib/client";
import { getFiltersForCategoryPath } from "@/sanity-cms/lib/products/filter/getFiltersForCategoryPath";

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

    it("derives distinct brands via a server-side unique query (T2.3)", async () => {
      mockSanityFetch
        .mockResolvedValueOnce(null) // cmsFilters
        .mockResolvedValueOnce({ price_data: { unit_amount: 29900 } }) // minPrice
        .mockResolvedValueOnce({ price_data: { unit_amount: 399900 } }) // maxPrice
        .mockResolvedValueOnce({ stock: 20 }) // maxStock
        .mockResolvedValueOnce(5) // count
        .mockResolvedValueOnce(["Sennheiser", "Focal"]); // distinct brands

      const result = await getFiltersForCategoryPath(["k"]);

      const brandsQuery = mockSanityFetch.mock.calls[5][0].query;
      expect(brandsQuery).toContain("array::unique");

      expect(result.priceRange).toEqual({ minPrice: 29900, maxPrice: 399900 });
      expect(result.maxStock).toBe(20);
      const brandGroup = result.filters.find((f) => f.field === "brand");
      expect(brandGroup?.options).toEqual([
        { value: "Focal", label: "Focal" },
        { value: "Sennheiser", label: "Sennheiser" },
      ]);
    });

    it("returns no filters when the category has no products", async () => {
      mockSanityFetch
        .mockResolvedValueOnce(null) // cmsFilters
        .mockResolvedValueOnce(null) // minPrice
        .mockResolvedValueOnce(null) // maxPrice
        .mockResolvedValueOnce(null) // maxStock
        .mockResolvedValueOnce(0) // count
        .mockResolvedValueOnce([]); // brands

      const result = await getFiltersForCategoryPath(["k"]);
      expect(result.filters).toEqual([]);
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
        .mockResolvedValueOnce(["Sennheiser"]); // distinct brands (no Sony)

      const result = await getFiltersForCategoryPath(["k"]);

      const brandGroup = result.filters.find((f) => f.field === "brand");
      expect(brandGroup?.options).toHaveLength(1);
      expect(brandGroup?.options[0].value).toBe("sennheiser");
      expect(brandGroup?.options.find((o: { value: string }) => o.value === "Sony")).toBeUndefined();
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
