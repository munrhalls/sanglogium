// # Execution Specs: Catalogue Filter & Sort Param Contract
//
// Covers Phase 1 / T1.1 + T1.2 of `filters-sorting-gap-closure-plan.md`:
// the single source of truth for parsing/serializing `sort`, `f`, `page`,
// plus the sort allowlist that closes the GROQ-injection gap (B1).

import { describe, it, expect } from "vitest";
import {
  SORT_OPTIONS,
  SORT_DEFAULT,
  FEATURED_ORDER,
  resolveSort,
  buildOrderClause,
  parseFilterEntry,
  countActiveFilters,
  filtersParser,
} from "@/lib/catalogue/filterParams";
import { loadCategorySearchParams } from "@/lib/catalogue/searchParams";

describe("Catalogue Filter & Sort Param Contract", () => {
  describe("SORT_OPTIONS", () => {
    it("includes the featured default as the first option", () => {
      expect(SORT_OPTIONS[0].value).toBe(SORT_DEFAULT);
      expect(SORT_DEFAULT).toBe("featured");
    });

    it("declares a safe, non-empty order expression for every option", () => {
      for (const opt of SORT_OPTIONS) {
        expect(typeof opt.order).toBe("string");
        expect(opt.order.length).toBeGreaterThan(0);
      }
    });
  });

  describe("resolveSort", () => {
    it("returns the matching option for a known sort value", () => {
      expect(resolveSort("name:asc").order).toBe("name asc");
      expect(resolveSort("price_data.unit_amount:desc").order).toBe(
        "price_data.unit_amount desc"
      );
    });

    it("returns the featured option (deterministic compound order) for the default", () => {
      expect(resolveSort("featured").value).toBe(SORT_DEFAULT);
      expect(resolveSort("featured").order).toBe(FEATURED_ORDER);
    });

    it("falls back to the default for an unknown sort value", () => {
      expect(resolveSort("created:asc").value).toBe(SORT_DEFAULT);
    });

    it("falls back to the default for a crafted injection-style value", () => {
      expect(resolveSort('_id) | order(@->secret){...} //').value).toBe(SORT_DEFAULT);
    });
  });

  describe("buildOrderClause", () => {
    it("builds an order clause for a known sort value", () => {
      expect(buildOrderClause("name:asc")).toBe("| order(name asc)");
      expect(buildOrderClause("price_data.unit_amount:desc")).toBe(
        "| order(price_data.unit_amount desc)"
      );
    });

    it("builds the deterministic featured order for the default (A2 / T4.2)", () => {
      expect(buildOrderClause("featured")).toBe(`| order(${FEATURED_ORDER})`);
      expect(buildOrderClause("featured")).toBe(
        "| order(coalesce(displayPriority, 0) desc, _createdAt desc)"
      );
    });

    it("never interpolates raw input — unknown/crafted values fall back to featured", () => {
      expect(buildOrderClause("evil:asc")).toBe(`| order(${FEATURED_ORDER})`);
      expect(buildOrderClause('x asc) | order(@->p)//')).toBe(`| order(${FEATURED_ORDER})`);
      expect(buildOrderClause("evil:asc")).not.toContain("evil");
    });
  });

  describe("parseFilterEntry", () => {
    it("splits on the first colon so compound values are preserved", () => {
      expect(parseFilterEntry("priceRange:min:5000")).toEqual({
        field: "priceRange",
        value: "min:5000",
      });
      expect(parseFilterEntry("brand:Sennheiser")).toEqual({
        field: "brand",
        value: "Sennheiser",
      });
    });

    it("returns null for an entry without a colon", () => {
      expect(parseFilterEntry("brand")).toBeNull();
    });

    it("returns null for an empty field or value", () => {
      expect(parseFilterEntry(":value")).toBeNull();
      expect(parseFilterEntry("field:")).toBeNull();
    });
  });

  describe("filtersParser", () => {
    it("round-trips an array of simple filters", () => {
      const value = ["brand:Focal", "stockMin:3"];
      expect(filtersParser.parse(filtersParser.serialize(value))).toEqual(value);
    });

    it("round-trips a value containing a comma (B4 collision fixed)", () => {
      const value = ["brand:Bowers, Wilkins"];
      expect(filtersParser.parse(filtersParser.serialize(value))).toEqual(value);
    });

    it("round-trips a value containing a colon", () => {
      const value = ["priceRange:min:5000", "priceRange:max:99900"];
      expect(filtersParser.parse(filtersParser.serialize(value))).toEqual(value);
    });

    it("still parses legacy unencoded comma-joined values", () => {
      expect(filtersParser.parse("brand:a,brand:b")).toEqual(["brand:a", "brand:b"]);
    });

    it("serializes an empty array to an empty string and parses it back to []", () => {
      expect(filtersParser.serialize([])).toBe("");
      expect(filtersParser.parse("")).toEqual([]);
    });

    it("compares arrays by value via eq (so clearOnDefault strips ?f=)", () => {
      expect(filtersParser.eq?.([], [])).toBe(true);
      expect(filtersParser.eq?.(["brand:Focal"], ["brand:Focal"])).toBe(true);
      expect(filtersParser.eq?.(["brand:Focal"], ["brand:HiFiMan"])).toBe(false);
      expect(filtersParser.eq?.(["a"], ["a", "b"])).toBe(false);
    });
  });

  describe("countActiveFilters", () => {
    it("counts each non-price filter once", () => {
      expect(countActiveFilters(["brand:Focal", "brand:HiFiMan", "stockMin:3"])).toBe(3);
    });

    it("collapses a price range (min+max) into a single active filter", () => {
      expect(countActiveFilters(["priceRange:min:1000", "priceRange:max:5000"])).toBe(1);
    });

    it("counts logical filters regardless of wire encoding", () => {
      const wire = filtersParser.serialize(["brand:Focal", "brand:HiFiMan"]);
      expect(countActiveFilters(filtersParser.parse(wire))).toBe(2);
    });
  });

  describe("loadCategorySearchParams (server loader)", () => {
    it("parses sort, f, and page from a search-params record", () => {
      expect(
        loadCategorySearchParams({ sort: "name:asc", f: "brand:a,brand:b", page: "2" })
      ).toEqual({ sort: "name:asc", f: ["brand:a", "brand:b"], page: 2 });
    });

    it("applies defaults when params are absent", () => {
      expect(loadCategorySearchParams({})).toEqual({ sort: "featured", f: [], page: 1 });
    });
  });
});
