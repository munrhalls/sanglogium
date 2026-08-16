import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { readClient } from "../sanity-cms/utils/migrations/normalizeIemImages/getClient.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKING_DIR = path.join(__dirname, "main-images");
const PUBLIC_DIR = path.join(__dirname, "..", "public", "normalize-accessories-images");

const ACCESSORY_SLUGS = [
  "headphone-cables",
  "interconnects",
  "adapters",
  "earpads",
  "eartips",
  "care-cleaning",
  "headphone-stands",
  "carrying-cases",
];

const CATEGORY_QUERY = `*[_type == "catalogueItem" && slug.current in $slugs] {
  _id,
  "slug": slug.current
}`;

const PRODUCT_QUERY = `*[_type == "product" && count(catalogueLocationKeys[(@ in $categoryIds)]) > 0] {
  _id,
  name,
  brand->{ _id, name, slug },
  price_data,
  stock,
  "slug": slug.current,
  "imageUrl": image.asset->url,
  image { asset->{ _id, url } }
}`;

function slugifyFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function main() {
  console.log("Fetching accessory category IDs...");
  const categories = await readClient.fetch(CATEGORY_QUERY, { slugs: ACCESSORY_SLUGS });

  if (!categories || categories.length === 0) {
    console.error("No product categories found for the given slugs.");
    process.exit(1);
  }

  const categoryIds = categories.map((c) => c._id);
  console.log(`Found ${categoryIds.length} categories: ${categories.map((c) => c.slug).join(", ")}`);

  console.log("Fetching accessory products...");
  const products = await readClient.fetch(PRODUCT_QUERY, { categoryIds });

  if (!products || products.length === 0) {
    console.error("No products found for the accessory categories.");
    process.exit(1);
  }

  // Deduplicate by product _id just in case
  const seen = new Set();
  const uniqueProducts = [];
  for (const p of products) {
    if (!seen.has(p._id)) {
      seen.add(p._id);
      uniqueProducts.push(p);
    }
  }

  console.log(`Found ${uniqueProducts.length} unique accessory products.`);

  await fs.mkdir(WORKING_DIR, { recursive: true });
  await fs.mkdir(PUBLIC_DIR, { recursive: true });

  let saved = 0;
  let skipped = 0;
  let failed = 0;

  for (const product of uniqueProducts) {
    const assetId = product.image?.asset?._id;
    const url = product.image?.asset?.url;

    if (!assetId || !url) {
      console.log(`Skipping "${product.name}" — no main image asset.`);
      skipped++;
      continue;
    }

    const ext = path.extname(new URL(url).pathname) || ".png";
    const filename = `${slugifyFilename(product.name)}-${assetId}${ext}`;
    const workingPath = path.join(WORKING_DIR, filename);
    const publicPath = path.join(PUBLIC_DIR, filename);

    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.log(`Failed to fetch "${product.name}": ${res.status} ${res.statusText}`);
        failed++;
        continue;
      }

      const buffer = Buffer.from(await res.arrayBuffer());
      await fs.writeFile(workingPath, buffer);
      await fs.writeFile(publicPath, buffer);
      console.log(`Saved "${product.name}" -> ${filename}`);
      saved++;
    } catch (err) {
      console.error(`Error saving "${product.name}":`, err.message);
      failed++;
    }
  }

  console.log(`\nDone. Saved: ${saved}, Skipped: ${skipped}, Failed: ${failed}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
