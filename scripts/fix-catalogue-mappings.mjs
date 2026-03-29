#!/usr/bin/env node
/**
 * Catalogue Mappings Cleanup Script
 * Phase 2: Detect and fix mix-ups
 */

import { createClient } from '@sanity/client';
import { config } from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

config();

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-11-14',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

// Load truth table
async function loadTruthTable() {
  const data = await fs.readFile(
    path.join(process.cwd(), 'data', 'truth-table.json'),
    'utf-8'
  );
  return JSON.parse(data);
}

// Detect mix-ups
async function detectMixUps() {
  console.log('🔍 Detecting mix-ups...\n');
  
  const truthTable = await loadTruthTable();
  const mixUps = {
    critical: [], // Completely wrong assignments
    medium: [],   // Missing correct assignments
    low: [],      // Extra incorrect assignments
    missing: []   // No assignments at all
  };
  
  let checked = 0;
  
  for (const [productId, data] of Object.entries(truthTable)) {
    checked++;
    
    const current = new Set(data.currentKeys || []);
    const truth = new Set(data.truthMappings || []);
    
    // Find differences
    const wrong = [...current].filter(k => !truth.has(k));
    const missing = [...truth].filter(k => !current.has(k));
    const correct = [...current].filter(k => truth.has(k));
    
    const severity = 
      current.size === 0 ? 'missing' :
      wrong.length > 0 && correct.length === 0 ? 'critical' :
      missing.length > 0 ? 'medium' :
      wrong.length > 0 ? 'low' :
      null;
    
    if (severity) {
      mixUps[severity].push({
        productId,
        name: data.name,
        brand: data.brand,
        current: [...current],
        truth: [...truth],
        wrong,
        missing,
        correct,
        topScore: data.allScores?.[0]?.score || 0
      });
    }
  }
  
  console.log(`✅ Checked ${checked} products`);
  console.log(`   Critical mix-ups: ${mixUps.critical.length}`);
  console.log(`   Medium issues: ${mixUps.medium.length}`);
  console.log(`   Low issues: ${mixUps.low.length}`);
  console.log(`   Missing keys: ${mixUps.missing.length}`);
  
  return mixUps;
}

// Generate detailed report
async function generateReport(mixUps) {
  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalIssues: mixUps.critical.length + mixUps.medium.length + mixUps.low.length + mixUps.missing.length,
      critical: mixUps.critical.length,
      medium: mixUps.medium.length,
      low: mixUps.low.length,
      missing: mixUps.missing.length
    },
    details: mixUps
  };
  
  await fs.writeFile(
    path.join(process.cwd(), 'data', 'mix-ups-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n💾 Saved data/mix-ups-report.json');
  
  // Print sample critical issues
  if (mixUps.critical.length > 0) {
    console.log('\n🔴 SAMPLE CRITICAL MIX-UPS:');
    for (let i = 0; i < Math.min(3, mixUps.critical.length); i++) {
      const m = mixUps.critical[i];
      console.log(`  ${m.name} (${m.brand})`);
      console.log(`    Current: ${m.current.join(', ')}`);
      console.log(`    Should be: ${m.truth.join(', ')}`);
    }
  }
  
  // Print sample missing
  if (mixUps.missing.length > 0) {
    console.log('\n⚠️  SAMPLE MISSING KEYS:');
    for (let i = 0; i < Math.min(3, mixUps.missing.length); i++) {
      const m = mixUps.missing[i];
      console.log(`  ${m.name} (${m.brand})`);
      console.log(`    Should have: ${m.truth.join(', ')}`);
    }
  }
}

// Generate corrections for dry-run or execution
async function generateCorrections(mixUps) {
  const corrections = [];
  
  // Combine all issues except 'missing' (treat as medium)
  const allIssues = [
    ...mixUps.critical,
    ...mixUps.medium,
    ...mixUps.low,
    ...mixUps.missing
  ];
  
  for (const issue of allIssues) {
    corrections.push({
      productId: issue.productId,
      productName: issue.name,
      currentKeys: issue.current,
      newKeys: issue.truth, // Use truth table as target
      action: issue.current.length === 0 ? 'add' : 'replace',
      severity: issue.wrong?.length > 0 && issue.correct?.length === 0 ? 'critical' : 
                issue.missing?.length > 0 ? 'medium' : 'low'
    });
  }
  
  return corrections;
}

// Dry-run: Preview corrections
async function dryRun(corrections) {
  console.log(`\n🔍 DRY RUN: ${corrections.length} corrections to apply\n`);
  
  for (let i = 0; i < Math.min(5, corrections.length); i++) {
    const c = corrections[i];
    console.log(`${i + 1}. ${c.productName}`);
    console.log(`   Action: ${c.action.toUpperCase()}`);
    console.log(`   Current: [${c.currentKeys.join(', ')}]`);
    console.log(`   New:     [${c.newKeys.join(', ')}]`);
    console.log(`   Severity: ${c.severity}`);
    console.log('');
  }
  
  if (corrections.length > 5) {
    console.log(`... and ${corrections.length - 5} more`);
  }
  
  return corrections.length;
}

// Execute corrections
async function executeCorrections(corrections) {
  console.log(`\n⚡ EXECUTING: ${corrections.length} corrections\n`);
  
  const results = {
    success: [],
    failed: []
  };
  
  for (let i = 0; i < corrections.length; i++) {
    const c = corrections[i];
    
    try {
      await client
        .patch(c.productId)
        .set({ catalogueLocationKeys: c.newKeys })
        .commit();
      
      results.success.push({
        productId: c.productId,
        name: c.productName,
        oldKeys: c.currentKeys,
        newKeys: c.newKeys
      });
      
      if ((i + 1) % 50 === 0) {
        console.log(`  Applied ${i + 1}/${corrections.length}...`);
      }
    } catch (err) {
      results.failed.push({
        productId: c.productId,
        name: c.productName,
        error: err.message
      });
      console.error(`  ❌ Failed ${c.productName}: ${err.message}`);
    }
  }
  
  // Save change log
  await fs.writeFile(
    path.join(process.cwd(), 'data', 'mapping-changes-log.json'),
    JSON.stringify({
      timestamp: new Date().toISOString(),
      total: corrections.length,
      success: results.success.length,
      failed: results.failed.length,
      changes: results.success
    }, null, 2)
  );
  
  console.log(`\n📊 Results: ${results.success.length} success, ${results.failed.length} failed`);
  console.log('💾 Saved data/mapping-changes-log.json');
}

// Main
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  CATALOGUE MAPPINGS CLEANUP - PHASE 2                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  if (!process.env.SANITY_API_TOKEN) {
    console.error('❌ SANITY_API_TOKEN not found');
    process.exit(1);
  }
  
  const args = process.argv.slice(2);
  const dryRunMode = !args.includes('--execute');
  
  try {
    // Detect mix-ups
    const mixUps = await detectMixUps();
    await generateReport(mixUps);
    
    // Generate corrections
    const corrections = await generateCorrections(mixUps);
    
    if (dryRunMode) {
      const count = await dryRun(corrections);
      console.log(`\n🔍 Dry run complete. ${count} corrections pending.`);
      console.log('Run with --execute to apply changes.');
    } else {
      await executeCorrections(corrections);
      console.log('\n✅ Cleanup complete!');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

main();
