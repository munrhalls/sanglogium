import client from "./getClient.mjs";

async function getHeadphones() {
  try {
    // GROQ query: case-insensitive match for anything starting with 'headphones'
    const query = `*[_type == "product" && categoryPath match "headphones*"]{
      _id,
      title,
      brand,
      categoryPath,
      "slug": slug.current,
      "imageUrl": image.asset->url
    } | order(brand asc)`;

    const products = await client.fetch(query);

    console.log(`\nFound ${products.length} products in Headphones category.\n`);

    // Display as a clean table for quick scanning
    console.table(products.map(p => ({
      Brand: p.brand,
      Title: p.title,
      ID: p._id,
      Slug: p.slug
    })));

  } catch (error) {
    console.error("Error fetching headphones:", error);
  }
}

getHeadphones();