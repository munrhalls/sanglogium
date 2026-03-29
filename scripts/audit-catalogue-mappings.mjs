#!/usr/bin/env node
/**
 * Catalogue Mappings Audit Script
 * Phase 1: Discovery - Generate truth table of expected product mappings
 */

import { createClient } from '@sanity/client';
import { config } from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { SEMANTIC_CATEGORIES } from '../lib/catalogue/semanticConfig.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config();

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-11-14',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

// Fetch all products with current catalogueLocationKeys
async function fetchCurrentMappings() {
  console.log('🔍 Fetching all products from Sanity...');

  const products = await client.fetch(`
    *[_type == "product"]{
      _id,
      name,
      brand,
      catalogueLocationKeys,
      "categoryPath": categoryPath
    }
  `);

  console.log(`📊 Found ${products.length} products`);

  const withKeys = products.filter(p => p.catalogueLocationKeys && p.catalogueLocationKeys.length > 0);
  const withoutKeys = products.filter(p => !p.catalogueLocationKeys || p.catalogueLocationKeys.length === 0);

  console.log(`   With catalogue keys: ${withKeys.length}`);
  console.log(`   Without keys: ${withoutKeys.length}`);

  return {
    products,
    stats: {
      total: products.length,
      withKeys: withKeys.length,
      withoutKeys: withoutKeys.length
    }
  };
}

// Fetch all leaf catalogue items
async function fetchLeafCategories() {
  console.log('\n📁 Fetching leaf catalogue items...');

  const categories = await client.fetch(`
    *[_type == "catalogueItem" && type == "link"]{
      _id,
      title,
      "slug": slug.current
    }
  `);

  console.log(`📁 Found ${categories.length} leaf categories`);

  return categories;
}

// Score product against semantic rule
function scoreProduct(product, rule) {
  let score = 0;
  const text = [
    product.name || '',
    product.brand || '',
    product.categoryPath || ''
  ].join(' ').toLowerCase();

  // Required keywords (must have at least one)
  if (rule.requiredKeywords) {
    const hasRequired = rule.requiredKeywords.some(kw => text.includes(kw.toLowerCase()));
    if (!hasRequired) return { score: 0, reasons: ['Missing required keywords'] };
    score += rule.weightings?.required || 30;
  }

  const reasons = [];

  // Positive keywords
  if (rule.positiveKeywords) {
    const matches = rule.positiveKeywords.filter(kw => text.includes(kw.toLowerCase()));
    if (matches.length > 0) {
      score += matches.length * ((rule.weightings?.positive || 20) / rule.positiveKeywords.length);
      reasons.push(`Positive: ${matches.join(', ')}`);
    }
  }

  // Negative keywords (penalty)
  if (rule.negativeKeywords) {
    const matches = rule.negativeKeywords.filter(kw => text.includes(kw.toLowerCase()));
    if (matches.length > 0) {
      score -= matches.length * Math.abs((rule.weightings?.negative || -50) / rule.negativeKeywords.length);
      reasons.push(`Negative: ${matches.join(', ')}`);
    }
  }

  // Brand matching
  if (rule.brandMatches && product.brand) {
    const brandMatch = rule.brandMatches.some(b =>
      product.brand.toLowerCase().includes(b.toLowerCase())
    );
    if (brandMatch) {
      score += rule.weightings?.brand || 10;
      reasons.push(`Brand match`);
    }
  }

  // Name matching bonus
  if (rule.positiveKeywords && product.name) {
    const nameMatches = rule.positiveKeywords.filter(kw =>
      product.name.toLowerCase().includes(kw.toLowerCase())
    );
    if (nameMatches.length > 0) {
      score += nameMatches.length * ((rule.weightings?.name || 40) / 10);
    }
  }

  return {
    score: Math.max(0, Math.round(score)),
    reasons
  };
}

// Generate truth table
async function generateTruthTable(products, categories) {
  console.log('\n🎯 Generating truth table...');

  const truthTable = {};
  let processed = 0;

  for (const product of products) {
    processed++;
    if (processed % 100 === 0) {
      console.log(`  Processed ${processed}/${products.length}...`);
    }

    const scores = [];

    for (const category of categories) {
      const rule = SEMANTIC_CATEGORIES[category.slug];
      if (!rule) {
        console.warn(`⚠️ No semantic rule for category: ${category.slug}`);
        continue;
      }

      const analysis = scoreProduct(product, rule);

      if (analysis.score > 30) { // Threshold for consideration
        scores.push({
          categoryId: category._id,
          categorySlug: category.slug,
          categoryTitle: category.title,
          score: analysis.score,
          reasons: analysis.reasons
        });
      }
    }

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);

    truthTable[product._id] = {
      name: product.name,
      brand: product.brand,
      currentKeys: product.catalogueLocationKeys || [],
      truthMappings: scores.slice(0, 3).map(s => s.categoryId), // Top 3 matches
      allScores: scores
    };
  }

  console.log(`✅ Truth table generated for ${Object.keys(truthTable).length} products`);

  return truthTable;
}

// Save data to JSON files
async function saveData(currentMappings, truthTable, stats) {
  console.log('\n💾 Saving data...');

  const dataDir = path.join(process.cwd(), 'data');

  // Ensure data directory exists
  await fs.mkdir(dataDir, { recursive: true });

  // Save current mappings
  await fs.writeFile(
    path.join(dataDir, 'current-mappings.json'),
    JSON.stringify({ products: currentMappings.products, stats }, null, 2)
  );
  console.log('   ✓ data/current-mappings.json');

  // Save truth table
  await fs.writeFile(
    path.join(dataDir, 'truth-table.json'),
    JSON.stringify(truthTable, null, 2)
  );
  console.log('   ✓ data/truth-table.json');

  // Generate summary report
  const summary = {
    generatedAt: new Date().toISOString(),
    totalProducts: stats.total,
    productsWithKeys: stats.withKeys,
    productsWithoutKeys: stats.withoutKeys,
    categoriesAnalyzed: Object.keys(SEMANTIC_CATEGORIES).length,
    sampleMappings: Object.entries(truthTable)
      .slice(0, 5)
      .map(([id, data]) => ({
        id,
        name: data.name,
        current: data.currentKeys,
        truth: data.truthMappings,
        topScore: data.allScores[0]?.score || 0
      }))
  };

  await fs.writeFile(
    path.join(dataDir, 'audit-summary.json'),
    JSON.stringify(summary, null, 2)
  );
  console.log('   ✓ data/audit-summary.json');
}

// Main execution
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  CATALOGUE MAPPINGS AUDIT - PHASE 1: DISCOVERY             ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  if (!process.env.SANITY_API_TOKEN) {
    console.error('❌ SANITY_API_TOKEN not found in environment');
    process.exit(1);
  }

  try {
    // Fetch current state
    const { products, stats } = await fetchCurrentMappings();

    // Fetch leaf categories
    const categories = await fetchLeafCategories();

    // Validate semantic rules coverage
    const categorySlugs = categories.map(c => c.slug);
    const ruleSlugs = Object.keys(SEMANTIC_CATEGORIES);
    const missingRules = categorySlugs.filter(slug => !ruleSlugs.includes(slug));

    if (missingRules.length > 0) {
      console.warn(`\n⚠️ Missing semantic rules for categories: ${missingRules.join(', ')}`);
    }

    // Generate truth table
    const truthTable = await generateTruthTable(products, categories);

    // Save all data
    await saveData({ products }, truthTable, stats);

    console.log('\n✅ Phase 1 Discovery Complete!');
    console.log('\nNext: Run Phase 2 (Cleanup) to fix mix-ups');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

main();
