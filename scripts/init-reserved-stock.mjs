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

// Initialize reservedStock for test products
const testProductIds = [
  "3O1ZNp54LWQGln4uEAU7Vs",
  "3O1ZNp54LWQGln4uEAUFVf"
];

console.log("Initializing reservedStock for test products...");

for (const productId of testProductIds) {
  try {
    await client.patch(productId)
      .setIfMissing({ reservedStock: 0 })
      .commit();
    console.log(`✓ Initialized reservedStock for ${productId}`);
  } catch (error) {
    console.error(`✗ Failed to initialize ${productId}:`, error.message);
  }
}

console.log("Done!");
