require('dotenv').config();
const { createClient } = require('@sanity/client');
const fs = require('fs');
const path = require('path');

const client = createClient({
  projectId: '2tdmkpky',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_STUDIO_READ_WRITE,
  useCdn: false,
  perspective: 'published',
});

const BASE = './uniformizing-product-images-edge-to-content-dimensions';

function loadMetas() {
  const metas = [];
  for (const section of ['iems', 'accessories']) {
    const sectionDir = path.join(BASE, section);
    if (!fs.existsSync(sectionDir)) continue;
    for (const prod of fs.readdirSync(sectionDir, { withFileTypes: true }).filter(d => d.isDirectory())) {
      const m = JSON.parse(fs.readFileSync(path.join(sectionDir, prod.name, 'meta.json')));
      metas.push(m);
    }
  }
  return metas;
}

async function verify() {
  const metas = loadMetas();
  const metaMap = new Map(metas.map(m => [m._id, m]));
  const ids = metas.map(m => m._id);
  const rows = await client.fetch('*[_id in $ids]{_id, "imageAsset": image.asset->_id}', { ids });
  let ok = 0, mismatch = [];
  for (const r of rows) {
    const m = metaMap.get(r._id);
    if (r.imageAsset === m.newAssetId) ok++;
    else mismatch.push({ _id: r._id, name: m.name, expected: m.newAssetId, got: r.imageAsset });
  }
  console.log('ok:', ok, 'mismatch:', mismatch.length);
  for (const x of mismatch) console.log('MISMATCH', x);
}

verify().catch(err => { console.error(err); process.exit(1); });
