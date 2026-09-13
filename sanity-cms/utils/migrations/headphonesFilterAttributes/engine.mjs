import { readClient, writeClient } from "./getClient.mjs";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Shared engine for sang-logium-1xs.9's per-brand headphones sourcing issues.
// One product per patch. Every agent working a different product/brand issue
// imports this file as-is and supplies only a small product-spec file (see
// products/_template.mjs) — do not fork or duplicate this file per product.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKUP_DIR = path.resolve(__dirname, "../../../backups");

function diffLine(fieldName, oldVal, newVal) {
  const o = JSON.stringify(oldVal ?? null);
  const n = JSON.stringify(newVal ?? null);
  return o === n
    ? `   = ${fieldName}: unchanged (${n})`
    : `   ~ ${fieldName}: ${o} -> ${n}`;
}

/**
 * @param {object} spec - see products/_template.mjs for the required shape.
 * @param {object} opts
 * @param {boolean} opts.write - false (default) = dry run only, no Sanity writes.
 */
export async function runProductPatch(spec, { write = false } = {}) {
  const { productId, brand, name, beadsIssue, filterAttributes, sourcing } = spec;

  if (!productId) throw new Error("productSpec.productId is required");
  if (!filterAttributes || Object.keys(filterAttributes).length === 0) {
    throw new Error("productSpec.filterAttributes must have at least one field");
  }

  console.log(
    `\n🎧 ${write ? "PATCH (WRITE)" : "DRY RUN"} — ${brand ?? "?"} ${name ?? ""} (${productId})`
  );
  if (beadsIssue) console.log(`   beads issue: ${beadsIssue}`);

  const current = await readClient.fetch(
    `*[_id == $id][0]{ _id, name, "currentFilterAttributes": filterAttributes }`,
    { id: productId }
  );

  if (!current) {
    throw new Error(
      `No Sanity product found for _id "${productId}" in dataset "${process.env.SANITY_STUDIO_DATASET}". Check the _id before proceeding.`
    );
  }

  if (name && current.name) {
    const specFirstWord = name.toLowerCase().split(" ")[0];
    if (!current.name.toLowerCase().includes(specFirstWord)) {
      console.log(
        `   ⚠️  NAME MISMATCH: Sanity has "${current.name}", spec says "${name}" for this _id. ` +
          `Verify productId before running --write.`
      );
    }
  }

  const before = current.currentFilterAttributes ?? {};

  console.log("\n   Field diff (filterAttributes.*):");
  for (const [field, newVal] of Object.entries(filterAttributes)) {
    console.log(diffLine(field, before[field], newVal));
  }

  if (sourcing?.length) {
    console.log(
      `\n   Sourcing: ${sourcing.length} citation entr${sourcing.length === 1 ? "y" : "ies"} will be set/merged into filterAttributes.sourcing`
    );
    for (const s of sourcing) {
      console.log(`   - ${s.field} [${s.tier}] <- ${s.url}`);
    }
  }

  if (!write) {
    console.log(
      "\n   (dry run only — no writes made. Review the diff above, then re-run with --write.)"
    );
    return { dryRun: true, productId, before, after: filterAttributes };
  }

  await fs.mkdir(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(BACKUP_DIR, `backup_headphones_${productId}_${stamp}.json`);
  await fs.writeFile(
    backupPath,
    JSON.stringify({ productId, before, backedUpAt: new Date().toISOString() }, null, 2)
  );
  console.log(`   💾 backed up prior filterAttributes -> ${backupPath}`);

  const setPayload = {};
  for (const [field, value] of Object.entries(filterAttributes)) {
    setPayload[`filterAttributes.${field}`] = value;
  }

  if (sourcing?.length) {
    const existingSourcing = before.sourcing ?? [];
    const touchedFields = new Set(sourcing.map((s) => s.field));
    const keep = existingSourcing.filter((e) => !touchedFields.has(e.field));
    setPayload["filterAttributes.sourcing"] = [...keep, ...sourcing];
  }

  const result = await writeClient.patch(productId).set(setPayload).commit();
  console.log(`   ✅ patched. rev: ${result._rev}`);
  return { dryRun: false, productId, rev: result._rev, backupPath };
}
