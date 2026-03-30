/**
 * Product Count Verification Test
 * Counts products per leaf path from truth-table chunks vs verification-consolidated.md
 * Fast, 100% trustworthy count verification
 */

import * as fs from 'fs';
import * as path from 'path';

interface LeafNode {
  path: string;
  products: string[];
}

function parseVerificationFile(filePath: string): Map<string, string[]> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  const leafMap = new Map<string, string[]>();
  let currentPath: string | null = null;
  let currentProducts: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Match leaf node paths: ### /headphones/by-design/closed-back
    const pathMatch = trimmed.match(/^###\s+(\/[^\s]+)/);
    if (pathMatch) {
      if (currentPath && currentProducts.length > 0) {
        leafMap.set(currentPath, currentProducts);
      }
      currentPath = pathMatch[1];
      currentProducts = [];
      continue;
    }
    
    // Match product lines: - Product Name
    const productMatch = trimmed.match(/^-\s+(.+)$/);
    if (productMatch && currentPath) {
      const productName = productMatch[1].trim();
      // Skip non-product lines
      if (productName.startsWith('[') || 
          productName.includes('verified') ||
          productName.startsWith('**') ||
          productName.includes('Matched') ||
          productName.includes('Status')) {
        continue;
      }
      currentProducts.push(productName);
    }
  }
  
  if (currentPath && currentProducts.length > 0) {
    leafMap.set(currentPath, currentProducts);
  }
  
  return leafMap;
}

function mergeLeafMaps(maps: Map<string, string[]>[]): Map<string, string[]> {
  const merged = new Map<string, string[]>();
  
  for (const map of maps) {
    for (const [leafPath, products] of map) {
      if (!merged.has(leafPath)) {
        merged.set(leafPath, []);
      }
      merged.get(leafPath)!.push(...products);
    }
  }
  
  return merged;
}

function compareCounts(
  consolidated: Map<string, string[]>,
  chunks: Map<string, string[]>
): { passed: boolean; errors: string[]; stats: { consolidatedTotal: number; chunksTotal: number } } {
  const errors: string[] = [];
  let consolidatedTotal = 0;
  let chunksTotal = 0;
  
  // Get all unique paths
  const allPaths = new Set([...consolidated.keys(), ...chunks.keys()]);
  
  for (const leafPath of allPaths) {
    const consCount = consolidated.has(leafPath) ? consolidated.get(leafPath)!.length : 0;
    const chunkCount = chunks.has(leafPath) ? chunks.get(leafPath)!.length : 0;
    
    consolidatedTotal += consCount;
    chunksTotal += chunkCount;
    
    if (consCount !== chunkCount) {
      errors.push(
        `Path "${leafPath}": consolidated=${consCount}, chunks=${chunkCount} (diff: ${consCount - chunkCount})`
      );
    }
  }
  
  return { 
    passed: errors.length === 0, 
    errors,
    stats: { consolidatedTotal, chunksTotal }
  };
}

function runTest(): void {
  const baseDir = 'c:/webdev/sang-logium/_temporary/catalogue-mapping';
  const consolidatedPath = path.join(baseDir, 'verification-consolidated.md');
  
  console.log('📊 Product Count Verification Test\n');
  
  // Parse consolidated
  console.log(`Reading: verification-consolidated.md`);
  const consolidated = parseVerificationFile(consolidatedPath);
  console.log(`  → ${consolidated.size} leaf nodes`);
  const consTotal = Array.from(consolidated.values()).reduce((sum, p) => sum + p.length, 0);
  console.log(`  → ${consTotal} total products\n`);
  
  // Parse all chunk files
  const files = fs.readdirSync(baseDir);
  const chunkFiles = files
    .filter(f => /^verification-\d+-\d+\.md$/.test(f))
    .sort();
  
  console.log(`Reading ${chunkFiles.length} chunk files...`);
  
  const allChunkMaps: Map<string, string[]>[] = [];
  for (const chunkFile of chunkFiles) {
    const chunkPath = path.join(baseDir, chunkFile);
    const chunkMap = parseVerificationFile(chunkPath);
    allChunkMaps.push(chunkMap);
  }
  
  const mergedChunks = mergeLeafMaps(allChunkMaps);
  const chunkTotal = Array.from(mergedChunks.values()).reduce((sum, p) => sum + p.length, 0);
  console.log(`  → ${mergedChunks.size} leaf nodes (merged)`);
  console.log(`  → ${chunkTotal} total products (merged)\n`);
  
  // Compare counts
  const result = compareCounts(consolidated, mergedChunks);
  
  console.log('='.repeat(50));
  
  if (result.passed) {
    console.log('✅ ALL COUNTS MATCH PERFECTLY');
    console.log(`   ${consolidated.size} leaf nodes`);
    console.log(`   ${result.stats.consolidatedTotal} products verified`);
    process.exit(0);
  } else {
    console.log(`❌ COUNT MISMATCHES FOUND: ${result.errors.length} paths\n`);
    for (const error of result.errors) {
      console.log(`  - ${error}`);
    }
    console.log(`\n  Totals: consolidated=${result.stats.consolidatedTotal}, chunks=${result.stats.chunksTotal}`);
    process.exit(1);
  }
}

runTest();
