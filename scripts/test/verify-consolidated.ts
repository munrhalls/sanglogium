/**
 * Verification Consolidation Test
 * Compares verification-consolidated.md against all verification-XXX-YYY.md chunks
 * Fast, 100% trustworthy - parses markdown and compares path→product mappings
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
      // Save previous leaf node if exists
      if (currentPath && currentProducts.length > 0) {
        leafMap.set(currentPath, currentProducts);
      }
      currentPath = pathMatch[1];
      currentProducts = [];
      continue;
    }

    // Match product lines: - Product Name (but NOT checklist lines like - [x] or markdown)
    const productMatch = trimmed.match(/^-\s+(.+)$/);
    if (productMatch && currentPath) {
      const productName = productMatch[1].trim();
      // Skip checklist lines and markdown formatting lines
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

  // Don't forget the last leaf node
  if (currentPath && currentProducts.length > 0) {
    leafMap.set(currentPath, currentProducts);
  }

  return leafMap;
}

function mergeLeafMaps(maps: Map<string, string[]>[]): Map<string, Set<string>> {
  const merged = new Map<string, Set<string>>();

  for (const map of maps) {
    for (const [path, products] of map) {
      if (!merged.has(path)) {
        merged.set(path, new Set());
      }
      for (const product of products) {
        merged.get(path)!.add(product);
      }
    }
  }

  return merged;
}

function compareConsolidatedAgainstChunks(
  consolidated: Map<string, string[]>,
  chunks: Map<string, Set<string>>
): { passed: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check all paths in consolidated exist in merged chunks
  for (const [path, products] of consolidated) {
    if (!chunks.has(path)) {
      errors.push(`Missing path in chunks: ${path}`);
      continue;
    }

    const chunkProducts = chunks.get(path)!;

    // Check each product in consolidated exists in merged chunks
    for (const product of products) {
      if (!chunkProducts.has(product)) {
        errors.push(
          `Path "${path}" product in consolidated but missing from all chunks: "${product}"`
        );
      }
    }

    // Check for extra products in chunks not in consolidated
    const consolidatedSet = new Set(products);
    for (const product of chunkProducts) {
      if (!consolidatedSet.has(product)) {
        errors.push(
          `Path "${path}" product in chunks but missing from consolidated: "${product}"`
        );
      }
    }
  }

  // Check for extra paths in chunks not in consolidated
  for (const path of chunks.keys()) {
    if (!consolidated.has(path)) {
      errors.push(`Extra path in chunks not in consolidated: ${path}`);
    }
  }

  return { passed: errors.length === 0, errors };
}

function runTest(): void {
  const baseDir = 'c:/webdev/sang-logium/_temporary/catalogue-mapping';
  const consolidatedPath = path.join(baseDir, 'verification-consolidated.md');

  console.log('🔍 Verification Consolidation Test\n');
  console.log(`Reading consolidated: ${consolidatedPath}`);

  const consolidated = parseVerificationFile(consolidatedPath);
  console.log(`Consolidated leaf nodes: ${consolidated.size}`);

  // Get all verification chunk files
  const files = fs.readdirSync(baseDir);
  const chunkFiles = files
    .filter(f => /^verification-\d+-\d+\.md$/.test(f))
    .sort();

  console.log(`Found ${chunkFiles.length} chunk files`);

  // Parse all chunks and merge them
  const allChunkMaps: Map<string, string[]>[] = [];
  for (const chunkFile of chunkFiles) {
    const chunkPath = path.join(baseDir, chunkFile);
    const chunkMap = parseVerificationFile(chunkPath);
    allChunkMaps.push(chunkMap);
  }

  const mergedChunks = mergeLeafMaps(allChunkMaps);
  console.log(`Merged chunks leaf nodes: ${mergedChunks.size}\n`);

  const result = compareConsolidatedAgainstChunks(consolidated, mergedChunks);

  console.log('='.repeat(50));

  if (result.passed) {
    console.log('✅ CONSOLIDATED MATCHES CHUNKS PERFECTLY');
    console.log(`   ${consolidated.size} leaf nodes verified`);
    console.log(`   ${Array.from(consolidated.values()).flat().length} total products verified`);
    process.exit(0);
  } else {
    console.log(`❌ FOUND ${result.errors.length} DISCREPANCIES:\n`);
    for (const error of result.errors.slice(0, 30)) {
      console.log(`  - ${error}`);
    }
    if (result.errors.length > 30) {
      console.log(`  ... and ${result.errors.length - 30} more`);
    }
    process.exit(1);
  }
}

runTest();
