const fs = require("fs");
const path = require("path");

const PROJECT_ID = "2tdmkpky";
const DATASET = "production";
const API_VERSION = "2024-11-26";
const QUERY_URL = `https://${PROJECT_ID}.apicdn.sanity.io/v${API_VERSION}/data/query/${DATASET}`;

const CHUNK = 100;

const idx = JSON.parse(fs.readFileSync(path.join(__dirname, "../../data/catalogue-index.json"), "utf8"));
const facetMap = JSON.parse(fs.readFileSync(path.join(__dirname, "facet-map.json"), "utf8"));

// --- build leaf key list and id -> root slug maps ---
const leafKeys = Object.entries(idx.slotMetadataMap)
  .filter(([_, v]) => v.children.length === 0)
  .map(([k]) => k);

const idToRootId = {};
const rootIdToSlug = {};

for (const root of idx.tree) {
  const rootId = root._key;
  rootIdToSlug[rootId] = (root.slug && root.slug.current) || root.title.toLowerCase().replace(/\s+/g, "-");
  const stack = [rootId];
  while (stack.length) {
    const id = stack.pop();
    idToRootId[id] = rootId;
    const node = idx.slotMetadataMap[id];
    if (node && node.children) {
      for (const childId of node.children) {
        if (!idToRootId[childId]) {
          idToRootId[childId] = rootId;
          stack.push(childId);
        }
      }
    }
  }
}

function productRootSlugs(product) {
  const set = new Set();
  for (const k of product.catalogueLocationKeys || []) {
    const rootId = idToRootId[k];
    if (rootId) set.add(rootIdToSlug[rootId]);
  }
  return Array.from(set);
}

function productLeafKey(product) {
  for (const k of product.catalogueLocationKeys || []) {
    if (leafKeys.includes(k)) return k;
  }
  return null;
}

// --- category rules for N/A cells ---
const NA_RULES = {
  "Back design": {
    reason: "IEMs (Universal IEMs) have no ear cup / back design",
    naWhen: (rootSlug, leafKey) => rootSlug === "headphones" && leafKey === "t2anvkkjfz9knqi85kozuaze",
  },
  "Connector / termination": {
    reason: "Earpads, eartips, stands, cases and care products have no connector/termination",
    naWhen: (rootSlug, leafKey) =>
      rootSlug === "accessories" &&
      [
        "j2yu4yvtje69j6gie4spxutu", // Earpads
        "9td5z7HwDgMNxTZ8edvs2d", // Eartips
        "u9o83mfmx23cudko8phu5otx", // Headphone Stands
        "j8ls622l90d6m4xetlajua4y", // Carrying Cases
        "ab2xhkm6hgabf69y0f3s4oo0", // Care & Cleaning
      ].includes(leafKey),
  },
};

function facetCell(facetName, rootSlugs, leafKey) {
  const facet = facetMap.find((f) => f.facet === facetName);
  if (!facet) return { state: "needs value" };

  // Universal facets and category apply to every visible product
  if (["Price", "Brand", "Availability", "Category"].includes(facetName)) {
    return { state: "needs value" };
  }

  const applicableRoots = facet.categories || [];
  const relevantRoot = rootSlugs.find((r) => applicableRoots.includes(r));

  if (!relevantRoot) {
    return {
      state: "N/A",
      reason: `Facet only applies to ${applicableRoots.join(", ")} products; this product is ${rootSlugs.join(", ")}`,
    };
  }

  const rule = NA_RULES[facetName];
  if (rule && rule.naWhen(relevantRoot, leafKey)) {
    return { state: "N/A", reason: rule.reason };
  }

  return { state: "needs value" };
}

// --- fetch live products from Sanity ---
async function sanityQuery(query, params) {
  const res = await fetch(QUERY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, params }),
  });
  if (!res.ok) throw new Error(`Sanity query failed: ${res.status} ${res.statusText}`);
  const json = await res.json();
  return json.result;
}

async function fetchAllProducts() {
  const products = [];
  let start = 0;
  while (true) {
    const end = start + CHUNK;
    const query = `*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0] | order(_id asc) [$start...$end] { _id, name, "slug": slug.current, catalogueLocationKeys }`;
    const chunk = await sanityQuery(query, { keys: leafKeys, start, end });
    if (!chunk || chunk.length === 0) break;
    products.push(...chunk);
    if (chunk.length < CHUNK) break;
    start = end;
  }
  return products;
}

async function main() {
  const products = await fetchAllProducts();
  const facetNames = facetMap.map((f) => f.facet);
  const matrix = products.map((p) => {
    const rootSlugs = productRootSlugs(p);
    const leafKey = productLeafKey(p);
    const leafTitle = leafKey ? idx.slotMetadataMap[leafKey]?.title || leafKey : null;
    const facets = {};
    for (const f of facetNames) {
      facets[f] = facetCell(f, rootSlugs, leafKey);
    }
    return {
      _id: p._id,
      name: p.name,
      slug: p.slug || "",
      rootCategory: rootSlugs,
      leafCategory: leafTitle,
      facets,
    };
  });

  const output = {
    meta: {
      generatedAt: new Date().toISOString(),
      source: "Sanity live CDN",
      totalRows: matrix.length,
      totalFacets: facetNames.length,
      leafCategories: leafKeys.length,
      facetNames,
    },
    rules: Object.entries(NA_RULES).map(([facet, rule]) => ({
      facet,
      reason: rule.reason,
    })),
    matrix,
  };

  fs.writeFileSync(path.join(__dirname, "product-facet-applicability-matrix.json"), JSON.stringify(output, null, 2));

  // --- also write a CSV for human spreadsheet inspection ---
  const header = ["_id", "name", "slug", "rootCategory", "leafCategory", ...facetNames];
  const rows = matrix.map((r) => {
    const cells = [
      r._id,
      `"${(r.name || "").replace(/"/g, "'")}"`,
      r.slug,
      r.rootCategory.join(";"),
      r.leafCategory || "",
    ];
    for (const f of facetNames) {
      const cell = r.facets[f];
      cells.push(cell.state === "N/A" ? `N/A: ${cell.reason}` : cell.state);
    }
    return cells.join(",");
  });
  fs.writeFileSync(
    path.join(__dirname, "product-facet-applicability-matrix.csv"),
    [header.join(","), ...rows].join("\n")
  );

  console.log(`Built matrix: ${matrix.length} products x ${facetNames.length} facets`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
