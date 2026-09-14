import { createClient } from 'next-sanity';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-03',
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
});

const ids = [
  'PHPYj28HJdPDHAaIBAL1Lw',
  'Pn6oyV4Ks5AcNbecjh1b8Y',
  'ZuUKzmkqDyQwdcwhxlJkHG',
  'k27n1AQuIbSr5iozG2j6zk',
];

const query = `*[_type == "product" && _id in $ids]{
  _id,
  name,
  slug,
  brand->{ _id, name, slug },
  price_data,
  stock,
  reservedStock,
  catalogueLocationKeys,
  "sourceUrl": sourceUrl,
  "manufacturerUrl": manufacturerUrl,
  "productUrl": productUrl,
  "url": url,
  specifications,
  overviewFields,
  filterAttributes,
  _createdAt
}`;

const result = await client.fetch(query, { ids });
console.log(JSON.stringify(result, null, 2));
