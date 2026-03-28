#!/usr/bin/env node
/**
 * Catalogue Coherence Sprint - Sanity CMS Operations
 * 
 * This script performs all Sanity CMS operations for the sprint:
 * 1. Delete TWS category
 * 2. Create 4 new categories (semi-open, bluetooth-dac-amps, usb-c-dacs, eartips)
 * 3. Update parent header children arrays
 * 4. Apply category renames
 * 
 * Usage: node scripts/sprint-sanity-operations.mjs --execute
 *        node scripts/sprint-sanity-operations.mjs --dry-run
 */

import { createClient } from '@sanity/client';
import { config } from 'dotenv';
import readline from 'readline';

config({ path: '.env.local' });
config({ path: '.env' });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-11-14',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

// Category IDs
const TWS_ID = 'sbbu2eig5fx84uht05ic863j';
const BY_DESIGN_HEADER = 'ekv4twh175wcse4fl4jjdxfq';
const IN_EAR_WIRELESS_HEADER = 'fxvwrl18sixw5b9ro2jrlepa';
const AMPLIFICATION_HEADER = 'hqb22ca5czb252r0r7l1xmet';
const DIGITAL_SOURCES_HEADER = 'lkuqr2n1gpeivrvxisnfs3ot';
const MAINTENANCE_HEADER = 'e4rct8015rxgy011710isd5e';
const IEMS_LEAF = 't2anvkkjfz9knqi85kozuaze';

async function confirmOperation(message) {
  return new Promise((resolve) => {
    rl.question(`${message} (yes/no): `, (answer) => {
      resolve(answer.toLowerCase() === 'yes');
    });
  });
}

async function deleteTWSCategory(dryRun = true) {
  console.log('\n🔴 STEP 1: Delete TWS Category');
  console.log('═══════════════════════════════════════════════════════════');
  
  try {
    // First, check if TWS exists
    const twsDoc = await client.getDocument(TWS_ID);
    
    if (!twsDoc) {
      console.log('ℹ️ TWS category not found (already deleted or never existed)');
      return { success: true, skipped: true };
    }
    
    console.log(`Found TWS category: ${twsDoc.title} (${TWS_ID})`);
    
    // Update parent header to remove TWS from children
    const parentDoc = await client.getDocument(IN_EAR_WIRELESS_HEADER);
    if (parentDoc && parentDoc.children) {
      const newChildren = parentDoc.children.filter(ref => ref._ref !== TWS_ID);
      
      if (dryRun) {
        console.log(`🔍 Would update parent "${parentDoc.title}" children:`);
        console.log(`   Current: ${parentDoc.children.length} children`);
        console.log(`   New: ${newChildren.length} children`);
      } else {
        await client
          .patch(IN_EAR_WIRELESS_HEADER)
          .set({ children: newChildren })
          .commit();
        console.log(`✅ Updated parent header children (removed TWS)`);
      }
    }
    
    // Delete TWS document
    if (dryRun) {
      console.log(`🔍 Would delete TWS category: ${twsDoc.title}`);
    } else {
      await client.delete(TWS_ID);
      console.log(`✅ Deleted TWS category: ${twsDoc.title}`);
    }
    
    return { success: true };
  } catch (err) {
    console.error(`❌ Error deleting TWS: ${err.message}`);
    return { success: false, error: err.message };
  }
}

async function createNewCategories(dryRun = true) {
  console.log('\n🟢 STEP 2: Create 4 New Categories');
  console.log('═══════════════════════════════════════════════════════════');
  
  const newCategories = [
    {
      title: 'Semi-Open',
      slug: 'semi-open',
      parentId: BY_DESIGN_HEADER,
      sortOrder: 2,
      description: 'Semi-open headphones - vented design between open and closed'
    },
    {
      title: 'Bluetooth DAC/Amps',
      slug: 'bluetooth-dac-amps',
      parentId: AMPLIFICATION_HEADER,
      sortOrder: 2,
      description: 'Bluetooth-enabled DAC and amplifier combinations'
    },
    {
      title: 'USB-C/Dongle DACs',
      slug: 'usb-c-dacs',
      parentId: DIGITAL_SOURCES_HEADER,
      sortOrder: 2,
      description: 'Portable USB-C and dongle-style DACs'
    },
    {
      title: 'Eartips',
      slug: 'eartips',
      parentId: MAINTENANCE_HEADER,
      sortOrder: 1,
      description: 'Replacement eartips for IEMs - foam, silicone, and specialty tips'
    }
  ];
  
  const createdIds = [];
  
  for (const cat of newCategories) {
    try {
      // Check if category already exists
      const existing = await client.fetch(`*[_type == "catalogueItem" && slug.current == "${cat.slug}"][0]`);
      
      if (existing) {
        console.log(`ℹ️ Category "${cat.title}" already exists (${existing._id})`);
        createdIds.push({ slug: cat.slug, id: existing._id, existing: true });
        continue;
      }
      
      if (dryRun) {
        console.log(`🔍 Would create: ${cat.title} (slug: ${cat.slug})`);
        console.log(`   Parent: ${cat.parentId}`);
        createdIds.push({ slug: cat.slug, id: '(new-id)', dryRun: true });
      } else {
        const doc = await client.create({
          _type: 'catalogueItem',
          title: cat.title,
          type: 'link',
          slug: { current: cat.slug },
          parent: { _type: 'reference', _ref: cat.parentId },
          sortOrder: cat.sortOrder
        });
        
        console.log(`✅ Created: ${cat.title} (${doc._id})`);
        createdIds.push({ slug: cat.slug, id: doc._id });
        
        // Update parent header to include new child
        const parent = await client.getDocument(cat.parentId);
        if (parent) {
          const currentChildren = parent.children || [];
          const newChildren = [...currentChildren, { _type: 'reference', _ref: doc._id }];
          
          await client
            .patch(cat.parentId)
            .set({ children: newChildren })
            .commit();
          
          console.log(`   Updated parent "${parent.title}" children array`);
        }
      }
    } catch (err) {
      console.error(`❌ Error creating "${cat.title}": ${err.message}`);
    }
  }
  
  return { success: true, createdIds };
}

async function applyRenames(dryRun = true) {
  console.log('\n🟡 STEP 3: Apply Category Renames');
  console.log('═══════════════════════════════════════════════════════════');
  
  const renames = [
    { id: IN_EAR_WIRELESS_HEADER, oldTitle: 'In-Ear & Wireless', newTitle: 'In-Ear Monitors' },
    { id: IEMS_LEAF, oldTitle: 'Monitors (IEMs)', newTitle: 'Universal IEMs' },
    { id: MAINTENANCE_HEADER, oldTitle: 'Maintenance', newTitle: 'Fit & Comfort' }
  ];
  
  for (const rename of renames) {
    try {
      const doc = await client.getDocument(rename.id);
      
      if (!doc) {
        console.log(`⚠️ Document not found: ${rename.id}`);
        continue;
      }
      
      if (doc.title === rename.newTitle) {
        console.log(`ℹ️ "${rename.newTitle}" already renamed`);
        continue;
      }
      
      if (dryRun) {
        console.log(`🔍 Would rename: "${doc.title}" → "${rename.newTitle}"`);
      } else {
        await client
          .patch(rename.id)
          .set({ title: rename.newTitle })
          .commit();
        console.log(`✅ Renamed: "${rename.oldTitle}" → "${rename.newTitle}"`);
      }
    } catch (err) {
      console.error(`❌ Error renaming ${rename.id}: ${err.message}`);
    }
  }
  
  return { success: true };
}

async function verifyOperations() {
  console.log('\n🔍 STEP 4: Verification');
  console.log('═══════════════════════════════════════════════════════════');
  
  try {
    // Check TWS deleted
    const twsCheck = await client.getDocument(TWS_ID);
    console.log(`TWS category: ${twsCheck ? '❌ STILL EXISTS' : '✅ Deleted'}`);
    
    // Check new categories exist
    const newSlugs = ['semi-open', 'bluetooth-dac-amps', 'usb-c-dacs', 'eartips'];
    console.log('\nNew categories:');
    for (const slug of newSlugs) {
      const exists = await client.fetch(`*[_type == "catalogueItem" && slug.current == "${slug}"][0]`);
      console.log(`  ${slug}: ${exists ? '✅' : '❌'}`);
    }
    
    // Check renames
    const renameChecks = [
      { id: IN_EAR_WIRELESS_HEADER, expected: 'In-Ear Monitors' },
      { id: MAINTENANCE_HEADER, expected: 'Fit & Comfort' }
    ];
    console.log('\nRenames:');
    for (const check of renameChecks) {
      const doc = await client.getDocument(check.id);
      const status = doc?.title === check.expected ? '✅' : '❌';
      console.log(`  ${check.expected}: ${status} (current: ${doc?.title || 'N/A'})`);
    }
    
    return { success: true };
  } catch (err) {
    console.error(`❌ Verification error: ${err.message}`);
    return { success: false };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--execute');
  
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║    CATALOGUE COHERENCE SPRINT - SANITY OPERATIONS          ║');
  console.log(dryRun ? '║                    [ DRY RUN MODE ]                        ║' : '║                   [ EXECUTE MODE ]                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  // Check credentials
  if (!process.env.SANITY_API_TOKEN) {
    console.error('\n❌ SANITY_API_TOKEN not found in environment');
    console.log('Please ensure your .env or .env.local file contains:');
    console.log('  SANITY_API_TOKEN=your_token_here');
    process.exit(1);
  }
  
  console.log(`\n📡 Connecting to Sanity:`);
  console.log(`   Project: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`);
  console.log(`   Dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET}`);
  
  if (!dryRun) {
    const confirmed = await confirmOperation('\n⚠️  This will MODIFY your Sanity CMS data. Are you sure?');
    if (!confirmed) {
      console.log('Operation cancelled.');
      rl.close();
      process.exit(0);
    }
  }
  
  try {
    // Execute operations
    await deleteTWSCategory(dryRun);
    await createNewCategories(dryRun);
    await applyRenames(dryRun);
    
    if (!dryRun) {
      await verifyOperations();
      console.log('\n🎉 All Sanity operations completed!');
      console.log('\nNext steps:');
      console.log('  1. Run: node scripts/build-catalogue-index.mjs');
      console.log('  2. Run: npx tsx tests/regression/catalogue-coherence-sprint.regression.test.ts');
    } else {
      console.log('\n🔍 Dry run completed. No changes made.');
      console.log('Run with --execute to apply changes.');
    }
    
    rl.close();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Fatal error:', err.message);
    rl.close();
    process.exit(1);
  }
}

main();
