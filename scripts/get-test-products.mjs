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

// Get first 2 products with stock
const products = await client.fetch(
  `*[_type == "product" && stock > 0][0..2] { _id, name, stock, reservedStock }`
);

console.log("Available test products:");
console.log(JSON.stringify(products, null, 2));

// Export as test data
const testProductIds = products.map(p => p._id);
console.log("\nTEST_PRODUCT_IDS =", JSON.stringify(testProductIds));
