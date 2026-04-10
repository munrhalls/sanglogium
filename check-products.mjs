import { checkoutClient } from './sanity/lib/checkoutClient.js';
import { groq } from 'next-sanity';

async function checkProducts() {
  const query = groq`*[_type == "product"] { _id, name, stripePriceId }`;
  const products = await checkoutClient.fetch(query);
  console.log('Products in Sanity:');
  products.forEach(p => {
    console.log(`  ${p._id}: ${p.name} -> ${p.stripePriceId}`);
  });
}

checkProducts().catch(console.error);
