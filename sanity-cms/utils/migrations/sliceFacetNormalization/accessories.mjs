// Accessories slice-facet normalization migration.
// Usage: node accessories.mjs          -> dry run (diffs + report tables)
//        node accessories.mjs --write  -> backup, then apply in one transaction
// Idempotent: after a successful --write, a dry run reports 0 docs to patch.

import { readClient as client, writeClient } from "./getClient.mjs";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WRITE = process.argv.includes("--write");
const BACKUP_DIR = path.resolve(__dirname, "../../../backups");

const ACCESSORY_TYPE_VOCAB = [
  "cables-interconnects",
  "replacement-parts",
  "cases-storage-transport",
  "adapters-converters",
  "cleaning-maintenance",
  "stands-isolation",
];
const COMPAT_PRODUCT_TYPE_ALLOWED = ["headphone", "speaker", "amplifier-source", "universal-any"];
const CABLE_FUNCTION_VOCAB = [
  "headphone-cable",
  "interconnect-rca-xlr",
  "digital-usb-coaxial-optical-aes-ebu-ethernet",
];
const CONNECTOR_TERMINATION_VOCAB = [
  "rca", "xlr", "3.5mm", "2.5mm", "4.4mm", "6.35mm", "4-pin-mini-xlr", "mini-to-rca",
];
const CONDUCTOR_MATERIAL_VOCAB = ["copper-ofc", "silver", "silver-plated-copper"];
const BALANCED_VOCAB = ["balanced", "unbalanced"];
const PART_TYPE_VOCAB = ["ear-pads-cushions", "ear-tips"];

const ACCESSORY_TYPE_ALIAS = {
  "cases-storage": "cases-storage-transport",
  earpad: "replacement-parts",
  eartip: "replacement-parts",
  stand: "stands-isolation",
  cable: "cables-interconnects",
};

const ACCESSORY_TYPE_NAME_RULES = [
  [/cable|interconnect|\bcord\b|\blead\b/i, "cables-interconnects"],
  [/ear ?pad|ear ?tip|eartip|iem[- ]?tips?|cushion|foam tip|replacement/i, "replacement-parts"],
  [/clean|brush|cloth|wipe|fluid|spray/i, "cleaning-maintenance"],
  [/\bcase\b|pouch|\bbag\b|sleeve|carrying|storage/i, "cases-storage-transport"],
  [/stand|hanger|holder|\bhook\b|isolation|\bfeet\b/i, "stands-isolation"],
  [/adapter|adaptor|converter|dongle|splitter/i, "adapters-converters"],
];

const CABLE_FUNCTION_NAME_RULES = [
  [/usb|digital|coaxial|optical|aes|ethernet|i2s|hdmi/i, "digital-usb-coaxial-optical-aes-ebu-ethernet"],
  [/speaker/i, "speaker-cable"],
  [/interconnect|\brca\b|mini[- ]?to[- ]?mini/i, "interconnect-rca-xlr"],
  [/headphone|heddphone|utopia|iem|earphone|earbud|mmcx|2-?pin|pentaconn|4-?pin|mini[- ]?xlr|4\.4|3\.5|2\.5|6\.35|upgrade cable|balanced cable|modular cable|magia/i, "headphone-cable"],
];

function classify(name, rules) {
  for (const [re, value] of rules) if (re.test(name)) return value;
  return undefined;
}

const isEmpty = (v) => v === null || v === undefined || (Array.isArray(v) && v.length === 0);

async function main() {
  const docs = await client.fetch(
    `*[_type == "product" && "accessories" in filterAttributes.category]{ _id, name, filterAttributes }`
  );
  // Safety net: query guarantees category, but re-check before patching anyway.
  const targets = docs.filter((d) =>
    (d.filterAttributes?.category ?? []).includes("accessories")
  );
  console.log(`Fetched ${docs.length} docs, ${targets.length} confirmed accessories.`);

  const patches = []; // {id, name, sets: {dottedPath: value}}
  const unresolved = [];
  const dropped = []; // {id, name, field, value}
  const fieldCounts = {}; // field -> docs patched
  const bump = (f) => (fieldCounts[f] = (fieldCounts[f] ?? 0) + 1);
  const diffLines = [];

  function patch(doc, field, value) {
    let p = patches.find((p) => p.id === doc._id);
    if (!p) patches.push((p = { id: doc._id, name: doc.name, sets: {} }));
    p.sets[`filterAttributes.${field}`] = value;
    bump(field);
    diffLines.push(`${doc.name}: ${field} -> ${JSON.stringify(value)}`);
  }

  for (const doc of targets) {
    const fa = doc.filterAttributes ?? {};
    const name = doc.name ?? doc._id;

    // 3a. accessoryType
    let accType = fa.accessoryType;
    if (accType in ACCESSORY_TYPE_ALIAS) {
      accType = ACCESSORY_TYPE_ALIAS[accType];
      patch(doc, "accessoryType", accType);
    } else if (isEmpty(accType)) {
      const c = classify(name, ACCESSORY_TYPE_NAME_RULES);
      if (c) {
        accType = c;
        patch(doc, "accessoryType", c);
      } else {
        unresolved.push(`${name}: accessoryType unclassifiable`);
      }
    }

    // 3b. compatibleProductType
    if (!isEmpty(fa.compatibleProductType)) {
      const raw = Array.isArray(fa.compatibleProductType)
        ? fa.compatibleProductType
        : [fa.compatibleProductType];
      const normalized = [];
      let changed = !Array.isArray(fa.compatibleProductType);
      for (const v of raw) {
        let nv = typeof v === "string" ? v.toLowerCase() : v;
        if (nv === "universal") nv = "universal-any";
        if (COMPAT_PRODUCT_TYPE_ALLOWED.includes(nv)) {
          if (!normalized.includes(nv)) normalized.push(nv);
          if (nv !== v) changed = true;
        } else {
          changed = true;
          dropped.push(`${name}: dropped compatibleProductType "${v}"`);
        }
      }
      if (changed) patch(doc, "compatibleProductType", normalized);
    }

    // 3c. scalar -> single-element array for array-typed fields
    // (cableFunction handled in 3e so coercion + vocab mapping land in one set)
    for (const f of ["connectorTermination", "conductorMaterial"]) {
      if (!isEmpty(fa[f]) && !Array.isArray(fa[f])) patch(doc, f, [fa[f]]);
    }

    // 3d. partType
    if (typeof fa.partType === "string") {
      const lower = fa.partType.toLowerCase();
      if (lower === "ear pads/cushions") patch(doc, "partType", "ear-pads-cushions");
      else if (lower === "ear tips") patch(doc, "partType", "ear-tips");
      else if (!PART_TYPE_VOCAB.includes(fa.partType))
        dropped.push(`${name}: partType "${fa.partType}" not in schema vocab (left as-is)`);
    }

    // 3e. cableFunction (only for cables-interconnects after 3a)
    if (accType === "cables-interconnects") {
      const orig = fa.cableFunction;
      const mapped = (Array.isArray(orig) ? orig : [orig])
        .filter((v) => !isEmpty(v))
        .map((v) =>
          v === "interconnect" ? "interconnect-rca-xlr"
          : v === "digital" ? "digital-usb-coaxial-optical-aes-ebu-ethernet"
          : v
        );
      if (
        mapped.length &&
        (!Array.isArray(orig) || mapped.some((v, i) => v !== orig[i]))
      ) {
        patch(doc, "cableFunction", mapped);
      } else if (!mapped.length) {
        const c = classify(name, CABLE_FUNCTION_NAME_RULES);
        if (c) patch(doc, "cableFunction", [c]);
        else unresolved.push(`${name}: cableFunction unclassifiable (cables-interconnects)`);
      }
    }

    // 3e2. balancedUnbalanced alias
    if (fa.balancedUnbalanced === "true" || fa.balancedUnbalanced === true)
      patch(doc, "balancedUnbalanced", "balanced");

    // 3f. condition
    if (isEmpty(fa.condition)) {
      const c = /open[- ]?box/i.test(name)
        ? "open-box"
        : /refurb/i.test(name)
        ? "refurbished"
        : "new";
      patch(doc, "condition", c);
    }
  }

  console.log(`\n=== DOCS TO PATCH: ${patches.length} ===`);
  for (const [f, n] of Object.entries(fieldCounts).sort()) console.log(`  ${f}: ${n} docs`);
  console.log(`\n=== DIFFS ===`);
  for (const l of diffLines) console.log(`  ${l}`);
  if (dropped.length) {
    console.log(`\n=== DROPPED / OUT-OF-VOCAB ===`);
    for (const l of dropped) console.log(`  ${l}`);
  }
  if (unresolved.length) {
    console.log(`\n=== UNRESOLVED (${unresolved.length}) ===`);
    for (const l of unresolved) console.log(`  ${l}`);
  }

  // ---- In-memory post-patch report ----
  const post = targets.map((d) => {
    const fa = JSON.parse(JSON.stringify(d.filterAttributes ?? {}));
    const p = patches.find((p) => p.id === d._id);
    if (p) for (const [k, v] of Object.entries(p.sets)) fa[k.split(".")[1]] = v;
    return { name: d.name, fa };
  });
  const cables = post.filter((p) => p.fa.accessoryType === "cables-interconnects");
  const parts = post.filter((p) => p.fa.accessoryType === "replacement-parts");

  const table = (label, rows, field, vocab) => {
    const counts = {};
    let missing = 0;
    for (const r of rows) {
      const v = r.fa[field];
      if (isEmpty(v)) missing++;
      else for (const x of Array.isArray(v) ? v : [v]) counts[x] = (counts[x] ?? 0) + 1;
    }
    console.log(`\n--- ${label} (${field}, n=${rows.length}, missing=${missing}) ---`);
    for (const [v, n] of Object.entries(counts).sort()) {
      const flag = vocab && !vocab.includes(v) ? "  <-- NOT IN VOCAB" : "";
      console.log(`  ${v}: ${n}${flag}`);
    }
    if (missing) console.log(`  (missing): ${missing}`);
  };

  table("accessoryType", post, "accessoryType", ACCESSORY_TYPE_VOCAB);
  table("compatibleProductType", post, "compatibleProductType", COMPAT_PRODUCT_TYPE_ALLOWED);
  table("cableFunction (cables)", cables, "cableFunction", CABLE_FUNCTION_VOCAB);
  table("connectorTermination (cables)", cables, "connectorTermination", CONNECTOR_TERMINATION_VOCAB);
  table("conductorMaterial (cables)", cables, "conductorMaterial", CONDUCTOR_MATERIAL_VOCAB);
  table("balancedUnbalanced (cables)", cables, "balancedUnbalanced", BALANCED_VOCAB);
  table("partType (replacement-parts)", parts, "partType", PART_TYPE_VOCAB);
  table("condition", post, "condition", ["new", "open-box", "refurbished"]);

  const lengths = cables.map((c) => c.fa.lengthM).filter((v) => typeof v === "number");
  console.log(
    `\n--- lengthM (cables): count=${lengths.length}` +
      (lengths.length ? `, min=${Math.min(...lengths)}, max=${Math.max(...lengths)}` : "") +
      " ---"
  );

  // Zero-data check on unrelated accessoryType-domain fields (any category).
  const zeroFields = ["powerProductType", "outletCount", "powerConnectorType", "treatmentType", "mounting"];
  for (const f of zeroFields) {
    const n = await client.fetch(
      `count(*[_type == "product" && defined(filterAttributes.${f})])`
    );
    console.log(`zero-data check: filterAttributes.${f} non-null on ${n} docs (any category)`);
  }

  if (!WRITE) {
    console.log(`\nDry run complete. Re-run with --write to apply ${patches.length} doc patches.`);
    return;
  }
  if (!patches.length) {
    console.log(`\nNothing to write.`);
    return;
  }

  await fs.mkdir(BACKUP_DIR, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(BACKUP_DIR, `backup_accessories_bulk_${ts}.json`);
  await fs.writeFile(backupPath, JSON.stringify(targets, null, 2));
  console.log(`\nBackup written: ${backupPath} (${targets.length} docs)`);

  const tx = writeClient.transaction();
  for (const p of patches) tx.patch(p.id, (pt) => pt.set(p.sets));
  await tx.commit();
  console.log(`Committed ${patches.length} doc patches in one transaction.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
