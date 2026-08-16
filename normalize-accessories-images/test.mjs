import { readClient } from "../sanity-cms/utils/migrations/normalizeIemImages/getClient.mjs";

async function main() {
  const adapterCats = await readClient.fetch(
    `*[_type == "catalogueItem" && slug.current in ["adapters"]]{_id, "slug": slug.current}`
  );
  console.log("Adapters catalogueItem:", JSON.stringify(adapterCats, null, 2));

  const ids = adapterCats.map(c => c._id);
  const q1 = await readClient.fetch(
    `*[_type == "product" && catalogueLocationKeys[@] in $ids][0...3]{_id, name, "slug": slug.current}`,
    { ids }
  );
  console.log("\ncatalogueLocationKeys[@] in $ids:", JSON.stringify(q1, null, 2));

  const q2 = await readClient.fetch(
    `*[_type == "product" && $ids[@] in catalogueLocationKeys][0...3]{_id, name, "slug": slug.current}`,
    { ids }
  );
  console.log("\n$ids[@] in catalogueLocationKeys:", JSON.stringify(q2, null, 2));

  const q3 = await readClient.fetch(
    `*[_type == "product" && count(catalogueLocationKeys[(@ in $ids)]) > 0][0...3]{_id, name, "slug": slug.current}`,
    { ids }
  );
  console.log("\ncount > 0:", JSON.stringify(q3, null, 2));
}

main().catch((err) => { console.error(err); process.exit(1); });
