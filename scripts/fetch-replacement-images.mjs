// Fetch replacement main images for every product with a broken main image.
// Strategy: most of these products are sold by apos.audio (Shopify). Shopify
// exposes product JSON at /products/<handle>.json; our store slugs map 1:1.
// For each product we fetch the JSON, take the featured image, download it and
// save it locally under fixing-botched-product-images/<handle>/<handle>.<ext>.
import fs from "fs/promises";
import path from "path";

// CLI args (optional): <brokenListFile> <outputMappingFile>
// Defaults keep the original accessories behavior.
const BROKEN_LIST_FILE = process.argv[2] || "broken-accessories-main-images.json";
const OUTPUT_MAPPING_FILE = process.argv[3] || "scripts/replacement-images-result.json";

const BROKEN_LIST = JSON.parse(await fs.readFile(BROKEN_LIST_FILE, "utf8"));

const STORES = [
  { name: "apos.audio", base: "https://apos.audio" },
  { name: "mezeaudio.com", base: "https://mezeaudio.com" },
  { name: "wickedcushions.com", base: "https://wickedcushions.com" },
];

// Some products live on apos.audio under an "apos-certified-" handle variant.
const HANDLE_OVERRIDES = {
  "meze-manta-headphone-stand": "apos-certified-meze-manta-headphone-stand",
  "ro75-compact-keyboard": "apos-certified-ro75-compact-keyboard",
};

// Candidate handles to try, in order: explicit override, raw handle, handle
// minus "-apos-certified" suffix, and handle with "apos-certified-" prefix.
function handleCandidates(baseHandle) {
  const cands = [];
  if (HANDLE_OVERRIDES[baseHandle]) cands.push(HANDLE_OVERRIDES[baseHandle]);
  cands.push(baseHandle);
  if (baseHandle.endsWith("-apos-certified")) {
    cands.push(baseHandle.slice(0, -"-apos-certified".length));
  }
  cands.push("apos-certified-" + baseHandle);
  return [...new Set(cands)];
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

async function getShopifyProduct(store, handle) {
  const url = `${store.base}/products/${handle}.json`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.product;
}

function extFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    const ext = path.extname(pathname);
    return ext && ext.length <= 5 ? ext : ".png";
  } catch {
    return ".png";
  }
}

const results = [];
for (const product of BROKEN_LIST) {
  const baseHandle = product.slug.replace("/product/", "");
  const candidates = handleCandidates(baseHandle);
  console.log(`\n=== ${product.name} ===`);

  let found = null;
  let foundStore = null;
  for (const store of STORES) {
    for (const handle of candidates) {
      try {
        const p = await getShopifyProduct(store, handle);
        if (p && p.image && p.image.src) {
          found = p.image.src;
          foundStore = store.name;
          break;
        }
      } catch {
        // try next candidate
      }
      await new Promise((r) => setTimeout(r, 300));
    }
    if (found) break;
  }

  if (!found) {
    console.log("  MISS: no image found on any candidate store");
    results.push({ name: product.name, slug: product.slug, status: "MISS" });
    continue;
  }

  const imgRes = await fetch(found, { headers: { "User-Agent": UA } });
  if (!imgRes.ok) {
    console.log(`  DOWNLOAD_FAIL: ${imgRes.status}`);
    results.push({
      name: product.name,
      slug: product.slug,
      status: "DOWNLOAD_FAIL",
      url: found,
    });
    continue;
  }

  const buffer = Buffer.from(await imgRes.arrayBuffer());
  const ext = extFromUrl(found);
  const folder = path.join("fixing-botched-product-images", baseHandle);
  await fs.mkdir(folder, { recursive: true });
  const filename = `${baseHandle}${ext}`;
  const outPath = path.join(folder, filename);
  await fs.writeFile(outPath, buffer);

  console.log(
    `  OK: saved ${filename} (${buffer.length} bytes) from ${foundStore}`,
  );
  results.push({
    name: product.name,
    slug: product.slug,
    status: "OK",
    sourceStore: foundStore,
    sourceUrl: found,
    localPath: folder.replace(/\\/g, "/") + "/" + filename,
  });

  await new Promise((r) => setTimeout(r, 400));
}

await fs.writeFile(
  OUTPUT_MAPPING_FILE,
  JSON.stringify(results, null, 2),
);
const okCount = results.filter((r) => r.status === "OK").length;
console.log(
  `\n\nDone: ${okCount}/${results.length} images saved. Mapping: ${OUTPUT_MAPPING_FILE}`,
);
