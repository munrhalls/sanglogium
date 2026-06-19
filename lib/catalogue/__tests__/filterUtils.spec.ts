import { describe, it, expect } from "vitest";
import { buildValidFilterFields, stripUnknownFilters } from "@/lib/catalogue/filterUtils";

describe("filterUtils (B3 / T5.1)", () => {
  const filterGroups = [
    { field: "brand", label: "Brand", options: [] },
    { field: "type", label: "Type", options: [] },
  ];

  describe("buildValidFilterFields", () => {
    it("always includes built-in fields priceRange and stockMin", () => {
      const valid = buildValidFilterFields([]);
      expect(valid.has("priceRange")).toBe(true);
      expect(valid.has("stockMin")).toBe(true);
    });
    it("includes dynamic fields from filter groups", () => {
      const valid = buildValidFilterFields(filterGroups);
      expect(valid.has("brand")).toBe(true);
      expect(valid.has("type")).toBe(true);
    });
  });

  describe("stripUnknownFilters", () => {
    it("keeps known filter entries unchanged", () => {
      const valid = buildValidFilterFields(filterGroups);
      const entries = ["brand:sennheiser", "priceRange:min:1000", "stockMin:3"];
      expect(stripUnknownFilters(entries, valid)).toEqual(entries);
    });
    it("removes entries with unknown fields", () => {
      const valid = buildValidFilterFields(filterGroups);
      const entries = ["brand:sennheiser", "foo:bar", "unknown:value"];
      expect(stripUnknownFilters(entries, valid)).toEqual(["brand:sennheiser"]);
    });
    it("removes malformed entries with no colon", () => {
      const valid = buildValidFilterFields(filterGroups);
      expect(stripUnknownFilters(["malformed"], valid)).toEqual([]);
    });
  });
});
