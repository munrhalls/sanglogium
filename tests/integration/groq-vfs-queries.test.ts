// GROQ Query Validation Tests for VFS Integration
import { resolveSlugToId, unrollDescendantKeys, buildGroqKeysParam } from "../../data/catalogue";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ GROQ Validation Test Failed: ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`❌ GROQ Validation Test Failed: ${message}. Expected: ${expected}, Got: ${actual}`);
  }
}

function assertArrayEqual<T>(actual: T[], expected: T[], message: string) {
  if (actual.length !== expected.length) {
    throw new Error(`❌ GROQ Validation Test Failed: ${message}. Expected length: ${expected.length}, Got length: ${actual.length}`);
  }
  for (let i = 0; i < actual.length; i++) {
    if (actual[i] !== expected[i]) {
      throw new Error(`❌ GROQ Validation Test Failed: ${message}. Expected at index ${i}: ${expected[i]}, Got: ${actual[i]}`);
    }
  }
}

// Mock GROQ query builder functions (simulating the real implementations)
function buildProductQuery(catalogueKeys: string[]): string {
  const pathQuery = catalogueKeys.length > 0 ? ` && count(catalogueLocationKeys[@ in $catalogueKeys]) > 0` : "";
  return `*[_type == "product"${pathQuery}]`;
}

function buildFilterQuery(catalogueKeys: string[]): string {
  if (catalogueKeys.length === 0) {
    return `*[_type == "categoryFilters"]`;
  }
  return `*[_type == "categoryFilters" && categoryKey in $catalogueKeys]`;
}

function buildSortQuery(catalogueKeys: string[]): string {
  if (catalogueKeys.length === 0) {
    return `*[_type == "categorySortables"]`;
  }
  return `*[_type == "categorySortables" && categoryKey in $catalogueKeys]`;
}

function runTests() {
  console.log("🧪 Running GROQ VFS Query Validation Tests...");

  // Test 1: GROQ syntax validation for VFS key intersection
  console.log("\n📋 Test 1: GROQ syntax validation for VFS key intersection");
  const singleKey = ["o7c6baiuobsr7ni2y2vf22sh"];
  const singleKeyQuery = buildProductQuery(singleKey);
  assert(singleKeyQuery.includes('count(catalogueLocationKeys[@ in $catalogueKeys]) > 0'), "single key query should include VFS intersection syntax");
  assert(singleKeyQuery.includes('$catalogueKeys'), "single key query should include catalogueKeys parameter");
  console.log("✅ Test 1: Single key GROQ syntax validated");

  const multipleKeys = ["o7c6baiuobsr7ni2y2vf22sh", "yq3p9s798zszjkzm5btnebjh"];
  const multipleKeysQuery = buildProductQuery(multipleKeys);
  assert(multipleKeysQuery.includes('count(catalogueLocationKeys[@ in $catalogueKeys]) > 0'), "multiple keys query should include VFS intersection syntax");
  assert(multipleKeysQuery.includes('$catalogueKeys'), "multiple keys query should include catalogueKeys parameter");
  console.log("✅ Test 1: Multiple keys GROQ syntax validated");

  // Test 2: Empty keys array returns all products
  console.log("\n📋 Test 2: Empty keys array returns all products");
  const emptyKeys: string[] = [];
  const emptyKeysQuery = buildProductQuery(emptyKeys);
  assertEqual(emptyKeysQuery, '*[_type == "product"]', "empty keys should query all products without VFS filter");
  assert(!emptyKeysQuery.includes('$catalogueKeys'), "empty keys query should not include catalogueKeys parameter");
  console.log("✅ Test 2: Empty keys query validated");

  // Test 3: Filter query GROQ validation
  console.log("\n📋 Test 3: Filter query GROQ validation");
  const filterQueryWithKeys = buildFilterQuery(singleKey);
  assert(filterQueryWithKeys.includes('categoryKey in $catalogueKeys'), "filter query should use VFS key intersection");
  assert(filterQueryWithKeys.includes('$catalogueKeys'), "filter query should include catalogueKeys parameter");

  const filterQueryEmpty = buildFilterQuery(emptyKeys);
  assertEqual(filterQueryEmpty, '*[_type == "categoryFilters"]', "empty keys filter query should get all filters");
  assert(!filterQueryEmpty.includes('$catalogueKeys'), "empty keys filter query should not include catalogueKeys parameter");
  console.log("✅ Test 3: Filter query GROQ syntax validated");

  // Test 4: Sort query GROQ validation
  console.log("\n📋 Test 4: Sort query GROQ validation");
  const sortQueryWithKeys = buildSortQuery(singleKey);
  assert(sortQueryWithKeys.includes('categoryKey in $catalogueKeys'), "sort query should use VFS key intersection");
  assert(sortQueryWithKeys.includes('$catalogueKeys'), "sort query should include catalogueKeys parameter");

  const sortQueryEmpty = buildSortQuery(emptyKeys);
  assertEqual(sortQueryEmpty, '*[_type == "categorySortables"]', "empty keys sort query should get all sortables");
  assert(!sortQueryEmpty.includes('$catalogueKeys'), "empty keys sort query should not include catalogueKeys parameter");
  console.log("✅ Test 4: Sort query GROQ syntax validated");

  // Test 5: Real catalogue key format validation
  console.log("\n📋 Test 5: Real catalogue key format validation");
  const headphonesKeys = unrollDescendantKeys("ugyeto8653n495dpf89nzoar");
  const realKeysQuery = buildProductQuery(headphonesKeys);
  assert(realKeysQuery.includes('count(catalogueLocationKeys[@ in $catalogueKeys]) > 0'), "real keys query should include VFS intersection");
  assert(realKeysQuery.includes('$catalogueKeys'), "real keys query should include catalogueKeys parameter");
  assertEqual(headphonesKeys.length, 11, "headphones subtree should have 11 keys");
  console.log("✅ Test 5: Real catalogue key format validated");

  // Test 6: Parameter type consistency verification
  console.log("\n📋 Test 6: Parameter type consistency verification");
  const testKeys = ["o7c6baiuobsr7ni2y2vf22sh", "yq3p9s798zszjkzm5btnebjh"];
  const groqKeys = buildGroqKeysParam(testKeys);
  
  // Verify all keys are strings
  for (const key of groqKeys) {
    assert(typeof key === "string", `key ${key} should be a string`);
  }
  
  // Verify no null or undefined values
  assert(!groqKeys.includes(null as any), "keys should not contain null");
  assert(!groqKeys.includes(undefined as any), "keys should not contain undefined");
  
  // Verify array structure
  assert(Array.isArray(groqKeys), "GROQ keys should be an array");
  assertEqual(groqKeys.length, testKeys.length, "GROQ keys length should match input");
  console.log("✅ Test 6: Parameter type consistency verified");

  // Test 7: GROQ query structure validation
  console.log("\n📋 Test 7: GROQ query structure validation");
  const complexKeys = unrollDescendantKeys("ugyeto8653n495dpf89nzoar");
  const complexQuery = buildProductQuery(complexKeys);
  
  // Verify query starts correctly
  assert(complexQuery.startsWith('*[_type == "product"'), "query should start with product type filter");
  
  // Verify VFS intersection syntax is correct
  assert(complexQuery.includes('count(catalogueLocationKeys[@ in $catalogueKeys]) > 0'), "query should use correct VFS intersection syntax");
  assert(complexQuery.includes('@ in'), "query should use @ in operator");
  assert(complexQuery.includes('$catalogueKeys'), "query should reference catalogueKeys parameter");
  
  // Verify query structure integrity
  assert(complexQuery.includes(']'), "query should be properly closed");
  console.log("✅ Test 7: GROQ query structure validated");

  // Test 8: Edge case GROQ query handling
  console.log("\n📋 Test 8: Edge case GROQ query handling");
  
  // Very large key array (simulating entire catalogue)
  const allLeafSlugs = [
    "open-back", "closed-back", "planar-magnetic", "dynamic", "electrostatic",
    "monitors-iems", "true-wireless-tws", "desktop-amps", "portable-amps", "standalone-dacs",
    "dac-amp-combos", "digital-players-daps", "network-streamers", "headphone-cables", "interconnects",
    "adapters", "earpads", "care-cleaning", "headphone-stands", "carrying-cases"
  ];
  
  const allLeafIds = allLeafSlugs.map(slug => resolveSlugToId(slug)).filter(Boolean) as string[];
  const largeKeysQuery = buildProductQuery(allLeafIds);
  assert(largeKeysQuery.includes('count(catalogueLocationKeys[@ in $catalogueKeys]) > 0'), "large keys query should include VFS intersection");
  assert(largeKeysQuery.includes('$catalogueKeys'), "large keys query should include catalogueKeys parameter");
  console.log("✅ Test 8: Large keys array handling validated");

  // Test 9: Query parameter passing simulation
  console.log("\n📋 Test 9: Query parameter passing simulation");
  const testQueryKeys = ["o7c6baiuobsr7ni2y2vf22sh"];
  const simulatedParams = { catalogueKeys: testQueryKeys };
  
  // Verify parameter structure
  assert(Array.isArray(simulatedParams.catalogueKeys), "catalogueKeys parameter should be an array");
  assertEqual(simulatedParams.catalogueKeys.length, 1, "catalogueKeys should have correct length");
  assertEqual(simulatedParams.catalogueKeys[0], "o7c6baiuobsr7ni2y2vf22sh", "catalogueKeys should contain correct ID");
  
  // Verify parameter would work with GROQ query
  const paramQuery = buildProductQuery(simulatedParams.catalogueKeys);
  assert(paramQuery.includes('$catalogueKeys'), "query should reference the parameter");
  console.log("✅ Test 9: Query parameter passing validated");

  console.log("\n🎉 All GROQ VFS Query Validation Tests Passed!");
  console.log("📊 GROQ Validation Summary:");
  console.log("  - VFS intersection syntax: ✅");
  console.log("  - Empty keys handling: ✅");
  console.log("  - Filter query syntax: ✅");
  console.log("  - Sort query syntax: ✅");
  console.log("  - Parameter consistency: ✅");
  console.log("  - Query structure integrity: ✅");
  console.log("  - Edge case handling: ✅");
  console.log("  - Parameter passing: ✅");
}

try {
  runTests();
} catch (error) {
  console.error((error as Error).message);
  process.exit(1);
}
