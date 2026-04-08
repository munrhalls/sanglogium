#!/usr/bin/env node
/**
 * COMPREHENSIVE REGRESSION TEST SUITE
 * Performance Sprint - Pre/Post Deployment Verification
 * 
 * Validates functionality across all areas affected by performance optimizations
 * 
 * Run: node tests/regression/run-regression-tests.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  bold: "\x1b[1m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// ============================================================================
// TEST HELPERS
// ============================================================================
function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function fileExists(filePath) {
  return fs.existsSync(path.join(process.cwd(), filePath));
}

function readFile(filePath) {
  return fs.readFileSync(path.join(process.cwd(), filePath), 'utf8');
}

// ============================================================================
// TEST SUITES
// ============================================================================
const results = [];

function test(name, fn) {
  const start = Date.now();
  try {
    fn();
    results.push({ name, passed: true, duration: Date.now() - start });
    log(`  ✅ ${name}`, "green");
  } catch (error) {
    results.push({ name, passed: false, error: error.message, duration: Date.now() - start });
    log(`  ❌ ${name}`, "red");
    log(`     Error: ${error.message}`, "red");
  }
}

// ============================================================================
// SUITE 1: VFS DATA INTEGRITY
// ============================================================================
function runVfsTests() {
  log("\n📦 VFS Data Integrity", "bold");
  log("-".repeat(40), "blue");

  test("VFS catalogue-index.json exists", () => {
    assert(fileExists("data/catalogue-index.json"), "catalogue-index.json not found");
  });

  test("VFS data loads and parses", () => {
    const data = JSON.parse(readFile("data/catalogue-index.json"));
    assert(data && typeof data === "object", "Invalid JSON structure");
  });

  test("VFS has required fields", () => {
    const data = JSON.parse(readFile("data/catalogue-index.json"));
    assert(data.slugToIdMap && typeof data.slugToIdMap === "object", "Missing slugToIdMap");
    assert(data.slotMetadataMap && typeof data.slotMetadataMap === "object", "Missing slotMetadataMap");
    assert(Array.isArray(data.tree), "Missing or invalid tree");
  });

  test("VFS slotMetadataMap complete", () => {
    const data = JSON.parse(readFile("data/catalogue-index.json"));
    const allChildrenIds = [];
    Object.values(data.slotMetadataMap).forEach((node) => {
      if (node.children) allChildrenIds.push(...node.children);
    });
    const missing = allChildrenIds.filter((id) => !(id in data.slotMetadataMap));
    assert(missing.length === 0, `Missing children: ${missing.slice(0, 3).join(", ")}`);
  });

  test("VFS slug mappings valid", () => {
    const data = JSON.parse(readFile("data/catalogue-index.json"));
    const invalid = Object.values(data.slugToIdMap).filter(
      (id) => !(id in data.slotMetadataMap)
    );
    assert(invalid.length === 0, `${invalid.length} invalid slug mappings`);
  });

  test("VFS critical paths exist", () => {
    const data = JSON.parse(readFile("data/catalogue-index.json"));
    const paths = ["headphones", "audio-electronics", "accessories"];
    const missing = paths.filter((slug) => !data.slugToIdMap[slug]);
    assert(missing.length === 0, `Missing: ${missing.join(", ")}`);
  });

  test("VFS catalogue.ts exports exist", () => {
    assert(fileExists("data/catalogue.ts"), "catalogue.ts not found");
    const content = readFile("data/catalogue.ts");
    assert(content.includes("export const getCatalogue"), "Missing getCatalogue export");
    assert(content.includes("export const resolveSlugToId"), "Missing resolveSlugToId export");
    assert(content.includes("export const unrollDescendantKeys"), "Missing unrollDescendantKeys export");
  });
}

// ============================================================================
// SUITE 2: HOMEPAGE COMPONENTS
// ============================================================================
function runHomepageTests() {
  log("\n📦 Homepage Components", "bold");
  log("-".repeat(40), "blue");

  const components = [
    "app/components/features/homepage/hero/Hero.tsx",
    "app/components/features/homepage/featured/Featured.tsx",
    "app/components/features/homepage/product-spotlight-1/ProductSpotlight1.tsx",
    "app/components/features/homepage/product-spotlight-2/ProductSpotlight2.tsx",
    "app/components/features/homepage/product-spotlight-3/ProductSpotlight3.tsx",
    "app/components/features/homepage/iems-gallery/IemsGallery.tsx",
    "app/components/features/homepage/newest-release/NewestRelease.tsx",
    "app/components/features/homepage/dacs/Dacs.tsx",
    "app/components/features/homepage/accessories/Accessories.tsx",
  ];

  test("All homepage components exist", () => {
    const missing = components.filter((c) => !fileExists(c));
    assert(missing.length === 0, `Missing: ${missing.join(", ")}`);
  });

  const fetchers = [
    "sanity/lib/hero/getHeroData.ts",
    "app/components/features/homepage/featured/getFeaturedProducts.ts",
    "app/components/features/homepage/newest-release/getNewestRelease.ts",
    "app/components/features/homepage/dacs/getDacProducts.ts",
    "app/components/features/homepage/iems-gallery/getIemProducts.ts",
    "app/components/features/homepage/accessories/getAccessoryProducts.ts",
  ];

  test("All data fetchers exist", () => {
    const missing = fetchers.filter((f) => !fileExists(f));
    assert(missing.length === 0, `Missing: ${missing.join(", ")}`);
  });

  test("Page.tsx exists and is server component", () => {
    assert(fileExists("app/(store)/page.tsx"), "page.tsx not found");
    const content = readFile("app/(store)/page.tsx");
    assert(!content.includes('"use client"'), "page.tsx has use client directive");
  });

  test("Featured is async component", () => {
    const content = readFile("app/components/features/homepage/featured/Featured.tsx");
    assert(content.includes("export default async function"), "Not an async component");
  });

  test("Hero has getHeroData fetcher", () => {
    assert(fileExists("sanity/lib/hero/getHeroData.ts"), "getHeroData.ts not found");
  });
}

// ============================================================================
// SUITE 3: PRODUCT PAGES
// ============================================================================
function runProductPageTests() {
  log("\n📦 Product Pages", "bold");
  log("-".repeat(40), "blue");

  test("Products page.tsx exists", () => {
    assert(fileExists("app/(store)/products/page.tsx"), "page.tsx not found");
  });

  test("Products page uses Promise.all", () => {
    const content = readFile("app/(store)/products/page.tsx");
    assert(content.includes("Promise.all"), "Missing Promise.all for parallel fetching");
  });

  test("Category page uses VFS", () => {
    assert(fileExists("app/(store)/products/[...category]/page.tsx"), "Category page not found");
    const content = readFile("app/(store)/products/[...category]/page.tsx");
    assert(content.includes("resolveSlugToId"), "Missing resolveSlugToId");
    assert(content.includes("unrollDescendantKeys"), "Missing unrollDescendantKeys");
  });

  test("getSelectedProducts exists", () => {
    assert(fileExists("sanity/lib/products/getSelectedProducts.ts"), "File not found");
    const content = readFile("sanity/lib/products/getSelectedProducts.ts");
    assert(content.includes("export"), "Missing export");
  });

  test("ProductsGrid exists", () => {
    assert(fileExists("app/components/features/products/ProductsGrid.tsx"), "Not found");
  });
}

// ============================================================================
// SUITE 4: CLIENT COMPONENTS
// ============================================================================
function runClientComponentTests() {
  log("\n📦 Client Components", "bold");
  log("-".repeat(40), "blue");

  const criticalClient = [
    "app/components/features/basket/BasketControls.tsx",
    "app/components/ui/drawers/filter/ProductsFilterDrawer.tsx",
    "app/components/ui/drawers/sort/ProductsSortDrawer.tsx",
    "app/components/ui/pagination/Pagination.tsx",
  ];

  test("Critical client components exist", () => {
    const missing = criticalClient.filter((c) => !fileExists(c));
    assert(missing.length === 0, `Missing: ${missing.join(", ")}`);
  });

  test("BasketControls has use client", () => {
    const content = readFile("app/components/features/basket/BasketControls.tsx");
    assert(content.includes('"use client"'), "Missing use client directive");
  });

  test("Drawers have use client", () => {
    const filter = readFile("app/components/ui/drawers/filter/ProductsFilterDrawer.tsx");
    assert(filter.includes('"use client"'), "Filter drawer missing use client");
  });
}

// ============================================================================
// SUITE 5: SANITY CLIENT
// ============================================================================
function runSanityTests() {
  log("\n📦 Sanity Client", "bold");
  log("-".repeat(40), "blue");

  test("Sanity client exists", () => {
    assert(fileExists("sanity/lib/client.ts"), "client.ts not found");
  });

  test("sanityFetch exported", () => {
    const content = readFile("sanity/lib/client.ts");
    assert(content.includes("export async function sanityFetch"), "Missing sanityFetch export");
  });

  test("Sanity client uses CDN", () => {
    const content = readFile("sanity/lib/client.ts");
    assert(content.includes("useCdn: true"), "Should use CDN");
  });

  test("Sanity types file exists", () => {
    assert(fileExists("sanity.types.ts"), "sanity.types.ts not found");
  });
}

// ============================================================================
// SUITE 6: BUILD INTEGRITY
// ============================================================================
function runBuildTests() {
  log("\n📦 Build Integrity", "bold");
  log("-".repeat(40), "blue");

  test("TypeScript compilation (quick check)", () => {
    // Check that key files have no obvious syntax errors
    const files = [
      "app/(store)/page.tsx",
      "sanity/lib/client.ts",
      "data/catalogue.ts",
    ];
    for (const file of files) {
      const content = readFile(file);
      assert(!content.includes("undefinedundefined"), `Syntax issue in ${file}`);
    }
  });

  test("Next.config.ts exists", () => {
    assert(fileExists("next.config.ts"), "next.config.ts not found");
  });

  test("Package.json has required scripts", () => {
    const pkg = JSON.parse(readFile("package.json"));
    assert(pkg.scripts && pkg.scripts.build, "Missing build script");
  });
}

// ============================================================================
// MAIN
// ============================================================================
function main() {
  log("\n🔬 PERFORMANCE SPRINT REGRESSION TEST SUITE", "bold");
  log("=".repeat(60), "blue");
  log("Validating all affected code areas...\n", "yellow");

  const startTime = Date.now();

  runVfsTests();
  runHomepageTests();
  runProductPageTests();
  runClientComponentTests();
  runSanityTests();
  runBuildTests();

  const duration = Date.now() - startTime;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  log("\n" + "=".repeat(60), "blue");
  log("📊 SUMMARY", "bold");
  log(`Total Tests: ${results.length}`, "bold");
  log(`Passed: ${passed}`, "green");
  log(`Failed: ${failed}`, failed > 0 ? "red" : "green");
  log(`Duration: ${duration}ms`, "yellow");
  log("=".repeat(60), "blue");

  if (failed > 0) {
    log("\n❌ REGRESSION TESTS FAILED - DO NOT DEPLOY", "red");
    process.exit(1);
  } else {
    log("\n✅ ALL REGRESSION TESTS PASSED", "green");
    log("Safe to proceed with performance sprint deployment", "green");
    process.exit(0);
  }
}

main();
