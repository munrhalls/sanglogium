// Step 1: For each broken product, search the web (DuckDuckGo HTML endpoint, no API key)
// for e-commerce product pages, extract candidate URLs, and print them for review.
import fs from "fs/promises";
import path from "path";

const BROKEN_LIST = JSON.parse(
  await fs.readFile("broken-accessories-main-images.json", "utf8"),
);

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

async function ddgSearch(query) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "text/html",
    },
  });
  if (!res.ok) throw new Error(`DDG ${res.status} for "${query}"`);
  const html = await res.text();

  // Extract result links + titles + snippets (rough but adequate for review)
  const links = [];
  const regex =
    /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
  let m;
  while ((m = regex.exec(html)) !== null) {
    const href = m[1];
    const title = m[2].replace(/<[^>]+>/g, "").trim();
    // DuckDuckGo wraps links: uddg=...&rut=...; decode to real URL
    let real = href;
    const uddgMatch = href.match(/[?&]uddg=([^&]+)/);
    if (uddgMatch) {
      try {
        real = decodeURIComponent(uddgMatch[1]);
      } catch {
        real = href;
      }
    }
    links.push({ title, url: real });
  }
  return links;
}

const results = [];
for (const product of BROKEN_LIST) {
  const name = product.name;
  const query = `${name} buy`;
  console.log(`\n=== ${name} ===`);
  try {
    const links = await ddgSearch(query);
    const ecom = links.slice(0, 6);
    results.push({ name, slug: product.slug, candidates: ecom });
    for (const l of ecom) {
      console.log(`  • ${l.title} -> ${l.url}`);
    }
  } catch (err) {
    console.log(`  ❌ ${err.message}`);
    results.push({
      name,
      slug: product.slug,
      candidates: [],
      error: err.message,
    });
  }
  // Be polite to DDG
  await new Promise((r) => setTimeout(r, 1500));
}

await fs.writeFile(
  "scripts/replacement-image-candidates.json",
  JSON.stringify(results, null, 2),
);
console.log(
  "\n\nSaved candidates to scripts/replacement-image-candidates.json",
);
