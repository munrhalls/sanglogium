import { readClient } from "../sanity-cms/utils/migrations/normalizeIemImages/getClient.mjs";

async function main() {
  const cat = await readClient.fetch(
    `*[_type == "catalogueItem" && slug.current == "earpads"]{_id, title}`
  );
  console.log("Earpads catalogueItems:", JSON.stringify(cat, null, 2));

  const product = await readClient.fetch(
    `*[_type == "product" && name == "Apos x Community Gremlin Tube Amp"][0]{_id, name, catalogueLocationKeys}`
  );
  console.log("\nProduct catalogueLocationKeys:", JSON.stringify(product, null, 2));

  const matching = await readClient.fetch(
    `*[_type == "catalogueItem" && _id in $ids]{_id, slug, title}`,
    { ids: product.catalogueLocationKeys }
  );
  console.log("\nCatalogue items for product:", JSON.stringify(matching, null, 2));
}

main().catch((err) => { console.error(err); process.exit(1); });
