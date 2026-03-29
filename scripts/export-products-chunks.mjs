import { createClient } from "@sanity/client";
import * as dotenv from "dotenv";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "..", ".env") });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_STUDIO_READ_WRITE_CREATE;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-14";

if (!projectId || !dataset || !token) {
  console.error("Missing required environment variables");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});

const CHUNK_SIZE = 100;
const OUTPUT_DIR = join(__dirname, "..", "_temporary", "catalogue-mapping", "chunks");

// Ensure output directory exists
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Base query for clean semantic format
const baseQuery = `{
  _id,
  name,
  brand,
  categoryPath,
  catalogueLocationKeys,
  "description": pt::text(description),
  "overviewFields": overviewFields[]{ title, value },
  "specifications": specifications[]{ title, value }
}`;

async function fetchAllProducts() {
  // Get total count
  const countQuery = `count(*[_type == "product"])`;
  const totalCount = await client.fetch(countQuery);
  console.log(`Total products to fetch: ${totalCount}`);

  let currentBatch = [];
  let fileIndex = 0;
  let processedCount = 0;

  // Fetch products in batches using offset-based pagination
  const batchSize = 100;
  for (let offset = 0; offset < totalCount; offset += batchSize) {
    const batchQuery = `*[_type == "product"] | order(_id asc) [${offset}...${offset + batchSize}] ${baseQuery}`;
    const batch = await client.fetch(batchQuery);

    for (const product of batch) {
      currentBatch.push(product);
      processedCount++;

      // When we hit CHUNK_SIZE, write the file
      if (currentBatch.length === CHUNK_SIZE) {
        const startIndex = fileIndex * CHUNK_SIZE;
        const endIndex = startIndex + CHUNK_SIZE - 1;
        const filename = `products-${startIndex}-${endIndex}.json`;
        const filepath = join(OUTPUT_DIR, filename);

        writeFileSync(filepath, JSON.stringify(currentBatch, null, 2));
        console.log(`Written ${filename} (${currentBatch.length} products)`);

        currentBatch = [];
        fileIndex++;
      }
    }

    console.log(`Processed ${Math.min(offset + batchSize, totalCount)}/${totalCount} products`);
  }

  // Write any remaining products
  if (currentBatch.length > 0) {
    const startIndex = fileIndex * CHUNK_SIZE;
    const endIndex = startIndex + currentBatch.length - 1;
    const filename = `products-${startIndex}-${endIndex}.json`;
    const filepath = join(OUTPUT_DIR, filename);

    writeFileSync(filepath, JSON.stringify(currentBatch, null, 2));
    console.log(`Written ${filename} (${currentBatch.length} products)`);
  }

  console.log(`\nComplete! Processed ${processedCount} products into ${fileIndex + (currentBatch.length > 0 ? 1 : 0)} chunk files.`);
}

fetchAllProducts().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
