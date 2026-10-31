// One-off: put the always-on list into the picklist document, so the CMS holds every field that becomes a control.
// Run once by the owner, then this file is deleted.
// node --env-file=/home/jan/work/sanglogium/.env.local tools/set-picklist-always-on.mjs --apply
// Exit 0 done (or already set). Exit 1 refused, nothing written. Exit 2 could not read or write.

const ALWAYS_ON = ['brand', 'price_data.unit_amount', 'stock'];
const env = process.env;
const host = `https://${env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v${env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-14'}/data`;
const dataset = env.NEXT_PUBLIC_SANITY_DATASET || 'production';

async function readDocs() {
  const query = '*[_id in ["filterPicklist", "drafts.filterPicklist"]]{ _id, _rev, alwaysOn }';
  const res = await fetch(`${host}/query/${dataset}?query=${encodeURIComponent(query)}`, { headers: { Authorization: `Bearer ${env.SANITY_API_READ_TOKEN}` } });
  if (!res.ok) throw new Error(`read failed: HTTP ${res.status}`);
  return (await res.json()).result;
}

try {
  if (!process.argv.includes('--apply')) {
    console.error('Refused: run with --apply.');
    process.exit(1);
  }
  const docs = await readDocs();
  const live = docs.find((d) => d._id === 'filterPicklist');
  if (!live) throw new Error('no published filterPicklist document');
  if (docs.some((d) => d._id === 'drafts.filterPicklist')) {
    console.error('Refused: a draft of the picklist is open in Studio. Publish or discard it first; publishing it would overwrite this write.');
    process.exit(1);
  }
  if (JSON.stringify(live.alwaysOn) === JSON.stringify(ALWAYS_ON)) {
    console.log('already set:', ALWAYS_ON.join(', '));
  } else {
    const res = await fetch(`${host}/mutate/${dataset}?visibility=sync`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.SANITY_STUDIO_READ_WRITE}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ mutations: [{ patch: { id: 'filterPicklist', ifRevisionID: live._rev, set: { alwaysOn: ALWAYS_ON } } }] }),
    });
    if (!res.ok) throw new Error(`write failed: HTTP ${res.status} ${await res.text()}`);
    const after = (await readDocs()).find((d) => d._id === 'filterPicklist');
    if (JSON.stringify(after?.alwaysOn) !== JSON.stringify(ALWAYS_ON)) throw new Error(`written, but the document now holds ${JSON.stringify(after?.alwaysOn)}`);
    console.log('set:', ALWAYS_ON.join(', '));
  }
} catch (e) {
  console.error(`FAILED: ${e.message}`);
  process.exit(2);
}
