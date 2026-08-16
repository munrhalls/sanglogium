// Targeted fetch for sourced replacement images using explicit (store, handle)
// mappings discovered via sitemap/product probes. Sequential with polite delays
// to avoid Shopify 429 rate limits. Writes scripts/replacement-images-mapped-result.json
import fs from "fs/promises";
import path from "path";

const BROKEN_LIST_FILE = "broken-botched-combined.json";
const OUTPUT = "scripts/replacement-images-mapped-result.json";

// baseHandle (our slug) -> { store base, apos/site handle }
const MAP = {
  "yulong-daart-aquila-iii-desktop-dac-pre-amp-amp": { base: "https://apos.audio", handle: "yulong-da-art-aquila-iii-desktop-dac-amp" },
  "yulong-daart-a39-desktop-r2r-pre-amp-headphone-amplifier": { base: "https://apos.audio", handle: "yulong-a39-desktop-headphone-amplifier" },
  "yulong-daart-asura-music-streamer-desktop-dac-headphone-amplifier": { base: "https://apos.audio", handle: "yulong-daart-asura-ak4499ex-ak4191-music-streamer-desktop-dac-headphone-amplifier" },
  "focal-headphone-stand": { base: "https://apos.audio", handle: "focal-high-fidelity-headphones-stand" },
  "focal-mahogany-headphone-stand": { base: "https://apos.audio", handle: "focal-high-fidelity-headphones-stand" },
  "dekoni-audio-elite-fenestrated-sheepskin-pads-for-sennheiser-hd6xx": { base: "https://apos.audio", handle: "dekoni-audio-epz-hd600-fnsk-replacement-ear-pads-for-sennheiser-hd600-series-headphones-elite-fenestrated-sheepskin" },
  "audioquest-red-river-xlr-to-xlr-analog-audio-interconnect-cable-9-84-3m-single-pack": { base: "https://www.audioadvice.com", handle: "audioquest-red-river-xlr-interconnect-cable" },
  "audioquest-red-river-xlr-to-xlr-analog-audio-interconnect-cables-9-84-3m-2-pack": { base: "https://www.audioadvice.com", handle: "audioquest-red-river-xlr-interconnect-cable" },
  "audioquest-red-river-xlr-to-xlr-analog-audio-interconnect-cables-2-46-0-75m-2-pack": { base: "https://www.audioadvice.com", handle: "audioquest-red-river-xlr-interconnect-cable" },
  "focal-clear-mg-replacement-ear-pads": { base: "https://dekoniaudio.com", handle: "ear-pads-for-focal-headphones-stellia-radiante-utopia-clear-clearmg-celestee" },
  "svs-soundpath-rca-audio-interconnect-cable-for-subwoofers-16-4-ft-5m": { base: "https://www.svsound.com", handle: "svs-soundpath-subwoofer-cable" },
  "svs-soundpath-rca-audio-interconnect-cable-for-subwoofers-3-28-ft-1m": { base: "https://www.svsound.com", handle: "svs-soundpath-subwoofer-cable" },
  "svs-soundpath-rca-audio-interconnect-cable-for-subwoofers-39-36-ft-12m": { base: "https://www.svsound.com", handle: "svs-soundpath-subwoofer-cable" },
  "svs-soundpath-rca-audio-interconnect-cable-for-subwoofers-49-2-ft-15m": { base: "https://www.svsound.com", handle: "svs-soundpath-subwoofer-cable" },
  "svs-soundpath-rca-audio-interconnect-cable-for-subwoofers-6-56-ft-2m": { base: "https://www.svsound.com", handle: "svs-soundpath-subwoofer-cable" },
  "svs-soundpath-rca-audio-interconnect-cable-for-subwoofers-26-24-ft-8m": { base: "https://www.svsound.com", handle: "svs-soundpath-subwoofer-cable" },
};

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url, opts = {}, retries = 3) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), 20000);
    try {
      const res = await fetch(url, {
        ...opts,
        signal: c.signal,
        headers: { "User-Agent": UA, ...(opts.headers || {}) },
      });
      if (res.status === 429) {
        await sleep(3000 * (attempt + 1));
        continue;
      }
      return res;
    } catch {
      await sleep(1500);
    } finally {
      clearTimeout(t);
    }
  }
  return null;
}

function extFromUrl(url) {
  try {
    const ext = path.extname(new URL(url).pathname);
    return ext && ext.length <= 5 ? ext : ".png";
  } catch {
    return ".png";
  }
}

const list = JSON.parse(await fs.readFile(BROKEN_LIST_FILE, "utf8"));
const results = [];
for (const product of list) {
  const baseHandle = product.slug.replace("/product/", "");
  const m = MAP[baseHandle];
  if (!m) {
    results.push({ name: product.name, slug: product.slug, status: "NO_MAPPING" });
    continue;
  }
  console.log("\n=== " + product.name + " ===  -> " + m.base + "/products/" + m.handle);

  const pRes = await fetchWithRetry(`${m.base}/products/${m.handle}.json`);
  if (!pRes || !pRes.ok) {
    console.log("  PRODUCT_JSON_FAIL: " + (pRes ? pRes.status : "no response"));
    results.push({ name: product.name, slug: product.slug, status: "PRODUCT_JSON_FAIL" });
    await sleep(500);
    continue;
  }
  const data = await pRes.json().catch(() => null);
  const img = data?.product?.image?.src;
  if (!img) {
    console.log("  NO_IMAGE in product JSON");
    results.push({ name: product.name, slug: product.slug, status: "NO_IMAGE" });
    await sleep(500);
    continue;
  }

  const iRes = await fetchWithRetry(img);
  if (!iRes || !iRes.ok) {
    console.log("  DOWNLOAD_FAIL: " + (iRes ? iRes.status : "no response"));
    results.push({ name: product.name, slug: product.slug, status: "DOWNLOAD_FAIL", url: img });
    await sleep(500);
    continue;
  }
  const buffer = Buffer.from(await iRes.arrayBuffer());
  const ext = extFromUrl(img);
  const folder = path.join("fixing-botched-product-images", baseHandle);
  await fs.mkdir(folder, { recursive: true });
  const filename = `${baseHandle}${ext}`;
  await fs.writeFile(path.join(folder, filename), buffer);
  console.log("  OK: " + filename + " (" + buffer.length + " bytes)");
  results.push({
    name: product.name,
    slug: product.slug,
    status: "OK",
    sourceStore: new URL(m.base).hostname,
    sourceUrl: img,
    localPath: folder.replace(/\\/g, "/") + "/" + filename,
  });
  await sleep(800);
}

await fs.writeFile(OUTPUT, JSON.stringify(results, null, 2));
const ok = results.filter((r) => r.status === "OK").length;
console.log("\nDone: " + ok + "/" + results.length + " saved. Mapping: " + OUTPUT);
