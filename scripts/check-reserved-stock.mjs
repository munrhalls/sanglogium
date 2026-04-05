import { createClient } from "@sanity/client";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2023-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

// Check reservedStock for test products
const testProductIds = [
  "3O1ZNp54LWQGln4uEAU7Vs",
  "3O1ZNp54LWQGln4uEAUFVf"
];

console.log("Checking reservedStock for test products...");

for (const productId of testProductIds) {
  try {
    const product = await client.fetch(
      `*[_type == "product" && _id == $productId][0] { _id, name, stock, reservedStock }`,
      { productId }
    );
    
    if (product) {
      console.log(`\n${product.name} (${productId}):`);
      console.log(`  Stock: ${product.stock}`);
      console.log(`  Reserved Stock: ${product.reservedStock || 'null/undefined'}`);
    } else {
      console.log(`Product not found: ${productId}`);
    }
  } catch (error) {
    console.error(`Error fetching ${productId}:`, error.message);
  }
}
