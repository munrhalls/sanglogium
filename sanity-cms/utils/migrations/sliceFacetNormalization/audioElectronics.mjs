// Turn 2 / Phase 2 -- normalize + backfill audio-electronics filterAttributes
// in the PRODUCTION dataset. Touches ONLY filterAttributes.deviceType,
// filterAttributes.inputs, filterAttributes.condition, via dotted-path
// patches inside a single transaction.
//
//   dry run:  node audioElectronics.mjs
//   write:    node audioElectronics.mjs --write
//
// --write refuses unless every doc to patch is an audio-electronics doc, and
// first saves a backup of the prior values of the changed fields to
// sanity-cms/backups/backup_audio-electronics_bulk_<ISO>.json.

import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readClient, writeClient } from './getClient.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WRITE = process.argv.includes('--write');

const VALID_INPUTS = new Set([
  'usb', 'optical', 'coaxial', 'rca', 'bluetooth', 'xlr-balanced',
  'phono-mm-mc', 'hdmi-earc', 'ethernet-lan', 'i2s-iis', 'aes-ebu',
]);

const COUNT_FIELDS = [
  'deviceType', 'formFactor', 'deviceConnectivity', 'inputs', 'amplification',
  'dacIncluded', 'balancedOutput', 'dsdSupport', 'dacChipsetFamily',
  'streamingPlatformSupport', 'bluetoothCodecs', 'condition',
];

const TURNTABLE_FIELDS = [
  'driveType', 'turntableOperation', 'speedsSupported',
  'phonoPreampBuiltIn', 'cartridgeIncluded', 'usbDigitalOutput',
];

function classifyDeviceType(name, fa) {
  if (/uniti|integrated/i.test(name)) return 'integrated-amplifier';
  if (/digital audio player|music player|\bDAP\b|\bplayer\b/i.test(name) && !/cd player|streamer/i.test(name))
    return 'digital-audio-player';
  if (/headphone amp|headphone\/pre|amplifier|\bamp\b|energizer|otl|tube amp/i.test(name))
    return 'headphone-amplifier';
  if (fa.amplification != null) return 'headphone-amplifier';
  return null;
}

function classifyCondition(name) {
  if (/open[- ]?box/i.test(name)) return 'open-box';
  if (/refurb/i.test(name)) return 'refurbished';
  return 'new';
}

function normalizeInputs(inputs) {
  const dropped = [];
  const out = [];
  for (const raw of inputs ?? []) {
    const v = raw === 'xlr' ? 'xlr-balanced' : raw;
    if (!VALID_INPUTS.has(v)) {
      dropped.push(raw);
      continue;
    }
    if (!out.includes(v)) out.push(v);
  }
  return { value: out, dropped };
}

async function main() {
  let docs = await readClient.fetch(
    `*[_type=="product" && "audio-electronics" in filterAttributes.category]{_id, name, filterAttributes}`,
  );
  if (docs.length < 200) {
    // Fallback: same fetch-all + client-side category test as
    // features/product-filtering/__tests__/proofs/ae-01-inventory-dump.mjs
    const all = await readClient.fetch(`*[_type=="product"]{_id, name, filterAttributes}`);
    docs = all.filter((p) => (p.filterAttributes?.category || []).includes('audio-electronics'));
  }
  console.log(`audio-electronics docs fetched: ${docs.length}`);

  // Live docs of ANY category holding turntable-only fields (for the report).
  const allDocs = await readClient.fetch(`*[_type=="product"]{filterAttributes}`);
  const turntableCounts = {};
  for (const f of TURNTABLE_FIELDS) {
    turntableCounts[f] = allDocs.filter((d) => d.filterAttributes?.[f] != null).length;
  }

  const patches = []; // {_id, name, set: {field: newVal}, before: {field: oldVal}}
  const unresolved = [];
  const perField = { deviceType: 0, inputs: 0, condition: 0 };

  for (const doc of docs) {
    const fa = doc.filterAttributes || {};
    const set = {};
    const before = {};

    if (fa.deviceType == null) {
      const dt = classifyDeviceType(doc.name || '', fa);
      if (dt == null) {
        unresolved.push({ _id: doc._id, name: doc.name });
      } else {
        set.deviceType = dt;
        before.deviceType = fa.deviceType ?? null;
      }
    }

    const { value: inputs, dropped } = normalizeInputs(fa.inputs);
    const changed =
      dropped.length > 0 ||
      inputs.length !== (fa.inputs ?? []).length ||
      inputs.some((v, i) => v !== (fa.inputs ?? [])[i]);
    if (fa.inputs != null && changed) {
      set.inputs = inputs;
      before.inputs = fa.inputs;
      for (const v of dropped) console.log(`  dropped input value "${v}" on ${doc.name} (${doc._id})`);
    }

    if (fa.condition == null) {
      set.condition = classifyCondition(doc.name || '');
      before.condition = fa.condition ?? null;
    }

    for (const k of Object.keys(set)) perField[k]++;
    if (Object.keys(set).length > 0) patches.push({ _id: doc._id, name: doc.name, set, before });
  }

  console.log('\n=== PATCH PLAN ===');
  console.log(`docs to patch per field: ${JSON.stringify(perField)}`);
  for (const p of patches) {
    for (const [field, newVal] of Object.entries(p.set)) {
      console.log(`  ${p.name} (${p._id}) ${field}: ${JSON.stringify(p.before[field])} -> ${JSON.stringify(newVal)}`);
    }
  }

  console.log('\n=== UNRESOLVED (no deviceType rule matched) ===');
  for (const u of unresolved) console.log(`  ${u.name} (${u._id})`);
  console.log(`unresolved: ${unresolved.length}`);

  // Apply patches in memory for the after-table.
  const after = docs.map((d) => {
    const p = patches.find((x) => x._id === d._id);
    return { ...d, filterAttributes: { ...(d.filterAttributes || {}), ...(p?.set || {}) } };
  });

  console.log('\n=== VALUE COUNTS (after patches) ===');
  for (const field of COUNT_FIELDS) {
    const counts = {};
    let missing = 0;
    for (const d of after) {
      const v = d.filterAttributes?.[field];
      if (v == null || (Array.isArray(v) && v.length === 0)) {
        missing++;
        continue;
      }
      for (const item of Array.isArray(v) ? v : [v]) {
        counts[item] = (counts[item] || 0) + 1;
      }
    }
    console.log(`  ${field}:`);
    for (const [val, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
      console.log(`    ${val}: ${n}`);
    }
    console.log(`    <missing>: ${missing}`);
  }

  console.log('\n=== TURNTABLE-ONLY FIELDS (live docs, any category, non-null) ===');
  for (const f of TURNTABLE_FIELDS) console.log(`  ${f}: ${turntableCounts[f]}`);

  if (!WRITE) {
    console.log('\nDry run only -- re-run with --write to apply.');
    return;
  }

  const bad = patches.filter((p) => {
    const d = docs.find((x) => x._id === p._id);
    return !(d?.filterAttributes?.category || []).includes('audio-electronics');
  });
  if (bad.length > 0) {
    console.error(`REFUSING TO WRITE: ${bad.length} doc(s) to patch are not audio-electronics:`);
    for (const b of bad) console.error(`  ${b.name} (${b._id})`);
    process.exit(1);
  }

  const backupDir = path.resolve(__dirname, '../../../backups');
  mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(
    backupDir,
    `backup_audio-electronics_bulk_${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
  );
  writeFileSync(
    backupPath,
    JSON.stringify(patches.map((p) => ({ _id: p._id, before: p.before })), null, 2),
  );
  console.log(`\nBackup written: ${backupPath}`);

  const tx = writeClient.transaction();
  for (const p of patches) {
    const setPatch = {};
    for (const [field, val] of Object.entries(p.set)) setPatch[`filterAttributes.${field}`] = val;
    tx.patch(p._id, (patch) => patch.set(setPatch));
  }
  const result = await tx.commit();
  console.log(`\nTransaction result: ${JSON.stringify(result)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
