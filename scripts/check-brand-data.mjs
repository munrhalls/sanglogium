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

async function checkBrandData() {
  try {
    // Check the specific Focal product
    const focalProduct = await client.fetch('*[_type == "product" && slug.current == "focal-clear-mg-headphones"]{_id, name, brand}');
    console.log("Focal product brand data:", JSON.stringify(focalProduct, null, 2));
    
    // Count products with null brands
    const nullBrandCount = await client.fetch('count(*[_type == "product" && brand == null])');
    console.log(`\nProducts with null brand: ${nullBrandCount}`);
    
    // Count products with any brand value
    const withBrandCount = await client.fetch('count(*[_type == "product" && defined(brand)])');
    console.log(`Products with any brand value: ${withBrandCount}`);
    
    // Get sample of products with brand values
    const sampleProducts = await client.fetch('*[_type == "product"][0..5]{_id, name, brand}');
    console.log("\nSample products brand data:");
    sampleProducts.forEach(p => {
      console.log(`  ${p.name}: ${JSON.stringify(p.brand)}`);
    });
    
  } catch (error) {
    console.error("Error:", error.message);
  }
}

checkBrandData();
