import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { readClient } from "../sanity-cms/utils/migrations/normalizeIemImages/getClient.mjs";

// Fetch-only script. Queries the main `image` field for every product in the
// homepage iemsGallery and saves each one, unmodified, to ./main-images.
// No processing, no writes to Sanity.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, "main-images");

const IEMS_GALLERY_QUERY = `*[_id == "homepageData"][0].iemsGallery[]->{
  _id,
  name,
  "slug": slug.current,
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
  console.log("📥 Fetching main iemsGallery images (read-only, no writes)\n");

  const products = await readClient.fetch(IEMS_GALLERY_QUERY);
  console.log(`📦 Found ${products.length} products.\n`);

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  for (const product of products) {
    const assetId = product.image?.asset?._id;
    const url = product.image?.asset?.url;

    if (!assetId || !url) {
      console.log(`⚪ Skipping "${product.name}" — no main image asset on document.`);
      continue;
    }

    const ext = path.extname(new URL(url).pathname) || ".png";
    const filename = `${slugifyFilename(product.name)}-${assetId}${ext}`;
    const outPath = path.join(OUTPUT_DIR, filename);

    const res = await fetch(url);
    if (!res.ok) {
      console.log(`❌ Failed to fetch "${product.name}": ${res.status} ${res.statusText}`);
      continue;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(outPath, buffer);
    console.log(`✅ Saved "${product.name}" -> ${filename}`);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
