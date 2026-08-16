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

const dir = process.argv[2];
if (!dir) {
  console.error('usage: node force-patch.cjs <product-dir>');
  process.exit(1);
}

(async () => {
  const meta = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json')));
  const normalizedPath = path.join(dir, 'normalized.png');
  const asset = await client.assets.upload('image', fs.createReadStream(normalizedPath), { filename: meta._id + '-normalized.png' });
  const targetId = meta._id.replace(/^drafts\./, '');
  await client.patch(targetId).set({ image: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } } }).commit();
  meta.status = 'patched';
  meta.newAssetId = asset._id;
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 2));
  console.log('force-patched', targetId, asset._id);
})().catch((err) => { console.error(err); process.exit(1); });
