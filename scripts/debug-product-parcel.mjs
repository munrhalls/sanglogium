/**
 * Debug: Fetch actual product parcel data
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { sanityFetch } from '../sanity-cms/lib/client.ts';
import groq from 'groq';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

async function main() {
  const productId = 'k27n1AQuIbSr5iozFz7FkW';
  
  console.log('Fetching product:', productId);
  
  const product = await sanityFetch({
    query: groq`*[_id == $productId] {
      _id,
      name,
      parcel {
        length,
        width,
        height,
        weight
      }
    }`,
    params: { productId }
  });
  
  console.log('Product data:');
  console.log(JSON.stringify(product, null, 2));
  
  if (product && product[0]) {
    const p = product[0];
    if (p.parcel) {
      const totalWeight = p.parcel.weight * 29;
      const totalVolume = p.parcel.length * p.parcel.width * p.parcel.height * 29;
      
      console.log('\n--- Calculations for quantity 29 ---');
      console.log(`Single item: ${p.parcel.weight}g, ${p.parcel.length}x${p.parcel.width}x${p.parcel.height}cm`);
      console.log(`Total weight: ${totalWeight}g (${totalWeight / 1000}kg)`);
      console.log(`Total volume: ${totalVolume} cm³`);
      console.log(`Max per package: 25kg, 99,000 cm³`);
      console.log(`Parcels by weight: ${Math.ceil(totalWeight / 25000)}`);
      console.log(`Parcels by volume: ${Math.ceil(totalVolume / 99000)}`);
    }
  }
}

main().catch(console.error);
