import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { fetchHomepageData } from "../app/(store)/lib/fetchHomepageData";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAIN_DIR = path.join(__dirname, "main-images");
const PUBLIC_DIR = path.join(__dirname, "..", "public", "normalize-accessories-images");

interface Asset {
  _id: string;
  url: string;
}

interface Product {
  _id: string;
  name: string;
  image?: { asset?: Asset | null };
}

function slugifyFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function safeProductName(name: string): string {
  return name
    .replace(/[<>:"\\/|?*]/g, "-")
    .replace(/[\s.]+$/g, "")
    .trim();
}

function getOriginalFilename(name: string, asset: Asset): string {
  const ext = path.extname(new URL(asset.url).pathname) || ".png";
  return `${slugifyFilename(name)}-${asset._id}${ext}`;
}

const VISIBLE_EARTIPS_PREFIXES = [
  "Galaxy Buds Pro 3 & 4 Memory Foam Ear Tips",
  "Dekoni Audio ETZ-TWS",
  "Dekoni Audio ETZ-GEMINI",
  "Dekoni Audio ETZ-MERCURY",
];

const VISIBLE_STORAGE_NAME = "Meze Manta Headphone Stand";
const BLACK_PLACEHOLDER = "black.webp";

async function deleteOldFlaggedImages(dir: string) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.startsWith("flagged-")) {
      await fs.unlink(path.join(dir, entry.name));
      console.log(`Deleted stale ${entry.name} from ${path.basename(dir)}`);
    }
  }
}

async function ensureBlackPlaceholder() {
  const blackSource = path.join(MAIN_DIR, BLACK_PLACEHOLDER);
  const blackDest = path.join(PUBLIC_DIR, BLACK_PLACEHOLDER);
  const exists = await fs.stat(blackDest).then(() => true).catch(() => false);
  if (!exists) {
    await fs.copyFile(blackSource, blackDest);
    console.log(`Copied ${BLACK_PLACEHOLDER} to public`);
  }
}

async function main() {
  await deleteOldFlaggedImages(MAIN_DIR);
  await deleteOldFlaggedImages(PUBLIC_DIR);
  await ensureBlackPlaceholder();

  const data = await fetchHomepageData();
  const targets = new Map<string, Product>();

  // All products under Pads (earpads) row
  for (const p of data.accessories.earpads) {
    targets.set(p._id, p as Product);
  }

  // Visible Eartips from screenshots
  for (const p of data.accessories.eartips) {
    if (VISIBLE_EARTIPS_PREFIXES.some((prefix) => p.name.startsWith(prefix))) {
      targets.set(p._id, p as Product);
    }
  }

  // Visible Storage product from screenshot
  for (const p of data.accessories.storage) {
    if (p.name === VISIBLE_STORAGE_NAME) {
      targets.set(p._id, p as Product);
    }
  }

  const map: { _id: string; productName: string; originalFilename: string; flaggedFilename: string }[] = [];
  let skipped = 0;

  for (const product of targets.values()) {
    const asset = product.image?.asset;
    if (!asset?._id || !asset?.url) {
      skipped++;
      continue;
    }

    const originalFilename = getOriginalFilename(product.name, asset);
    const flaggedFilename = BLACK_PLACEHOLDER;

    map.push({ _id: product._id, productName: product.name, originalFilename, flaggedFilename });
    console.log(`Flagged "${product.name}" -> ${flaggedFilename}`);
  }

  const mapPath = path.join(__dirname, "flagged-map.json");
  await fs.writeFile(mapPath, JSON.stringify(map, null, 2));

  console.log(`\nDone. Flagged ${map.length} products. Skipped ${skipped}.`);
  console.log(`Map written to ${mapPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
