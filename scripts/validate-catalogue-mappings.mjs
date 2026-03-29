#!/usr/bin/env node
/**
 * Catalogue Mappings Validation Script
 * Phase 3: Validate truth table - no mix-ups in product subsets
 */

import { createClient } from '@sanity/client';
import { config } from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
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
    product.categoryPath || ''
  ].join(' ').toLowerCase();

  // Required keywords
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

  return { 
    score: Math.max(0, Math.round(score)), 
    reasons 
  };
}

// Validate all product mappings
async function validateMappings() {
  console.log('🔍 Validating product mappings...\n');
  
  // Fetch all products with their catalogue keys
  const products = await client.fetch(`
    *[_type == "product"]{
      _id,
      name,
      brand,
      catalogueLocationKeys,
      "categoryPath": categoryPath
    }
  `);
  
  // Fetch leaf categories
  const categories = await client.fetch(`
    *[_type == "catalogueItem" && type == "link"]{
      _id,
      title,
      "slug": slug.current
    }
  `);
  
  console.log(`📊 Found ${products.length} products`);
  console.log(`📁 Found ${categories.length} leaf categories\n`);
  
  // Build category slug map
  const categoryMap = {};
  for (const cat of categories) {
    categoryMap[cat._id] = cat;
  }
  
  // Validate each assigned product
  const results = {
    valid: [],
    invalid: [],
    unassigned: [],
    byCategory: {}
  };
  
  for (const product of products) {
    const keys = product.catalogueLocationKeys || [];
    
    if (keys.length === 0) {
      results.unassigned.push({
        productId: product._id,
        name: product.name,
        brand: product.brand
      });
      continue;
    }
    
    const productValidations = [];
    let hasInvalid = false;
    
    for (const key of keys) {
      const category = categoryMap[key];
      if (!category) {
        productValidations.push({
          key,
          valid: false,
          reason: 'Category not found'
        });
        hasInvalid = true;
        continue;
      }
      
      const rule = SEMANTIC_CATEGORIES[category.slug];
      if (!rule) {
        productValidations.push({
          key,
          category: category.title,
          valid: false,
          reason: 'No semantic rule'
        });
        hasInvalid = true;
        continue;
      }
      
      const analysis = scoreProduct(product, rule);
      const isValid = analysis.score >= 30;
      
      if (!isValid) hasInvalid = true;
      
      productValidations.push({
        key,
        category: category.title,
        slug: category.slug,
        valid: isValid,
        score: analysis.score,
        reasons: analysis.reasons
      });
      
      // Track by category
      if (!results.byCategory[key]) {
        results.byCategory[key] = {
          category: category.title,
          slug: category.slug,
          valid: [],
          invalid: []
        };
      }
      
      if (isValid) {
        results.byCategory[key].valid.push(product._id);
      } else {
        results.byCategory[key].invalid.push({
          id: product._id,
          name: product.name,
          score: analysis.score
        });
      }
    }
    
    if (hasInvalid) {
      results.invalid.push({
        productId: product._id,
        name: product.name,
        brand: product.brand,
        validations: productValidations
      });
    } else {
      results.valid.push({
        productId: product._id,
        name: product.name,
        keys
      });
    }
  }
  
  return results;
}

// Generate validation report
async function generateReport(results) {
  console.log('\n📊 VALIDATION RESULTS\n');
  
  const total = results.valid.length + results.invalid.length + results.unassigned.length;
  const accuracy = total > 0 ? (results.valid.length / total) * 100 : 0;
  
  console.log(`Total Products: ${total}`);
  console.log(`✅ Valid: ${results.valid.length} (${(results.valid.length/total*100).toFixed(1)}%)`);
  console.log(`❌ Invalid: ${results.invalid.length} (${(results.invalid.length/total*100).toFixed(1)}%)`);
  console.log(`⚠️  Unassigned: ${results.unassigned.length} (${(results.unassigned.length/total*100).toFixed(1)}%)`);
  console.log(`\n📈 Accuracy: ${accuracy.toFixed(1)}%\n`);
  
  // Category breakdown
  console.log('BY CATEGORY:');
  for (const [key, data] of Object.entries(results.byCategory)) {
    const totalInCat = data.valid.length + data.invalid.length;
    const catAccuracy = totalInCat > 0 ? (data.valid.length / totalInCat) * 100 : 0;
    console.log(`  ${data.category}: ${data.valid.length} valid, ${data.invalid.length} invalid (${catAccuracy.toFixed(0)}%)`);
  }
  
  // Sample invalid products
  if (results.invalid.length > 0) {
    console.log('\n🔴 SAMPLE INVALID ASSIGNMENTS:');
    for (let i = 0; i < Math.min(5, results.invalid.length); i++) {
      const p = results.invalid[i];
      console.log(`  ${p.name} (${p.brand})`);
      for (const v of p.validations) {
        if (!v.valid) {
          console.log(`    → ${v.category || v.key}: score ${v.score} (${v.reasons?.join(', ') || v.reason})`);
        }
      }
    }
  }
  
  // Save report
  const report = {
    validatedAt: new Date().toISOString(),
    summary: {
      total,
      valid: results.valid.length,
      invalid: results.invalid.length,
      unassigned: results.unassigned.length,
      accuracy: parseFloat(accuracy.toFixed(2))
    },
    byCategory: results.byCategory,
    sampleInvalid: results.invalid.slice(0, 10)
  };
  
  await fs.writeFile(
    path.join(process.cwd(), 'data', 'validation-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n💾 Saved data/validation-report.json');
  
  // Exit with error if accuracy < 95%
  if (accuracy < 95) {
    console.log('\n⚠️  VALIDATION FAILED: Accuracy below 95% threshold');
    process.exit(1);
  } else {
    console.log('\n✅ VALIDATION PASSED: Accuracy >= 95%');
    process.exit(0);
  }
}

// Main
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  CATALOGUE MAPPINGS VALIDATION - PHASE 3                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  if (!process.env.SANITY_API_TOKEN) {
    console.error('❌ SANITY_API_TOKEN not found');
    process.exit(1);
  }
  
  try {
    const results = await validateMappings();
    await generateReport(results);
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

main();
