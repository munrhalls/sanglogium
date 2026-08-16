require('dotenv').config();
const { createClient } = require('@sanity/client');
const fs = require('fs');
const path = require('path');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '2tdmkpky',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_STUDIO_READ_WRITE,
  useCdn: false,
  perspective: 'published',
});

const BASE = './uniformizing-product-images-edge-to-content-dimensions';

const ACCESSORY_SLOT_SLUGS = [
  'headphone-cables',
  'interconnects',
  'adapters',
  'earpads',
  'eartips',
  'care-cleaning',
  'headphone-stands',
  'carrying-cases',
];

async function resolveSlotIds() {
  const rows = await client.fetch(
    '*[_type == "catalogueItem" && slug.current in $slugs]{_id, "slug": slug.current}',
    { slugs: ACCESSORY_SLOT_SLUGS }
  );
  const map = {};
  for (const r of rows) map[r.slug] = r._id;
  return map;
}

async function getIems() {
  const data = await client.fetch(
    '*[_type == "homepageData"][0]{"iemsGallery": iemsGallery[]->{_id, name, "imageUrl": image.asset->url}}'
  );
  const list = data?.iemsGallery || [];
  return list.slice(0, 16);
}

async function getAccessories(slotIds) {
  const categories = [
    { key: 'cables', id: slotIds['headphone-cables'] },
    { key: 'interconnects', id: slotIds['interconnects'] },
    { key: 'adapters', id: slotIds['adapters'] },
    { key: 'earpads', id: slotIds['earpads'] },
    { key: 'eartips', id: slotIds['eartips'] },
    { key: 'careCleaning', id: slotIds['care-cleaning'] },
    { key: 'storage', id: slotIds['headphone-stands'] },
    { key: 'storage2', id: slotIds['carrying-cases'] },
  ];

  const all = [];
  for (const cat of categories) {
    if (!cat.id) continue;
    const q = cat.key === 'storage'
      ? '*[_type == "product" && ($id1 in catalogueLocationKeys || $id2 in catalogueLocationKeys)] | order(_createdAt desc){_id, name, "imageUrl": image.asset->url}'
      : '*[_type == "product" && $id in catalogueLocationKeys] | order(_createdAt desc){_id, name, "imageUrl": image.asset->url}';
    const params = cat.key === 'storage' ? { id1: cat.id, id2: slotIds['carrying-cases'] } : { id: cat.id };
    const rows = await client.fetch(q, params);
    all.push(...(rows || []));
  }
  return all;
}

function writeMeta(section, product) {
  if (!product._id) return;
  const dir = path.join(BASE, section, product._id);
  fs.mkdirSync(dir, { recursive: true });
  const meta = {
    _id: product._id,
    name: product.name,
    section,
    originalUrl: product.imageUrl,
    status: 'listed',
  };
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 2));
}

async function run() {
  fs.mkdirSync(BASE, { recursive: true });

  const [iems, slotIds] = await Promise.all([getIems(), resolveSlotIds()]);
  const accessories = await getAccessories(slotIds);

  let skipped = [];

  for (const p of iems) {
    if (!p.imageUrl) {
      skipped.push({ section: 'iems', ...p });
      continue;
    }
    writeMeta('iems', p);
  }

  const seen = new Set();
  for (const p of accessories) {
    if (seen.has(p._id)) continue;
    seen.add(p._id);
    if (!p.imageUrl) {
      skipped.push({ section: 'accessories', ...p });
      continue;
    }
    writeMeta('accessories', p);
  }

  console.log('iems:', iems.length, 'accessories:', accessories.length);
  if (skipped.length) {
    console.log('skipped (no imageUrl):', skipped.length);
    for (const s of skipped) console.log(' -', s.section, s._id, s.name);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
