import { createClient } from "@sanity/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_READ_TOKEN,
  apiVersion: "2023-05-03",
  useCdn: false,
});

async function testProductQuery() {
  try {
    // Test the actual query used by the product page
    const keys = ["o7c6baiuobsr7ni2y2vf22sh"]; // open-back category key
    
    console.log("Testing product query with keys:", keys);
    
    const products = await client.fetch(`
      *[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0] {
        _id,
        name,
        brand->{_id, name},
        displayPrice,
        slug {current}
      }[0...10]
    `, { keys });
    
    console.log(`Found ${products.length} products`);
    
    if (products.length > 0) {
      console.log("\nFirst product:", JSON.stringify(products[0], null, 2));
    } else {
      // Test without VFS filter
      const allProducts = await client.fetch(`
        *[_type == "product"][0...5] {
          _id, name, catalogueLocationKeys, brand
        }
      `);
      console.log("\nSample products without filter:", JSON.stringify(allProducts, null, 2));
    }
    
    // Test brand filter with reference
    const brandProducts = await client.fetch(`
      *[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 && brand->name == "focal"] {
        _id, name, brand->{name}
      }[0...5]
    `, { keys });
    
    console.log(`\nFocal products: ${brandProducts.length}`);
    
  } catch (error) {
    console.error("Query failed:", error.message);
  }
}

testProductQuery();
