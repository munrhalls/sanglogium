import client from "./getClient.mjs";
import fs from "fs";
import path from "path";

async function downloadFeatured() {
  const targetDir = "c:/webdev/sang-logium/app/components/features/homepage/featured";

  const featuredSlugs = [
    "audeze-lcd-x-headphones-|-2024-creator's-edition",
    "focal-clear-mg-headphones",
    "sennheiser-hd-800s-headphones",
    "bowers-wilkins-pi8-in-ear-bluetooth-true-wireless-earbuds-midnight-blue",
    "dan-clark-audio-aeon-2-noire-headphones",
    "hifiman-arya-headphones-|-stealth-magnets-edition",
    "mark-levinson-№-5909-active-noise-cancellation-headphones"
  ];

  try {
    const query = `*[_type == "product" && slug.current in $featuredSlugs]{
      _id,
      brand,
      "name": coalesce(title, name),
      "slug": slug.current,
      "imageUrl": image.asset->url,
      displayPrice,
      "tag": categoryPath
    }`;

    const products = await client.fetch(query, { featuredSlugs });

    fs.writeFileSync(
      path.join(targetDir, "content-dump.json"),
      JSON.stringify(products, null, 2)
    );

    console.log(`✅ Featured Dump Complete: ${products.length} unique products saved.`);
  } catch (error) {
    console.error("❌ Featured Download failed:", error);
  }
}

downloadFeatured();