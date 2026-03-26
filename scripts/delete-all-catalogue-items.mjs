import { createClient } from "next-sanity";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: "2024-11-14",
  token: process.env.SANITY_STUDIO_READ_WRITE_CREATE,
});

async function main() {
  console.log("Fetching all catalogueItems...");
  const docs = await client.fetch(`*[_type == "catalogueItem"]{_id}`);
  
  if (docs.length === 0) {
    console.log("No documents found.");
    return;
  }

  console.log(`Found ${docs.length} documents. Deleting...`);
  const transaction = client.transaction();
  docs.forEach((doc) => {
    transaction.delete(doc._id);
  });
  
  await transaction.commit();
  console.log("Deletion complete.");
}

main().catch(console.error);
