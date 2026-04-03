
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: '2tdmkpky',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-11-26',
});

async function run() {
  const query = `*[_type == "product" && (
    name match $query ||
    brand->name match $query ||
    sku match $query ||
    specifications[].value match $query ||
    overviewFields[].value match $query
  )] | order(name asc) {
    _id,
    name,
    brand->{ name },
    sku,
    specifications,
    overviewFields
  }`;

  const params = { query: 'sony*' };
  const results = await client.fetch(query, params);

  console.log(`Found ${results.length} results for 'sony*'`);
  results.forEach(p => {
    console.log(`- [${p.brand?.name}] ${p.name} (ID: ${p._id})`);
    
    // Check where the match might be
    if (p.name.toLowerCase().includes('sony')) console.log('  -> Match in name');
    if (p.brand?.name?.toLowerCase().includes('sony')) console.log('  -> Match in brand name');
    if (p.sku?.toLowerCase().includes('sony')) console.log('  -> Match in SKU');
    
    p.specifications?.forEach(s => {
      if (s.value?.toLowerCase().includes('sony')) {
        console.log(`  -> Match in specification [${s.label}]: ${s.value}`);
      }
    });

    p.overviewFields?.forEach(f => {
      if (f.value?.toLowerCase().includes('sony')) {
        console.log(`  -> Match in overview field [${f.label}]: ${f.value}`);
      }
    });
  });
}

run().catch(console.error);
