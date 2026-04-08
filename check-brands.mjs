import { createClient } from '@sanity/client';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env.local') });

const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET,
  token: process.env.SANITY_STUDIO_READ_WRITE_CREATE,
  apiVersion: '2024-01-01',
  useCdn: false
});

const brands = await client.fetch('*[_type == "brand"] {_id, name}');
console.log('Available brands:');
brands.forEach(b => console.log(`  ${b._id}: ${b.name}`));
