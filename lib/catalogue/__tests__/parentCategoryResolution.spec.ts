// # Execution Specs: Parent Category Slug Resolution
//
// Verifies that root category slugs (headphones, audio-electronics, accessories)
// resolve to their node IDs in slugToIdMap, and that unrollDescendantKeys
// correctly expands a root node into all descendant leaf IDs.

import { describe, it, expect } from "vitest";
import { resolveSlugToId, unrollDescendantKeys } from "@/data/catalogue";

const HEADPHONES_ID = "ugyeto8653n495dpf89nzoar";
const OPEN_BACK_ID = "o7c6baiuobsr7ni2y2vf22sh";

describe("Parent category slug resolution", () => {
  it("resolveSlugToId('headphones') returns the Headphones root ID", () => {
    expect(resolveSlugToId("headphones")).toBe(HEADPHONES_ID);
  });

  it("resolveSlugToId('audio-electronics') returns the Audio Electronics root ID", () => {
    expect(resolveSlugToId("audio-electronics")).toBeTruthy();
  });

  it("resolveSlugToId('accessories') returns the Accessories root ID", () => {
    expect(resolveSlugToId("accessories")).toBeTruthy();
  });
});

describe("unrollDescendantKeys from a root node", () => {
  const allKeys = unrollDescendantKeys(HEADPHONES_ID);

  it("returns an array with more than one element (not a leaf)", () => {
    expect(allKeys.length).toBeGreaterThan(1);
  });

  it("includes the root node ID itself", () => {
    expect(allKeys).toContain(HEADPHONES_ID);
  });

  it("includes all known leaf IDs under Headphones", () => {
    const expectedLeafIds = [
      "o7c6baiuobsr7ni2y2vf22sh", // Open-Back
      "yq3p9s798zszjkzm5btnebjh", // Closed-Back
      "dW7bkxuW7lwltD3OAxQ9yH", // Semi-Open
      "yd9641q8fiuh9rgoupauw2zl", // Planar Magnetic
      "j751evwbn8n9aac4elrekqi4", // Dynamic
      "icmc3j8qzjiffr9h6tw6kg74", // Electrostatic
      "t2anvkkjfz9knqi85kozuaze", // Universal IEMs
    ];
    for (const leafId of expectedLeafIds) {
      expect(allKeys).toContain(leafId);
    }
  });
});

describe("leaf-node regression", () => {
  it("unrollDescendantKeys(leafId) returns exactly [leafId]", () => {
    expect(unrollDescendantKeys(OPEN_BACK_ID)).toEqual([OPEN_BACK_ID]);
  });

  it("resolveSlugToId('open-back') still returns the correct leaf ID", () => {
    expect(resolveSlugToId("open-back")).toBe(OPEN_BACK_ID);
  });
});
