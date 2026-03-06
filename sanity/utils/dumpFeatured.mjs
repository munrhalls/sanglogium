import client from "./getClient.mjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TARGET_PATH = "c:\\webdev\\sang-logium\\app\\components\\features\\homepage\\featured-carousel\\content-dump.json";

const FEATURED_SLUGS = [
  "focal-clear-mg-headphones",
  "sennheiser-hd-800s-headphones",
  "meze-audio-liric-ii-headphones",
  "audeze-lcd-x-headphones-|-2024-creator's-edition",
  "dan-clark-audio-stealth-headphones",
  "bowers-wilkins-pi8-in-ear-bluetooth-true-wireless-earbuds-midnight-blue"
];

async function dumpFeaturedContent() {
  try {
    console.log("🚀 Starting dump for Featured Carousel...");

    // Pobieramy dane na podstawie schemy: name, brand, displayPrice, image
    const query = `*[_type == "product" && slug.current in $slugs]{
      "id": _id,
      "name": name,
      brand,
      "slug": slug.current,
      displayPrice,
      "imageUrl": image.asset->url,
      "tag": overviewFields[0].value
    }`;

    const data = await client.fetch(query, { slugs: FEATURED_SLUGS });

    // Sortujemy dane, aby zachować kolejność z FEATURED_SLUGS
    const sortedData = FEATURED_SLUGS.map(slug =>
      data.find(item => item.slug === slug)
    ).filter(Boolean);

    // Zapisujemy do pliku
    fs.writeFileSync(TARGET_PATH, JSON.stringify(sortedData, null, 2));

    console.log(`✅ Success! Data dumped to: ${TARGET_PATH}`);
    console.log(`📦 Items collected: ${sortedData.length}`);

  } catch (error) {
    console.error("❌ Dump failed:", error);
  }
}

dumpFeaturedContent();