const fs = require("fs");

const raw = JSON.parse(fs.readFileSync("./sanity/backups/backup_products_latest.json", "utf8"));
const arr = Array.isArray(raw) ? raw : raw.result || raw.products || raw.docs || [];
const idx = JSON.parse(fs.readFileSync("./data/catalogue-index.json", "utf8"));

// map catalogue node key -> title path
const idToTitle = {};
const walk = (nodes, path) => {
  for (const n of nodes) {
    const t = [...path, n.title];
    idToTitle[n._key] = t.join(" / ");
    if (n.children) walk(n.children, t);
  }
};
walk(idx.tree, []);

console.log("total products:", arr.length);

// ---- category breakdown ----
const catCount = {};
const rootCount = {};
for (const p of arr) {
  const keys = p.catalogueLocationKeys || [];
  let matched = false;
  const roots = new Set();
  for (const k of keys) {
    const title = idToTitle[k];
    if (title) {
      catCount[title] = (catCount[title] || 0) + 1;
      roots.add(title.split(" / ")[0]);
      matched = true;
    }
  }
  for (const r of roots) rootCount[r] = (rootCount[r] || 0) + 1;
  if (!matched) rootCount["<UNMAPPED>"] = (rootCount["<UNMAPPED>"] || 0) + 1;
}

console.log("\n=== ROOT CATEGORY (distinct products) ===");
for (const [k, v] of Object.entries(rootCount).sort((a, b) => b[1] - a[1]))
  console.log(String(v).padStart(4), k);

console.log("\n=== LEAF CATEGORY ===");
for (const [k, v] of Object.entries(catCount).sort((a, b) => b[1] - a[1]))
  console.log(String(v).padStart(4), k);

// ---- overviewFields + specifications vocab ----
function vocab(field) {
  const titles = {};
  const vals = {};
  let withAny = 0;
  for (const p of arr) {
    const list = p[field] || [];
    if (list.length) withAny++;
    for (const o of list) {
      const t = (o.title || "").trim();
      titles[t] = (titles[t] || 0) + 1;
      (vals[t] = vals[t] || new Set()).add((o.value || "").trim());
    }
  }
  console.log(`\n=== ${field}: ${withAny}/${arr.length} products have >=1 ===`);
  for (const [k, v] of Object.entries(titles).sort((a, b) => b[1] - a[1]).slice(0, 45))
    console.log(String(v).padStart(4), JSON.stringify(k), " distinctVals:", vals[k].size);
}
vocab("overviewFields");
vocab("specifications");

// ---- description presence ----
let desc = 0, descLen = 0;
for (const p of arr) {
  if (p.description && String(p.description).trim().length > 20) {
    desc++;
    descLen += String(p.description).length;
  }
}
console.log(`\n=== description: ${desc}/${arr.length} non-trivial, avg len ${Math.round(descLen / (desc || 1))} ===`);
