import { createClient } from "@sanity/client";
import * as dotenv from "dotenv";
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

async function emptyCatalogueLocationKeys() {
  // First, count products with non-empty catalogueLocationKeys
  const countQuery = `count(*[_type == "product" && defined(catalogueLocationKeys) && length(catalogueLocationKeys) > 0])`;
  const count = await client.fetch(countQuery);
  console.log(`Found ${count} products with non-empty catalogueLocationKeys`);

  if (count === 0) {
    console.log("Nothing to do - all products already have empty arrays");
    return;
  }

  // Fetch IDs of products to update
  const idsQuery = `*[_type == "product" && defined(catalogueLocationKeys) && length(catalogueLocationKeys) > 0]._id`;
  const productIds = await client.fetch(idsQuery);
  console.log(`Will update ${productIds.length} products`);

  // Create mutations - ONLY touching catalogueLocationKeys
  const mutations = productIds.map((id) => ({
    patch: {
      id: id,
      set: {
        catalogueLocationKeys: []
      }
    }
  }));

  // Execute mutations
  const result = await client.mutate(mutations);
  console.log(`Successfully emptied catalogueLocationKeys for ${result.results.length} products`);

  // Verify
  const verifyCount = await client.fetch(countQuery);
  console.log(`Verification: ${verifyCount} products still have non-empty arrays`);
}

emptyCatalogueLocationKeys().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
