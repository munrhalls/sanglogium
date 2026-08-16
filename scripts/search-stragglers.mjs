// Background search: paginate audio46.com and headphones.com catalogs for the
// remaining unsourced products. Writes .logs/straggler-search.json
import fs from "node:fs";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
const NEEDLE = /red river|choice leather|sundara|travel pouch|mahogany|soundpath/i;

async function getJSON(url, ms = 20000) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  try {
    const r = await fetch(url, { signal: c.signal, headers: { "User-Agent": UA } });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

const matches = [];
for (const base of ["https://www.audio46.com", "https://headphones.com", "https://www.audioadvice.com"]) {
  for (let page = 1; page <= 20; page++) {
    const j = await getJSON(`${base}/products.json?limit=250&page=${page}`);
    if (!j || !j.products?.length) break;
    for (const p of j.products) {
      if (NEEDLE.test(p.title)) {
        matches.push({ store: base, handle: p.handle, title: p.title });
      }
    }
    if (j.products.length < 250) break;
    console.log(base + " page " + page);
  }
  console.log(base + " done");
}

fs.writeFileSync(".logs/straggler-search.json", JSON.stringify(matches, null, 2));
console.log("MATCHES: " + matches.length);
for (const m of matches) console.log(m.store + " | " + m.handle + " | " + m.title);
