import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { readClient } from "../sanity-cms/utils/migrations/normalizeIemImages/getClient.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAIN_DIR = path.join(__dirname, "main-images");
const PUBLIC_DIR = path.join(__dirname, "..", "public", "normalize-accessories-images");

function slugifyFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function safeProductName(name) {
  return name
    .replace(/[<>:"\\/|?*]/g, "-")
    .replace(/[\s.]+$/g, "")
    .trim();
}

function getOriginalFilename(name, asset) {
  const assetId = asset?._id;
  const url = asset?.url;
  if (!assetId || !url) return null;
  const ext = path.extname(new URL(url).pathname) || ".png";
  return `${slugifyFilename(name)}-${assetId}${ext}`;
}

async function main() {
  // Get earpads category ids
  const earpadCategories = await readClient.fetch(
    `*[_type == "catalogueItem" && slug.current == "earpads"]{_id}`
  );
  const earpadIds = earpadCategories.map((c) => c._id);

  // All products under Pads (earpads)
  const padsProducts = await readClient.fetch(
    `*[_type == "product" && count(catalogueLocationKeys[(@ in $ids)]) > 0]{
      _id,
      name,
      "imageUrl": image.asset->url,
      image { asset->{ _id, url } }
    }`,
    { ids: earpadIds }
  );

  // Specific visible products in Eartips and Storage rows
  const extraProducts = await readClient.fetch(
    `*[_type == "product" && (
      string::startsWith(name, "Galaxy Buds Pro 3 & 4 Memory Foam Ear Tips") ||
      string::startsWith(name, "ETZ-TWS") ||
      string::startsWith(name, "ETZ-GEMINI") ||
      string::startsWith(name, "ETZ-MERCURY") ||
      string::startsWith(name, "Meze Manta Headphone Stand")
    )]{
      _id,
      name,
      "imageUrl": image.asset->url,
      image { asset->{ _id, url } }
    }`
  );

  // Combine and dedupe
  const seen = new Set();
  const all = [];
  for (const p of [...(padsProducts || []), ...(extraProducts || [])]) {
    if (!seen.has(p._id)) {
      seen.add(p._id);
      all.push(p);
    }
  }

  const map = [];
  let renamed = 0;
  let skipped = 0;

  for (const product of all) {
    const originalFilename = getOriginalFilename(product.name, product.image?.asset);
    if (!originalFilename) {
      console.log(`Skipping "${product.name}" — no image asset.`);
      skipped++;
      continue;
    }

    const ext = path.extname(new URL(product.image.asset.url).pathname) || ".png";
    const safeName = safeProductName(product.name) || "unnamed";
    const flaggedFilename = `flagged-${safeName}${ext}`;

    const mainOriginal = path.join(MAIN_DIR, originalFilename);
    const mainFlagged = path.join(MAIN_DIR, flaggedFilename);

    const mainExists = await fs.stat(mainOriginal).then(() => true).catch(() => false);

    if (!mainExists) {
      console.log(`File not found for "${product.name}" — ${originalFilename}`);
      skipped++;
      continue;
    }

    await fs.rename(mainOriginal, mainFlagged);

    map.push({
      productName: product.name,
      originalFilename,
      flaggedFilename,
    });

    console.log(`Flagged "${product.name}" -> ${flaggedFilename}`);
    renamed++;
  }

  const mapPath = path.join(__dirname, "flagged-map.json");
  await fs.writeFile(mapPath, JSON.stringify(map, null, 2));

  console.log(`\nDone. Flagged ${renamed} products. Skipped ${skipped}.`);
  console.log(`Map written to ${mapPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
