#!/usr/bin/env node

import { createClient } from '@sanity/client';
import { config } from 'dotenv';

config();

function assertValue(v, errorMessage) {
  if (v === undefined) {
    throw new Error(errorMessage);
  }
  return v;
}

const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  "Missing environment variable: NEXT_PUBLIC_SANITY_DATASET"
);

const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  "Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID"
);

const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-14";

const token = assertValue(
  process.env.SANITY_STUDIO_READ_WRITE,
  "Missing environment variable: SANITY_STUDIO_READ_WRITE"
);

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});

async function addDigitalSourcesSlug() {
  console.log('Searching for "Digital Sources" catalogueItem...');

  const items = await client.fetch(
    `*[_type == "catalogueItem" && title == "Digital Sources"]{
      _id,
      title,
      type,
      slug,
      parent->{ _id, title }
    }`
  );

  if (!items || items.length === 0) {
    console.error('No "Digital Sources" catalogueItem found.');
    process.exit(1);
  }

  if (items.length > 1) {
    console.error(`Found ${items.length} items with title "Digital Sources". Expected exactly 1.`);
    process.exit(1);
  }

  const item = items[0];

  console.log(`Found: "${item.title}" (type: ${item.type}, id: ${item._id})`);
  console.log(`Parent: "${item.parent?.title}" (${item.parent?._id})`);

  if (item.slug?.current === 'digital-sources') {
    console.log('Slug "digital-sources" already set. No changes needed.');
    return;
  }

  if (item.slug?.current) {
    console.log(`WARNING: Item already has slug "${item.slug.current}". Overwriting with "digital-sources".`);
  }

  console.log('Patching slug to "digital-sources"...');

  await client
    .patch(item._id)
    .set({ slug: { _type: 'slug', current: 'digital-sources' } })
    .commit();

  console.log('Done. Slug "digital-sources" set on "Digital Sources" catalogueItem.');
}

addDigitalSourcesSlug().catch((error) => {
  console.error('Migration failed:', error.message);
  process.exit(1);
});
