#!/usr/bin/env node

/**
 * Validation script to verify all products have reservedStock field
 * Usage: node scripts/validations/verifyReservedStock.mjs
 */

import { createClient } from "@sanity/client";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2023-01-01",
  useCdn: false,
  token: process.env.SANITY_STUDIO_READ_WRITE || process.env.SANITY_API_TOKEN,
});

async function main() {
  console.log('=== Reserved Stock Validation ===\n');

  try {
    // Step 1: Count total products
    const totalProductsQuery = `count(*[_type == "product"])`;
    const totalProducts = await client.fetch(totalProductsQuery);
    console.log(`Total products: ${totalProducts}`);

    // Step 2: Count products with reservedStock field
    const withReservedStockQuery = `count(*[_type == "product" && defined(reservedStock)])`;
    const withReservedStock = await client.fetch(withReservedStockQuery);
    console.log(`Products with reservedStock: ${withReservedStock}`);

    // Step 3: Find products missing reservedStock
    const missingQuery = `*[_type == "product" && !defined(reservedStock)] {_id, name, stock}`;
    const missingProducts = await client.fetch(missingQuery);
    
    console.log(`\nProducts missing reservedStock: ${missingProducts.length}`);
    
    if (missingProducts.length > 0) {
      console.log('\nMissing reservedStock field:');
      missingProducts.forEach(p => {
        console.log(`  - ${p.name} (${p._id}) - Stock: ${p.stock || 'undefined'}`);
      });
      console.log('\nACTION REQUIRED: Run migration script');
      process.exit(1);
    }

    // Step 4: Check for null/undefined values
    const nullValuesQuery = `*[_type == "product" && reservedStock == null] {_id, name, reservedStock}`;
    const nullProducts = await client.fetch(nullValuesQuery);
    
    console.log(`\nProducts with null reservedStock: ${nullProducts.length}`);
    
    if (nullProducts.length > 0) {
      console.log('\nNull reservedStock values:');
      nullProducts.forEach(p => {
        console.log(`  - ${p.name} (${p._id}) - reservedStock: ${p.reservedStock}`);
      });
      console.log('\nACTION REQUIRED: Fix null values');
      process.exit(1);
    }

    // Step 5: Check for negative values
    const negativeQuery = `*[_type == "product" && reservedStock < 0] {_id, name, stock, reservedStock}`;
    const negativeProducts = await client.fetch(negativeQuery);
    
    console.log(`\nProducts with negative reservedStock: ${negativeProducts.length}`);
    
    if (negativeProducts.length > 0) {
      console.log('\nNegative reservedStock values:');
      negativeProducts.forEach(p => {
        console.log(`  - ${p.name} (${p._id}) - Stock: ${p.stock}, Reserved: ${p.reservedStock}`);
      });
      console.log('\nWARNING: Negative values detected');
    }

    // Step 6: Summary
    console.log('\n=== Validation Summary ===');
    console.log('All products have reservedStock field defined');
    console.log('No null reservedStock values found');
    console.log(`Total products validated: ${withReservedStock}`);
    console.log('\nSTATUS: PASSED');

  } catch (error) {
    console.error('Validation failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);
