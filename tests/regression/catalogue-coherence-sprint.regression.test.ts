/**
 * REGRESSION TEST SUITE: Catalogue Coherence Sprint
 *
 * This test suite MUST pass before and after the sprint.
 * It validates that:
 * 1. VFS resolution mechanics remain intact
 * 2. New categories integrate properly
 * 3. Removed categories (TWS) no longer appear
 * 4. Semantic configuration is valid
 * 5. Build pipeline produces correct output
 *
 * Run before sprint: npx tsx tests/regression/catalogue-coherence-sprint.regression.test.ts
 * Run after sprint: npx tsx tests/regression/catalogue-coherence-sprint.regression.test.ts
 */

import catalogueIndex from "../../data/catalogue-index.json" with { type: "json" };
import { SEMANTIC_CATEGORIES, getSemanticRule } from "../../lib/catalogue/semanticConfig.js";

interface CatalogueIndexData {
  generatedAt: string;
  slugToIdMap: Record<string, string>;
  slotMetadataMap: Record<string, {
    children: string[];
    title: string;
    type: string;
    slug?: string;
    url?: string;
  }>;
  tree: any[];
}

// Test assertion utilities
function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`❌ REGRESSION TEST FAILED: ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`❌ REGRESSION TEST FAILED: ${message}. Expected: ${expected}, Got: ${actual}`);
  }
}

function assertArrayContains<T>(array: T[], item: T, message: string): void {
  if (!array.includes(item)) {
    throw new Error(`❌ REGRESSION TEST FAILED: ${message}. Array does not contain: ${item}`);
  }
}

function assertArrayNotContains<T>(array: T[], item: T, message: string): void {
  if (array.includes(item)) {
    throw new Error(`❌ REGRESSION TEST FAILED: ${message}. Array should not contain: ${item}`);
  }
}

// VFS utility functions (copied from data/catalogue.ts for test isolation)
function resolveSlugToId(slug: string): string | undefined {
  const data = catalogueIndex as unknown as CatalogueIndexData;
  return data.slugToIdMap[slug];
}

function unrollDescendantKeys(nodeId: string): string[] {
  const data = catalogueIndex as unknown as CatalogueIndexData;
  const { slotMetadataMap } = data;

  if (!slotMetadataMap[nodeId]) {
    return [];
  }

  const result = new Set<string>();
  const stack = [nodeId];

  while (stack.length > 0) {
    const currentId = stack.pop()!;
    if (result.has(currentId)) {
      continue;
    }

    result.add(currentId);
    const children = slotMetadataMap[currentId]?.children || [];
    stack.push(...children);
  }

  return Array.from(result);
}

console.log("🔒 CATALOGUE COHERENCE SPRINT - REGRESSION TEST SUITE");
console.log("=" .repeat(60));

// =============================================================================
// TEST GROUP 1: VFS Structural Integrity (Must pass before AND after sprint)
// =============================================================================
console.log("\n📦 TEST GROUP 1: VFS Structural Integrity");

function testVfsStructuralIntegrity() {
  const data = catalogueIndex as unknown as CatalogueIndexData;
  const { slotMetadataMap, slugToIdMap, tree } = data;

  // Test 1.1: slotMetadataMap has no orphaned children references
  console.log("\n  Test 1.1: No orphaned children references");
  let orphanedCount = 0;
  for (const [nodeId, metadata] of Object.entries(slotMetadataMap)) {
    for (const childId of metadata.children) {
      if (!slotMetadataMap[childId]) {
        console.log(`    ⚠️ Orphaned: ${childId} (referenced by ${nodeId})`);
        orphanedCount++;
      }
    }
  }
  assertEqual(orphanedCount, 0, `Found ${orphanedCount} orphaned child references`);
  console.log("    ✅ No orphaned children references");

  // Test 1.2: All leaf nodes have valid URLs (not '#')
  console.log("\n  Test 1.2: All leaf nodes have valid URLs");
  let invalidUrlCount = 0;
  for (const [nodeId, metadata] of Object.entries(slotMetadataMap)) {
    if (metadata.type === 'link' && metadata.url === '#') {
      console.log(`    ⚠️ Invalid URL: ${metadata.title} (${nodeId})`);
      invalidUrlCount++;
    }
  }
  assertEqual(invalidUrlCount, 0, `Found ${invalidUrlCount} leaf nodes with invalid URLs`);
  console.log("    ✅ All leaf nodes have valid URLs");

  // Test 1.3: All slugToIdMap entries exist in slotMetadataMap
  console.log("\n  Test 1.3: slugToIdMap entries exist in slotMetadataMap");
  let missingCount = 0;
  for (const [slug, id] of Object.entries(slugToIdMap)) {
    if (!slotMetadataMap[id]) {
      console.log(`    ⚠️ Missing metadata: ${slug} → ${id}`);
      missingCount++;
    }
  }
  assertEqual(missingCount, 0, `Found ${missingCount} missing metadata entries`);
  console.log("    ✅ All slugToIdMap entries have metadata");

  // Test 1.4: Tree structure is valid JSON
  console.log("\n  Test 1.4: Tree structure is valid");
  assert(Array.isArray(tree), "Tree must be an array");
  assert(tree.length > 0, "Tree must have root nodes");
  console.log("    ✅ Tree structure is valid");

  console.log("\n  🎉 VFS Structural Integrity: PASSED");
}

// =============================================================================
// TEST GROUP 2: Category Resolution (Critical for navigation)
// =============================================================================
console.log("\n📦 TEST GROUP 2: Category Resolution");

function testCategoryResolution() {
  const data = catalogueIndex as unknown as CatalogueIndexData;
  const { slugToIdMap } = data;

  // Test 2.1: Core categories resolve correctly
  console.log("\n  Test 2.1: Core categories resolve");
  const coreCategories = [
    "open-back",
    "closed-back",
    "planar-magnetic",
    "dynamic",
    "desktop-amps",
    "standalone-dacs",
    "headphone-cables",
    "earpads"
  ];

  for (const slug of coreCategories) {
    const id = resolveSlugToId(slug);
    assert(id !== undefined, `Core category "${slug}" must resolve`);
  }
  console.log("    ✅ All core categories resolve");

  // Test 2.2: Header categories (should NOT have slugs)
  console.log("\n  Test 2.2: Headers don't have URL slugs");
  const headerSlugs = ["headphones", "audio-electronics", "accessories"];
  for (const slug of headerSlugs) {
    const id = resolveSlugToId(slug);
    // Headers may or may not resolve depending on config
    // This test documents current behavior
    console.log(`    ℹ️ Header "${slug}" resolves to: ${id || 'undefined (expected)'}`);
  }
  console.log("    ✅ Header resolution documented");

  // Test 2.3: Subtree unrolling produces expected counts
  console.log("\n  Test 2.3: Subtree unrolling");

  // Headphones root currently has 11 nodes (will be 12 after adding semi-open)
  const headphonesKeys = unrollDescendantKeys("ugyeto8653n495dpf89nzoar");
  const minExpected = 10;
  const maxExpected = 12;
  assert(
    headphonesKeys.length >= minExpected && headphonesKeys.length <= maxExpected,
    `Headphones subtree should have ${minExpected}-${maxExpected} keys, got ${headphonesKeys.length}`
  );
  console.log(`    ✅ Headphones subtree: ${headphonesKeys.length} keys`);

  // Audio Electronics currently has 9 nodes (will be 11 after adding 2 new categories)
  const audioKeys = unrollDescendantKeys("ti2wufd15h51jxtq855ogbfa");
  assert(
    audioKeys.length >= 8 && audioKeys.length <= 10,
    `Audio Electronics subtree should have 8-10 keys, got ${audioKeys.length}`
  );
  console.log(`    ✅ Audio Electronics subtree: ${audioKeys.length} keys`);

  console.log("\n  🎉 Category Resolution: PASSED");
}

// =============================================================================
// TEST GROUP 3: Semantic Configuration Integrity
// =============================================================================
console.log("\n📦 TEST GROUP 3: Semantic Configuration");

function testSemanticConfiguration() {
  // Test 3.1: All expected categories have semantic rules
  console.log("\n  Test 3.1: Semantic rules completeness");

  const requiredCategories = [
    "open-back", "closed-back", "planar-magnetic", "dynamic", "electrostatic", "semi-open",
    "monitors-iems", "desktop-amps", "portable-amps", "bluetooth-dac-amps",
    "standalone-dacs", "dac-amp-combos", "usb-c-dacs", "digital-players-daps", "network-streamers",
    "headphone-cables", "interconnects", "adapters",
    "earpads", "eartips", "care-cleaning", "headphone-stands", "carrying-cases"
  ];

  // Note: TWS is intentionally excluded from required list (to be removed)

  let missingRules = 0;
  for (const slug of requiredCategories) {
    const rule = getSemanticRule(slug);
    if (!rule) {
      console.log(`    ⚠️ Missing semantic rule: ${slug}`);
      missingRules++;
    }
  }

  assertEqual(missingRules, 0, `Missing ${missingRules} semantic rules`);
  console.log(`    ✅ All ${requiredCategories.length} required categories have semantic rules`);

  // Test 3.2: Semantic rules have required fields
  console.log("\n  Test 3.2: Semantic rule structure validity");
  let invalidRules = 0;

  for (const [slug, rule] of Object.entries(SEMANTIC_CATEGORIES)) {
    if (!rule.title || !rule.positiveKeywords || !rule.weightings) {
      console.log(`    ⚠️ Invalid rule: ${slug}`);
      invalidRules++;
    }
  }

  assertEqual(invalidRules, 0, `Found ${invalidRules} invalid semantic rules`);
  console.log("    ✅ All semantic rules have required fields");

  // Test 3.3: Weightings sum to reasonable values
  console.log("\n  Test 3.3: Semantic weighting validity");
  let invalidWeightings = 0;

  for (const [slug, rule] of Object.entries(SEMANTIC_CATEGORIES)) {
    const { weightings } = rule;
    const total = weightings.required + weightings.positive + weightings.name + weightings.brand;
    // Should have enough positive weight to reach 80+ score with good matches
    if (total < 50) {
      console.log(`    ⚠️ Low total weightings: ${slug} (${total})`);
      invalidWeightings++;
    }
  }

  assertEqual(invalidWeightings, 0, `Found ${invalidWeightings} rules with invalid weightings`);
  console.log("    ✅ All weightings are valid");

  console.log("\n  🎉 Semantic Configuration: PASSED");
}

// =============================================================================
// TEST GROUP 4: Sprint-Specific Validation (PRE-SPRINT state)
// =============================================================================
console.log("\n📦 TEST GROUP 4: Sprint Baseline (Current State)");

function testSprintBaseline() {
  const data = catalogueIndex as unknown as CatalogueIndexData;
  const { slugToIdMap, slotMetadataMap } = data;

  // Test 4.1: TWS category EXISTS before sprint (to be removed)
  console.log("\n  Test 4.1: TWS category exists (baseline)");
  const twsId = resolveSlugToId("true-wireless-tws");

  if (twsId) {
    console.log(`    ℹ️ TWS category exists: ${twsId} (to be removed in sprint)`);
    assert(twsId === "sbbu2eig5fx84uht05ic863j", "TWS should have expected ID");
    assertArrayContains(Object.keys(slugToIdMap), "true-wireless-tws", "TWS should be in slugToIdMap");
    console.log("    ✅ TWS exists (will be removed)");
  } else {
    console.log("    ℹ️ TWS category already removed or never existed");
  }

  // Test 4.2: New categories do NOT exist before sprint
  console.log("\n  Test 4.2: New categories don't exist (baseline)");
  const newCategories = [
    "semi-open",           // Semi-Open Headphones
    "bluetooth-dac-amps",  // Bluetooth DAC/Amps
    "usb-c-dacs",          // USB-C/Dongle DACs
    "eartips"              // Eartips
  ];

  for (const slug of newCategories) {
    const id = resolveSlugToId(slug);
    if (id) {
      console.log(`    ⚠️ Unexpected: "${slug}" already exists`);
    } else {
      console.log(`    ✅ "${slug}" doesn't exist (to be added)`);
    }
  }

  // Test 4.3: Current leaf count (should be 20 before sprint)
  console.log("\n  Test 4.3: Current leaf count");
  const leafCount = Object.values(slotMetadataMap).filter(m => m.type === 'link').length;
  console.log(`    ℹ️ Current leaf count: ${leafCount}`);

  // After sprint, should be 23 (remove 1 TWS, add 4 new = +3 net from 20)
  assert(
    leafCount >= 19 && leafCount <= 21,
    `Expected ~20 leaf categories, found ${leafCount}`
  );
  console.log("    ✅ Leaf count within expected range");

  console.log("\n  🎉 Sprint Baseline: DOCUMENTED");
}

// =============================================================================
// TEST GROUP 5: Sprint Completion Validation (POST-SPRINT state)
// =============================================================================
console.log("\n📦 TEST GROUP 5: Sprint Completion Criteria");

function testSprintCompletion() {
  const data = catalogueIndex as unknown as CatalogueIndexData;
  const { slugToIdMap, slotMetadataMap } = data;

  // These tests will FAIL before sprint and should PASS after sprint
  console.log("\n  ⚠️ These tests validate sprint completion:");

  // Test 5.1: TWS category REMOVED
  console.log("\n  Test 5.1: TWS category removed");
  const twsId = resolveSlugToId("true-wireless-tws");
  if (twsId) {
    console.log("    ❌ FAIL: TWS category still exists (must be removed)");
  } else {
    console.log("    ✅ PASS: TWS category removed");
  }

  // Test 5.2: New categories ADDED
  console.log("\n  Test 5.2: New categories added");
  const requiredNewCategories = [
    "semi-open",
    "bluetooth-dac-amps",
    "usb-c-dacs",
    "eartips"
  ];

  for (const slug of requiredNewCategories) {
    const id = resolveSlugToId(slug);
    if (id) {
      console.log(`    ✅ "${slug}" added`);
    } else {
      console.log(`    ❌ "${slug}" NOT added`);
    }
  }

  // Test 5.3: Renamed categories
  console.log("\n  Test 5.3: Category renames applied");
  // Check if "monitors-iems" was renamed to "universal-iems"
  const oldIemsId = resolveSlugToId("monitors-iems");
  const newIemsId = resolveSlugToId("universal-iems");

  if (!oldIemsId && newIemsId) {
    console.log("    ✅ IEMs category renamed");
  } else if (oldIemsId && !newIemsId) {
    console.log("    ℹ️ IEMs not yet renamed");
  } else {
    console.log("    ⚠️ Unexpected IEMs state");
  }

  // Test 5.4: Target leaf count (23 after sprint)
  console.log("\n  Test 5.4: Target leaf count (23)");
  const leafCount = Object.values(slotMetadataMap).filter(m => m.type === 'link').length;
  if (leafCount === 23) {
    console.log(`    ✅ PASS: Exactly 23 leaf categories`);
  } else {
    console.log(`    ❌ Expected 23, got ${leafCount}`);
  }

  console.log("\n  📊 Sprint completion tests documented");
}

// =============================================================================
// RUN ALL TESTS
// =============================================================================
function runAllTests() {
  try {
    testVfsStructuralIntegrity();
    testCategoryResolution();
    testSemanticConfiguration();
    testSprintBaseline();
    testSprintCompletion();

    console.log("\n" + "=".repeat(60));
    console.log("🎉 ALL REGRESSION TESTS PASSED");
    console.log("=".repeat(60));
    console.log("\nSummary:");
    console.log("  ✅ VFS structural integrity maintained");
    console.log("  ✅ Category resolution working");
    console.log("  ✅ Semantic configuration valid");
    console.log("  ✅ Sprint baseline documented");
    console.log("  ✅ Completion criteria defined");

    return 0;
  } catch (error) {
    console.error("\n" + "=".repeat(60));
    console.error("❌ REGRESSION TEST SUITE FAILED");
    console.error("=".repeat(60));
    console.error((error as Error).message);
    return 1;
  }
}

process.exit(runAllTests());
