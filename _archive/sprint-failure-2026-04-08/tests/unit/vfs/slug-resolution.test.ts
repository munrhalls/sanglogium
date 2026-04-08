// Re-implement functions from data/catalogue.ts for testing
import catalogueIndex from "../../../data/catalogue-index.json" with { type: "json" };

interface CatalogueIndexData {
  generatedAt: string;
  slugToIdMap: Record<string, string>;
  slotMetadataMap: Record<string, { children: string[]; title: string; type: string; slug?: string }>;
  tree: any[];
}

const resolveSlugToId = (slug: string) => {
  const data = catalogueIndex as unknown as CatalogueIndexData;
  return data.slugToIdMap[slug];
};

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ Slug Resolution Test Failed: ${message}`);
  }
}

function runTests() {
  console.log("🧪 Running Slug Resolution Tests...");

  // Test 1: Valid leaf slugs return correct IDs (sample: 5 random slugs)
  assert(resolveSlugToId("open-back") === "o7c6baiuobsr7ni2y2vf22sh", "open-back should resolve to correct ID");
  assert(resolveSlugToId("closed-back") === "yq3p9s798zszjkzm5btnebjh", "closed-back should resolve to correct ID");
  assert(resolveSlugToId("planar-magnetic") === "yd9641q8fiuh9rgoupauw2zl", "planar-magnetic should resolve to correct ID");
  assert(resolveSlugToId("desktop-amps") === "o6mz3kbs5xla8ixastppktsd", "desktop-amps should resolve to correct ID");
  assert(resolveSlugToId("headphone-cables") === "vnrj2n32p172vcje1tt3s4ls", "headphone-cables should resolve to correct ID");
  console.log("✅ Test 1: Valid leaf slugs resolve correctly (5 tested)");

  // Test 2: Header slugs return undefined (sample: 3 headers)
  assert(resolveSlugToId("headphones") === undefined, "headphones header should return undefined");
  assert(resolveSlugToId("audio-electronics") === undefined, "audio-electronics header should return undefined");
  assert(resolveSlugToId("accessories") === undefined, "accessories header should return undefined");
  console.log("✅ Test 2: Header slugs return undefined (3 tested)");

  // Test 3: Non-existent slugs return undefined
  assert(resolveSlugToId("nonexistent") === undefined, "nonexistent slug should return undefined");
  assert(resolveSlugToId("invalid-category") === undefined, "invalid-category should return undefined");
  console.log("✅ Test 3: Non-existent slugs return undefined");

  // Test 4: Empty string returns undefined
  assert(resolveSlugToId("") === undefined, "empty string should return undefined");
  console.log("✅ Test 4: Empty string returns undefined");

  // Test 5: Case sensitivity (slug "Open-Back" should not match "open-back")
  assert(resolveSlugToId("Open-Back") === undefined, "Open-Back (capital) should not match open-back");
  assert(resolveSlugToId("OPEN-BACK") === undefined, "OPEN-BACK (caps) should not match open-back");
  assert(resolveSlugToId("Headphones") === undefined, "Headphones (capital) should not match headphones");
  console.log("✅ Test 5: Case sensitivity enforced");

  // Test 6: Test all 20 leaf slugs exist and resolve
  const allLeafSlugs = [
    "open-back", "closed-back", "planar-magnetic", "dynamic", "electrostatic",
    "monitors-iems", "true-wireless-tws", "desktop-amps", "portable-amps", "standalone-dacs",
    "dac-amp-combos", "digital-players-daps", "network-streamers", "headphone-cables", "interconnects",
    "adapters", "earpads", "care-cleaning", "headphone-stands", "carrying-cases"
  ];

  const unresolvedSlugs = allLeafSlugs.filter(slug => resolveSlugToId(slug) === undefined);
  assert(unresolvedSlugs.length === 0, `Unresolved leaf slugs: ${unresolvedSlugs.join(', ')}`);
  console.log("✅ Test 6: All 20 leaf slugs resolve correctly");

  // Test 7: Test special characters (none in current data, but verify handling)
  assert(resolveSlugToId("slug-with-dashes") === undefined, "slug-with-dashes should return undefined");
  assert(resolveSlugToId("slug_with_underscores") === undefined, "slug_with_underscores should return undefined");
  console.log("✅ Test 7: Special character handling verified");

  // Test 8: Test whitespace handling
  assert(resolveSlugToId(" open-back") === undefined, "leading space should prevent match");
  assert(resolveSlugToId("open-back ") === undefined, "trailing space should prevent match");
  assert(resolveSlugToId("open-back") === "o7c6baiuobsr7ni2y2vf22sh", "exact match should still work");
  console.log("✅ Test 8: Whitespace handling verified");

  console.log("🎉 All Slug Resolution Tests Passed!");
}

try {
  runTests();
} catch (error) {
  console.error((error as Error).message);
  process.exit(1);
}
