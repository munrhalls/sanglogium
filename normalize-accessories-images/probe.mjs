import { readClient } from "../sanity-cms/utils/migrations/normalizeIemImages/getClient.mjs";

const slugs = [
  "headphone-cables",
  "interconnects",
  "adapters",
  "earpads",
  "eartips",
  "care-cleaning",
  "headphone-stands",
  "carrying-cases",
];

async function main() {
  console.log("--- Documents with matching slug.current ---");
  const bySlug = await readClient.fetch(
    `*[slug.current in $slugs]{_id, _type, "slug": slug.current, title}[0...50]`,
    { slugs }
  );
  console.log(JSON.stringify(bySlug, null, 2));

  console.log("\n--- Categories by type guesses ---");
  const byType = await readClient.fetch(
    `*[_type in ["category", "productCategory", "catalogue", "productCatalogue"]]{_id, _type, "slug": slug.current, title}[0...50]`
  );
  console.log(JSON.stringify(byType, null, 2));

  console.log("\n--- Sample product catalogueLocationKeys ---");
  const product = await readClient.fetch(
    `*[_type == "product" && defined(catalogueLocationKeys)][0]{_id, name, catalogueLocationKeys, "slug": slug.current}`
  );
  console.log(JSON.stringify(product, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
