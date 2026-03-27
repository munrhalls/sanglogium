#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

function getNextUnmappedProduct() {
  const unmappedFile = join(process.cwd(), 'catalog_temporary', 'unmapped_products.md');
  const mappedFile = join(process.cwd(), 'catalog_temporary', 'mapped_products.md');
  
  // Read unmapped products
  const unmappedContent = readFileSync(unmappedFile, 'utf8');
  const unmappedLines = unmappedContent.split('\n');
  
  // Find the first product ID line (skip headers)
  let nextProductId = null;
  let nextProductName = null;
  
  for (const line of unmappedLines) {
    if (line.match(/^\d+\.\s`[^`]+`\s*-\s*.+/)) {
      const match = line.match(/^\d+\.\s`([^`]+)`\s*-\s*(.+)/);
      if (match) {
        nextProductId = match[1];
        nextProductName = match[2];
        break;
      }
    }
  }
  
  if (!nextProductId) {
    console.log('✅ All products have been processed!');
    return false;
  }
  
  console.log(`🔄 Processing next product: ${nextProductName} (${nextProductId})`);
  
  // Step 1: Run dry-run
  console.log('\n📋 Step 1: Running dry-run...');
  try {
    const dryRunOutput = execSync(
      `node scripts/product-vfs-mapper/index.mjs --dry-run --productId="${nextProductId}"`,
      { encoding: 'utf8', cwd: process.cwd() }
    );
    console.log(dryRunOutput);
  } catch (error) {
    console.error('❌ Dry-run failed:', error.message);
    return false;
  }
  
  // Step 2: Run verification
  console.log('\n🧪 Step 2: Running verification...');
  try {
    const verifyOutput = execSync(
      `node scripts/product-vfs-mapper/index.mjs --verify-determined --productId="${nextProductId}"`,
      { encoding: 'utf8', cwd: process.cwd() }
    );
    console.log(verifyOutput);
    
    // Check if verification passed
    if (!verifyOutput.includes('ALL TESTS PASSED')) {
      console.log('❌ Verification tests did not pass');
      return false;
    }
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return false;
  }
  
  // Step 3: Move product from unmapped to mapped
  console.log('\n✅ Step 3: Moving product to mapped list...');
  
  // Remove from unmapped
  const newUnmappedContent = unmappedLines
    .filter(line => !line.includes(nextProductId))
    .join('\n');
  
  // Update unmapped file
  const newUnmappedHeader = `# All Product IDs - ${new Date().toISOString().split('T')[0]}\n\n` +
    `Total Products: ${unmappedLines.filter(line => line.match(/^\d+\.\s`/)).length - 1}\n\n` +
    `## Product IDs\n\n`;
  
  writeFileSync(unmappedFile, newUnmappedHeader + newUnmappedContent.split('## Product IDs\n\n')[1]);
  
  // Add to mapped
  const mappedContent = readFileSync(mappedFile, 'utf8');
  const mappedLines = mappedContent.split('\n');
  
  const newMappedEntry = `${mappedLines.length - 4}. \`${nextProductId}\` - ${nextProductName}`;
  
  // Insert before the "Notes" section
  const notesIndex = mappedLines.findIndex(line => line.includes('## Notes'));
  const newMappedLines = [...mappedLines];
  newMappedLines.splice(notesIndex, 0, newMappedEntry);
  
  // Update total count
  const totalCountIndex = mappedLines.findIndex(line => line.includes('Total Mapped Products:'));
  const currentCount = parseInt(mappedLines[totalCountIndex].match(/\d+/)[0]);
  newMappedLines[totalCountIndex] = `Total Mapped Products: ${currentCount + 1}`;
  
  writeFileSync(mappedFile, newMappedLines.join('\n'));
  
  console.log(`✅ Successfully mapped: ${nextProductName}`);
  console.log(`📊 Progress: ${currentCount + 1} products mapped`);
  
  return true;
}

async function runPipeline() {
  console.log('🚀 Starting VFS Mapping Pipeline...\n');
  
  let continueProcessing = true;
  let processedCount = 0;
  const maxProducts = 10; // Process max 10 products per run
  
  while (continueProcessing && processedCount < maxProducts) {
    continueProcessing = getNextUnmappedProduct();
    if (continueProcessing) {
      processedCount++;
      console.log('\n' + '='.repeat(60) + '\n');
    }
  }
  
  console.log(`\n🏁 Pipeline completed. Processed ${processedCount} products.`);
}

runPipeline().catch(error => {
  console.error('Pipeline error:', error.message);
  process.exit(1);
});
