import 'dotenv/config';
import { createClient } from '@sanity/client';
import fs from 'fs';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_STUDIO_READ_WRITE || process.env.SANITY_API_TOKEN,
  useCdn: false,
});

(async () => {
  const doc = await client.fetch(
    `*[_type == "product" && (name match "*Pi7 S2*" || title match "*Pi7 S2*")][0]{_id, name, title, mainImage, image}`
  );
  if (!doc) throw new Error('No product matched "*Pi7 S2*" under _type "product" — check the _type name or title/name spelling.');

  const field = doc.mainImage ? 'mainImage' : doc.image ? 'image' : null;
  if (!field) throw new Error(`Neither mainImage nor image exists on doc ${doc._id} — inspect the doc and fix the field name.`);

  const asset = await client.assets.upload(
    'image',
    fs.createReadStream('./image-task/normalized/pi7-s2-normalized.png'),
    { filename: 'pi7-s2-normalized.png' }
  );

  const targetId = doc._id.replace(/^drafts\./, '');
  await client
    .patch(targetId)
    .set({ [field]: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } } })
    .commit();

  console.log('OK — field:', field, '| new asset:', asset._id, '| doc:', targetId);
})().catch((err) => {
  console.error('FAILED:', err.message);
  process.exit(1);
});
