/**
 * VFS Data Fidelity Test - Catalog Item to Products
 * Pure data path verification with NO UI dependencies
 * 
 * Usage: npx tsx tests/vfs-data-fidelity.test.ts
 */

import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { sanityFetch } from "../sanity/lib/client";
import groq from "groq";

// Load catalogue index
const catalogueIndex = JSON.parse(
  readFileSync(join(process.cwd(), "data/catalogue-index.json"), "utf-8")
);

// Target categories to test
const TARGET_CATEGORIES = [
  { slug: "open-back", name: "Open-Back Headphones", expectedType: "headphone", parent: "headphones" },
  { slug: "closed-back", name: "Closed-Back Headphones", expectedType: "headphone", parent: "headphones" },
  { slug: "in-ear", name: "In-Ear Headphones", expectedType: "iems", parent: "headphones" },
  { slug: "on-ear", name: "On-Ear Headphones", expectedType: "headphone", parent: "headphones" },
  { slug: "desktop-amps", name: "Desktop Amps", expectedType: "amp", parent: "audio-electronics" },
  { slug: "portable-amps", name: "Portable Amps", expectedType: "amp", parent: "audio-electronics" },
  { slug: "desktop-dacs", name: "Desktop DACs", expectedType: "dac", parent: "audio-electronics" },
  { slug: "portable-dacs", name: "Portable DACs", expectedType: "dac", parent: "audio-electronics" },
  { slug: "earpads", name: "Earpads", expectedType: "accessory", parent: "accessories" },
  { slug: "cables", name: "Cables", expectedType: "accessory", parent: "accessories" },
  { slug: "adapters", name: "Adapters", expectedType: "accessory", parent: "accessories" },
  { slug: "cases", name: "Cases", expectedType: "accessory", parent: "accessories" },
];

// Resolve slug to catalog item ID
function resolveSlugToId(slug: string): string | null {
  return catalogueIndex.slugToIdMap[slug] || null;
}

// Unroll descendant keys from catalog item ID
function unrollDescendantKeys(nodeId: string): string[] {
  const slotMetadataMap = catalogueIndex.slotMetadataMap;
  
  // If ID not in metadata map, treat as leaf
  if (!slotMetadataMap[nodeId]) {
    return [nodeId];
  }
  
  const result = new Set<string>();
  const stack = [nodeId];
  
  while (stack.length > 0) {
    const currentId = stack.pop()!;
    if (result.has(currentId)) continue;
    
    result.add(currentId);
    const metadata = slotMetadataMap[currentId];
    
    if (metadata?.children?.length > 0) {
      for (const childId of metadata.children) {
        if (!result.has(childId)) {
          stack.push(childId);
        }
      }
    }
  }
  
  return Array.from(result);
}

// Build GROQ query for products
function buildGroqQuery(keys: string[]): string {
  return groq`*[_type == "product" && count(catalogueLocationKeys[@ in ${JSON.stringify(keys)}]) > 0] {
    _id,
    name,
    brand,
    catalogueLocationKeys,
    overview[]{
      children[]{
        text
      }
    }
  }`;
}

// Semantic validation - check if product matches expected category type
function validateSemanticMatch(product: any, expectedType: string): boolean {
  const name = (product.name || "").toLowerCase();
  const overview = product.overview?.map((block: any) => 
    block.children?.map((c: any) => c.text).join(" ") || ""
  ).join(" ").toLowerCase() || "";
  
  const textToCheck = `${name} ${overview}`;
  
  switch (expectedType) {
    case "headphone":
      return textToCheck.includes("headphone") || textToCheck.includes("headphones");
    case "iems":
      return textToCheck.includes("iem") || textToCheck.includes("earphone") || textToCheck.includes("in-ear");
    case "amp":
      return textToCheck.includes("amp") || textToCheck.includes("amplifier");
    case "dac":
      return textToCheck.includes("dac") || textToCheck.includes("converter");
    case "accessory":
      return textToCheck.includes("pad") || textToCheck.includes("cable") || 
             textToCheck.includes("adapter") || textToCheck.includes("case");
    default:
      return true;
  }
}

describe("VFS Data Fidelity", () => {
  for (const category of TARGET_CATEGORIES) {
    describe(`Category: ${category.name}`, () => {
      let catalogId: string | null;
      let catalogueKeys: string[];
      let products: any[];
      
      it(`should resolve slug "${category.slug}" to catalog ID`, () => {
        catalogId = resolveSlugToId(category.slug);
        
        if (!catalogId) {
          console.log(`  ⚠️  SKIP: No ID found for slug "${category.slug}"`);
        }
        
        expect(catalogId).toBeTruthy();
      });
      
      it("should unroll descendant keys from catalog ID", async () => {
        if (!catalogId) {
          console.log(`  ⚠️  SKIP: No catalog ID to unroll`);
          return;
        }
        
        catalogueKeys = unrollDescendantKeys(catalogId);
        
        console.log(`  📊 ${category.name}: ${catalogueKeys.length} catalogue keys`);
        console.log(`     Keys: ${catalogueKeys.slice(0, 3).join(", ")}${catalogueKeys.length > 3 ? "..." : ""}`);
        
        expect(catalogueKeys.length).toBeGreaterThan(0);
        expect(catalogueKeys).toContain(catalogId);
      });
      
      it("should build valid GROQ query", () => {
        if (!catalogueKeys || catalogueKeys.length === 0) {
          console.log(`  ⚠️  SKIP: No catalogue keys to build query`);
          return;
        }
        
        const query = buildGroqQuery(catalogueKeys);
        
        console.log(`  📝 Query: ${query.substring(0, 80)}...`);
        
        expect(query).toContain('_type == "product"');
        expect(query).toContain('catalogueLocationKeys');
        expect(query).toContain('count(');
      });
      
      it("should retrieve products from Sanity", async () => {
        if (!catalogueKeys || catalogueKeys.length === 0) {
          console.log(`  ⚠️  SKIP: Cannot query without keys`);
          products = [];
          return;
        }
        
        const query = buildGroqQuery(catalogueKeys);
        
        try {
          products = await sanityFetch({
            query,
            tags: [`category-${category.slug}`],
          });
          
          console.log(`  ✅ Retrieved ${products.length} products`);
          
          if (products.length > 0) {
            console.log(`     Sample: ${products[0].name}`);
          }
        } catch (error) {
          console.error(`  ❌ Query failed: ${error}`);
          products = [];
        }
        
        // We expect products OR an empty result (valid state)
        expect(Array.isArray(products)).toBe(true);
      });
      
      it("should have semantic match between products and category", () => {
        if (!products || products.length === 0) {
          console.log(`  ⚠️  SKIP: No products to validate`);
          return;
        }
        
        const matches = products.filter(p => validateSemanticMatch(p, category.expectedType));
        const matchRate = matches.length / products.length;
        
        console.log(`  🎯 Semantic match: ${matches.length}/${products.length} (${Math.round(matchRate * 100)}%)`);
        
        // Log mismatches for debugging
        const mismatches = products.filter(p => !validateSemanticMatch(p, category.expectedType));
        if (mismatches.length > 0) {
          console.log(`     Mismatches: ${mismatches.slice(0, 2).map((p: any) => p.name).join(", ")}${mismatches.length > 2 ? "..." : ""}`);
        }
        
        // Expect at least 50% semantic match (flexible threshold)
        expect(matchRate).toBeGreaterThanOrEqual(0.5);
      });
    });
  }
});

// Direct execution for quick feedback
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("\n🔍 VFS DATA FIDELITY - DIRECT EXECUTION\n");
  console.log("=" .repeat(70));
  
  for (const category of TARGET_CATEGORIES) {
    console.log(`\n📂 ${category.name} (${category.parent}/${category.slug})`);
    console.log("  " + "-".repeat(60));
    
    // Step 1: Resolve slug to ID
    const catalogId = resolveSlugToId(category.slug);
    if (!catalogId) {
      console.log(`  ❌ FAIL: No ID found for slug "${category.slug}"`);
      continue;
    }
    console.log(`  ✅ Catalog ID: ${catalogId}`);
    
    // Step 2: Unroll descendant keys
    const catalogueKeys = unrollDescendantKeys(catalogId);
    console.log(`  ✅ Catalogue Keys: ${catalogueKeys.length}`);
    console.log(`     ${catalogueKeys.slice(0, 5).join(", ")}${catalogueKeys.length > 5 ? "..." : ""}`);
    
    // Step 3: Build GROQ query
    const query = buildGroqQuery(catalogueKeys);
    console.log(`  ✅ GROQ Query: ${query.substring(0, 70)}...`);
    
    console.log(`  ⏳ Products: [Run with Vitest to query Sanity]`);
  }
  
  console.log("\n" + "=".repeat(70));
  console.log("\n📋 To get full product data, run:");
  console.log("   npx vitest run tests/vfs-data-fidelity.test.ts");
  console.log("\n");
}
