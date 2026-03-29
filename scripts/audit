// Audit script to test actual product queries
import { getProductsByVfsKeys } from './sanity/lib/products/getProductsByVfsKeys.js';
import { resolveSlugToId, unrollDescendantKeys } from './data/catalogue.js';

async function auditProductQueries() {
  console.log('=== VFS Product Query Audit ===\n');
  
  const categories = [
    { slug: 'open-back', name: 'Open-Back Headphones' },
    { slug: 'closed-back', name: 'Closed-Back Headphones' },
    { slug: 'planar-magnetic', name: 'Planar Magnetic' },
    { slug: 'dynamic', name: 'Dynamic' },
    { slug: 'electrostatic', name: 'Electrostatic' },
    { slug: 'monitors-iems', name: 'Monitors (IEMs)' },
    { slug: 'true-wireless-tws', name: 'True Wireless (TWS)' },
    { slug: 'desktop-amps', name: 'Desktop Amps' },
    { slug: 'portable-amps', name: 'Portable Amps' },
    { slug: 'standalone-dacs', name: 'Standalone DACs' },
    { slug: 'dac-amp-combos', name: 'DAC/Amp Combos' },
    { slug: 'digital-players-daps', name: 'Digital Players (DAPs)' },
    { slug: 'network-streamers', name: 'Network Streamers' },
    { slug: 'headphone-cables', name: 'Headphone Cables' },
    { slug: 'interconnects', name: 'Interconnects' },
    { slug: 'adapters', name: 'Adapters' },
    { slug: 'earpads', name: 'Earpads' },
    { slug: 'care-cleaning', name: 'Care & Cleaning' },
    { slug: 'headphone-stands', name: 'Headphone Stands' },
    { slug: 'carrying-cases', name: 'Carrying Cases' },
  ];
  
  let totalProducts = 0;
  const results = [];
  
  for (const category of categories) {
    const id = resolveSlugToId(category.slug);
    const keys = unrollDescendantKeys(id);
    const products = await getProductsByVfsKeys(keys);
    
    totalProducts += products.length;
    results.push({
      category: category.name,
      slug: category.slug,
      id,
      keyCount: keys.length,
      productCount: products.length,
      products: products.map(p => p.name)
    });
    
    console.log(`${category.name}:`);
    console.log(`  Slug: ${category.slug}`);
    console.log(`  ID: ${id}`);
    console.log(`  Keys: ${keys.length}`);
    console.log(`  Products: ${products.length}`);
    if (products.length > 0) {
      console.log(`  Names: ${products.map(p => p.name).join(', ')}`);
    }
    console.log('');
  }
  
  console.log('=== SUMMARY ===');
  console.log(`Total Categories: ${categories.length}`);
  console.log(`Total Products Found: ${totalProducts}`);
  
  const categoriesWithProducts = results.filter(r => r.productCount > 0);
  const categoriesWithoutProducts = results.filter(r => r.productCount === 0);
  
  console.log(`\nCategories WITH products: ${categoriesWithProducts.length}`);
  console.log(`Categories WITHOUT products: ${categoriesWithoutProducts.length}`);
  
  if (categoriesWithoutProducts.length > 0) {
    console.log('\nCategories needing product assignment:');
    categoriesWithoutProducts.forEach(r => {
      console.log(`  - ${r.category} (${r.slug})`);
    });
  }
  
  // Check for products with no category assignment
  const { data: catalogueIndex } = await import('./data/catalogue-index.json', { assert: { type: 'json' } });
  const allVfsKeys = Object.keys(catalogueIndex.slotMetadataMap);
  console.log(`\nTotal VFS keys in manifest: ${allVfsKeys.length}`);
}

auditProductQueries().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
