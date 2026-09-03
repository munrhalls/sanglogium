const fs = require("fs");
const path = require("path");

const BASE_DIR = __dirname;
const MATRIX_PATH = path.join(BASE_DIR, "product-facet-applicability-matrix.json");
const EXPORT_PATH = path.join(BASE_DIR, "products-export.json");
const FACET_MAP_PATH = path.join(BASE_DIR, "facet-map.json");
const ACQUIRED_JSON = path.join(BASE_DIR, "acquired-values.json");
const UNRESOLVED_JSON = path.join(BASE_DIR, "unresolved-queue.json");
const BATCHES_JSON = path.join(BASE_DIR, "brand-batches.json");
const ACQUIRED_CSV = path.join(BASE_DIR, "acquired-values.csv");
const UNRESOLVED_CSV = path.join(BASE_DIR, "unresolved-queue.csv");
const COVERAGE_JSON = path.join(BASE_DIR, "acquire-coverage.json");

const SITE_BASE = "https://sanglogium.com";

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function saveJson(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n");
}

function csvCell(value) {
  const s = String(value == null ? "" : value).replace(/"/g, '""');
  if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
    return `"${s}"`;
  }
  return s;
}

function findFirstFieldValue(product, candidates) {
  const all = [
    ...(product.overviewFields || []),
    ...(product.specifications || []),
  ];
  for (const item of all) {
    const title = (item.title || "").trim();
    if (candidates.some((c) => title.toLowerCase() === c.toLowerCase())) {
      const val = item.value;
      if (val !== undefined && val !== null) return String(val).trim();
    }
  }
  return null;
}

function normalizeSlug(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function normalizeCompressed(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "")
    .replace(/\.+/g, ".");
}

const BOOLEAN_TRUTHY = new Set(["true", "yes", "1"]);
const BOOLEAN_FALSY = new Set(["false", "no", "0"]);

function isPlaceholderVocab(valueVocab) {
  return valueVocab.some((v) => v.startsWith("<") && v.endsWith(">"));
}

function tokenize(raw, { splitSpace, splitHyphen }) {
  const candidates = new Set();
  candidates.add(raw);

  const separators = splitSpace ? /[,;|/\\()\\\s-]/g : /[,;|/\\()-]/g;

  const parts = String(raw)
    .split(separators)
    .map((s) => s.trim())
    .filter(Boolean);
  for (const p of parts) candidates.add(p);

  if (splitSpace) {
    const tokens = String(raw)
      .split(/[,;|/\\()\\\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    for (let i = 0; i < tokens.length - 1; i++) {
      candidates.add(tokens[i] + " " + tokens[i + 1]);
    }
  }

  return [...candidates];
}

function mappableValue(raw, facet) {
  if (!raw) return null;

  const type = facet.type;
  const valueVocab = facet.valueVocab || [];

  if (["range"].includes(type)) return raw;
  if (["brand", "category"].includes(type) || isPlaceholderVocab(valueVocab)) {
    return raw ? raw : null;
  }

  if (type === "boolean") {
    const compressed = normalizeCompressed(raw);
    if (BOOLEAN_TRUTHY.has(compressed) || BOOLEAN_TRUTHY.has(normalizeSlug(raw))) return "true";
    if (BOOLEAN_FALSY.has(compressed) || BOOLEAN_FALSY.has(normalizeSlug(raw))) return "false";
    return null;
  }

  const allowed = new Set();
  for (const v of valueVocab) {
    allowed.add(normalizeSlug(v));
    allowed.add(normalizeCompressed(v));
  }

  const isMulti = type === "multi";
  const candidates = tokenize(raw, { splitSpace: isMulti, splitHyphen: true });

  const matches = [];
  for (const c of candidates) {
    const slug = normalizeSlug(c);
    const compressed = normalizeCompressed(c);
    if (allowed.has(slug) || allowed.has(compressed)) {
      for (const v of valueVocab) {
        if (normalizeSlug(v) === slug || normalizeCompressed(v) === compressed) {
          matches.push(v);
          break;
        }
      }
    }
  }

  if (!matches.length) return null;
  if (type === "multi") return matches.join(", ");
  return matches[0];
}

function productSourceUrl(product) {
  return `${SITE_BASE}/products/${product.slug}`;
}

function truncatePhrase(phrase, max = 240) {
  if (phrase.length <= max) return phrase;
  return phrase.slice(0, max).trim() + "…";
}

const FIELD_EXTRACTORS = {
  price: (product) => (product.price !== undefined && product.price !== null ? String(product.price) : null),
  brand: (product) => product.brandSlug || null,
  inStock: (product) => {
    if (product.stock === undefined || product.stock === null) return null;
    const reserved = product.reservedStock || 0;
    return product.stock - reserved > 0 ? "true" : "false";
  },
  category: (product, matrixRow) => (matrixRow.rootCategory || []).join(", "),
  wearingStyle: (product) => findFirstFieldValue(product, ["Wearing style"]),
  backDesign: (product) => findFirstFieldValue(product, ["Back design", "Cup style", "Cup / back design"]),
  driverType: (product) => findFirstFieldValue(product, ["Driver type", "Driver Type"]),
  connectivity: (product) => findFirstFieldValue(product, ["Connectivity"]),
  connector: (product) => findFirstFieldValue(product, ["Connector", "Connector / plug"]),
  microphone: (product) => findFirstFieldValue(product, ["Microphone", "Microphones"]),
  noiseCancelling: (product) =>
    findFirstFieldValue(product, [
      "Noise cancelling",
      "Noise canceling",
      "ANC",
      "Active noise cancelling",
    ]),
  requiresAmplifier: (product) =>
    findFirstFieldValue(product, ["Amp required", "Requires amplifier", "Amplifier required"]),
  deviceType: (product) => findFirstFieldValue(product, ["Device type", "Product type", "Type"]),
  formFactor: (product) => findFirstFieldValue(product, ["Form factor", "Portability"]),
  amplification: (product) => findFirstFieldValue(product, ["Amplifier type", "Amplification"]),
  dacIncluded: (product) => findFirstFieldValue(product, ["DAC included", "DAC", "Built-in DAC"]),
  balancedOutput: (product) =>
    findFirstFieldValue(product, ["Balanced output", "Balanced", "Balanced connection"]),
  inputs: (product) => findFirstFieldValue(product, ["Inputs", "Input"]),
  outputs: (product) => findFirstFieldValue(product, ["Outputs", "Output"]),
  accessoryType: (product) => findFirstFieldValue(product, ["Accessory type", "Type"]),
  connectorTermination: (product) =>
    findFirstFieldValue(product, ["Connector / termination", "Connector", "Termination"]),
  compatibility: (product) =>
    findFirstFieldValue(product, ["Compatibility", "Compatible with", "Fits"]),
};

function getFieldName(facet) {
  return facet.field.replace("filterAttributes.", "");
}

function acquireForProduct(product, matrixRow, facetMap) {
  const acquired = {};
  const unresolved = [];

  for (const facet of facetMap) {
    const cell = matrixRow.facets[facet.facet];
    if (!cell || cell.state !== "needs value") continue;

    const fieldName = getFieldName(facet);
    const extractor = FIELD_EXTRACTORS[fieldName];
    if (!extractor) {
      unresolved.push({
        facet: facet.facet,
        note: "No extractor defined for this facet",
      });
      continue;
    }

    const raw = extractor(product, matrixRow);
    if (!raw) {
      unresolved.push({
        facet: facet.facet,
        note: "No matching field found in product overview/specifications",
      });
      continue;
    }

    // Compatibility values are free-text model lists; slugification to product slugs
    // requires a separate reconciliation pass, so they always go to D3 for now.
    if (facet.urlParam === "compatibility") {
      unresolved.push({
        facet: facet.facet,
        note: `Compatibility data present but needs canonical product-slug matching (raw: ${truncatePhrase(raw, 120)})`,
      });
      continue;
    }

    const mapped = mappableValue(raw, facet);
    if (!mapped) {
      unresolved.push({
        facet: facet.facet,
        note: `Field found but value does not map to closed vocabulary (raw: ${truncatePhrase(raw, 120)})`,
      });
      continue;
    }

    acquired[facet.facet] = {
      status: "filled",
      value: mapped,
      sourceUrl: productSourceUrl(product),
      sourcePhrase: truncatePhrase(raw, 500),
    };
  }

  return { acquired, unresolved };
}

function main() {
  const matrix = loadJson(MATRIX_PATH);
  const exportData = loadJson(EXPORT_PATH);
  const facetMap = loadJson(FACET_MAP_PATH);

  const products = Array.isArray(exportData.products) ? exportData.products : exportData;
  const productById = new Map();
  for (const p of products) {
    productById.set(p._id, p);
  }

  const brandProducts = new Map();
  for (const row of matrix.matrix) {
    const product = productById.get(row._id);
    const brand = product ? product.brandName || product.brandSlug || "unknown" : "unknown";
    if (!brandProducts.has(brand)) brandProducts.set(brand, []);
    brandProducts.get(brand).push({ row, product });
  }

  const brandOrder = [...brandProducts.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .map(([brand]) => brand);

  const acquiredById = {};
  const unresolvedQueue = [];
  const brandBatches = {};
  const facetTotals = {};
  for (const facet of facetMap) facetTotals[facet.facet] = { filled: 0, unresolved: 0 };

  for (const brand of brandOrder) {
    const items = brandProducts.get(brand);
    let filled = 0;
    let unresolved = 0;

    for (const { row, product } of items) {
      if (!product) {
        for (const [facetName, cell] of Object.entries(row.facets)) {
          if (cell.state === "needs value") {
            unresolvedQueue.push({
              _id: row._id,
              name: row.name,
              slug: row.slug,
              brand,
              facet: facetName,
              note: "Product not found in export",
            });
            unresolved++;
            facetTotals[facetName].unresolved++;
          }
        }
        continue;
      }

      const { acquired, unresolved: u } = acquireForProduct(product, row, facetMap);
      if (Object.keys(acquired).length) {
        acquiredById[row._id] = {
          _id: row._id,
          name: row.name,
          slug: row.slug,
          brand: product.brandName || product.brandSlug || brand,
          facets: acquired,
        };
        for (const [facetName, data] of Object.entries(acquired)) {
          filled++;
          facetTotals[facetName].filled++;
        }
      }
      for (const uItem of u) {
        unresolvedQueue.push({
          _id: row._id,
          name: row.name,
          slug: row.slug,
          brand: product.brandName || product.brandSlug || brand,
          facet: uItem.facet,
          note: uItem.note,
        });
        unresolved++;
        facetTotals[uItem.facet].unresolved++;
      }
    }

    brandBatches[brand] = {
      brand,
      catalogueShare: items.length,
      status: "closed",
      closedAt: new Date().toISOString(),
      filled,
      unresolved,
    };
  }

  const acquiredArray = Object.values(acquiredById);

  const coverage = {
    generatedAt: new Date().toISOString(),
    totalBrands: brandOrder.length,
    totalProducts: matrix.matrix.length,
    totalFilled: acquiredArray.reduce((sum, p) => sum + Object.keys(p.facets).length, 0),
    totalUnresolved: unresolvedQueue.length,
    brandOrder,
    brandBatches: Object.fromEntries(
      brandOrder.map((b) => [b, brandBatches[b]])
    ),
    perFacet: facetTotals,
  };

  // --- JSON deliverables ---
  saveJson(ACQUIRED_JSON, {
    generatedAt: new Date().toISOString(),
    source: "sang-logium product catalogue",
    totalProducts: acquiredArray.length,
    products: acquiredById,
  });

  saveJson(UNRESOLVED_JSON, {
    generatedAt: new Date().toISOString(),
    total: unresolvedQueue.length,
    queue: unresolvedQueue,
  });

  saveJson(BATCHES_JSON, {
    generatedAt: new Date().toISOString(),
    order: brandOrder,
    batches: brandBatches,
  });

  saveJson(COVERAGE_JSON, coverage);

  // --- CSV deliverables ---
  const acquiredRows = [
    ["_id", "name", "slug", "brand", "facet", "value", "source_url", "source_phrase"].join(","),
  ];
  for (const p of acquiredArray) {
    for (const [facet, data] of Object.entries(p.facets)) {
      acquiredRows.push(
        [
          csvCell(p._id),
          csvCell(p.name),
          csvCell(p.slug),
          csvCell(p.brand),
          csvCell(facet),
          csvCell(data.value),
          csvCell(data.sourceUrl),
          csvCell(data.sourcePhrase),
        ].join(",")
      );
    }
  }
  fs.writeFileSync(ACQUIRED_CSV, acquiredRows.join("\n") + "\n");

  const unresolvedRows = [
    ["_id", "name", "slug", "brand", "facet", "note"].join(","),
  ];
  for (const u of unresolvedQueue) {
    unresolvedRows.push(
      [
        csvCell(u._id),
        csvCell(u.name),
        csvCell(u.slug),
        csvCell(u.brand),
        csvCell(u.facet),
        csvCell(u.note),
      ].join(",")
    );
  }
  fs.writeFileSync(UNRESOLVED_CSV, unresolvedRows.join("\n") + "\n");

  console.log(`=== Brand-batched value acquisition ===`);
  console.log(`Brands processed: ${brandOrder.length} (largest catalogue share first)`);
  console.log(`Products processed: ${matrix.matrix.length}`);
  console.log(`Values filled:      ${coverage.totalFilled}`);
  console.log(`Unresolved queue:   ${coverage.totalUnresolved}`);
  console.log(`Coverage by facet:`);
  for (const [facet, counts] of Object.entries(facetTotals)) {
    const total = counts.filled + counts.unresolved;
    if (total === 0) continue;
    const pct = Math.round((counts.filled / total) * 100);
    console.log(`  ${facet.padEnd(22)} ${pct.toString().padStart(3)}%  filled ${counts.filled.toString().padStart(5)} / ${total.toString().padStart(5)}`);
  }
  console.log(`\nOutputs:`);
  console.log(`  ${ACQUIRED_JSON}`);
  console.log(`  ${UNRESOLVED_JSON}`);
  console.log(`  ${BATCHES_JSON}`);
  console.log(`  ${COVERAGE_JSON}`);
  console.log(`  ${ACQUIRED_CSV}`);
  console.log(`  ${UNRESOLVED_CSV}`);
}

main();
