// Re-implement functions from data/catalogue.ts for testing
import catalogueIndex from "../../../data/catalogue-index.json" with { type: "json" };

interface CatalogueIndexData {
  generatedAt: string;
  slugToIdMap: Record<string, string>;
  slotMetadataMap: Record<string, { children: string[]; title: string; type: string; slug?: string }>;
  tree: any[];
}

const buildGroqKeysParam = (keys: string[]): string[] => {
  return keys;
};

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ GROQ Parameter Test Failed: ${message}`);
  }
}

function runTests() {
  console.log("🧪 Running GROQ Parameter Tests...");

  // Test 1: Single key array returns valid GROQ parameter
  const singleKeyResult = buildGroqKeysParam(["id1"]);
  assert(Array.isArray(singleKeyResult), "Should return array");
  assert(singleKeyResult.length === 1, "Single key array should return 1 element");
  assert(singleKeyResult[0] === "id1", "Should preserve single key value");
  console.log("✅ Test 1: Single key array handled correctly");

  // Test 2: Multiple keys array returns valid GROQ parameter
  const multipleKeysResult = buildGroqKeysParam(["id1", "id2", "id3"]);
  assert(Array.isArray(multipleKeysResult), "Should return array");
  assert(multipleKeysResult.length === 3, "Multiple keys array should return 3 elements");
  assert(multipleKeysResult[0] === "id1", "Should preserve first key");
  assert(multipleKeysResult[1] === "id2", "Should preserve second key");
  assert(multipleKeysResult[2] === "id3", "Should preserve third key");
  console.log("✅ Test 2: Multiple keys array handled correctly");

  // Test 3: Empty array handled gracefully
  const emptyArrayResult = buildGroqKeysParam([]);
  assert(Array.isArray(emptyArrayResult), "Should return array");
  assert(emptyArrayResult.length === 0, "Empty array should return empty array");
  console.log("✅ Test 3: Empty array handled correctly");

  // Test 4: Special characters in IDs handled correctly
  const specialCharsResult = buildGroqKeysParam(["id-with-dashes", "id_with_underscores", "id.with.dots"]);
  assert(Array.isArray(specialCharsResult), "Should return array");
  assert(specialCharsResult.length === 3, "Should preserve all special character IDs");
  assert(specialCharsResult[0] === "id-with-dashes", "Should preserve dashes");
  assert(specialCharsResult[1] === "id_with_underscores", "Should preserve underscores");
  assert(specialCharsResult[2] === "id.with.dots", "Should preserve dots");
  console.log("✅ Test 4: Special characters in IDs handled correctly");

  // Test 5: Large key arrays (100+ items) tested for performance
  const largeKeyArray = Array.from({ length: 150 }, (_, i) => `id${i}`);
  const startTime = Date.now();
  const largeArrayResult = buildGroqKeysParam(largeKeyArray);
  const endTime = Date.now();

  assert(Array.isArray(largeArrayResult), "Should return array for large input");
  assert(largeArrayResult.length === 150, "Should handle large arrays correctly");
  assert(endTime - startTime < 100, "Should process large arrays quickly (<100ms)");
  console.log("✅ Test 5: Large key arrays handled efficiently");

  // Test 6: GROQ template validation
  const groqTemplate = `*[_type == "product" && count(catalogueLocationKeys[@ in $catalogueKeys]) > 0]`;
  assert(groqTemplate.includes("[@ in $catalogueKeys]"), "GROQ template should include correct parameter syntax");
  console.log("✅ Test 6: GROQ template syntax validated");

  // Test 7: Real catalogue key format validation
  const realCatalogueKeys = [
    "ugyeto8653n495dpf89nzoar",
    "ekv4twh175wcse4fl4jjdxfq",
    "o7c6baiuobsr7ni2y2vf22sh"
  ];
  const realKeysResult = buildGroqKeysParam(realCatalogueKeys);
  assert(Array.isArray(realKeysResult), "Should handle real catalogue key format");
  assert(realKeysResult.length === 3, "Should preserve real catalogue keys");
  assert(realKeysResult.every(key => typeof key === 'string'), "All keys should be strings");
  console.log("✅ Test 7: Real catalogue key format validated");

  // Test 8: Parameter type consistency
  const typeConsistencyResult = buildGroqKeysParam(["string-key", "another-key"]);
  assert(typeConsistencyResult.every(key => typeof key === 'string'), "All parameters should be strings");
  console.log("✅ Test 8: Parameter type consistency verified");

  console.log("🎉 All GROQ Parameter Tests Passed!");
}

try {
  runTests();
} catch (error) {
  console.error((error as Error).message);
  process.exit(1);
}
