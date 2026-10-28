// One-off script: brings the stored product data to what the filter code reads.
//   - filterAttributes.price is removed everywhere: the only price is price_data.unit_amount.
//   - channelCount stored as a number becomes the one-item list the schema declares (2 -> ["2.0"]).
//   - phonoStageBuiltIn stored as false becomes "none"; hiResCertification stored as false is removed (no certification).
//   - hiResCertification true on the two GUSTARD DACs (X30, X26 III) becomes ["mqa"]: their spec sheets list MQA and no Hi-Res Audio logo.
//   A value it cannot map (any other true, a number outside the schema's list) is printed as NOT FIXED and left alone.
// Dry run by default. With --apply: saves the old values to a backup file, then writes. The owner runs it manually.
// Run: node --env-file=/home/jan/work/sanglogium/.env.local scripts/fix-cms-contract-data.mjs
// Apply: node --env-file=/home/jan/work/sanglogium/.env.local scripts/fix-cms-contract-data.mjs --apply

import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { createClient } from '@sanity/client';

const APPLY = process.argv.includes('--apply');
const BACKUP = 'scripts/output/cms-contract-data-backup.json';
const CHANNEL_COUNTS = ['2.0', '2.1', '5.1', '7.1', '7.1.4'];
const MQA_DACS = ['xMEqvkRBbdrlJXyFG8fIQr', 'xMEqvkRBbdrlJXyFG8fkYr'];

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-14',
  token: process.env.SANITY_STUDIO_READ_WRITE,
  useCdn: false,
  perspective: 'raw',
});

const docs = await client.fetch(
  `*[_type == "product" && defined(filterAttributes)] | order(_id asc) { _id, "a": filterAttributes{ price, channelCount, phonoStageBuiltIn, hiResCertification } }`,
);

const changes = [];
const notFixed = [];
for (const doc of docs) {
  const _id = doc._id;
  const a = doc.a ?? {};
  const set = {};
  const unset = [];
  const before = {};
  const note = (key, from, to) => console.log(`${_id} | ${key} | ${JSON.stringify(from)} -> ${to}`);

  if (a.price !== undefined && a.price !== null) {
    before.price = a.price;
    unset.push('filterAttributes.price');
    note('price', a.price, 'removed');
  }
  if (typeof a.channelCount === 'number') {
    const text = a.channelCount.toFixed(1);
    if (CHANNEL_COUNTS.includes(text)) {
      before.channelCount = a.channelCount;
      set['filterAttributes.channelCount'] = [text];
      note('channelCount', a.channelCount, JSON.stringify([text]));
    } else notFixed.push(`${_id} | channelCount | ${JSON.stringify(a.channelCount)}`);
  }
  if (typeof a.phonoStageBuiltIn === 'boolean') {
    if (a.phonoStageBuiltIn === false) {
      before.phonoStageBuiltIn = false;
      set['filterAttributes.phonoStageBuiltIn'] = 'none';
      note('phonoStageBuiltIn', false, '"none"');
    } else notFixed.push(`${_id} | phonoStageBuiltIn | true`);
  }
  if (typeof a.hiResCertification === 'boolean') {
    if (a.hiResCertification === false) {
      before.hiResCertification = false;
      unset.push('filterAttributes.hiResCertification');
      note('hiResCertification', false, 'removed');
    } else if (MQA_DACS.includes(_id)) {
      before.hiResCertification = true;
      set['filterAttributes.hiResCertification'] = ['mqa'];
      note('hiResCertification', true, '["mqa"]');
    } else notFixed.push(`${_id} | hiResCertification | true`);
  }
  if (unset.length || Object.keys(set).length) changes.push({ id: _id, set, unset, before });
}

for (const line of notFixed) console.log(`NOT FIXED ${line}`);
console.log(`${changes.length} products to change, ${notFixed.length} not fixable`);

if (!APPLY) {
  console.log('dry run: nothing written. Add --apply to write.');
} else if (changes.length === 0) {
  console.log('nothing to change.');
} else if (existsSync(BACKUP)) {
  console.log(`backup file exists, move it away first: ${BACKUP}`);
  process.exit(1);
} else {
  mkdirSync('scripts/output', { recursive: true });
  writeFileSync(BACKUP, JSON.stringify(changes.map(({ id, before }) => ({ id, before })), null, 2));
  const tx = client.transaction();
  for (const { id, set, unset } of changes) {
    let patch = client.patch(id);
    if (Object.keys(set).length) patch = patch.set(set);
    if (unset.length) patch = patch.unset(unset);
    tx.patch(patch);
  }
  try {
    await tx.commit();
  } catch (error) {
    unlinkSync(BACKUP);
    throw error;
  }
  console.log(`changed ${changes.length} products`);
}
