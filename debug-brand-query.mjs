import { sanityFetch } from './sanity/lib/client.ts';
import groq from 'groq';

// Debug: Check actual brand names in products
const products = await sanityFetch({
  query: groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0][0...10] {
    name,
    brand->name,
    catalogueLocationKeys
  }`,
  params: { keys: ["o7c6baiuobsr7ni2y2vf22sh"] } // open-back key
});

console.log('Products in open-back category:');
products.forEach((p, i) => {
  console.log(`${i}: ${p.name} - Brand: "${p.brand?.name || 'null'}"`);
});

// Also check all brand documents
const brands = await sanityFetch({
  query: groq`*[_type == "brand"] {
    name,
    slug
  }`
});

console.log('\nAll brands in Sanity:');
brands.forEach((b, i) => {
  console.log(`${i}: "${b.name}" (slug: ${b.slug?.current})`);
});
