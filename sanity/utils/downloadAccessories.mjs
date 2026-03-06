import client from "./getClient.mjs";
import fs from "fs";
import path from "path";

async function downloadAccessoriesCategorized() {
  const basePath = "c:/webdev/sang-logium/app/components/features/homepage/accessories/accessories-dump";

  const mapping = [
    { dir: "dump-cables", keywords: ["cable", "adapter", "connector", "xlr", "plug"] },
    { dir: "dump-pads", keywords: ["pad", "cushion", "earpad", "headband"] },
    { dir: "dump-storage", keywords: ["case", "stand", "bag", "hanger", "storage"] }
  ];

  try {
    for (const category of mapping) {
      const targetDir = path.join(basePath, category.dir);

      if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
      fs.readdirSync(targetDir).forEach(file => fs.unlinkSync(path.join(targetDir, file)));

      const query = `*[_type == "product" && (${category.keywords.map(k => `name match "*${k}*"`).join(" || ")})][0...6]{
        _id,
        brand,
        "name": coalesce(title, name),
        "slug": slug.current,
        "imageUrl": image.asset->url,
        displayPrice
      }`;

      const products = await client.fetch(query);

      products.forEach((p) => {
        const fileName = `${p.brand.replace(/\s+/g, '')}-${p.slug.slice(0, 15)}.json`;
        fs.writeFileSync(path.join(targetDir, fileName), JSON.stringify(p, null, 2));
      });

      console.log(`✅ [${category.dir}] populated with ${products.length} products.`);
    }
  } catch (error) {
    console.error("❌ Categorized Download failed:", error);
  }
}

downloadAccessoriesCategorized();