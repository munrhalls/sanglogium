import client from "./getClient.mjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TARGET_PATH = path.resolve(
  __dirname,
  "../../app/components/features/homepage/product-spotlight-1/Meze Audio LIRIC II Headphones - $2000.json"
);

async function dumpMeze() {
  const slug = "meze-audio-liric-ii-headphones";

  try {
    console.log(`📡 Fetching ${slug} from Sanity...`);

    const query = `*[_type == "product" && slug.current == $slug][0]{
      "id": _id,
      name,
      brand,
      "slug": slug.current,
      displayPrice,
      "mainImage": image.asset->url,
      "gallery": gallery[].asset->url,
      "specs": specifications[0...4]{
        title,
        value
      },
      description
    }`;

    const product = await client.fetch(query, { slug });

    if (!product) {
      console.error(`❌ ERROR: Product with slug "${slug}" not found.`);
      // Check if it exists under a different slug to help troubleshoot
      const alt = await client.fetch(`*[_type == "product" && brand == "Meze"]{ "slug": slug.current }`);
      console.log("Found these Meze products instead:", alt);
      return;
    }

    const enrichedData = {
      ...product,
      headline: "The Modern Standard",
      subheadline: "Refined Closed-Back Excellence",
      isGold: false,
      order: 1
    };

    const targetDir = path.dirname(TARGET_PATH);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    fs.writeFileSync(TARGET_PATH, JSON.stringify(enrichedData, null, 2));
    console.log(`✅ SUCCESS: Dumped to ${TARGET_PATH}`);

  } catch (error) {
    console.error("❌ Script failed:", error.message);
  }
}

dumpMeze();