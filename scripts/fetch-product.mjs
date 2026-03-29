import { createClient } from "@sanity/client";
import * as dotenv from "dotenv";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root
dotenv.config({ path: join(__dirname, "..", ".env") });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_STUDIO_READ_WRITE_CREATE;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-14";

if (!projectId || !dataset || !token) {
  console.error("Missing required environment variables");
  console.error("Project ID:", projectId ? "OK" : "MISSING");
  console.error("Dataset:", dataset ? "OK" : "MISSING");
  console.error("Token:", token ? "OK" : "MISSING");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});

// GROQ query to get first product with all fields
const query = `*[_type == "product"][0]`;

async function fetchProduct() {
  try {
    const product = await client.fetch(query);
    if (!product) {
      console.error("No products found");
      process.exit(1);
    }
    
    const outputPath = join(__dirname, "..", "_temporary", "catalogue-mapping", "product-example.json");
    writeFileSync(outputPath, JSON.stringify(product, null, 2));
    console.log("Product saved to:", outputPath);
    console.log("Product name:", product.name || product.title || "Unnamed");
  } catch (error) {
    console.error("Error fetching product:", error);
    process.exit(1);
  }
}

fetchProduct();
