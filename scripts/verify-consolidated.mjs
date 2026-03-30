#!/usr/bin/env node
/**
 * Consolidated File Enricher & Verifier
 *
 * This script:
 * 1. Parses all truth-table-*.md files to extract product IDs and names
 * 2. Enriches verification-consolidated.md with product IDs
 * 3. Verifies that all product names in consolidated file have matching IDs
 */

import fs from 'fs';
import path from 'path';

// Configuration
const TRUTH_TABLE_DIR = 'c:/webdev/sang-logium/_temporary/catalogue-mapping';
const CONSOLIDATED_FILE = path.join(TRUTH_TABLE_DIR, 'verification-consolidated.md');
const OUTPUT_FILE = path.join(TRUTH_TABLE_DIR, 'verification-consolidated-with-ids.md');

// ============================================================================
// TRUTH TABLE PARSER
// ============================================================================

function parseTruthTables() {
  const truthFiles = fs.readdirSync(TRUTH_TABLE_DIR)
    .filter(f => f.startsWith('truth-table-') && f.endsWith('.md'))
    .map(f => path.join(TRUTH_TABLE_DIR, f));

  const index = {
    nameToId: new Map(),      // product name -> { id, path, sourceFile }
    idToName: new Map(),      // id -> { name, path, sourceFile }
    duplicates: [],             // names that appear multiple times
    allEntries: []             // all parsed entries
  };

  for (const file of truthFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const entries = parseTruthTableContent(content, file);

    for (const entry of entries) {
      // Check for duplicate names
      if (index.nameToId.has(entry.name)) {
        index.duplicates.push({
          name: entry.name,
          existing: index.nameToId.get(entry.name),
          duplicate: entry
        });
      } else {
        index.nameToId.set(entry.name, entry);
      }

      index.idToName.set(entry.id, entry);
      index.allEntries.push(entry);
    }
  }

  return index;
}

function parseTruthTableContent(content, sourceFile) {
  const entries = [];
  const lines = content.split('\n');

  let currentLeafPath = null;
  let currentProduct = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Extract leaf path (e.g., "### /headphones/by-design/closed-back")
    const pathMatch = line.match(/^###\s+(\/[^\s]+)$/);
    if (pathMatch) {
      currentLeafPath = pathMatch[1];
      continue;
    }

    // Extract leaf node ID (e.g., "**Leaf Node ID:** `abc123`")
    const leafIdMatch = line.match(/\*\*Leaf Node ID:\*\*\s*`([^`]+)`/);
    if (leafIdMatch && currentLeafPath) {
      // Store leaf node ID mapping if needed
      continue;
    }

    // Start of a product entry (e.g., "* **Product Name**")
    const productStartMatch = line.match(/^\*\s+\*\*([^*]+)\*\*/);
    if (productStartMatch) {
      currentProduct = {
        name: productStartMatch[1].trim(),
        path: currentLeafPath,
        sourceFile: path.basename(sourceFile),
        id: null,
        lineNumber: i + 1
      };
      continue;
    }

    // Extract product ID (e.g., "  * **ID:** `abc123`")
    if (currentProduct && line.includes('**ID:**')) {
      const idMatch = line.match(/\*\*ID:\*\*\s*`([^`]+)`/);
      if (idMatch) {
        currentProduct.id = idMatch[1];
        entries.push({ ...currentProduct });
        currentProduct = null;
      }
    }
  }

  return entries;
}

// ============================================================================
// CONSOLIDATED FILE PARSER
// ============================================================================

function parseConsolidatedFile() {
  const content = fs.readFileSync(CONSOLIDATED_FILE, 'utf-8');
  const lines = content.split('\n');

  const products = [];
  let currentSection = null;
  let currentSubsection = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    // Section header (e.g., "### /headphones/by-design/closed-back")
    const sectionMatch = line.match(/^###\s+(\/[^\s]+)$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1];
      continue;
    }

    // Subsection header (e.g., "## Products 100-124")
    const subsectionMatch = line.match(/^##\s+(.+)$/);
    if (subsectionMatch) {
      currentSubsection = subsectionMatch[1];
      continue;
    }

    // Product line (e.g., "- Product Name")
    const productMatch = line.match(/^-\s+(.+)$/);
    if (productMatch) {
      // Skip lines that look like IDs already added
      const name = productMatch[1].trim();

      // Skip checklist lines (e.g., "- [x] /path - description")
      if (name.startsWith('[') && (name.includes('[x]') || name.includes('[ ]'))) {
        continue;
      }

      // Skip summary/bold lines (e.g., "- **Total Matched**: 0 products")
      if (name.startsWith('**')) {
        continue;
      }

      if (!name.startsWith('**ID:**') && !name.includes('`')) {
        products.push({
          name: name,
          section: currentSection,
          subsection: currentSubsection,
          lineNumber: lineNumber,
          originalLine: line
        });
      }
    }
  }

  return { content, lines, products };
}

// ============================================================================
// ENRICHMENT FUNCTION
// ============================================================================

function enrichConsolidatedFile(consolidatedData, truthIndex) {
  const { lines } = consolidatedData;
  const enrichedLines = [];
  let currentSection = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    // Track current section
    const sectionMatch = line.match(/^###\s+(\/[^\s]+)$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1];
    }

    // Product line (e.g., "- Product Name")
    const productMatch = line.match(/^-\s+(.+)$/);
    if (productMatch) {
      const name = productMatch[1].trim();

      // Skip checklist lines (e.g., "- [x] /path - description")
      if (name.startsWith('[') && (name.includes('[x]') || name.includes('[ ]'))) {
        enrichedLines.push(line);
        continue;
      }

      // Skip if already enriched (has ID marker)
      if (!name.startsWith('**ID:**') && !name.includes('`')) {
        const truthEntry = truthIndex.nameToId.get(name);

        if (truthEntry) {
          enrichedLines.push(`- ${name}  `);
          enrichedLines.push(`  **ID:** \`${truthEntry.id}\``);
        } else {
          // Product not found in truth tables - keep original
          enrichedLines.push(line);
        }
        continue;
      }
    }

    enrichedLines.push(line);
  }

  return enrichedLines.join('\n');
}

// ============================================================================
// VERIFICATION FUNCTION
// ============================================================================

function verifyMappings(consolidatedData, truthIndex) {
  const results = {
    matched: [],
    unmatched: [],
    nameMismatches: [],
    summary: {
      totalProducts: consolidatedData.products.length,
      matched: 0,
      unmatched: 0,
      orphanedTruthEntries: 0
    }
  };

  const usedTruthIds = new Set();

  for (const product of consolidatedData.products) {
    const truthEntry = truthIndex.nameToId.get(product.name);

    if (truthEntry) {
      results.matched.push({
        name: product.name,
        id: truthEntry.id,
        section: product.section,
        sourceFile: truthEntry.sourceFile
      });
      results.summary.matched++;
      usedTruthIds.add(truthEntry.id);
    } else {
      results.unmatched.push({
        name: product.name,
        section: product.section,
        lineNumber: product.lineNumber
      });
      results.summary.unmatched++;
    }
  }

  // Find orphaned truth entries (in truth tables but not in consolidated)
  const consolidatedNames = new Set(consolidatedData.products.map(p => p.name));
  for (const entry of truthIndex.allEntries) {
    if (!consolidatedNames.has(entry.name) && !usedTruthIds.has(entry.id)) {
      results.summary.orphanedTruthEntries++;
    }
  }

  return results;
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  console.log('=' .repeat(70));
  console.log('CONSOLIDATED FILE ENRICHER & VERIFIER');
  console.log('=' .repeat(70));
  console.log();

  // Step 1: Parse truth tables
  console.log('[1/4] Parsing truth tables...');
  const truthIndex = parseTruthTables();
  console.log(`      Found ${truthIndex.allEntries.length} products in truth tables`);
  console.log(`      ${truthIndex.duplicates.length} duplicate names detected`);

  if (truthIndex.duplicates.length > 0) {
    console.log('      ⚠️  Warning: Duplicate product names found:');
    for (const dup of truthIndex.duplicates.slice(0, 5)) {
      console.log(`         - "${dup.name}" appears in ${dup.existing.sourceFile} and ${dup.duplicate.sourceFile}`);
    }
  }
  console.log();

  // Step 2: Parse consolidated file
  console.log('[2/4] Parsing consolidated file...');
  const consolidatedData = parseConsolidatedFile();
  console.log(`      Found ${consolidatedData.products.length} products in consolidated file`);
  console.log();

  // Step 3: Verify mappings
  console.log('[3/4] Running verification...');
  const verificationResults = verifyMappings(consolidatedData, truthIndex);

  console.log(`      ✓ Matched: ${verificationResults.summary.matched}/${verificationResults.summary.totalProducts}`);
  console.log(`      ✗ Unmatched: ${verificationResults.summary.unmatched}`);
  console.log(`      ⊘ Orphaned truth entries: ${verificationResults.summary.orphanedTruthEntries}`);
  console.log();

  if (verificationResults.unmatched.length > 0) {
    console.log('      Unmatched products (sample):');
    for (const u of verificationResults.unmatched.slice(0, 5)) {
      console.log(`         - "${u.name}" (line ${u.lineNumber})`);
    }
    if (verificationResults.unmatched.length > 5) {
      console.log(`         ... and ${verificationResults.unmatched.length - 5} more`);
    }
    console.log();
  }

  // Step 4: Enrich and write output
  console.log('[4/4] Enriching consolidated file...');
  const enrichedContent = enrichConsolidatedFile(consolidatedData, truthIndex);
  fs.writeFileSync(OUTPUT_FILE, enrichedContent, 'utf-8');
  console.log(`      ✓ Written to: ${OUTPUT_FILE}`);
  console.log();

  // Summary
  console.log('=' .repeat(70));
  console.log('SUMMARY');
  console.log('=' .repeat(70));
  console.log(`Truth table products:    ${truthIndex.allEntries.length}`);
  console.log(`Consolidated products:   ${consolidatedData.products.length}`);
  console.log(`Matched:                 ${verificationResults.summary.matched}`);
  console.log(`Unmatched:               ${verificationResults.summary.unmatched}`);
  console.log(`Orphaned truth entries:  ${verificationResults.summary.orphanedTruthEntries}`);
  console.log();
  console.log(`Output file:             ${OUTPUT_FILE}`);
  console.log();

  // Exit code
  if (verificationResults.summary.unmatched > 0) {
    console.log('⚠️  WARNING: Some products could not be matched. Review unmatched list above.');
    process.exit(1);
  } else {
    console.log('✓ All products successfully verified and enriched!');
    process.exit(0);
  }
}

main();
