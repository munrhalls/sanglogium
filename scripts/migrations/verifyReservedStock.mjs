#!/usr/bin/env node

/**
 * Verification script for reservedStock field migration
 * Usage: node scripts/migrations/verifyReservedStock.mjs [--count] [--full]
 */

import { createClient } from "@sanity/client";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2023-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

const COUNT_ONLY = process.argv.includes('--count');
const FULL_REPORT = process.argv.includes('--full');

async function main() {
  console.log('🔍 Reserved Stock Verification');
  
  // Count products without reservedStock
  const missingQuery = `count(*[_type == "product" && !defined(reservedStock)])`;
  const missingCount = await client.fetch(missingQuery);
  
  // Count total products
  const totalQuery = `count(*[_type == "product"])`;
  const totalCount = await client.fetch(totalQuery);
  
  // Count products with reservedStock
  const withQuery = `count(*[_type == "product" && defined(reservedStock)])`;
  const withCount = await client.fetch(withQuery);
  
  console.log('\n📊 Summary:');
  console.log(`  Total products: ${totalCount}`);
  console.log(`  With reservedStock: ${withCount}`);
  console.log(`  Missing reservedStock: ${missingCount}`);
  
  if (COUNT_ONLY) {
    console.log(`\n${missingCount}`);
    return;
  }
  
  if (missingCount > 0) {
    console.log('\n❌ Products still missing reservedStock:');
    
    const missingProducts = await client.fetch(
      `*[_type == "product" && !defined(reservedStock)] {_id, name, stock} | order(name)`
    );
    
    missingProducts.forEach(p => {
      console.log(`  - ${p.name} (${p._id})`);
    });
  } else {
    console.log('\n✅ All products have reservedStock field!');
  }
  
  if (FULL_REPORT) {
    console.log('\n📋 Full Report - Reserved Stock Values:');
    
    const allProducts = await client.fetch(
      `*[_type == "product"] {_id, name, stock, reservedStock} | order(name)`
    );
    
    // Group by reservedStock value
    const groups = allProducts.reduce((acc, product) => {
      const value = product.reservedStock || 'missing';
      if (!acc[value]) acc[value] = [];
      acc[value].push(product);
      return acc;
    }, {});
    
    Object.entries(groups).forEach(([value, products]) => {
      console.log(`\n  reservedStock = ${value}: ${products.length} products`);
      if (FULL_REPORT && products.length <= 10) {
        products.forEach(p => {
          console.log(`    - ${p.name} (stock: ${p.stock || 0})`);
        });
      } else if (FULL_REPORT && products.length > 10) {
        products.slice(0, 5).forEach(p => {
          console.log(`    - ${p.name} (stock: ${p.stock || 0})`);
        });
        console.log(`    ... and ${products.length - 5} more`);
      }
    });
  }
}

main().catch(console.error);
