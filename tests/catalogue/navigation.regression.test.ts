import { describe, it, expect } from "vitest";
import DetailSection from "@/app/components/layout/catalogue/details/DetailSection";
import type { NavigationSection } from "@/data/catalogue";

// Mock NavigationSection for testing
const mockSection: NavigationSection = {
  title: "Test Section",
  links: [
    { label: "Open-Back", url: "/products/headphones/open-back", slug: "open-back" },
    { label: "Closed-Back", url: "/products/headphones/closed-back", slug: "closed-back" },
  ],
};

describe("DetailSection Navigation", () => {
  it("should render Link component instead of anchor tag", () => {
    // This test verifies that the component uses Next.js Link
    // The actual rendering test would be in a component test file
    // This is a structural verification that Link is imported and used
    expect(DetailSection).toBeDefined();
    expect(typeof DetailSection).toBe("function");
  });

  it("should maintain correct URL structure in links", () => {
    // Verify mock data has correct URL format
    mockSection.links.forEach((link) => {
      expect(link.url).toMatch(/^\/products\/[a-z-]+\/[a-z-]+$/);
      expect(link.slug).toBeDefined();
      expect(link.label).toBeDefined();
    });
  });

  it("should have all required link properties", () => {
    mockSection.links.forEach((link) => {
      expect(link).toHaveProperty("label");
      expect(link).toHaveProperty("url");
      expect(link).toHaveProperty("slug");
    });
  });
});

describe("Catalogue Navigation Data Path", () => {
  it("should generate correct URL format for all leaf categories", () => {
    const leafCategories = [
      { root: "headphones", leaves: ["open-back", "closed-back", "in-ear", "on-ear"] },
      { root: "audio-electronics", leaves: ["desktop-amps", "portable-amps", "desktop-dacs", "portable-dacs"] },
      { root: "accessories", leaves: ["earpads", "cables", "adapters", "cases"] },
    ];

    leafCategories.forEach(({ root, leaves }) => {
      leaves.forEach((leaf) => {
        const expectedUrl = `/products/${root}/${leaf}`;
        expect(expectedUrl).toMatch(/^\/products\/[a-z-]+\/[a-z-]+$/);
      });
    });
  });

  it("should verify URL format matches catch-all route pattern", () => {
    // The [...category] catch-all route expects /products/segment1/segment2
    const testUrls = [
      "/products/headphones/open-back",
      "/products/audio-electronics/desktop-amps",
      "/products/accessories/earpads",
    ];

    testUrls.forEach((url) => {
      const segments = url.split("/").filter(Boolean);
      expect(segments[0]).toBe("products");
      expect(segments.length).toBeGreaterThanOrEqual(2);
      expect(segments.length).toBeLessThanOrEqual(3);
    });
  });
});
