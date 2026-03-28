// Integration Tests: Catalogue Navigation → Products Page Flow
import { resolveSlugToId, unrollDescendantKeys, buildGroqKeysParam } from "../../data/catalogue";
import catalogueIndex from "../../data/catalogue-index.json";

interface CatalogueIndexData {
  generatedAt: string;
  slugToIdMap: Record<string, string>;
  slotMetadataMap: Record<string, { children: string[]; title: string; type: string; slug?: string }>;
  tree: any[];
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ Integration Test Failed: ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`❌ Integration Test Failed: ${message}. Expected: ${expected}, Got: ${actual}`);
  }
}

function assertArrayEqual<T>(actual: T[], expected: T[], message: string) {
  if (actual.length !== expected.length) {
    throw new Error(`❌ Integration Test Failed: ${message}. Expected length: ${expected.length}, Got length: ${actual.length}`);
  }
  for (let i = 0; i < actual.length; i++) {
    if (actual[i] !== expected[i]) {
      throw new Error(`❌ Integration Test Failed: ${message}. Expected at index ${i}: ${expected[i]}, Got: ${actual[i]}`);
    }
  }
}

function runTests() {
  const data = catalogueIndex as unknown as CatalogueIndexData;
  const { slotMetadataMap } = data;

  console.log("🧪 Running Catalogue-to-Products Integration Tests...");

  // Test 1: Full flow for leaf category "open-back"
  console.log("\n📋 Test 1: Full flow for leaf category 'open-back'");
  const openBackSlug = "open-back";
  const openBackId = resolveSlugToId(openBackSlug);
  assert(openBackId !== undefined, "open-back slug should resolve to ID");
  assertEqual(openBackId, "o7c6baiuobsr7ni2y2vf22sh", "open-back should resolve to correct ID");
  
  const openBackKeys = unrollDescendantKeys(openBackId);
  assertArrayEqual(openBackKeys, ["o7c6baiuobsr7ni2y2vf22sh"], "leaf should unroll to single key");
  
  const openBackGroqKeys = buildGroqKeysParam(openBackKeys);
  assertArrayEqual(openBackGroqKeys, ["o7c6baiuobsr7ni2y2vf22sh"], "GROQ keys should match unrolled keys");
  console.log("✅ Test 1: Leaf category 'open-back' full flow works");

  // Test 2: Header slug returns undefined (appropriate fallback)
  console.log("\n📋 Test 2: Header slug 'headphones' handling");
  const headphonesSlug = "headphones";
  const headphonesId = resolveSlugToId(headphonesSlug);
  assertEqual(headphonesId, undefined, "headphones header should return undefined");
  
  // When undefined, catalogueKeys should be empty array
  const headerKeys = headphonesId ? unrollDescendantKeys(headphonesId) : [];
  assertArrayEqual(headerKeys, [], "undefined ID should result in empty keys");
  console.log("✅ Test 2: Header slug handling works correctly");

  // Test 3: Full subtree flow for headphones root (if accessed by ID directly)
  console.log("\n📋 Test 3: Full subtree flow for headphones root");
  const headphonesRootId = "ugyeto8653n495dpf89nzoar";
  const headphonesSubtreeKeys = unrollDescendantKeys(headphonesRootId);
  assertEqual(headphonesSubtreeKeys.length, 11, "headphones subtree should have 11 keys");
  assert(headphonesSubtreeKeys.includes(headphonesRootId), "should include root ID");
  assert(headphonesSubtreeKeys.includes("o7c6baiuobsr7ni2y2vf22sh"), "should include open-back leaf");
  assert(headphonesSubtreeKeys.includes("yq3p9s798zszjkzm5btnebjh"), "should include closed-back leaf");
  console.log("✅ Test 3: Headphones subtree flow works correctly");

  // Test 4: Audio electronics subtree
  console.log("\n📋 Test 4: Audio electronics subtree");
  const audioElectronicsId = "ti2wufd15h51jxtq855ogbfa";
  const audioSubtreeKeys = unrollDescendantKeys(audioElectronicsId);
  assertEqual(audioSubtreeKeys.length, 9, "audio electronics subtree should have 9 keys");
  assert(audioSubtreeKeys.includes(audioElectronicsId), "should include root ID");
  assert(audioSubtreeKeys.includes("o6mz3kbs5xla8ixastppktsd"), "should include desktop-amps leaf");
  console.log("✅ Test 4: Audio electronics subtree works correctly");

  // Test 5: Accessories subtree
  console.log("\n📋 Test 5: Accessories subtree");
  const accessoriesId = "j9ozs17mc0b1nv2gqn2rvmg1";
  const accessoriesSubtreeKeys = unrollDescendantKeys(accessoriesId);
  assertEqual(accessoriesSubtreeKeys.length, 11, "accessories subtree should have 11 keys");
  assert(accessoriesSubtreeKeys.includes(accessoriesId), "should include root ID");
  assert(accessoriesSubtreeKeys.includes("vnrj2n32p172vcje1tt3s4ls"), "should include headphone-cables leaf");
  console.log("✅ Test 5: Accessories subtree works correctly");

  // Test 6: Empty keys handling (All Products page)
  console.log("\n📋 Test 6: Empty keys handling");
  const emptyKeys: string[] = [];
  const emptyGroqKeys = buildGroqKeysParam(emptyKeys);
  assertArrayEqual(emptyGroqKeys, [], "empty keys should remain empty");
  console.log("✅ Test 6: Empty keys handling works correctly");

  // Test 7: All 20 leaf categories can be resolved
  console.log("\n📋 Test 7: All 20 leaf categories resolution");
  const allLeafSlugs = [
    "open-back", "closed-back", "planar-magnetic", "dynamic", "electrostatic",
    "monitors-iems", "true-wireless-tws", "desktop-amps", "portable-amps", "standalone-dacs",
    "dac-amp-combos", "digital-players-daps", "network-streamers", "headphone-cables", "interconnects",
    "adapters", "earpads", "care-cleaning", "headphone-stands", "carrying-cases"
  ];

  let resolvedCount = 0;
  for (const slug of allLeafSlugs) {
    const id = resolveSlugToId(slug);
    if (id !== undefined) {
      resolvedCount++;
      const keys = unrollDescendantKeys(id);
      assertEqual(keys.length, 1, `leaf ${slug} should unroll to single key`);
      assertEqual(keys[0], id, `leaf ${slug} should return its own ID`);
    }
  }
  assertEqual(resolvedCount, 20, "all 20 leaf slugs should resolve");
  console.log("✅ Test 7: All 20 leaf categories resolve correctly");

  // Test 8: GROQ parameter building for various scenarios
  console.log("\n📋 Test 8: GROQ parameter building scenarios");
  const singleKey = buildGroqKeysParam(["o7c6baiuobsr7ni2y2vf22sh"]);
  assertArrayEqual(singleKey, ["o7c6baiuobsr7ni2y2vf22sh"], "single key should pass through");

  const multipleKeys = buildGroqKeysParam(["o7c6baiuobsr7ni2y2vf22sh", "yq3p9s798zszjkzm5btnebjh"]);
  assertEqual(multipleKeys.length, 2, "multiple keys should pass through");

  const subtreeKeys = buildGroqKeysParam(headphonesSubtreeKeys);
  assertEqual(subtreeKeys.length, 11, "subtree keys should pass through");
  console.log("✅ Test 8: GROQ parameter building works correctly");

  // Test 9: Invalid category handling
  console.log("\n📋 Test 9: Invalid category handling");
  const invalidId = resolveSlugToId("nonexistent-category");
  assertEqual(invalidId, undefined, "invalid category should return undefined");
  const invalidKeys = invalidId ? unrollDescendantKeys(invalidId) : [];
  assertArrayEqual(invalidKeys, [], "invalid category should result in empty keys");
  console.log("✅ Test 9: Invalid category handling works correctly");

  // Test 10: Edge case - whitespace and case sensitivity
  console.log("\n📋 Test 10: Edge cases");
  assertEqual(resolveSlugToId(" open-back"), undefined, "leading space should prevent match");
  assertEqual(resolveSlugToId("open-back "), undefined, "trailing space should prevent match");
  assertEqual(resolveSlugToId("Open-Back"), undefined, "capital case should not match");
  assertEqual(resolveSlugToId("OPEN-BACK"), undefined, "upper case should not match");
  console.log("✅ Test 10: Edge case handling works correctly");

  console.log("\n🎉 All Catalogue-to-Products Integration Tests Passed!");
  console.log("📊 Integration Summary:");
  console.log("  - Leaf category resolution: ✅");
  console.log("  - Header category handling: ✅");
  console.log("  - Subtree unrolling: ✅");
  console.log("  - GROQ parameter building: ✅");
  console.log("  - Empty keys handling: ✅");
  console.log("  - Invalid category handling: ✅");
  console.log("  - Edge case handling: ✅");
}

try {
  runTests();
} catch (error) {
  console.error((error as Error).message);
  process.exit(1);
}
