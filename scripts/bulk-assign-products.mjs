#!/usr/bin/env node
/**
 * Bulk Product Catalog Assignment Script
 * Assigns all 582 products to categories based on semantic matching
 */

import { createClient } from '@sanity/client';
import { config } from 'dotenv';
import { SEMANTIC_CATEGORIES } from '../lib/catalogue/semanticConfig.ts';

config();

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-11-14',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

// Score product against semantic rule
function scoreProduct(product, rule) {
  let score = 0;
  const text = [
    product.name || '',
    product.brand || '',
    ...(product.overviewFields || []).map(f => f.value || ''),
    ...(product.specifications || []).map(s => `${s.name || ''} ${s.value || ''}`)
  ].join(' ').toLowerCase();

  // Required keywords (must have at least one)
  if (rule.requiredKeywords) {
    const hasRequired = rule.requiredKeywords.some(kw => text.includes(kw.toLowerCase()));
    if (!hasRequired) return 0;
    score += rule.weightings.required;
  }

  // Positive keywords
  if (rule.positiveKeywords) {
    const matches = rule.positiveKeywords.filter(kw => text.includes(kw.toLowerCase()));
    score += matches.length * (rule.weightings.positive / rule.positiveKeywords.length);
  }

  // Negative keywords
  if (rule.negativeKeywords) {
    const matches = rule.negativeKeywords.filter(kw => text.includes(kw.toLowerCase()));
    score -= matches.length * Math.abs(rule.weightings.negative / rule.negativeKeywords.length);
  }

  // Name matching
  if (rule.positiveKeywords && product.name) {
    const nameMatches = rule.positiveKeywords.filter(kw =>
      product.name.toLowerCase().includes(kw.toLowerCase())
    );
    score += nameMatches.length * (rule.weightings.name / 10);
  }

  // Brand matching
  if (rule.brandMatches && product.brand) {
    const brandMatch = rule.brandMatches.some(b =>
      product.brand.toLowerCase().includes(b.toLowerCase())
    );
    if (brandMatch) score += rule.weightings.brand;
  }

  return Math.max(0, Math.round(score));
}

async function assignProducts() {
  console.log('🔍 Fetching all products...');

  const products = await client.fetch(`
    *[_type == "product"]{
      _id,
      _rev,
      name,
      brand,
      overviewFields,
      specifications,
      catalogueLocationKeys
    }
  `);

  console.log(`📊 Found ${products.length} products`);

  // Get all leaf categories from Sanity
  const leafCategories = await client.fetch(`
    *[_type == "catalogueItem" && type == "link"]{_id, slug}
  `);

  console.log(`📁 Found ${leafCategories.length} leaf categories`);

  // Create slug to ID map
  const slugToId = {};
  for (const cat of leafCategories) {
    if (cat.slug?.current) {
      slugToId[cat.slug.current] = cat._id;
    }
  }

  // Score each product against each rule
  const assignments = [];
  let processed = 0;

  for (const product of products) {
    processed++;
    if (processed % 50 === 0) {
      console.log(`  Processed ${processed}/${products.length}...`);
    }

    const scores = [];
    for (const [slug, rule] of Object.entries(SEMANTIC_CATEGORIES)) {
      const score = scoreProduct(product, rule);
      if (score > 30) { // Threshold for assignment
        scores.push({ slug, score, id: slugToId[slug] });
      }
    }

    // Sort by score and get top matches
    scores.sort((a, b) => b.score - a.score);
    const topMatches = scores.slice(0, 3).filter(s => s.id); // Max 3 categories

    if (topMatches.length > 0) {
      assignments.push({
        productId: product._id,
        productRev: product._rev,
        productName: product.name,
        matches: topMatches
      });
    }
  }

  console.log(`\n✅ ${assignments.length} products have category matches`);

  // Show sample assignments
  console.log('\n📋 Sample assignments:');
  for (let i = 0; i < Math.min(5, assignments.length); i++) {
    const a = assignments[i];
    console.log(`  ${a.productName}`);
    console.log(`    → ${a.matches.map(m => `${m.slug}(${m.score})`).join(', ')}`);
  }

  return { assignments, totalProducts: products.length };
}

async function applyAssignments(assignments, dryRun = true) {
  console.log(`\n${dryRun ? '🔍 DRY RUN' : '⚡ APPLYING'}: ${assignments.length} products...`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < assignments.length; i++) {
    const a = assignments[i];
    const categoryIds = a.matches.map(m => m.id);

    try {
      if (dryRun) {
        if (i < 3) {
          console.log(`  Would update: ${a.productName} → [${categoryIds.join(', ')}]`);
        }
        success++;
      } else {
        await client
          .patch(a.productId)
          .set({ catalogueLocationKeys: categoryIds })
          .commit();
        success++;
        if (i % 50 === 0) {
          console.log(`  Applied ${i + 1}/${assignments.length}...`);
        }
      }
    } catch (err) {
      failed++;
      console.error(`  ❌ Failed ${a.productName}: ${err.message}`);
    }
  }

  console.log(`\n📊 Results: ${success} success, ${failed} failed`);
  return { success, failed };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--execute');

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     BULK PRODUCT CATALOG ASSIGNMENT                        ║');
  console.log(dryRun ? '║              [ DRY RUN MODE ]                              ║' : '║             [ EXECUTE MODE ]                             ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  if (!process.env.SANITY_API_TOKEN) {
    console.error('❌ SANITY_API_TOKEN not found');
    process.exit(1);
  }

  try {
    const { assignments, totalProducts } = await assignProducts();

    if (assignments.length === 0) {
      console.log('\n⚠️ No products matched any categories');
      process.exit(0);
    }

    const results = await applyAssignments(assignments, dryRun);

    if (dryRun) {
      console.log('\n🔍 Dry run complete. Run with --execute to apply changes.');
    } else {
      console.log('\n🎉 Product assignments complete!');
      console.log('\nNext: Run node scripts/build-catalogue-index.mjs');
    }

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  }
}

main();
