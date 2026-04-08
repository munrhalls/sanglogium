/**
 * VFS & Catalogue Test Suite
 * Systematic validation of Virtual File System functionality
 *
 * Test Suites:
 * 1. catalogue-index.json Structure Validation (8 tests)
 * 2. VFS Function Unit Tests (10 tests)
 * 3. Node → Leaf Resolution (6 tests)
 * 4. Leaf → Product Resolution (14 tests)
 * 5. Parent → Products Aggregation (11 tests)
 * 6. Index Consistency (8 tests)
 * 7. E2E URL → Products Pipeline (6 tests)
 *
 * Total: 67 tests
 */

import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import {
  resolveSlugToId,
  unrollDescendantKeys,
  getCatalogue,
  buildGroqKeysParam,
  validateCatalogueIndex,
} from "../../data/catalogue";
import { sanityFetch } from "../../sanity/lib/client";
import groq from "groq";

// ============================================================================
// TEST FIXTURES & DATA LOADING
// ============================================================================

const catalogueIndex = JSON.parse(
  readFileSync(join(process.cwd(), "data/catalogue-index.json"), "utf-8")
);

const truthTable = JSON.parse(
  readFileSync(
    join(process.cwd(), "_temporary/catalogue-mapping/catalogue-truth-table.json"),
    "utf-8"
  )
);

// Helper to check if CMS is available
let cmsAvailable = false;
beforeAll(async () => {
  try {
    await sanityFetch({
      query: groq`*[_type == "product"][0]{_id}`,
      tags: ["cms-check"],
    });
    cmsAvailable = true;
  } catch {
    cmsAvailable = false;
  }
});

// ============================================================================
// SUITE 1: catalogue-index.json Structure Validation
// ============================================================================

describe("1. catalogue-index.json Structure Validation", () => {
  it("IDX-01: Schema completeness - all required fields exist", () => {
    expect(catalogueIndex).toHaveProperty("generatedAt");
    expect(catalogueIndex).toHaveProperty("slugToIdMap");
    expect(catalogueIndex).toHaveProperty("slotMetadataMap");
    expect(catalogueIndex).toHaveProperty("tree");
  });

  it("IDX-02: Slug-to-ID bijection - no duplicate IDs", () => {
    const ids = Object.values(catalogueIndex.slugToIdMap);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("IDX-03: Metadata map coverage - all tree nodes have metadata", () => {
    const treeNodeIds = new Set<string>();

    const collectIds = (nodes: any[]) => {
      for (const node of nodes) {
        treeNodeIds.add(node._key);
        if (node.children) {
          collectIds(node.children);
        }
      }
    };

    collectIds(catalogueIndex.tree);

    for (const id of treeNodeIds) {
      expect(catalogueIndex.slotMetadataMap).toHaveProperty(id);
    }
  });

  it("IDX-04: Children reference validity - all children exist in metadata", () => {
    for (const [nodeId, metadata] of Object.entries(catalogueIndex.slotMetadataMap)) {
      const children = (metadata as any).children || [];
      for (const childId of children) {
        expect(catalogueIndex.slotMetadataMap).toHaveProperty(childId);
      }
    }
  });

  it("IDX-05: Leaf node identification - link types have no children", () => {
    for (const [nodeId, metadata] of Object.entries(catalogueIndex.slotMetadataMap)) {
      const meta = metadata as any;
      if (meta.type === "link") {
        expect(meta.children).toHaveLength(0);
      }
    }
  });

  it("IDX-06: Header node structure - headers with children have valid references", () => {
    for (const [nodeId, metadata] of Object.entries(catalogueIndex.slotMetadataMap)) {
      const meta = metadata as any;
      if (meta.type === "header" && meta.children?.length > 0) {
        for (const childId of meta.children) {
          expect(catalogueIndex.slotMetadataMap[childId]).toBeDefined();
        }
      }
    }
  });

  it("IDX-07: generatedAt is valid ISO date", () => {
    const date = new Date(catalogueIndex.generatedAt);
    expect(date.toISOString()).toBe(catalogueIndex.generatedAt);
  });

  it("IDX-08: tree is non-empty array", () => {
    expect(Array.isArray(catalogueIndex.tree)).toBe(true);
    expect(catalogueIndex.tree.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// SUITE 2: VFS Function Unit Tests
// ============================================================================

describe("2. VFS Function Unit Tests", () => {
  describe("resolveSlugToId", () => {
    it("FNS-01: returns correct ID for known slug", () => {
      const id = resolveSlugToId("open-back");
      expect(id).toBe("o7c6baiuobsr7ni2y2vf22sh");
    });

    it("FNS-02: returns undefined for unknown slug", () => {
      const id = resolveSlugToId("nonexistent-slug-12345");
      expect(id).toBeUndefined();
    });

    it("FNS-03: slug matching is case-sensitive", () => {
      const lower = resolveSlugToId("open-back");
      const upper = resolveSlugToId("Open-Back");
      expect(upper).toBeUndefined();
      expect(lower).toBeDefined();
    });
  });

  describe("unrollDescendantKeys", () => {
    it("FNS-04: leaf node returns array containing only itself", () => {
      const result = unrollDescendantKeys("o7c6baiuobsr7ni2y2vf22sh"); // open-back
      expect(result).toEqual(["o7c6baiuobsr7ni2y2vf22sh"]);
    });

    it("FNS-05: parent with 1 level returns itself + direct children", () => {
      const result = unrollDescendantKeys("ekv4twh175wcse4fl4jjdxfq"); // by-design header
      expect(result).toContain("ekv4twh175wcse4fl4jjdxfq");
      expect(result).toContain("o7c6baiuobsr7ni2y2vf22sh"); // open-back
      expect(result).toContain("yq3p9s798zszjkzm5btnebjh"); // closed-back
      expect(result).toContain("dW7bkxuW7lwltD3OAxQ9yH"); // semi-open
    });

    it("FNS-06: parent with 2 levels returns all descendants + itself", () => {
      const result = unrollDescendantKeys("ugyeto8653n495dpf89nzoar"); // headphones root
      expect(result).toContain("ugyeto8653n495dpf89nzoar"); // self
      expect(result).toContain("ekv4twh175wcse4fl4jjdxfq"); // by-design (level 1)
      expect(result).toContain("o7c6baiuobsr7ni2y2vf22sh"); // open-back (level 2)
      expect(result.length).toBeGreaterThan(6); // at least root + 2 headers + 3 leaves
    });

    it("FNS-07: unknown ID treated as leaf", () => {
      const result = unrollDescendantKeys("unknown-id-12345");
      expect(result).toEqual(["unknown-id-12345"]);
    });

    it("FNS-08: result contains no duplicates", () => {
      const result = unrollDescendantKeys("ugyeto8653n495dpf89nzoar");
      const unique = new Set(result);
      expect(unique.size).toBe(result.length);
    });
  });

  describe("getCatalogue", () => {
    it("FNS-09: returns valid tree array", () => {
      const tree = getCatalogue();
      expect(Array.isArray(tree)).toBe(true);
      expect(tree.length).toBeGreaterThan(0);
    });
  });

  describe("buildGroqKeysParam", () => {
    it("FNS-10: returns input array unchanged", () => {
      const input = ["id1", "id2", "id3"];
      const result = buildGroqKeysParam(input);
      expect(result).toEqual(input);
      expect(result).toBe(input); // same reference
    });
  });
});

// ============================================================================
// SUITE 3: Node → Leaf Resolution
// ============================================================================

describe("3. Node → Leaf Resolution", () => {
  const isLeafNode = (id: string): boolean => {
    const meta = catalogueIndex.slotMetadataMap[id];
    return meta?.type === "link";
  };

  it("NODE-01: Leaf node (open-back) returns only itself", () => {
    const result = unrollDescendantKeys("o7c6baiuobsr7ni2y2vf22sh");
    const leaves = result.filter(isLeafNode);
    expect(leaves).toEqual(["o7c6baiuobsr7ni2y2vf22sh"]);
  });

  it("NODE-02: Header (by-design) returns 3 leaf IDs", () => {
    const result = unrollDescendantKeys("ekv4twh175wcse4fl4jjdxfq");
    const leaves = result.filter(isLeafNode);
    expect(leaves).toContain("o7c6baiuobsr7ni2y2vf22sh"); // open-back
    expect(leaves).toContain("yq3p9s798zszjkzm5btnebjh"); // closed-back
    expect(leaves).toContain("dW7bkxuW7lwltD3OAxQ9yH"); // semi-open
    expect(leaves).toHaveLength(3);
  });

  it("NODE-03: Root header (headphones) returns all 7 headphone leaves", () => {
    const result = unrollDescendantKeys("ugyeto8653n495dpf89nzoar");
    const leaves = result.filter(isLeafNode);
    expect(leaves.length).toBe(7);
  });

  it("NODE-04: Root (audio-electronics) returns all 8 electronics leaves", () => {
    const result = unrollDescendantKeys("ti2wufd15h51jxtq855ogbfa");
    const leaves = result.filter(isLeafNode);
    expect(leaves.length).toBe(8);
  });

  it("NODE-05: Root (accessories) returns all 8 accessories leaves", () => {
    const result = unrollDescendantKeys("j9ozs17mc0b1nv2gqn2rvmg1");
    const leaves = result.filter(isLeafNode);
    expect(leaves.length).toBe(8);
  });

  it("NODE-06: Cross-category parent (amplification) returns 3 leaves", () => {
    const result = unrollDescendantKeys("hqb22ca5czb252r0r7l1xmet");
    const leaves = result.filter(isLeafNode);
    expect(leaves).toContain("o6mz3kbs5xla8ixastppktsd"); // desktop-amps
    expect(leaves).toContain("ipz8oe0elii0vm2voxsbgsw6"); // portable-amps
    expect(leaves).toContain("2Q3Hkst6W23iaT5J8DYRdm"); // bluetooth-dac-amps
    expect(leaves).toHaveLength(3);
  });
});

// ============================================================================
// SUITE 4: Leaf → Product Resolution
// ============================================================================

describe("4. Leaf → Product Resolution", () => {
  // Path mapping from truth table paths to leaf node IDs
  const pathToLeafId: Record<string, string> = {
    "/accessories/connectivity/adapters": "jdxde1qpftseepekaivzpl8c",
    "/accessories/connectivity/headphone-cables": "vnrj2n32p172vcje1tt3s4ls",
    "/accessories/connectivity/interconnects": "ck7d2wm9xe6lujtdfq7biyh7",
    "/accessories/storage/headphone-stands": "u9o83mfmx23cudko8phu5otx",
    "/audio-electronics/amplification/bluetooth-dac-amps": "2Q3Hkst6W23iaT5J8DYRdm",
    "/audio-electronics/amplification/desktop-amps": "o6mz3kbs5xla8ixastppktsd",
    "/audio-electronics/amplification/portable-amps": "ipz8oe0elii0vm2voxsbgsw6",
    "/audio-electronics/digital-sources/dac-amp-combos": "o37u0yjphzt3qu91ewnww2yj",
    "/audio-electronics/digital-sources/standalone-dacs": "mpni93r13d9yo2vn5moexlkp",
    "/audio-electronics/digital-sources/network-streamers": "npwbgqg3v4t5qe95rg35wte0",
    "/audio-electronics/digital-sources/usb-c-dacs": "dW7bkxuW7lwltD3OAxQBo5",
    "/headphones/by-design/closed-back": "yq3p9s798zszjkzm5btnebjh",
    "/headphones/by-design/open-back": "o7c6baiuobsr7ni2y2vf22sh",
    "/headphones/by-driver/dynamic": "j751evwbn8n9aac4elrekqi4",
    "/headphones/by-driver/planar-magnetic": "yd9641q8fiuh9rgoupauw2zl",
    "/headphones/in-ear-monitors/monitors-iems": "t2anvkkjfz9knqi85kozuaze",
  };

  const testLeafNode = async (path: string, expectedCount: number) => {
    if (!cmsAvailable) {
      console.log(`  ⏭️  SKIP (CMS unavailable): ${path}`);
      return;
    }

    const leafId = pathToLeafId[path];
    if (!leafId) {
      console.log(`  ⚠️  SKIP: No leaf ID mapping for ${path}`);
      return;
    }

    const query = groq`*[_type == "product" && "${leafId}" in catalogueLocationKeys]{_id, name}`;
    const products = await sanityFetch({ query, tags: [leafId] });

    expect(products.length).toBe(expectedCount);

    // Verify expected product IDs from truth table
    const expectedProducts = truthTable.leafNodes[path]?.products || [];
    const actualIds = products.map((p: any) => p._id);

    for (const expected of expectedProducts) {
      expect(actualIds).toContain(expected.id);
    }
  };

  it("PROD-01: adapters returns 3 products", async () => {
    await testLeafNode("/accessories/connectivity/adapters", 3);
  });

  it("PROD-02: headphone-cables returns 10 products", async () => {
    await testLeafNode("/accessories/connectivity/headphone-cables", 10);
  });

  it("PROD-03: interconnects returns 2 products", async () => {
    await testLeafNode("/accessories/connectivity/interconnects", 2);
  });

  it("PROD-04: headphone-stands returns 2 products", async () => {
    await testLeafNode("/accessories/storage/headphone-stands", 2);
  });

  it("PROD-05: bluetooth-dac-amps returns 2 products", async () => {
    await testLeafNode("/audio-electronics/amplification/bluetooth-dac-amps", 2);
  });

  it("PROD-06: desktop-amps returns 25 products", async () => {
    await testLeafNode("/audio-electronics/amplification/desktop-amps", 25);
  });

  it("PROD-07: portable-amps returns 3 products", async () => {
    await testLeafNode("/audio-electronics/amplification/portable-amps", 3);
  });

  it("PROD-08: dac-amp-combos returns 22 products", async () => {
    await testLeafNode("/audio-electronics/digital-sources/dac-amp-combos", 22);
  });

  it("PROD-09: standalone-dacs returns 14 products", async () => {
    await testLeafNode("/audio-electronics/digital-sources/standalone-dacs", 14);
  });

  it("PROD-10: network-streamers returns 11 products", async () => {
    await testLeafNode("/audio-electronics/digital-sources/network-streamers", 11);
  });

  it("PROD-11: usb-c-dacs returns 4 products", async () => {
    await testLeafNode("/audio-electronics/digital-sources/usb-c-dacs", 4);
  });

  it("PROD-12: closed-back returns 31 products", async () => {
    await testLeafNode("/headphones/by-design/closed-back", 31);
  });

  it("PROD-13: open-back returns 6 products", async () => {
    await testLeafNode("/headphones/by-design/open-back", 6);
  });

  it("PROD-14: dynamic driver returns 21 products", async () => {
    await testLeafNode("/headphones/by-driver/dynamic", 21);
  });
});

// ============================================================================
// SUITE 5: Parent → Products Aggregation
// ============================================================================

describe("5. Parent → Products Aggregation", () => {
  const testParentAggregation = async (
    parentId: string,
    expectedLeaves: string[],
    minExpectedCount: number
  ) => {
    if (!cmsAvailable) {
      console.log(`  ⏭️  SKIP (CMS unavailable): ${parentId}`);
      return;
    }

    // Get leaf IDs
    const allIds = unrollDescendantKeys(parentId);
    const isLeafNode = (id: string): boolean => {
      const meta = catalogueIndex.slotMetadataMap[id];
      return meta?.type === "link";
    };
    const leafIds = allIds.filter(isLeafNode);

    // Verify leaf count
    expect(leafIds).toHaveLength(expectedLeaves.length);
    for (const leaf of expectedLeaves) {
      expect(leafIds).toContain(leaf);
    }

    // Query aggregated products
    const query = groq`*[_type == "product" && count(catalogueLocationKeys[@ in ${JSON.stringify(
      leafIds
    )}]) > 0]{_id, name, catalogueLocationKeys}`;
    const products = await sanityFetch({ query, tags: [parentId] });

    expect(products.length).toBeGreaterThanOrEqual(minExpectedCount);

    // Verify no duplicates
    const seenIds = new Set<string>();
    for (const product of products) {
      expect(seenIds.has(product._id)).toBe(false);
      seenIds.add(product._id);
    }
  };

  it("PAGG-01: by-design aggregates open-back + closed-back + semi-open", async () => {
    await testParentAggregation(
      "ekv4twh175wcse4fl4jjdxfq",
      ["o7c6baiuobsr7ni2y2vf22sh", "yq3p9s798zszjkzm5btnebjh", "dW7bkxuW7lwltD3OAxQ9yH"],
      39
    );
  });

  it("PAGG-02: by-driver aggregates planar + dynamic + electrostatic", async () => {
    await testParentAggregation(
      "px3eujo0ql1hot9dkoxleao6",
      ["yd9641q8fiuh9rgoupauw2zl", "j751evwbn8n9aac4elrekqi4", "icmc3j8qzjiffr9h6tw6kg74"],
      34
    );
  });

  it("PAGG-03: in-ear-monitors returns same as monitors-iems leaf", async () => {
    await testParentAggregation(
      "fxvwrl18sixw5b9ro2jrlepa",
      ["t2anvkkjfz9knqi85kozuaze"],
      22
    );
  });

  it("PAGG-04: headphones root aggregates all 7 leaves", async () => {
    await testParentAggregation(
      "ugyeto8653n495dpf89nzoar",
      [
        "o7c6baiuobsr7ni2y2vf22sh",
        "yq3p9s798zszjkzm5btnebjh",
        "dW7bkxuW7lwltD3OAxQ9yH",
        "yd9641q8fiuh9rgoupauw2zl",
        "j751evwbn8n9aac4elrekqi4",
        "icmc3j8qzjiffr9h6tw6kg74",
        "t2anvkkjfz9knqi85kozuaze",
      ],
      61
    );
  });

  it("PAGG-05: amplification aggregates 3 leaf categories", async () => {
    await testParentAggregation(
      "hqb22ca5czb252r0r7l1xmet",
      ["o6mz3kbs5xla8ixastppktsd", "ipz8oe0elii0vm2voxsbgsw6", "2Q3Hkst6W23iaT5J8DYRdm"],
      25
    );
  });

  it("PAGG-06: digital-sources aggregates 5 leaf categories", async () => {
    await testParentAggregation(
      "lkuqr2n1gpeivrvxisnfs3ot",
      [
        "mpni93r13d9yo2vn5moexlkp",
        "o37u0yjphzt3qu91ewnww2yj",
        "dW7bkxuW7lwltD3OAxQBo5",
        "o9igtdq1g5oqaahpa0zvq238",
        "npwbgqg3v4t5qe95rg35wte0",
      ],
      50
    );
  });

  it("PAGG-07: audio-electronics aggregates all 8 leaves", async () => {
    await testParentAggregation(
      "ti2wufd15h51jxtq855ogbfa",
      [
        "o6mz3kbs5xla8ixastppktsd",
        "ipz8oe0elii0vm2voxsbgsw6",
        "2Q3Hkst6W23iaT5J8DYRdm",
        "mpni93r13d9yo2vn5moexlkp",
        "o37u0yjphzt3qu91ewnww2yj",
        "dW7bkxuW7lwltD3OAxQBo5",
        "o9igtdq1g5oqaahpa0zvq238",
        "npwbgqg3v4t5qe95rg35wte0",
      ],
      75
    );
  });

  it("PAGG-08: connectivity aggregates 3 leaf categories", async () => {
    await testParentAggregation(
      "lhpqqb5qkfvh4kid6q6455eu",
      ["vnrj2n32p172vcje1tt3s4ls", "ck7d2wm9xe6lujtdfq7biyh7", "jdxde1qpftseepekaivzpl8c"],
      15
    );
  });

  it("PAGG-09: fit-comfort returns 0 products (empty category)", async () => {
    if (!cmsAvailable) {
      console.log("  ⏭️  SKIP (CMS unavailable): fit-comfort");
      return;
    }

    const allIds = unrollDescendantKeys("e4rct8015rxgy011710isd5e");
    const leafIds = allIds.filter((id) => catalogueIndex.slotMetadataMap[id]?.type === "link");

    const query = groq`*[_type == "product" && count(catalogueLocationKeys[@ in ${JSON.stringify(
      leafIds
    )}]) > 0]{_id}`;
    const products = await sanityFetch({ query, tags: ["fit-comfort"] });

    expect(products).toHaveLength(0);
  });

  it("PAGG-10: storage aggregates 2 leaf categories", async () => {
    await testParentAggregation(
      "rw0symuvdvebq75r4og53tlf",
      ["u9o83mfmx23cudko8phu5otx", "j8ls622l90d6m4xetlajua4y"],
      2
    );
  });

  it("PAGG-11: accessories aggregates all 8 leaves", async () => {
    await testParentAggregation(
      "j9ozs17mc0b1nv2gqn2rvmg1",
      [
        "vnrj2n32p172vcje1tt3s4ls",
        "ck7d2wm9xe6lujtdfq7biyh7",
        "jdxde1qpftseepekaivzpl8c",
        "j2yu4yvtje69j6gie4spxutu",
        "9td5z7HwDgMNxTZ8edvs2d",
        "ab2xhkm6hgabf69y0f3s4oo0",
        "u9o83mfmx23cudko8phu5otx",
        "j8ls622l90d6m4xetlajua4y",
      ],
      15
    );
  });
});

// ============================================================================
// SUITE 6: Pre-computed Index Consistency
// ============================================================================

describe("6. catalogue-index.json Consistency", () => {
  it("PRE-01: slugToIdMap aligns with tree leaf nodes", () => {
    const treeSlugs = new Set<string>();

    const collectSlugs = (nodes: any[]) => {
      for (const node of nodes) {
        if (node.type === "link" && node.slug?.current) {
          treeSlugs.add(node.slug.current);
        }
        if (node.children) {
          collectSlugs(node.children);
        }
      }
    };

    collectSlugs(catalogueIndex.tree);

    for (const slug of treeSlugs) {
      expect(catalogueIndex.slugToIdMap).toHaveProperty(slug);
    }
  });

  it("PRE-02: slotMetadataMap contains all tree node keys", () => {
    const collectKeys = (nodes: any[]): string[] => {
      let keys: string[] = [];
      for (const node of nodes) {
        keys.push(node._key);
        if (node.children) {
          keys = keys.concat(collectKeys(node.children));
        }
      }
      return keys;
    };

    const treeKeys = collectKeys(catalogueIndex.tree);

    for (const key of treeKeys) {
      expect(catalogueIndex.slotMetadataMap).toHaveProperty(key);
    }
  });

  it("PRE-03: slotMetadataMap.children matches tree.children", () => {
    const collectTreeChildren = (nodes: any[]): Map<string, string[]> => {
      const map = new Map<string, string[]>();
      for (const node of nodes) {
        if (node.children) {
          const childKeys = node.children.map((c: any) => c._key);
          map.set(node._key, childKeys);
          // Merge child maps
          const childMap = collectTreeChildren(node.children);
          childMap.forEach((value, key) => map.set(key, value));
        }
      }
      return map;
    };

    const treeChildren = collectTreeChildren(catalogueIndex.tree);

    for (const [nodeId, expectedChildren] of treeChildren) {
      const meta = catalogueIndex.slotMetadataMap[nodeId];
      expect(meta?.children?.sort()).toEqual(expectedChildren.sort());
    }
  });

  it("PRE-04: Leaf count equals slugToIdMap entry count", () => {
    const countLeaves = (nodes: any[]): number => {
      let count = 0;
      for (const node of nodes) {
        if (node.type === "link") {
          count++;
        }
        if (node.children) {
          count += countLeaves(node.children);
        }
      }
      return count;
    };

    const treeLeafCount = countLeaves(catalogueIndex.tree);
    const slugMapCount = Object.keys(catalogueIndex.slugToIdMap).length;

    expect(treeLeafCount).toBe(slugMapCount);
  });

  it("PRE-05: generatedAt is within 30 days", () => {
    const generated = new Date(catalogueIndex.generatedAt);
    const now = new Date();
    const diffDays = (now.getTime() - generated.getTime()) / (1000 * 60 * 60 * 24);

    expect(diffDays).toBeLessThan(30);
  });

  it("PRE-06: Root categories are complete", () => {
    const rootTitles = catalogueIndex.tree.map((node: any) => node.title);
    expect(rootTitles).toContain("Headphones");
    expect(rootTitles).toContain("Audio Electronics");
    expect(rootTitles).toContain("Accessories");
  });

  it("PRE-07: No orphaned metadata entries", () => {
    const collectTreeKeys = (nodes: any[]): string[] => {
      let keys: string[] = [];
      for (const node of nodes) {
        keys.push(node._key);
        if (node.children) {
          keys = keys.concat(collectTreeKeys(node.children));
        }
      }
      return keys;
    };

    const treeKeys = new Set(collectTreeKeys(catalogueIndex.tree));
    const metadataKeys = Object.keys(catalogueIndex.slotMetadataMap);

    for (const key of metadataKeys) {
      expect(treeKeys.has(key)).toBe(true);
    }
  });

  it("PRE-08: No circular references in unrollDescendantKeys", () => {
    const allNodeIds = Object.keys(catalogueIndex.slotMetadataMap);

    for (const nodeId of allNodeIds) {
      const result = unrollDescendantKeys(nodeId);
      // Should terminate and return results
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    }
  });
});

// ============================================================================
// SUITE 7: E2E URL → Products Pipeline
// ============================================================================

describe("7. E2E URL → Products Pipeline", () => {
  const testE2EPipeline = async (
    urlPath: string,
    slug: string,
    expectedNodeId: string,
    minProductCount: number
  ) => {
    if (!cmsAvailable) {
      console.log(`  ⏭️  SKIP (CMS unavailable): ${urlPath}`);
      return;
    }

    // Step 1: Extract slug from URL
    const extractedSlug = urlPath.split("/").pop() || "";
    expect(extractedSlug).toBe(slug);

    // Step 2: Slug → Node ID
    const nodeId = resolveSlugToId(slug);
    expect(nodeId).toBe(expectedNodeId);

    // Step 3: Node ID → Descendant IDs
    const descendantIds = unrollDescendantKeys(nodeId);
    expect(descendantIds.length).toBeGreaterThan(0);
    expect(descendantIds).toContain(nodeId);

    // Step 4: Filter to leaf IDs only
    const isLeafNode = (id: string): boolean => {
      const meta = catalogueIndex.slotMetadataMap[id];
      return meta?.type === "link";
    };
    const leafIds = descendantIds.filter(isLeafNode);
    expect(leafIds.length).toBeGreaterThan(0);

    // Step 5: Build GROQ query
    const query = groq`*[_type == "product" && count(catalogueLocationKeys[@ in ${JSON.stringify(
      leafIds
    )}]) > 0]{_id, name, catalogueLocationKeys}`;

    // Step 6: Fetch products
    const products = await sanityFetch({ query, tags: [slug] });
    expect(products.length).toBeGreaterThanOrEqual(minProductCount);

    // Step 7: Validate all products have valid catalogueLocationKeys
    for (const product of products) {
      expect(Array.isArray(product.catalogueLocationKeys)).toBe(true);
      expect(product.catalogueLocationKeys.length).toBeGreaterThan(0);

      // Each key should exist in slotMetadataMap
      for (const key of product.catalogueLocationKeys) {
        expect(catalogueIndex.slotMetadataMap).toHaveProperty(key);
      }
    }
  };

  it("E2E-01: /products/headphones/open-back → 6 products", async () => {
    await testE2EPipeline("/products/headphones/open-back", "open-back", "o7c6baiuobsr7ni2y2vf22sh", 6);
  });

  it("E2E-02: /shop/open-back → 6 products (direct leaf)", async () => {
    await testE2EPipeline("/shop/open-back", "open-back", "o7c6baiuobsr7ni2y2vf22sh", 6);
  });

  it("E2E-03: /shop/closed-back → 31 products", async () => {
    await testE2EPipeline("/shop/closed-back", "closed-back", "yq3p9s798zszjkzm5btnebjh", 31);
  });

  it("E2E-04: /shop/desktop-amps → 25 products", async () => {
    await testE2EPipeline("/shop/desktop-amps", "desktop-amps", "o6mz3kbs5xla8ixastppktsd", 25);
  });

  it("E2E-05: /shop/adapters → 3 products", async () => {
    await testE2EPipeline("/shop/adapters", "adapters", "jdxde1qpftseepekaivzpl8c", 3);
  });

  it("E2E-06: /shop/dac-amp-combos → 22 products", async () => {
    await testE2EPipeline("/shop/dac-amp-combos", "dac-amp-combos", "o37u0yjphzt3qu91ewnww2yj", 22);
  });
});
