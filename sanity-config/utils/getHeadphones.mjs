import client from "./getClient.mjs";

async function getHeadphonesFiltered() {
  // Define the IDs of the Spotlight products to exclude them from the Featured selection
  // These are the IDs for Meze Liric II, DCA Stealth, and Focal Utopia
  const spotlightIds = [
    "moXlkADK7m1DHgGwWtblBG", // Meze Liric II
    "k27n1AQuIbSr5iozFz7HA5", // DCA Stealth
    "k27n1AQuIbSr5iozFz7EsP"  // Focal Utopia / Clear Mg (Checking against your previous dump)
  ];

  try {
    const query = `*[_type == "product" && categoryPath match "headphones*" && !(_id in $spotlightIds)]{
      _id,
      title,
      brand,
      categoryPath,
      "slug": slug.current,
      "imageUrl": image.asset->url,
      displayPrice
    } | order(brand asc)`;

    const products = await client.fetch(query, { spotlightIds });

    console.log(`\n✅ Found ${products.length} products (excluding 3 Spotlights).\n`);

    console.table(products.map(p => ({
      Brand: p.brand,
      Title: p.title,
      Price: p.displayPrice,
      Slug: p.slug
    })));

  } catch (error) {
    console.error("Error fetching filtered headphones:", error);
  }
}

getHeadphonesFiltered();