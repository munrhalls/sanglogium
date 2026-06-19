// # Execution Specs: getProductsByVfsKeys — Sort Safety
//
// Phase 1 / T1.4: the category product query must build its order clause from
// the allow-listed contract (`buildOrderClause`), never from raw URL input.
// This is the enforcement half of B1 (GROQ-order injection).

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/sanity-cms/lib/client", () => ({
  sanityFetch: vi.fn(),
}));

import { sanityFetch } from "@/sanity-cms/lib/client";
import { getProductsByVfsKeys } from "@/sanity-cms/lib/products/getProductsByVfsKeys";

const mockSanityFetch = sanityFetch as ReturnType<typeof vi.fn>;

const allQueries = (): string[] =>
  mockSanityFetch.mock.calls.map((call) => call[0].query as string);
const productsQuery = (): string =>
  allQueries().find((q) => q.trimStart().startsWith("*["))!;
const countQuery = (): string =>
  allQueries().find((q) => q.trimStart().startsWith("count("))!;

describe("getProductsByVfsKeys", () => {
  beforeEach(() => {
    mockSanityFetch.mockReset();
    // The count query resolves to a number; the products query to an array.
    mockSanityFetch.mockImplementation((arg: { query: string }) =>
      Promise.resolve(arg.query.trimStart().startsWith("count(") ? 0 : [])
    );
  });

  describe("when no keys are provided", () => {
    it("returns an empty array without querying", async () => {
      const result = await getProductsByVfsKeys({ keys: [] });
      expect(result).toEqual({ products: [], totalCount: 0 });
      expect(mockSanityFetch).not.toHaveBeenCalled();
    });
  });

  describe("sort handling", () => {
    it("applies a known sort value as a GROQ order clause", async () => {
      await getProductsByVfsKeys({ keys: ["k"], sort: "name:asc" });
      const query = productsQuery();
      expect(query).toContain("| order(name asc)");
    });

    it("applies a price sort with direction", async () => {
      await getProductsByVfsKeys({ keys: ["k"], sort: "price_data.unit_amount:desc" });
      const query = productsQuery();
      expect(query).toContain("| order(price_data.unit_amount desc)");
    });

    it("emits the deterministic featured order for the default (A2 / T4.2)", async () => {
      await getProductsByVfsKeys({ keys: ["k"], sort: "featured" });
      const query = productsQuery();
      expect(query).toContain("| order(coalesce(displayPriority, 0) desc, _createdAt desc)");
    });

    it("never interpolates a raw or crafted sort field (B1)", async () => {
      const crafted = "_id) | order(@->secret){...} //";
      await getProductsByVfsKeys({ keys: ["k"], sort: crafted });
      const query = productsQuery();
      expect(query).not.toContain("secret");
      // Crafted values fall back to the trusted featured order, never raw input.
      expect(query).toContain("| order(coalesce(displayPriority, 0) desc, _createdAt desc)");
    });
  });

  describe("query construction", () => {
    it("caps results at the safety limit", async () => {
      await getProductsByVfsKeys({ keys: ["k"] });
      const query = productsQuery();
      expect(query).toContain("[0...100]");
    });

    it("passes catalogue keys as query params", async () => {
      await getProductsByVfsKeys({ keys: ["a", "b"] });
      expect(mockSanityFetch).toHaveBeenCalledWith(
        expect.objectContaining({ params: { keys: ["a", "b"] } })
      );
    });
  });

  describe("pagination", () => {
    it("requests the first page window by default", async () => {
      await getProductsByVfsKeys({ keys: ["k"] });
      expect(productsQuery()).toContain("[0...100]");
    });

    it("offsets the window for a later page", async () => {
      await getProductsByVfsKeys({ keys: ["k"], page: 2 });
      expect(productsQuery()).toContain("[100...200]");
    });

    it("caps the page size at the safety limit", async () => {
      await getProductsByVfsKeys({ keys: ["k"], perPage: 5000, page: 1 });
      expect(productsQuery()).toContain("[0...100]");
    });

    it("issues a total-count query alongside the products query (A1)", async () => {
      await getProductsByVfsKeys({ keys: ["k"] });
      expect(mockSanityFetch).toHaveBeenCalledTimes(2);
      expect(countQuery()).toContain("count(*[");
      expect(countQuery()).not.toContain("order(");
    });

    it("returns the total count from the count query, not the window size", async () => {
      mockSanityFetch
        .mockResolvedValueOnce(42) // count (first in Promise.all)
        .mockResolvedValueOnce([{ _id: "p1" }]); // products
      const result = await getProductsByVfsKeys({ keys: ["k"] });
      expect(result.totalCount).toBe(42);
      expect(result.products).toEqual([{ _id: "p1" }]);
    });
  });

  describe("mixed parent and leaf keys", () => {
    it("constructs the GROQ filter without error for a mixed keys array", async () => {
      const mixedKeys = [
        "ugyeto8653n495dpf89nzoar", // parent (Headphones root)
        "o7c6baiuobsr7ni2y2vf22sh", // leaf (Open-Back)
      ];
      await getProductsByVfsKeys({ keys: mixedKeys });

      const query = productsQuery();
      expect(query).toContain("count(catalogueLocationKeys[@ in $keys]) > 0");
      expect(mockSanityFetch).toHaveBeenCalledWith(
        expect.objectContaining({ params: { keys: mixedKeys } })
      );
    });

    it("issues both a count query and a products query for mixed keys", async () => {
      await getProductsByVfsKeys({
        keys: ["ugyeto8653n495dpf89nzoar", "o7c6baiuobsr7ni2y2vf22sh"],
      });
      expect(mockSanityFetch).toHaveBeenCalledTimes(2);
      expect(countQuery()).toContain("count(catalogueLocationKeys[@ in $keys]) > 0");
    });
  });

  describe("resilience", () => {
    it("returns an empty array when Sanity fails (B2)", async () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockSanityFetch.mockRejectedValueOnce(new Error("boom"));

      const result = await getProductsByVfsKeys({ keys: ["k"], sort: "name:asc" });

      expect(result).toEqual({ products: [], totalCount: 0 });
      errorSpy.mockRestore();
    });
  });
});
