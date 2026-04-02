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

async function debugGroqBrand() {
  console.log("=== Debugging GROQ Brand Extraction ===\n");

  try {
    // Test 1: Check the specific product that's showing brand: null
    console.log("1. Testing Bowers & Wilkins Pi7 S2 product...");

    const productBySlug = await client.fetch(`
      *[_type == "product" && slug.current == "bowers-&-wilkins-pi7-s2-wireless-in-ear-headphones"]{
        _id,
        name,
        brand
      }
    `);

    console.log("By slug query result:");
    console.log(JSON.stringify(productBySlug, null, 2));

    // Add type checking in JavaScript
    if (productBySlug.length > 0) {
      const product = productBySlug[0];
      console.log("\nBrand field analysis:");
      console.log(`  Type: ${typeof product.brand}`);
      console.log(`  Is null: ${product.brand === null}`);
      console.log(`  Is undefined: ${product.brand === undefined}`);
      console.log(`  Is empty string: ${product.brand === ""}`);
    }

    // Test 2: Try by product ID we saw in console
    console.log("\n2. Testing by product ID 'k27n1AQuIbSr5iozFz7EsP'...");

    const productById = await client.fetch(`
      *[_type == "product" && _id == "k27n1AQuIbSr5iozFz7EsP"]{
        _id,
        name,
        brand
      }
    `);

    console.log("By ID query result:");
    console.log(JSON.stringify(productById, null, 2));

    if (productById.length > 0) {
      const product = productById[0];
      console.log("\nBrand field analysis:");
      console.log(`  Type: ${typeof product.brand}`);
      console.log(`  Is null: ${product.brand === null}`);
      console.log(`  Is undefined: ${product.brand === undefined}`);
      console.log(`  Is empty string: ${product.brand === ""}`);
    }

    // Test 3: Check what the getProductBySlug function actually returns
    console.log("\n3. Testing the actual getProductBySlug function logic...");

    const functionTest = await client.fetch(`
      *[_type == "product" && slug.current == $slug] {
        _id,
        name,
        brand {
          _id,
          name
        },
        displayPrice,
        stock,
        sku,
        image,
        gallery,
        slug {
          current
        },
        description,
        overviewFields[] {
          title,
          value,
          information
        },
        specifications[] {
          title,
          value,
          information
        },
        catalogueLocationKeys
      }
    `, { slug: "bowers-&-wilkins-pi7-s2-wireless-in-ear-headphones" });

    console.log("Function-style query result:");
    console.log(JSON.stringify(functionTest, null, 2));

    // Test 4: Compare with simple brand extraction
    console.log("\n4. Testing simple brand extraction...");

    const simpleQuery = await client.fetch(`
      *[_type == "product" && slug.current == "bowers-&-wilkins-pi7-s2-wireless-in-ear-headphones"]{
        _id,
        name,
        brand
      }
    `);

    console.log("Simple query result:");
    console.log(JSON.stringify(simpleQuery, null, 2));

    // Test 5: Check if there are multiple products with same slug
    console.log("\n5. Checking for duplicate slugs...");

    const duplicates = await client.fetch(`
      *[_type == "product" && slug.current == "bowers-&-wilkins-pi7-s2-wireless-in-ear-headphones"]{
        _id,
        name,
        brand
      }
    `);

    console.log(`Found ${duplicates.length} products with this slug:`);
    duplicates.forEach((d, i) => {
      console.log(`  ${i + 1}. ${d._id}: ${d.name} -> brand: ${JSON.stringify(d.brand)}`);
    });

    // Test 6: Check all Bowers & Wilkins products
    console.log("\n6. Checking all Bowers & Wilkins products...");

    const allBowers = await client.fetch(`
      *[_type == "product" && name match "Bowers & Wilkins*"]{
        _id,
        name,
        brand,
        slug {
          current
        }
      }
    `);

    console.log(`Found ${allBowers.length} Bowers & Wilkins products:`);
    allBowers.forEach(p => {
      console.log(`  - ${p.name} (${p.slug.current}): brand = ${JSON.stringify(p.brand)}`);
    });

  } catch (error) {
    console.error("Debug failed:", error.message);
  }
}

debugGroqBrand();
