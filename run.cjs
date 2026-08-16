require('dotenv').config();
const { createClient } = require('@sanity/client');
const { normalize } = require('./normalize.cjs');
const fs = require('fs');
const path = require('path');
const https = require('https');

const client = createClient({
  projectId: '2tdmkpky',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_STUDIO_READ_WRITE,
  useCdn: false,
  perspective: 'published',
});

const BASE = './uniformizing-product-images-edge-to-content-dimensions';

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode !== 200) return reject(new Error('download failed: ' + res.statusCode));
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

const readMeta = (dir) => JSON.parse(fs.readFileSync(path.join(dir, 'meta.json')));
const writeMeta = (dir, meta) => fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 2));

async function processOne(dir) {
  const meta = readMeta(dir);
  if (meta.status === 'patched') return meta;

  console.log('processing', meta._id, meta.name);

  try {
    if (!meta.originalUrl) { meta.status = 'skipped_no_image'; writeMeta(dir, meta); return meta; }

    const ext = path.extname(new URL(meta.originalUrl).pathname) || '.png';
    const originalPath = path.join(dir, 'original' + ext);
    if (!fs.existsSync(originalPath)) await download(meta.originalUrl, originalPath);

    const normalizedPath = path.join(dir, 'normalized.png');
    const result = await normalize(originalPath, normalizedPath);
    meta.mode = result.mode;
    meta.marginPct = result.marginPct;

    const tol = 2;
    if (Math.abs(result.marginPct.L - result.marginPct.R) > tol || Math.abs(result.marginPct.T - result.marginPct.B) > tol) {
      meta.status = 'verify_failed';
      writeMeta(dir, meta);
      return meta;
    }
    meta.status = 'normalized';
    writeMeta(dir, meta);

    const asset = await client.assets.upload('image', fs.createReadStream(normalizedPath), { filename: meta._id + '-normalized.png' });
    const targetId = meta._id.replace(/^drafts\./, '');
    await client.patch(targetId).set({ image: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } } }).commit();

    meta.status = 'patched';
    meta.newAssetId = asset._id;
    writeMeta(dir, meta);
    return meta;
  } catch (err) {
    meta.status = 'error';
    meta.error = err.message;
    writeMeta(dir, meta);
    return meta;
  }
}

async function run() {
  const sectionDirs = fs.readdirSync(BASE, { withFileTypes: true }).filter(d => d.isDirectory());
  const dirs = sectionDirs.flatMap(section =>
    fs.readdirSync(path.join(BASE, section.name), { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(product => path.join(BASE, section.name, product.name))
  );

  const results = [];
  for (const dir of dirs) {
    results.push(await processOne(dir));
    await new Promise(res => setTimeout(res, 200));
  }

  const counts = {};
  for (const r of results) counts[r.status] = (counts[r.status] || 0) + 1;
  console.log('SUMMARY', counts);
  for (const r of results) if (r.status !== 'patched') console.log(r.status, r._id, r.name, r.error || '');
}

run().catch(console.error);
