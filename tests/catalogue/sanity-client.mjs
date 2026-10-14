// Minimal Sanity client for the catalogue proof scripts in this folder ONLY.
// Deliberately does not import app code — nothing in a proof chain depends on
// the code under test.
import { createClient } from '@sanity/client';

process.loadEnvFile(new URL('../../.env.local', import.meta.url));

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-14',
  useCdn: false,
  perspective: 'published',
  token: process.env.SANITY_STUDIO_READ_WRITE,
});
