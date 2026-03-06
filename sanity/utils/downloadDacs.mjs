import client from "./getClient.mjs";
import fs from "fs";
import path from "path";

async function downloadDacs() {
  const dumpPath = "c:/webdev/sang-logium/app/components/features/homepage/dacs-dump";

  if (!fs.existsSync(dumpPath)) {
    fs.mkdirSync(dumpPath, { recursive: true });
  }

  try {
    const query = `*[_type == "product" && (
      categoryPath match "*dac*" ||
      categoryPath match "*amp*" ||
      categoryPath match "*amplifier*"
    )][0...12]{
      _id,
      brand,
      "name": coalesce(title, name),
      "slug": slug.current,
      "imageUrl": image.asset->url,
      displayPrice
    } | order(displayPrice desc)`; // High-end first for "The Power House" feel

    const products = await client.fetch(query);

    products.forEach((product) => {
      const fileName = `DAC-${product.brand.replace(/\s+/g, '')}-${product.slug.slice(0, 25)}.json`;
      fs.writeFileSync(path.join(dumpPath, fileName), JSON.stringify(product, null, 2));
      console.log(`✅ DAC/Amp Saved: ${fileName}`);
    });

    console.log(`\n🚀 Success: ${products.length} source components dumped.`);

  } catch (error) {
    console.error("❌ DAC Download failed:", error);
  }
}

downloadDacs();