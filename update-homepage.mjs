import { createClient } from '@sanity/client';
import { readFile } from 'fs/promises';
import 'dotenv/config';

const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_STUDIO_READ_WRITE_CREATE,
  useCdn: false,
  apiVersion: '2024-11-26'
});

async function updateHomepage() {
  try {
    const payloadData = JSON.parse(await readFile('payload.json', 'utf8'));
    const result = await client.patch('homepageData').set(payloadData).commit();
    console.log('Update successful:', result._id);
  } catch (error) {
    console.error('Update failed:', error.message);
  }
}

updateHomepage();
