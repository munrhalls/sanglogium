import { createClient } from "@sanity/client";
import fs from "fs";
import path from "path";

const client = createClient({
  projectId: "2tdmkpky",
  dataset: "production",
  useCdn: false,
  apiVersion: "2024-03-06",
});

const targetIds = [
  "Y7l1IhzX2fnyiano571oLJ",
  "Y7l1IhzX2fnyiano572DVy",
  "dLGDVDmEEI2lV8CArIgVky"
];

async function downloadIems() {
  // Use coalesce to try multiple field names used in your schema
  const query = `*[_id in $targetIds]{
    "_id": _id,
    "brand": brand,
    "displayPrice": coalesce(displayPrice, price, 0),
    "imageUrl": coalesce(mainImage.asset->url, image.asset->url, gallery[0].asset->url),
    "name": name,
    "slug": slug.current
  }`;

  try {
    const products = await client.fetch(query, { targetIds });
    const dumpPath = "c:/webdev/sang-logium/app/components/features/homepage/iems-gallery/iems-dump";

    products.forEach((product) => {
      if (!product.imageUrl) console.warn(`⚠️ Warning: Image still missing for ${product.name}. Check Sanity Studio.`);

      const fileName = `IEM-${product.brand.replace(/\s+/g, "-")}-${product._id}.json`;
      const fullPath = path.join(dumpPath, fileName);

      fs.writeFileSync(fullPath, JSON.stringify(product, null, 2), "utf8");
      console.log(`✅ Fixed & Downloaded: ${product.name} ($${product.displayPrice})`);
    });
  } catch (err) {
    console.error("❌ Sanity Fetch Failed:", err);
  }
}

downloadIems();