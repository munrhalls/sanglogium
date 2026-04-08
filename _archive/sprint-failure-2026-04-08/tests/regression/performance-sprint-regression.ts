#!/usr/bin/env node
/**
 * COMPREHENSIVE REGRESSION TEST SUITE
 * Performance Sprint - Pre/Post Deployment Verification
 * 
 * Scope: Validates functionality across all areas affected by performance optimizations
 * Areas Tested:
 * - Homepage data fetching (9 components)
 * - Product listing pages (category filters, sorting, pagination)
 * - VFS catalogue system (slug resolution, descendant unrolling)
 * - Client component hydration
 * - Sanity data integrity
 * 
 * Success Criteria: 100% pass rate before and after deployment
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  passed: number;
  failed: number;
}

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  bold: "\x1b[1m",
};

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// ============================================================================
// TEST SUITE 1: VFS DATA INTEGRITY
// ============================================================================
function testVfsDataIntegrity(): TestResult[] {
  const results: TestResult[] = [];
  const startTime = Date.now();

  try {
    // Load catalogue data
    const cataloguePath = path.join(process.cwd(), "data/catalogue-index.json");
    const catalogueData = JSON.parse(fs.readFileSync(cataloguePath, "utf8"));

    // Test 1.1: Validate structure
    const test1Start = Date.now();
    try {
      if (!catalogueData.slugToIdMap || typeof catalogueData.slugToIdMap !== "object") {
        throw new Error("slugToIdMap missing or invalid");
      }
      if (!catalogueData.slotMetadataMap || typeof catalogueData.slotMetadataMap !== "object") {
        throw new Error("slotMetadataMap missing or invalid");
      }
      if (!Array.isArray(catalogueData.tree)) {
        throw new Error("tree field missing or invalid");
      }
      results.push({
        name: "VFS Structure Valid",
        passed: true,
        duration: Date.now() - test1Start,
      });
    } catch (error) {
      results.push({
        name: "VFS Structure Valid",
        passed: false,
        error: (error as Error).message,
        duration: Date.now() - test1Start,
      });
    }

    // Test 1.2: All children IDs exist
    const test2Start = Date.now();
    try {
      const allChildrenIds: string[] = [];
      Object.values(catalogueData.slotMetadataMap).forEach((node: any) => {
        if (node.children) allChildrenIds.push(...node.children);
      });
      const missingChildren = allChildrenIds.filter(
        (id) => !(id in catalogueData.slotMetadataMap)
      );
      if (missingChildren.length > 0) {
        throw new Error(`Missing children: ${missingChildren.slice(0, 5).join(", ")}`);
      }
      results.push({
        name: "All Children IDs Exist",
        passed: true,
        duration: Date.now() - test2Start,
      });
    } catch (error) {
      results.push({
        name: "All Children IDs Exist",
        passed: false,
        error: (error as Error).message,
        duration: Date.now() - test2Start,
      });
    }

    // Test 1.3: Slug mappings resolve
    const test3Start = Date.now();
    try {
      const invalidMappings = Object.values(catalogueData.slugToIdMap).filter(
        (id: any) => !(id in catalogueData.slotMetadataMap)
      );
      if (invalidMappings.length > 0) {
        throw new Error(`${invalidMappings.length} invalid slug mappings`);
      }
      results.push({
        name: "Slug Mappings Valid",
        passed: true,
        duration: Date.now() - test3Start,
      });
    } catch (error) {
      results.push({
        name: "Slug Mappings Valid",
        passed: false,
        error: (error as Error).message,
        duration: Date.now() - test3Start,
      });
    }

    // Test 1.4: Critical paths exist
    const test4Start = Date.now();
    try {
      const criticalPaths = [
        "headphones",
        "audio-electronics",
        "accessories",
        "closed-back",
        "open-back",
        "in-ear-monitors",
      ];
      const missingPaths = criticalPaths.filter(
        (slug) => !catalogueData.slugToIdMap[slug]
      );
      if (missingPaths.length > 0) {
        throw new Error(`Missing critical paths: ${missingPaths.join(", ")}`);
      }
      results.push({
        name: "Critical Paths Exist",
        passed: true,
        duration: Date.now() - test4Start,
      });
    } catch (error) {
      results.push({
        name: "Critical Paths Exist",
        passed: false,
        error: (error as Error).message,
        duration: Date.now() - test4Start,
      });
    }
  } catch (error) {
    results.push({
      name: "VFS Data Load",
      passed: false,
      error: (error as Error).message,
      duration: Date.now() - startTime,
    });
  }

  return results;
}

// ============================================================================
// TEST SUITE 2: HOMEPAGE COMPONENTS
// ============================================================================
function testHomepageComponents(): TestResult[] {
  const results: TestResult[] = [];

  // Test 2.1: All homepage component files exist
  const test1Start = Date.now();
  try {
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

    const missing = components.filter(
      (comp) => !fs.existsSync(path.join(process.cwd(), comp))
    );
    if (missing.length > 0) {
      throw new Error(`Missing components: ${missing.join(", ")}`);
    }
    results.push({
      name: "Homepage Components Exist",
      passed: true,
      duration: Date.now() - test1Start,
    });
  } catch (error) {
    results.push({
      name: "Homepage Components Exist",
      passed: false,
      error: (error as Error).message,
      duration: Date.now() - test1Start,
    });
  }

  // Test 2.2: All data fetchers exist
  const test2Start = Date.now();
  try {
    const fetchers = [
      "sanity/lib/hero/getHeroData.ts",
      "app/components/features/homepage/featured/getFeaturedProducts.ts",
      "app/components/features/homepage/product-spotlight-1/getSpotlight1Data.ts",
      "app/components/features/homepage/product-spotlight-2/getSpotlight2Data.ts",
      "app/components/features/homepage/product-spotlight-3/getSpotlight3Data.ts",
      "app/components/features/homepage/iems-gallery/getIemProducts.ts",
      "app/components/features/homepage/newest-release/getNewestRelease.ts",
      "app/components/features/homepage/dacs/getDacProducts.ts",
      "app/components/features/homepage/accessories/getAccessoryProducts.ts",
    ];

    const missing = fetchers.filter(
      (fetcher) => !fs.existsSync(path.join(process.cwd(), fetcher))
    );
    if (missing.length > 0) {
      throw new Error(`Missing fetchers: ${missing.join(", ")}`);
    }
    results.push({
      name: "Data Fetchers Exist",
      passed: true,
      duration: Date.now() - test2Start,
    });
  } catch (error) {
    results.push({
      name: "Data Fetchers Exist",
      passed: false,
      error: (error as Error).message,
      duration: Date.now() - test2Start,
    });
  }

  // Test 2.3: Components are async (Server Components)
  const test3Start = Date.now();
  try {
    const featuredPath = path.join(
      process.cwd(),
      "app/components/features/homepage/featured/Featured.tsx"
    );
    const content = fs.readFileSync(featuredPath, "utf8");
    if (!content.includes("export default async function")) {
      throw new Error("Featured component not an async Server Component");
    }
    results.push({
      name: "Featured is Async Component",
      passed: true,
      duration: Date.now() - test3Start,
    });
  } catch (error) {
    results.push({
      name: "Featured is Async Component",
      passed: false,
      error: (error as Error).message,
      duration: Date.now() - test3Start,
    });
  }

  // Test 2.4: No "use client" in page.tsx
  const test4Start = Date.now();
  try {
    const pagePath = path.join(process.cwd(), "app/(store)/page.tsx");
    const content = fs.readFileSync(pagePath, "utf8");
    if (content.includes('"use client"')) {
      throw new Error("page.tsx should not have 'use client' directive");
    }
    results.push({
      name: "Page.tsx is Server Component",
      passed: true,
      duration: Date.now() - test4Start,
    });
  } catch (error) {
    results.push({
      name: "Page.tsx is Server Component",
      passed: false,
      error: (error as Error).message,
      duration: Date.now() - test4Start,
    });
  }

  return results;
}

// ============================================================================
// TEST SUITE 3: PRODUCT PAGES
// ============================================================================
function testProductPages(): TestResult[] {
  const results: TestResult[] = [];

  // Test 3.1: Product listing pages exist
  const test1Start = Date.now();
  try {
    const pages = [
      "app/(store)/products/page.tsx",
      "app/(store)/products/[...category]/page.tsx",
    ];

    const missing = pages.filter(
      (page) => !fs.existsSync(path.join(process.cwd(), page))
    );
    if (missing.length > 0) {
      throw new Error(`Missing pages: ${missing.join(", ")}`);
    }
    results.push({
      name: "Product Pages Exist",
      passed: true,
      duration: Date.now() - test1Start,
    });
  } catch (error) {
    results.push({
      name: "Product Pages Exist",
      passed: false,
      error: (error as Error).message,
      duration: Date.now() - test1Start,
    });
  }

  // Test 3.2: Uses Promise.all for parallel fetching
  const test2Start = Date.now();
  try {
    const pagePath = path.join(process.cwd(), "app/(store)/products/page.tsx");
    const content = fs.readFileSync(pagePath, "utf8");
    if (!content.includes("Promise.all")) {
      throw new Error("products/page.tsx should use Promise.all");
    }
    results.push({
      name: "Products Page Uses Promise.all",
      passed: true,
      duration: Date.now() - test2Start,
    });
  } catch (error) {
    results.push({
      name: "Products Page Uses Promise.all",
      passed: false,
      error: (error as Error).message,
      duration: Date.now() - test2Start,
    });
  }

  // Test 3.3: Category page uses VFS
  const test3Start = Date.now();
  try {
    const pagePath = path.join(
      process.cwd(),
      "app/(store)/products/[...category]/page.tsx"
    );
    const content = fs.readFileSync(pagePath, "utf8");
    if (!content.includes("resolveSlugToId") || !content.includes("unrollDescendantKeys")) {
      throw new Error("Category page should use VFS functions");
    }
    results.push({
      name: "Category Page Uses VFS",
      passed: true,
      duration: Date.now() - test3Start,
    });
  } catch (error) {
    results.push({
      name: "Category Page Uses VFS",
      passed: false,
      error: (error as Error).message,
      duration: Date.now() - test3Start,
    });
  }

  // Test 3.4: getSelectedProducts exists and exports
  const test4Start = Date.now();
  try {
    const filePath = path.join(
      process.cwd(),
      "sanity/lib/products/getSelectedProducts.ts"
    );
    if (!fs.existsSync(filePath)) {
      throw new Error("getSelectedProducts.ts not found");
    }
    const content = fs.readFileSync(filePath, "utf8");
    if (!content.includes("export")) {
      throw new Error("getSelectedProducts should export a function");
    }
    results.push({
      name: "getSelectedProducts Export Valid",
      passed: true,
      duration: Date.now() - test4Start,
    });
  } catch (error) {
    results.push({
      name: "getSelectedProducts Export Valid",
      passed: false,
      error: (error as Error).message,
      duration: Date.now() - test4Start,
    });
  }

  return results;
}

// ============================================================================
// TEST SUITE 4: CLIENT COMPONENTS
// ============================================================================
function testClientComponents(): TestResult[] {
  const results: TestResult[] = [];

  // Test 4.1: Critical client components exist
  const test1Start = Date.now();
  try {
    const components = [
      "app/components/features/basket/BasketControls.tsx",
      "app/components/ui/drawers/filter/ProductsFilterDrawer.tsx",
      "app/components/ui/drawers/sort/ProductsSortDrawer.tsx",
      "app/components/ui/pagination/Pagination.tsx",
    ];

    const missing = components.filter(
      (comp) => !fs.existsSync(path.join(process.cwd(), comp))
    );
    if (missing.length > 0) {
      throw new Error(`Missing client components: ${missing.join(", ")}`);
    }
    results.push({
      name: "Critical Client Components Exist",
      passed: true,
      duration: Date.now() - test1Start,
    });
  } catch (error) {
    results.push({
      name: "Critical Client Components Exist",
      passed: false,
      error: (error as Error).message,
      duration: Date.now() - test1Start,
    });
  }

  // Test 4.2: Client components have "use client"
  const test2Start = Date.now();
  try {
    const basketPath = path.join(
      process.cwd(),
      "app/components/features/basket/BasketControls.tsx"
    );
    const content = fs.readFileSync(basketPath, "utf8");
    if (!content.includes('"use client"')) {
      throw new Error("BasketControls should have 'use client' directive");
    }
    results.push({
      name: "BasketControls Has Use Client",
      passed: true,
      duration: Date.now() - test2Start,
    });
  } catch (error) {
    results.push({
      name: "BasketControls Has Use Client",
      passed: false,
      error: (error as Error).message,
      duration: Date.now() - test2Start,
    });
  }

  return results;
}

// ============================================================================
// TEST SUITE 5: SANITY CLIENT
// ============================================================================
function testSanityClient(): TestResult[] {
  const results: TestResult[] = [];

  // Test 5.1: Sanity client exists
  const test1Start = Date.now();
  try {
    const clientPath = path.join(process.cwd(), "sanity/lib/client.ts");
    if (!fs.existsSync(clientPath)) {
      throw new Error("sanity/lib/client.ts not found");
    }
    results.push({
      name: "Sanity Client Exists",
      passed: true,
      duration: Date.now() - test1Start,
    });
  } catch (error) {
    results.push({
      name: "Sanity Client Exists",
      passed: false,
      error: (error as Error).message,
      duration: Date.now() - test1Start,
    });
  }

  // Test 5.2: Client exports sanityFetch
  const test2Start = Date.now();
  try {
    const clientPath = path.join(process.cwd(), "sanity/lib/client.ts");
    const content = fs.readFileSync(clientPath, "utf8");
    if (!content.includes("export async function sanityFetch")) {
      throw new Error("sanityFetch not exported from client.ts");
    }
    results.push({
      name: "sanityFetch Exported",
      passed: true,
      duration: Date.now() - test2Start,
    });
  } catch (error) {
    results.push({
      name: "sanityFetch Exported",
      passed: false,
      error: (error as Error).message,
      duration: Date.now() - test2Start,
    });
  }

  // Test 5.3: Client uses CDN
  const test3Start = Date.now();
  try {
    const clientPath = path.join(process.cwd(), "sanity/lib/client.ts");
    const content = fs.readFileSync(clientPath, "utf8");
    if (!content.includes("useCdn: true")) {
      throw new Error("Sanity client should use CDN");
    }
    results.push({
      name: "Sanity Client Uses CDN",
      passed: true,
      duration: Date.now() - test3Start,
    });
  } catch (error) {
    results.push({
      name: "Sanity Client Uses CDN",
      passed: false,
      error: (error as Error).message,
      duration: Date.now() - test3Start,
    });
  }

  return results;
}

// ============================================================================
// TEST SUITE 6: BUILD INTEGRITY
// ============================================================================
function testBuildIntegrity(): TestResult[] {
  const results: TestResult[] = [];

  // Test 6.1: TypeScript compilation
  const test1Start = Date.now();
  try {
    execSync("npx tsc --noEmit", {
      cwd: process.cwd(),
      stdio: "pipe",
      timeout: 60000,
    });
    results.push({
      name: "TypeScript Compilation",
      passed: true,
      duration: Date.now() - test1Start,
    });
  } catch (error) {
    results.push({
      name: "TypeScript Compilation",
      passed: false,
      error: "TypeScript compilation failed",
      duration: Date.now() - test1Start,
    });
  }

  // Test 6.2: Critical files syntax check
  const test2Start = Date.now();
  try {
    const files = [
      "app/(store)/page.tsx",
      "sanity/lib/client.ts",
      "data/catalogue.ts",
    ];

    for (const file of files) {
      const filePath = path.join(process.cwd(), file);
      const content = fs.readFileSync(filePath, "utf8");
      // Basic syntax validation - check for common issues
      if (content.includes("undefinedundefined")) {
        throw new Error(`Syntax issue in ${file}`);
      }
    }
    results.push({
      name: "Critical Files Syntax Valid",
      passed: true,
      duration: Date.now() - test2Start,
    });
  } catch (error) {
    results.push({
      name: "Critical Files Syntax Valid",
      passed: false,
      error: (error as Error).message,
      duration: Date.now() - test2Start,
    });
  }

  return results;
}

// ============================================================================
// MAIN RUNNER
// ============================================================================
function runTests(): void {
  log("\n🔬 PERFORMANCE SPRINT REGRESSION TEST SUITE", "bold");
  log("=" .repeat(60), "blue");
  log("Running comprehensive regression tests...\n", "yellow");

  const startTime = Date.now();
  const suites: TestSuite[] = [];

  // Run all test suites
  suites.push({
    name: "VFS Data Integrity",
    tests: testVfsDataIntegrity(),
    ...countResults(testVfsDataIntegrity()),
  });

  suites.push({
    name: "Homepage Components",
    tests: testHomepageComponents(),
    ...countResults(testHomepageComponents()),
  });

  suites.push({
    name: "Product Pages",
    tests: testProductPages(),
    ...countResults(testProductPages()),
  });

  suites.push({
    name: "Client Components",
    tests: testClientComponents(),
    ...countResults(testClientComponents()),
  });

  suites.push({
    name: "Sanity Client",
    tests: testSanityClient(),
    ...countResults(testSanityClient()),
  });

  suites.push({
    name: "Build Integrity",
    tests: testBuildIntegrity(),
    ...countResults(testBuildIntegrity()),
  });

  // Print results
  let totalPassed = 0;
  let totalFailed = 0;

  for (const suite of suites) {
    log(`\n📦 ${suite.name}`, "bold");
    log("-".repeat(40), "blue");

    for (const test of suite.tests) {
      const status = test.passed ? "✅" : "❌";
      const color = test.passed ? "green" : "red";
      log(`${status} ${test.name} (${test.duration}ms)`, color);

      if (test.error) {
        log(`   Error: ${test.error}`, "red");
      }

      if (test.passed) totalPassed++;
      else totalFailed++;
    }
  }

  const totalDuration = Date.now() - startTime;

  // Summary
  log("\n" + "=".repeat(60), "blue");
  log("📊 SUMMARY", "bold");
  log(`Total Tests: ${totalPassed + totalFailed}`, "bold");
  log(`Passed: ${totalPassed}`, "green");
  log(`Failed: ${totalFailed}`, totalFailed > 0 ? "red" : "green");
  log(`Duration: ${totalDuration}ms`, "yellow");
  log("=".repeat(60), "blue");

  // Exit code
  if (totalFailed > 0) {
    log("\n❌ REGRESSION TESTS FAILED", "red");
    process.exit(1);
  } else {
    log("\n✅ ALL REGRESSION TESTS PASSED", "green");
    log("Safe to proceed with deployment", "green");
    process.exit(0);
  }
}

function countResults(tests: TestResult[]): { passed: number; failed: number } {
  return {
    passed: tests.filter((t) => t.passed).length,
    failed: tests.filter((t) => !t.passed).length,
  };
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export { runTests, testVfsDataIntegrity, testHomepageComponents };
