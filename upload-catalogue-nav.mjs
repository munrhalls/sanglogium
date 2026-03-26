import { createClient } from "next-sanity";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config({ path: ".env" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: "2023-05-03",
  token: process.env.SANITY_STUDIO_READ_WRITE_CREATE,
});

function processCatalogueItems(items) {
  if (!items || !Array.isArray(items)) return [];

  return items.map((item) => {
    const processedItem = {
      ...item,
      _type: "catalogueItem",
      _key: crypto.randomUUID(),
    };

    if (processedItem.children && Array.isArray(processedItem.children)) {
      processedItem.children = processCatalogueItems(processedItem.children);
    }

    return processedItem;
  });
}

async function uploadCatalogueNavData() {
  try {
    const dataPath = path.join(process.cwd(), "app/components/layout/catalogue/catalogue-nav-data.json");
    const catalogueData = await fs.readFile(dataPath, "utf8");
    const parsedData = JSON.parse(catalogueData);

    const processedCatalogue = processCatalogueItems(parsedData.catalogue);

    const document = {
      _type: "catalogue",
      catalogue: processedCatalogue,
    };

    const result = await client.create(document);

    console.log("Success. Document ID:", result._id);
    process.exit(0);
  } catch (error) {
    console.error("Upload failed:", error);
    process.exit(1);
  }
}

uploadCatalogueNavData();