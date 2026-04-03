
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: '3o1znp54', // I need to find the real project ID
  dataset: 'production',
  useCdn: false,
  apiVersion: '2023-01-01',
});

// Since I don't know the project ID from here easily, 
// I'll check sanity.config.ts or .env
