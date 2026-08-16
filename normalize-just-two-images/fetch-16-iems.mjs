import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { readClient } from "../sanity-cms/utils/migrations/normalizeIemImages/getClient.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, "main-images");

const REQUESTED_NAMES = [
  "Sennheiser IE 600 In-Ear Headphones",
  "Sennheiser IE 200 In-Ear Headphones",
  "Sennheiser IE 900 In-Ear Headphones",
  "64 Audio U12t In-Ear Headphones",
  "64 Audio U4s In-Ear Headphones",
  "Moondrop Dark Saber In-Ear Headphones",
  "Moondrop Rays Gaming IEMs",
  "Moondrop Variations Tribrid IEMs",
  "Thieaudio Monarch MKIII In-Ear Headphones",
  "Thieaudio Hype 4 In-Ear Headphones",
  "TRUTHEAR HEXA In-Ear Headphones",
  "TRUTHEAR NOVA In-Ear Headphones",
  "Softears Volume S In-Ear Headphones",
  "CrinEar Daybreak In-Ear Headphones",
  "CrinEar Reference In-Ear Headphones",
  "Moondrop Blessing 3 In-Ear Monitors",
];

const GENERIC_WORDS = [
  "in-ear",
  "inear",
  "headphones",
  "headphone",
  "earphones",
  "earphone",
  "iems",
  "iem",
  "monitors",
  "monitor",
  "in",
  "ear",
];

function toTokens(name) {
  return name
    .toLowerCase()
    .replace(/[()]/g, " ")
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .filter((t) => !GENERIC_WORDS.includes(t));
}

function slugifyShort(name) {
  const tokens = toTokens(name);
  return tokens
    .map((t) => t.replace(/[^a-z0-9]/gi, ""))
    .filter(Boolean)
    .join("-");
}

async function main() {
  console.log("Fetching main images for 16 selected IEMs...\n");

  const query = `*[_type == "product" && defined(image)]{
    _id,
    name,
    "slug": slug.current,
    image { asset->{ _id, url } }
  }`;

  const products = await readClient.fetch(query);

  const matches = [];

  for (const requested of REQUESTED_NAMES) {
    const tokens = toTokens(requested);
    const candidates = products.filter((p) => {
      const pTokens = toTokens(p.name || "");
      return tokens.every((t) => pTokens.includes(t));
    });

    // Prefer the candidate with the fewest extra tokens (closest match)
    const best = candidates.sort((a, b) => {
      const aExtra = toTokens(a.name).length - tokens.length;
      const bExtra = toTokens(b.name).length - tokens.length;
      return aExtra - bExtra;
    })[0];

    if (!best) {
      console.error(`❌ No match for: ${requested}`);
      continue;
    }

    const url = best.image?.asset?.url;
    const assetId = best.image?.asset?._id;
    if (!url) {
      console.error(`⚪ No image URL for: ${best.name}`);
      continue;
    }

    const ext = path.extname(new URL(url).pathname) || ".png";
    const shortName = slugifyShort(best.name);
    const filename = `${shortName}${ext}`;
    const outPath = path.join(OUTPUT_DIR, filename);

    matches.push({ requested, actual: best.name, url, filename });

    const res = await fetch(url);
    if (!res.ok) {
      console.error(`❌ Failed to fetch ${best.name}: ${res.status} ${res.statusText}`);
      continue;
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    await fs.writeFile(outPath, buffer);
    console.log(`✅ ${best.name} -> ${filename} (${buffer.length} bytes)`);
  }

  console.log(`\nDone. ${matches.length} images saved to ${OUTPUT_DIR}`);

  if (matches.length !== REQUESTED_NAMES.length) {
    console.error("\nSome products could not be matched or downloaded.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
