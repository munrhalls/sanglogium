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

async function debugBrandData() {
  try {
    console.log("=== Debugging Brand Data Discrepancy ===\n");

    // Check the specific Focal product
    console.log("1. Checking specific Focal product...");
    const focalProduct = await client.fetch(`
      *[_type == "product" && slug.current == "focal-clear-mg-headphones"]{
        _id,
        name,
        brand
      }
    `);

    console.log("Focal product details:");
    console.log(JSON.stringify(focalProduct, null, 2));

    // Add type checking in JavaScript
    if (focalProduct.length > 0) {
      const product = focalProduct[0];
      console.log("\nBrand field analysis:");
      console.log(`  Type: ${typeof product.brand}`);
      console.log(`  Is null: ${product.brand === null}`);
      console.log(`  Is undefined: ${product.brand === undefined}`);
      console.log(`  Is empty string: ${product.brand === ""}`);
    }

    // Check different null/empty conditions
    console.log("\n2. Testing different null/empty conditions...");

    const conditions = [
      { name: "brand == null", query: '*[_type == "product" && brand == null]{_id, name, brand}' },
      { name: "brand == undefined", query: '*[_type == "product" && brand == undefined]{_id, name, brand}' },
      { name: "brand == \"\"", query: '*[_type == "product" && brand == ""]{_id, name, brand}' },
      { name: "!defined(brand)", query: '*[_type == "product" && !defined(brand)]{_id, name, brand}' },
      { name: "defined(brand) == false", query: '*[_type == "product" && defined(brand) == false]{_id, name, brand}' }
    ];

    for (const condition of conditions) {
      const results = await client.fetch(condition.query);
      console.log(`\n${condition.name}: ${results.length} products`);
      if (results.length > 0 && results.length <= 5) {
        results.forEach(r => console.log(`  - ${r.name}: ${JSON.stringify(r.brand)}`));
      }
    }

    // Check all products with brand field types
    console.log("\n3. Brand field analysis across all products...");
    const brandAnalysis = await client.fetch(`
      *[_type == "product"]{
        _id,
        name,
        brand
      } | order(name)
    `);

    const brandTypes = {};
    brandAnalysis.forEach(product => {
      const type = typeof product.brand;
      brandTypes[type] = (brandTypes[type] || 0) + 1;
    });

    console.log("Brand field types:");
    Object.entries(brandTypes).forEach(([type, count]) => {
      console.log(`  ${type}: ${count} products`);
    });

    // Show samples of each type
    console.log("\n4. Samples by brand type:");
    const samplesByType = {};
    brandAnalysis.forEach(product => {
      const type = product.brandType;
      if (!samplesByType[type] || samplesByType[type].length < 3) {
        if (!samplesByType[type]) samplesByType[type] = [];
        samplesByType[type].push(product);
      }
    });

    Object.entries(samplesByType).forEach(([type, samples]) => {
      console.log(`\n${type} samples:`);
      samples.forEach(s => {
        console.log(`  ${s.name}: ${JSON.stringify(s.brand)}`);
      });
    });

  } catch (error) {
    console.error("Debug failed:", error.message);
  }
}

debugBrandData();
