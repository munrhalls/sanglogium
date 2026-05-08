import client from "./getClient.mjs";

async function getIemsFromHeadphones() {
  try {
    // Search within headphones but filter for In-Ear keywords
    const query = `*[_type == "product" && categoryPath match "headphones*" && (slug.current match "*ear*" || slug.current match "*buds*" || slug.current match "*iem*")]{
      _id,
      brand,
      "name": coalesce(title, name),
      "slug": slug.current,
      categoryPath
    } | order(brand asc)`;

    const products = await client.fetch(query);

    console.log(`\nFound ${products.length} In-Ear products hiding in Headphones.\n`);
    console.table(products);

  } catch (error) {
    console.error("Error:", error);
  }
}

getIemsFromHeadphones();