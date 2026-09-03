const fs = require("fs");
const raw = JSON.parse(fs.readFileSync("./sanity/backups/backup_products_latest.json", "utf8"));
const arr = Array.isArray(raw) ? raw : raw.result || raw.products || [];
const idx = JSON.parse(fs.readFileSync("./data/catalogue-index.json", "utf8"));

const idToRoot = {};
const walk = (nodes, root) => {
  for (const n of nodes) {
    const r = root || n.title;
    idToRoot[n._key] = r;
    if (n.children) walk(n.children, r);
  }
};
walk(idx.tree, null);

const rootOf = (p) => {
  for (const k of p.catalogueLocationKeys || []) if (idToRoot[k]) return idToRoot[k];
  return null;
};

const ov = (p, title) => {
  const hit = (p.overviewFields || []).find((o) => (o.title || "").toLowerCase() === title.toLowerCase());
  return hit ? (hit.value || "").trim() : null;
};
const spec = (p, title) => {
  const hit = (p.specifications || []).find((o) => (o.title || "").toLowerCase() === title.toLowerCase());
  return hit ? (hit.value || "").trim() : null;
};

const groups = { Headphones: [], "Audio Electronics": [], Accessories: [] };
for (const p of arr) {
  const r = rootOf(p);
  if (r && groups[r]) groups[r].push(p);
}

function report(name, list, facets) {
  console.log(`\n================  ${name}  (${list.length} in-scope products)  ================`);
  for (const [label, fn] of facets) {
    const vals = list.map(fn).filter(Boolean);
    const distinct = [...new Set(vals)];
    const pct = Math.round((vals.length / list.length) * 100);
    console.log(
      `  ${label.padEnd(22)} ${String(pct).padStart(3)}%  (${vals.length}/${list.length})  ` +
        `vals: ${distinct.slice(0, 8).map((v) => JSON.stringify(v)).join(", ")}${distinct.length > 8 ? " …" : ""}`
    );
  }
}

report("HEADPHONES", groups["Headphones"], [
  ["Wearing style", (p) => ov(p, "Wearing style")],
  ["Cup / back design", (p) => ov(p, "Cup style")],
  ["Driver type", (p) => ov(p, "Driver type") || spec(p, "Driver Type")],
  ["Connectivity", (p) => ov(p, "Connectivity")],
  ["Amp required", (p) => ov(p, "Amp required")],
  ["Connector (spec)", (p) => spec(p, "Connector")],
  ["Sensitivity (spec)", (p) => spec(p, "Sensitivity")],
  ["Input impedance (spec)", (p) => spec(p, "Input impedance")],
  ["Microphone (any)", (p) => spec(p, "Microphones") || ov(p, "Microphone")],
  ["Model #", (p) => ov(p, "Model")],
  ["UPC", (p) => ov(p, "UPC")],
]);

report("AUDIO ELECTRONICS", groups["Audio Electronics"], [
  ["Amplifier type", (p) => ov(p, "Amplifier type")],
  ["Portability", (p) => ov(p, "Portability")],
  ["Connectivity", (p) => ov(p, "Connectivity")],
  ["Balanced (spec)", (p) => spec(p, "Balanced")],
  ["Connector (spec)", (p) => spec(p, "Connector")],
  ["Gain (spec)", (p) => spec(p, "Gain")],
  ["Model #", (p) => ov(p, "Model")],
  ["UPC", (p) => ov(p, "UPC")],
]);

report("ACCESSORIES", groups["Accessories"], [
  ["Type (ov)", (p) => ov(p, "Type")],
  ["Connector (spec)", (p) => spec(p, "Connector")],
  ["Model #", (p) => ov(p, "Model")],
  ["UPC", (p) => ov(p, "UPC")],
]);

// distinct value dump for the clean enum-ish fields
console.log("\n=== distinct values for near-structured overviewFields (all in-scope) ===");
const inScope = [...groups.Headphones, ...groups["Audio Electronics"], ...groups.Accessories];
for (const t of ["Wearing style", "Cup style", "Driver type", "Connectivity", "Amplifier type", "Portability", "Amp required"]) {
  const d = [...new Set(inScope.map((p) => ov(p, t)).filter(Boolean))];
  console.log(`  ${t}: ${d.map((v) => JSON.stringify(v)).join(", ")}`);
}
