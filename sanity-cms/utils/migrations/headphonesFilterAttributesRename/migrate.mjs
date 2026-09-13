import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { readClient, writeClient } from "./getClient.mjs";

// Data migration for sang-logium-1xs.9.20 (AC bullet 3): move existing
// headphones product documents off the superseded field names
// (backDesign -> acousticDesign, connector -> cableTermination,
// noiseCancelling boolean -> anc enum). See
// docs/filters-sort/headphones-filterattributes-migration.md for the exact
// value mapping and the noiseCancelling -> anc heuristic.
//
//   node migrate.mjs            # dry run (no writes) — review the diff
//   node migrate.mjs --write    # back up each doc, then set new + unset old

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKUP_DIR = path.resolve(__dirname, "../../../backups");

const ACOUSTIC_MAP = { open: "open-back", closed: "closed-back", "semi-open": "semi-open" };
const CABLE_MAP = { "2.5mm": "2.5mm-balanced" };

function mapAcousticDesign(old) {
  if (old === undefined || old === null) return undefined;
  // Old field was a string; new field is array<string>.
  const mapped = ACOUSTIC_MAP[old] ?? old;
  return [mapped];
}

function mapCableTermination(old) {
  if (!Array.isArray(old)) return undefined;
  return old.map((v) => CABLE_MAP[v] ?? v);
}

function mapAnc(noiseCancelling, acoustic) {
  if (noiseCancelling === undefined || noiseCancelling === null) return undefined;
  if (noiseCancelling === true) return "anc";
  // false -> passive unless the design is open/semi-open, then none.
  const a = Array.isArray(acoustic) ? acoustic[0] : acoustic;
  if (a === "open" || a === "open-back" || a === "semi-open") return "none";
  return "passive";
}

const OLD_FIELDS = ["backDesign", "connector", "noiseCancelling"];
const NEW_FIELDS = ["acousticDesign", "cableTermination", "anc"];

// Scope: only docs whose filterAttributes.category includes "headphones".
// A handful of docs carry a legacy headphone field but are NOT in the
// headphones category — e.g. the TEAC UD-701N (audio-electronics) has a stray
// `connector`, and ~15 real headphones are missing their category metadata.
// Those are deliberately NOT migrated here (AC bullet 4: non-headphones
// unchanged). The category check is done in JS (not GROQ `in`, which is
// unreliable on a null category value).
const QUERY = `*[_type == "product" && (
  defined(filterAttributes.backDesign) ||
  defined(filterAttributes.connector) ||
  defined(filterAttributes.noiseCancelling)
)]{ _id, name, "fa": filterAttributes }`;

function isHeadphones(doc) {
  const cat = doc.fa?.category;
  if (Array.isArray(cat)) return cat.includes("headphones");
  return cat === "headphones";
}


function plan(doc) {
  const fa = doc.fa ?? {};
  const hasNew = NEW_FIELDS.some((f) => fa[f] !== undefined);
  const set = {};
  const unset = [];

  if (!hasNew) {
    const acoustic = mapAcousticDesign(fa.backDesign);
    if (acoustic !== undefined) set["filterAttributes.acousticDesign"] = acoustic;
    const cable = mapCableTermination(fa.connector);
    if (cable !== undefined) set["filterAttributes.cableTermination"] = cable;
    const anc = mapAnc(fa.noiseCancelling, fa.backDesign ?? fa.acousticDesign);
    if (anc !== undefined) set["filterAttributes.anc"] = anc;
  }

  for (const f of OLD_FIELDS) {
    if (fa[f] !== undefined) unset.push(`filterAttributes.${f}`);
  }

  return { set, unset, hasNew };
}

async function main() {
  const write = process.argv.includes("--write");
  const allDocs = await readClient.fetch(QUERY);
  const docs = allDocs.filter(isHeadphones);
  const excluded = allDocs.filter((d) => !isHeadphones(d));

  console.log(
    `\n🎧 ${write ? "MIGRATE (WRITE)" : "MIGRATE (DRY RUN)"} — ${docs.length} headphones document(s) carrying >=1 legacy field\n`
  );

  let wouldSet = 0;
  let wouldUnsetOnly = 0;
  let noop = 0;

  for (const d of docs) {
    const { set, unset, hasNew } = plan(d);
    const setKeys = Object.keys(set);
    if (setKeys.length === 0 && unset.length === 0) {
      noop++;
      continue;
    }
    if (setKeys.length > 0) wouldSet++;
    else wouldUnsetOnly++;

    console.log(`\n${d._id} | ${d.name}`);
    for (const [k, v] of Object.entries(set)) {
      console.log(`   + ${k} = ${JSON.stringify(v)}`);
    }
    for (const u of unset) {
      console.log(`   - ${u} (unset${hasNew ? " — new field already present" : ""})`);
    }

    if (write) {
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupPath = path.join(BACKUP_DIR, `backup_headphones_${d._id}_${stamp}.json`);
      await fs.writeFile(
        backupPath,
        JSON.stringify({ _id: d._id, name: d.name, before: d.fa, backedUpAt: new Date().toISOString() }, null, 2)
      );
      let patch = writeClient.patch(d._id);
      if (setKeys.length) patch = patch.set(set);
      if (unset.length) patch = patch.unset(unset);
      const res = await patch.commit();
      console.log(`   ✅ migrated. rev: ${res._rev}`);
    }
  }

  console.log(
    `\nSummary: ${docs.length} total | ${wouldSet} will migrate (set new + unset old) | ${wouldUnsetOnly} will only unset orphaned old fields | ${noop} no-op`
  );

  if (excluded.length) {
    console.log(
      `\n⚠️  ${excluded.length} doc(s) carry a legacy field but are NOT headphones-category (left untouched):`
    );
    for (const d of excluded) {
      const fa = d.fa ?? {};
      const legacy = OLD_FIELDS.filter((f) => fa[f] !== undefined)
        .map((f) => `${f}=${JSON.stringify(fa[f])}`)
        .join(", ");
      console.log(`   - ${d._id} | ${d.name} | ${legacy}`);
    }
  }

  if (!write) {
    console.log("\n(dry run only — no writes made. Review, then re-run with --write.)");
  }
}

main().catch((e) => {
  console.error(`\n❌ ${e.message}`);
  process.exit(1);
});
