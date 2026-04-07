#!/usr/bin/env node

/**
 * Backup script for all products before migration
 * Usage: node scripts/migrations/backupProducts.mjs
 */

import { createClient } from "@sanity/client";
import fs from 'fs/promises';
import path from 'path';
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2023-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function main() {
  console.log('💾 Creating backup of all products...');
  
  // Fetch all products
  const query = `*[_type == "product"]`;
  const products = await client.fetch(query);
  
  console.log(`Found ${products.length} products to backup`);
  
  // Create backup directory if it doesn't exist
  const backupDir = path.join(process.cwd(), 'sanity', 'backups');
  try {
    await fs.mkdir(backupDir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
  
  // Generate backup filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `backup_products_${timestamp}.json`);
  
  // Save backup
  const backupData = {
    timestamp: new Date().toISOString(),
    count: products.length,
    products: products
  };
  
  await fs.writeFile(backupFile, JSON.stringify(backupData, null, 2));
  
  console.log(`✅ Backup saved to: ${backupFile}`);
  console.log(`  File size: ${(await fs.stat(backupFile)).size} bytes`);
  
  // Also save a copy without the timestamp for easy reference
  const latestBackup = path.join(backupDir, 'backup_products_latest.json');
  await fs.writeFile(latestBackup, JSON.stringify(backupData, null, 2));
  console.log(`✅ Latest backup saved to: ${latestBackup}`);
  
  console.log('\n📊 Backup Summary:');
  console.log(`  Total products: ${products.length}`);
  console.log(`  Products with reservedStock: ${products.filter(p => p.reservedStock !== undefined).length}`);
  console.log(`  Products missing reservedStock: ${products.filter(p => p.reservedStock === undefined).length}`);
}

main().catch(console.error);
