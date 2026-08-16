// Enumerate apos.audio catalog and find exact handles/titles for the MISS
// products, plus search a few other stores. Writes .logs/miss-catalog-matches.json
import fs from "node:fs";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

const RESULT_FILE = "scripts/replacement-images-combined-result.json";
const MISS = JSON.parse(fs.readFileSync(RESULT_FILE, "utf8")).filter(
  (r) => r.status === "MISS",
);
const missTitles = MISS.map((m) => {
  // Normalize: strip suffix units/dashes for fuzzy match
  return m.name.replace(/\s+/g, " ").trim();
});

function normalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ");
}

const needleWords = missTitles.map((t) =>
  normalize(t.replace(/-\s?\d+[\d.,\s]*f?t?[.\s]*\(\d+m\)/gi, "").replace(/\s*-\s*\d+.*/, "")),
);

async function getJSON(url, ms = 25000) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  try {
    const res = await fetch(url, { signal: c.signal, headers: { "User-Agent": UA } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

async function allShopifyProducts(base) {
  const out = [];
  for (let page = 1; page <= 30; page++) {
    const j = await getJSON(`${base}/products.json?limit=250&page=${page}`);
    if (!j || !j.products?.length) break;
    out.push(...j.products);
    if (j.products.length < 250) break;
    console.log(base + " page " + page + " (" + out.length + " so far)");
  }
  return out;
}

const stores = ["https://apos.audio", "https://svsound.com", "https://dekoniaudio.com", "https://wickedcushions.com"];
const matches = [];

for (const base of stores) {
  console.log("Enumerating " + base + " ...");
  const products = await allShopifyProducts(base);
  console.log(base + " total " + products.length);
  for (const p of products) {
    const title = p.title.replace(/\s+/g, " ").trim();
    const tn = normalize(title);
    for (const m of MISS) {
      // score: count of meaningful tokens from the miss name present in title
      const nameNorm = normalize(m.name);
      const words = nameNorm.split(" ").filter((w) => w.length > 3 && !["audio", "cable", "for", "the", "and", "with"].includes(w));
      const hit = words.filter((w) => tn.includes(w)).length;
      if (hit >= Math.max(3, Math.floor(words.length * 0.5))) {
        matches.push({ slug: m.slug, store: base, handle: p.handle, title, score: hit });
      }
    }
  }
}

// dedupe matches
const seen = new Set();
const uniq = matches.filter((m) => {
  const k = m.slug + "|" + m.store + "|" + m.handle;
  if (seen.has(k)) return false;
  seen.add(k);
  return true;
});

fs.writeFileSync(".logs/miss-catalog-matches.json", JSON.stringify(uniq, null, 2));
console.log("\nMATCHES: " + uniq.length);
for (const m of uniq) {
  console.log(m.slug + " -> " + m.store + "/products/" + m.handle + "  [" + m.title.slice(0, 80) + "]");
}
