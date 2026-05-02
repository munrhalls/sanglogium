import client from "./getClient.mjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_HOMEPAGE_PATH = path.resolve(__dirname, "../../app/components/features/homepage");

const SPOTLIGHT_CONFIG = [
  {
    slug: "meze-audio-liric-ii-headphones",
    headline: "The Modern Standard",
    subheadline: "Refined Closed-Back Excellence",
    isGold: false,
    targetFolder: "product-spotlight-1",
    targetFile: "Meze Audio LIRIC II Headphones - $2000.json"
  },
  {
    slug: "dan-clark-audio-stealth-headphones",
    headline: "Acoustic Precision",
    subheadline: "The Reference Icon",
    isGold: false,
    targetFolder: "product-spotlight-2",
    targetFile: "Dan Clark Audio Stealth Headphones - $3999.99.json"
  },
  {
    slug: "focal-utopia-reference-open-back-hi-fi-headphones",
    headline: "The Golden Standard",
    subheadline: "The Absolute Pinnacle",
    isGold: true,
    targetFolder: "product-spotlight-3",
    targetFile: "Utopia - $4999.json"
  }
];

async function dumpSpotlights() {
  try {
    const slugs = SPOTLIGHT_CONFIG.map(s => s.slug);
    const query = `*[_type == "product"]{ "slug": slug.current }`;
    const allProducts = await client.fetch(query);

    console.log("🔍 Checking Sanity Slugs:", allProducts.map(p => p.slug));

    const productQuery = `*[_type == "product" && slug.current in $slugs]{
      "id": _id,
      name,
      brand,
      "slug": slug.current,
      displayPrice,
      "mainImage": image.asset->url,
      "gallery": gallery[].asset->url,
      "specs": specifications[0...4]{ title, value },
      description
    }`;

    const data = await client.fetch(productQuery, { slugs });

    for (const conf of SPOTLIGHT_CONFIG) {
      const product = data.find(p => p.slug === conf.slug);

      if (!product) {
        console.error(`❌ FAILED: ${conf.slug} not found in Sanity results.`);
        continue;
      }

      const targetDir = path.join(BASE_HOMEPAGE_PATH, conf.targetFolder);
      const filePath = path.join(targetDir, conf.targetFile);

      if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

      fs.writeFileSync(filePath, JSON.stringify({
        ...product,
        headline: conf.headline,
        subheadline: conf.subheadline,
        isGold: conf.isGold
      }, null, 2));

      console.log(`✅ SUCCESS: Created ${conf.targetFile}`);
    }
  } catch (error) {
    console.error("❌ Critical Script Error:", error.message);
  }
}

dumpSpotlights();