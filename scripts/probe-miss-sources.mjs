// Probe candidate sources for the 20 MISS products from the combined fetch.
// Tries Shopify JSON first (base/products/<handle>.json) then HTML og:image.
// Read-only. Outputs hits to stdout and .logs/probe-miss-hits.json
import fs from "node:fs";

const RESULT_FILE = "scripts/replacement-images-combined-result.json";
const MISS = JSON.parse(fs.readFileSync(RESULT_FILE, "utf8")).filter(
  (r) => r.status === "MISS",
);

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

const STORES = [
  { name: "apos.audio", base: "https://apos.audio" },
  { name: "dekoniaudio.com", base: "https://dekoniaudio.com" },
  { name: "svsound.com", base: "https://svsound.com" },
  { name: "audioquest.com", base: "https://audioquest.com" },
  { name: "audio-technica.com", base: "https://www.audio-technica.com" },
  { name: "focal.com", base: "https://www.focal.com" },
];

function handleVariants(h) {
  const v = [];
  v.push(h);
  if (h.endsWith("-apos-certified")) v.push(h.slice(0, -"-apos-certified".length));
  v.push("apos-certified-" + h);
  // strip measurement segment variants: e.g. "-16-4-ft-5m" suffix
  const m = h.match(/^(.*?)(-\d+(-\d+)?-?ft?(-\d+)?m?)?$/);
  if (m && m[1] && m[1] !== h) v.push(m[1]);
  return [...new Set(v)];
}

async function fetchWithTimeout(url, ms = 12000) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  try {
    return await fetch(url, { signal: c.signal, headers: { "User-Agent": UA } });
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

async function probeShopify(store, handle) {
  const url = `${store.base}/products/${handle}.json`;
  const res = await fetchWithTimeout(url);
  if (!res || !res.ok) return null;
  try {
    const data = await res.json();
    if (data.product?.image?.src) return data.product.image.src;
  } catch {}
  return null;
}

async function probeHtml(store, handle) {
  const url = `${store.base}/products/${handle}`;
  const res = await fetchWithTimeout(url);
  if (!res || !res.ok) return null;
  const html = await res.text().catch(() => "");
  const og =
    html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)?.[1] ||
    html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i)?.[1];
  return og || null;
}

const hits = [];
let idx = 0;
const CONCURRENCY = 6;
async function worker() {
  while (idx < MISS.length) {
    const m = MISS[idx++];
    const baseHandle = m.slug.replace("/product/", "");
    let found = null;
    let via = null;
    outer: for (const store of STORES) {
      for (const h of handleVariants(baseHandle)) {
        const img = await probeShopify(store, h);
        if (img) { found = img; via = store.name + " (shopify " + h + ")"; break outer; }
      }
      for (const h of handleVariants(baseHandle)) {
        const img = await probeHtml(store, h);
        if (img) { found = img; via = store.name + " (html " + h + ")"; break outer; }
      }
    }
    const status = found ? "HIT" : "MISS";
    console.log(status + " | " + baseHandle + (found ? " | " + via : ""));
    hits.push({ slug: m.slug, status, via, imageUrl: found });
  }
}
const workers = [];
for (let i = 0; i < CONCURRENCY; i++) workers.push(worker());
await Promise.all(workers);

fs.writeFileSync(".logs/probe-miss-hits.json", JSON.stringify(hits, null, 2));
const ok = hits.filter((h) => h.status === "HIT").length;
console.log("\nHITS: " + ok + "/" + hits.length);
