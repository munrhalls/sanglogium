/**
 * Quick Fix: Find products with null brands and suggest brand names
 *
 * This script analyzes products with null brands and extracts potential brand names
 * from product names to help manual assignment or automated fixing.
 */

import { createClient } from "@sanity/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: "2023-05-03",
  useCdn: false,
});

async function fixNullBrands() {
  console.log("Analyzing products with null brands...\n");

  try {
    // Get all existing brands
    const existingBrands = await client.fetch('*[_type == "brand"]{ _id, name }');
    console.log(`Found ${existingBrands.length} existing brands:`);
    existingBrands.forEach(b => console.log(`  - ${b.name} (${b._id})`));

    // Get products with null brands
    const nullBrandProducts = await client.fetch(`
      *[_type == "product" && brand == null]{
        _id,
        name,
        sku
      }
    `);

    console.log(`\nFound ${nullBrandProducts.length} products with null brands:`);

    // Extract potential brand names from product names
    const potentialBrands = {};
    nullBrandProducts.forEach(product => {
      const firstWord = product.name.split(" ")[0].toLowerCase();
      potentialBrands[firstWord] = (potentialBrands[firstWord] || 0) + 1;
    });

    console.log("\nPotential brand names (from product first words):");
    Object.entries(potentialBrands)
      .sort(([,a], [,b]) => b - a)
      .forEach(([brand, count]) => {
        console.log(`  ${brand}: ${count} products`);
      });

    // Show sample products for each potential brand
    console.log("\nSample products by potential brand:");
    for (const [brand, count] of Object.entries(potentialBrands).sort(([,a], [,b]) => b - a)) {
      const samples = nullBrandProducts
        .filter(p => p.name.split(" ")[0].toLowerCase() === brand)
        .slice(0, 3);

      console.log(`\n${brand.toUpperCase()} (${count} products):`);
      samples.forEach(p => console.log(`  - ${p.name} (${p._id})`));
    }

    // Generate fix suggestions
    console.log("\n=== FIX SUGGESTIONS ===");
    console.log("1. Manual approach: Use Sanity Studio to assign brands");
    console.log("2. Automated approach: Run this script with --auto flag");
    console.log("3. Create missing brand documents first, then update products");

  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Auto-fix mode
async function autoFixBrands() {
  console.log("AUTO-FIX MODE: Creating brand documents and updating products...\n");

  try {
    // Get existing brands
    const existingBrands = await client.fetch('*[_type == "brand"]{ _id, name }');
    const brandMap = new Map(existingBrands.map(b => [b.name.toLowerCase(), b._id]));

    // Get products with null brands
    const nullBrandProducts = await client.fetch(`
      *[_type == "product" && brand == null]{
        _id,
        name,
        sku
      }
    `);

    console.log(`Processing ${nullBrandProducts.length} products...`);

    let createdBrands = 0;
    let updatedProducts = 0;

    for (const product of nullBrandProducts) {
      const brandName = product.name.split(" ")[0];
      const brandKey = brandName.toLowerCase();

      // Create brand if it doesn't exist
      if (!brandMap.has(brandKey)) {
        const brandDoc = {
          _type: "brand",
          name: brandName,
          slug: {
            current: brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
          },
        };

        const result = await client.create(brandDoc);
        brandMap.set(brandKey, result._id);
        console.log(`[CREATED] Brand: ${brandName} -> ${result._id}`);
        createdBrands++;
      }

      // Update product with brand reference
      const brandRef = brandMap.get(brandKey);
      await client
        .patch(product._id)
        .set({
          brand: {
            _type: "reference",
            _ref: brandRef,
          },
        })
        .commit();

      console.log(`[UPDATED] Product: ${product.name} -> ${brandName}`);
      updatedProducts++;
    }

    console.log(`\nAuto-fix complete:`);
    console.log(`  Created brands: ${createdBrands}`);
    console.log(`  Updated products: ${updatedProducts}`);

  } catch (error) {
    console.error("Auto-fix failed:", error.message);
  }
}

// Run based on command line args
if (process.argv.includes("--auto")) {
  autoFixBrands();
} else {
  fixNullBrands();
  console.log("\nTo auto-fix, run: node scripts/fix-null-brands.mjs --auto");
}
