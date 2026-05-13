#!/usr/bin/env node

/**
 * Script to examine homepageData document structure and product references
 * Usage: node scripts/examine-homepage-data.mjs
 */

import { createClient } from "next-sanity";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
const envPath = join(__dirname, "..", ".env");
const envContent = readFileSync(envPath, "utf-8");
envContent.split("\n").forEach((line) => {
  const [key, ...valueParts] = line.split("=");
  if (key && valueParts.length > 0) {
    process.env[key.trim()] = valueParts.join("=").trim();
  }
});

// Load environment variables
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-14";
const token = process.env.SANITY_STUDIO_READ_WRITE;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID is required");
}

if (!token) {
  throw new Error("SANITY_STUDIO_READ_WRITE is required");
}

// Create backend client
const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});

// Load remaining products list
const remainingProductsPath = join(__dirname, "migrations", "catalogue-location-keys-migration", "legacy-products-to-be-deleted.json");
const legacyProductsData = JSON.parse(readFileSync(remainingProductsPath, "utf-8"));

const remainingProductIds = [
  "A5Y8wEwAn6Fo0zYQ5BM6cZ",
  "k27n1AQuIbSr5iozFz3irz",
  "k27n1AQuIbSr5iozFz9AMx",
  "k27n1AQuIbSr5iozFz9Bia",
  "k27n1AQuIbSr5iozG2iuRV",
  "k27n1AQuIbSr5iozG2j9JO",
  "k27n1AQuIbSr5iozG2jBlt",
  "k27n1AQuIbSr5iozG37bAg",
  "moXlkADK7m1DHgGwWtdOZo",
  "moXlkADK7m1DHgGwWtdOi5",
  "moXlkADK7m1DHgGwWwEcU6",
  "moXlkADK7m1DHgGwWwzeV4",
  "moXlkADK7m1DHgGwWwzsZX",
  "moXlkADK7m1DHgGwWxMiDQ",
  "n10eAegrGspodtsQvnmjTT",
  "n10eAegrGspodtsQvnmnzL",
  "n10eAegrGspodtsQvnmskl",
  "n10eAegrGspodtsQw12qTN",
  "n10eAegrGspodtsQw13Gvj",
  "n10eAegrGspodtsQw2ncaN",
  "n10eAegrGspodtsQw2nd9M",
  "n10eAegrGspodtsQw2nh6F",
];

async function main() {
  console.log("=== Examining homepageData Documents ===\n");

  // Query for both draft and published homepageData documents
  const homepageDataDraft = await client.fetch(`*[_type == "homepageData" && _id == "drafts.homepageData"][0]`);
  const homepageDataPublished = await client.fetch(`*[_type == "homepageData" && _id != "drafts.homepageData"][0]`);

  console.log("📄 Draft homepageData:", homepageDataDraft ? "found" : "not found");
  console.log("📄 Published homepageData:", homepageDataPublished ? "found" : "not found");

  // Extract all product references from both versions
  function extractAllProductReferences(obj, path = "") {
    const references = [];

    if (!obj || typeof obj !== "object") {
      return references;
    }

    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        references.push(...extractAllProductReferences(item, `${path}[${index}]`));
      });
      return references;
    }

    for (const key in obj) {
      const value = obj[key];
      const currentPath = path ? `${path}.${key}` : key;

      // Check if it's a reference to a product (any product, not just remaining ones)
      if (value && typeof value === "object") {
        if (value._ref) {
          references.push({
            path: currentPath,
            productId: value._ref,
            type: "reference",
          });
        } else if (value._type === "product" && value._id) {
          references.push({
            path: currentPath,
            productId: value._id,
            type: "embedded",
          });
        } else {
          references.push(...extractAllProductReferences(value, currentPath));
        }
      }
    }

    return references;
  }

  const draftReferences = homepageDataDraft ? extractAllProductReferences(homepageDataDraft) : [];
  const publishedReferences = homepageDataPublished ? extractAllProductReferences(homepageDataPublished) : [];

  console.log("\n=== Product References in homepageData ===");
  console.log(`Draft: ${draftReferences.length} references`);
  console.log(`Published: ${publishedReferences.length} references`);

  // Check which remaining products are referenced
  const draftRemainingRefs = draftReferences.filter(ref => remainingProductIds.includes(ref.productId));
  const publishedRemainingRefs = publishedReferences.filter(ref => remainingProductIds.includes(ref.productId));

  console.log("\n=== References to Remaining Products ===");
  console.log(`Draft homepageData: ${draftRemainingRefs.length} references to remaining products`);
  console.log(`Published homepageData: ${publishedRemainingRefs.length} references to remaining products`);

  if (draftRemainingRefs.length > 0) {
    console.log("\nDraft references:");
    draftRemainingRefs.forEach(ref => {
      console.log(`  - ${ref.productId} at ${ref.path}`);
    });
  }

  if (publishedRemainingRefs.length > 0) {
    console.log("\nPublished references:");
    publishedRemainingRefs.forEach(ref => {
      console.log(`  - ${ref.productId} at ${ref.path}`);
    });
  }

  // Get all product IDs from published homepageData
  const publishedProductIds = [...new Set(publishedReferences.map(ref => ref.productId))];
  console.log(`\n=== All Product IDs in Published homepageData (${publishedProductIds.length}) ===`);
  publishedProductIds.forEach(id => {
    console.log(`  - ${id}`);
  });

  // Search codebase for homepage-related files using find_by_name
  console.log("\n=== Searching Codebase for Homepage Files ===");
  
  try {
    const homepageFiles = [
      "app/(store)/lib/fetchHomepageData.ts",
      "app/components/features/homepage",
      "app/lib/data/homepageBatch.ts"
    ];

    console.log(`Checking ${homepageFiles.length} homepage-related files:`);
    const codebaseProductIds = new Set();

    for (const file of homepageFiles) {
      const fullPath = join(__dirname, "..", file);
      try {
        const fileContent = readFileSync(fullPath, 'utf-8');
        console.log(`  ✓ Read ${file}`);
        // Look for Sanity product IDs (format: 24-character alphanumeric strings)
        const idMatches = fileContent.match(/[a-zA-Z0-9]{24}/g);
        if (idMatches) {
          idMatches.forEach(id => codebaseProductIds.add(id));
        }
      } catch (error) {
        console.log(`  ✗ Could not read ${file}: ${error.message}`);
      }
    }

    console.log(`Found ${codebaseProductIds.size} potential product IDs in codebase`);
    
    // Compare with published homepageData
    const cmsIds = new Set(publishedProductIds);
    const codebaseIdsSet = codebaseProductIds;
    
    const intersection = [...cmsIds].filter(id => codebaseIdsSet.has(id));
    const cmsOnly = [...cmsIds].filter(id => !codebaseIdsSet.has(id));
    const codebaseOnly = [...codebaseIdsSet].filter(id => !cmsIds.has(id));

    console.log("\n=== Comparison: CMS vs Codebase ===");
    console.log(`Matching product IDs: ${intersection.length}`);
    console.log(`Only in CMS: ${cmsOnly.length}`);
    console.log(`Only in codebase: ${codebaseOnly.length}`);

    if (intersection.length > 0) {
      console.log("\nMatching IDs:");
      intersection.forEach(id => {
        console.log(`  - ${id}`);
      });
    }

    // Check which remaining products are in either location
    const remainingInCMS = remainingProductIds.filter(id => cmsIds.has(id));
    const remainingInCodebase = remainingProductIds.filter(id => codebaseIdsSet.has(id));

    console.log("\n=== Remaining 22 Products Analysis ===");
    console.log(`In published homepageData: ${remainingInCMS.length}`);
    console.log(`In codebase: ${remainingInCodebase.length}`);

    if (remainingInCMS.length > 0) {
      console.log("\nRemaining products in CMS:");
      remainingInCMS.forEach(id => {
        console.log(`  - ${id}`);
      });
    }

    if (remainingInCodebase.length > 0) {
      console.log("\nRemaining products in codebase:");
      remainingInCodebase.forEach(id => {
        console.log(`  - ${id}`);
      });
    }

  } catch (error) {
    console.log("Error searching codebase:", error.message);
  }

  console.log("\n=== Summary ===");
  console.log(`Total remaining products: ${remainingProductIds.length}`);
  console.log(`Referenced in draft homepageData: ${draftRemainingRefs.length}`);
  console.log(`Referenced in published homepageData: ${publishedRemainingRefs.length}`);
}

main().catch(console.error);
