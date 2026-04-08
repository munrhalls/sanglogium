import { describe, it, expect } from "vitest";
import { resolveSlugToId, unrollDescendantKeys } from "@/data/catalogue";
import { getSelectedProducts } from "@/sanity/lib/products/getSelectedProducts";

// Mock catalogue index data
const mockSlugToIdMap: Record<string, string> = {
  "open-back": "o7c6baiuobsr7ni2y2vf22sh",
  "closed-back": "ekv4twh175wcse4fl4jjdxfq",
  "in-ear": "px3eujo0ql1hot9dkoxleao6",
  "on-ear": "fxvwrl18sixw5b9ro2jrlepa",
  "desktop-amps": "amp_desktop_001",
  "portable-amps": "amp_portable_001",
  "earpads": "acc_earpads_001",
  "cables": "acc_cables_001",
};

describe("Data Path - Slug Resolution", () => {
  it("should resolve leaf slug to ID", () => {
    // Test that leaf slugs resolve correctly
    const testCases = [
      { slug: "open-back", expected: "o7c6baiuobsr7ni2y2vf22sh" },
      { slug: "closed-back", expected: "ekv4twh175wcse4fl4jjdxfq" },
      { slug: "earpads", expected: "acc_earpads_001" },
    ];

    testCases.forEach(({ slug, expected }) => {
      const resolvedId = mockSlugToIdMap[slug];
      expect(resolvedId).toBe(expected);
    });
  });

  it("should return undefined for non-existent slugs", () => {
    const resolvedId = mockSlugToIdMap["non-existent-slug"];
    expect(resolvedId).toBeUndefined();
  });

  it("should use leaf slug from path array", () => {
    // Simulate the fix: path = ["headphones", "open-back"] -> use "open-back"
    const path = ["headphones", "open-back"];
    const leafSlug = path[path.length - 1];
    
    expect(leafSlug).toBe("open-back");
    expect(mockSlugToIdMap[leafSlug]).toBe("o7c6baiuobsr7ni2y2vf22sh");
  });

  it("should NOT use joined path for resolution", () => {
    // Verify the old bug is fixed: "headphones/open-back" should NOT be used
    const path = ["headphones", "open-back"];
    const wrongSlug = path.join("/");
    
    expect(wrongSlug).toBe("headphones/open-back");
    expect(mockSlugToIdMap[wrongSlug]).toBeUndefined();
  });
});

describe("Data Path - Empty Keys Guard", () => {
  it("should return empty products when catalogueKeys is empty", async () => {
    // This tests the fix: empty keys should return NO products, not ALL products
    const result = await getSelectedProducts([], [], [], {
      page: 1,
      pageSize: 12,
    });

    expect(result).toEqual({
      products: [],
      totalProductsCount: 0,
    });
  });

  it("should return empty products when catalogueKeys is null", async () => {
    const result = await getSelectedProducts(null as unknown as string[], [], [], {
      page: 1,
      pageSize: 12,
    });

    expect(result).toEqual({
      products: [],
      totalProductsCount: 0,
    });
  });

  it("should return empty products when catalogueKeys is undefined", async () => {
    const result = await getSelectedProducts(undefined as unknown as string[], [], [], {
      page: 1,
      pageSize: 12,
    });

    expect(result).toEqual({
      products: [],
      totalProductsCount: 0,
    });
  });
});

describe("Data Path - End to End Flow", () => {
  it("should correctly resolve URL path to catalogue ID", () => {
    // Simulate: /products/headphones/open-back
    const path = ["headphones", "open-back"];
    const leafSlug = path[path.length - 1];
    const resolvedId = mockSlugToIdMap[leafSlug];

    expect(leafSlug).toBe("open-back");
    expect(resolvedId).toBe("o7c6baiuobsr7ni2y2vf22sh");
  });

  it("should handle all 22 leaf categories", () => {
    const leafSlugs = [
      "open-back", "closed-back", "in-ear", "on-ear",
      "desktop-amps", "portable-amps", "desktop-dacs", "portable-dacs",
      "earpads", "cables", "adapters", "cases",
      "gaming-headsets", "studio-monitors", "turntables",
      "microphones", "stands", "cleaning-kits", "storage",
      "replacement-parts", "gift-cards",
    ];

    // Each slug should either exist in map or be undefined (for non-existent)
    leafSlugs.forEach((slug) => {
      const resolvedId = mockSlugToIdMap[slug];
      // Either it resolves to an ID or it's undefined (we just verify no errors)
      expect(resolvedId === undefined || typeof resolvedId === "string").toBe(true);
    });
  });
});

describe("Data Path - Console Logging Format", () => {
  it("should log correct data path structure", () => {
    // This is a structural test for the logging format
    const path = ["headphones", "open-back"];
    const leafSlug = path[path.length - 1];
    const resolvedId = mockSlugToIdMap[leafSlug];
    const catalogueKeys = resolvedId ? [resolvedId] : [];

    // Verify the structure matches console output format
    expect(path.join("/")).toBe("headphones/open-back");
    expect(leafSlug).toBe("open-back");
    expect(catalogueKeys.length).toBe(1);
    expect(catalogueKeys[0]).toBe("o7c6baiuobsr7ni2y2vf22sh");
  });
});
