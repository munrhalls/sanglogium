import client from "./getClient.mjs";
import fs from "fs";
import path from "path";

async function downloadIems() {
  const dumpPath = "c:/webdev/sang-logium/app/components/features/homepage/iems-gallery/iems-dump";

  if (!fs.existsSync(dumpPath)) {
    fs.mkdirSync(dumpPath, { recursive: true });
  } else {
    // Clear existing files to avoid mixing old duplicates with new unique files
    fs.readdirSync(dumpPath).forEach(file => fs.unlinkSync(path.join(dumpPath, file)));
  }

  try {
    const query = `*[_type == "product" && categoryPath match "headphones*" && (slug.current match "*ear*" || slug.current match "*buds*" || slug.current match "*iem*")]{
      _id,
      brand,
      "name": coalesce(title, name),
      "slug": slug.current,
      "imageUrl": image.asset->url,
      displayPrice
    } | order(brand asc)`;

    const allProducts = await client.fetch(query);
    const uniqueProducts = [];
    const seenBaseModels = new Set();

    for (const prod of allProducts) {
      if (uniqueProducts.length >= 16) break;

      // Create a "Base Model" key by removing common color/bundle suffixes
      // This prevents "Pi8 White" and "Pi8 Black" from both appearing
      const baseName = prod.name
        .split(/ - | \(| 2024| with | bundle/i)[0] // Split at common separators
        .replace(/(black|white|grey|silver|green|blue|pink|gold|storm|glacier|jade|cloud|forest|midnight)/gi, '')
        .trim();

      if (!seenBaseModels.has(baseName)) {
        seenBaseModels.add(baseName);
        uniqueProducts.push(prod);
      }
    }

    uniqueProducts.forEach((product) => {
      const fileName = `IEM-${product.brand.replace(/\s+/g, '')}-${product.slug}.json`;
      const filePath = path.join(dumpPath, fileName);
      fs.writeFileSync(filePath, JSON.stringify(product, null, 2));
      console.log(`✅ Unique Download: ${fileName}`);
    });

    console.log(`\n🚀 Success: ${uniqueProducts.length} unique products dumped.`);

  } catch (error) {
    console.error("❌ Download failed:", error);
  }
}

downloadIems();