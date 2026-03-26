/**
 * migrate-catalogue-to-flat.mjs
 *
 * One-time migration script to flatten the singleton catalogue tree
 * into independent catalogueItem documents.
 *
 * CRITICAL: Each new document's _id is set to the old node's _key
 * to preserve all existing product catalogueLocationKeys references.
 *
 * USAGE:
 *   1. Add SANITY_API_TOKEN to your .env file (Editor-level write token
 *      from sanity.io/manage → [your project] → API → Tokens)
 *   2. node scripts/migrate-catalogue-to-flat.mjs
 */

import { createClient } from "next-sanity";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ─── Env ─────────────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const API_TOKEN = process.env.SANITY_STUDIO_READ_WRITE_CREATE;

if (!PROJECT_ID) throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID in .env");
if (!DATASET)    throw new Error("Missing NEXT_PUBLIC_SANITY_DATASET in .env");

// ─── Sanity client ────────────────────────────────────────────────────────────

const client = createClient({
  projectId: PROJECT_ID,
  dataset:   DATASET,
  useCdn:    false,           // mutations must bypass CDN
  apiVersion: "2024-11-14",  // matches sanity/env.ts
  token:     API_TOKEN,
});

// ─── Migration functions ───────────────────────────────────────────────────────

function flattenTree(nodes, parentSortOrder = 0) {
  const flatDocs = [];
  
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    
    // Create flat document for this node
    const flatDoc = {
      _id: node._key,                    // CRITICAL: preserve old _key as new _id
      _type: "catalogueItem",
      title: node.title,
      type: node.type ?? "link",
      sortOrder: i,                      // preserve original array position
    };
    
    // Only attach slug when present
    if (node.slug?.current) {
      flatDoc.slug = {
        _type: "slug",
        current: node.slug.current,
      };
    }
    
    // Optional icon
    if (node.icon) {
      flatDoc.icon = node.icon;
    }
    
    // Children as references
    if (Array.isArray(node.children) && node.children.length > 0) {
      flatDoc.children = node.children.map(child => ({
        _type: "reference",
        _ref:  child._key,               // reference to child document by its _key
        _key:  child._key
      }));
      
      // Recursively process children
      const childDocs = flattenTree(node.children, i);
      flatDocs.push(...childDocs);
    }
    
    flatDocs.push(flatDoc);
  }
  
  return flatDocs;
}

// ─── Migration function ───────────────────────────────────────────────────────

async function migrateCatalogue() {
  console.log("🔄  Starting catalogue migration to flat documents...");
  console.log(`    Project : ${PROJECT_ID}`);
  console.log(`    Dataset : ${DATASET}`);

  // 1. Fetch existing singleton catalogue
  console.log("\n📥  Fetching existing singleton catalogue...");
  const singleton = await client.fetch(`*[_id == "catalogue"][0].catalogue`);
  
  if (!singleton) {
    throw new Error("No singleton catalogue document found with _id 'catalogue'");
  }
  
  console.log(`    ✓ Found ${singleton.length} top-level items`);

  // 2. Flatten the tree
  console.log("\n📐  Flattening tree to independent documents...");
  const flatDocuments = flattenTree(singleton);
  console.log(`    ✓ Generated ${flatDocuments.length} flat documents`);

  // Quick audit
  let rootCount = 0;
  let groupCount = 0;
  let leafCount = 0;
  
  for (const doc of flatDocuments) {
    if (doc.type === "header") {
      if (doc.icon) {
        rootCount++;
      } else {
        groupCount++;
      }
    } else {
      leafCount++;
    }
  }
  
  console.log(`    ✓ Audit: ${rootCount} roots, ${groupCount} groups, ${leafCount} leaves`);
  
  // Verify expected counts
  if (flatDocuments.length !== 31) {
    throw new Error(`Expected 31 total documents but got ${flatDocuments.length}`);
  }
  
  if (rootCount !== 3) {
    throw new Error(`Expected 3 root documents but got ${rootCount}`);
  }
  
  if (groupCount !== 8) {
    throw new Error(`Expected 8 group documents but got ${groupCount}`);
  }
  
  if (leafCount !== 20) {
    throw new Error(`Expected 20 leaf documents but got ${leafCount}`);
  }

  // 3. Write to Sanity using transaction
  console.log("\n🚀  Writing flat documents to Sanity Content Lake...");
  
  const transaction = client.transaction();
  
  for (const doc of flatDocuments) {
    transaction.createOrReplace(doc);
  }
  
  await transaction.commit();
  console.log("    ✓ Transaction committed");

  // 4. Verification
  console.log("\n🔍  Verifying migration...");
  const verification = await client.fetch(`*[_type == "catalogueItem"]`);
  
  if (verification.length !== flatDocuments.length) {
    throw new Error(`Verification failed: expected ${flatDocuments.length} documents but found ${verification.length}`);
  }
  
  console.log(`    ✓ Migration verified: ${verification.length} catalogueItem documents in Content Lake`);

  // 5. Summary
  console.log(`
✅  Migration complete!

Summary:
  • Total documents created: ${verification.length}
  • Root nodes (with icon): ${rootCount}
  • Group headers: ${groupCount}
  • Leaf links: ${leafCount}

Next steps:
  1. Run: node scripts/verify-migration.mjs
  2. Run: node scripts/build-catalogue-index.mjs
  3. Test the frontend to ensure VFS queries work correctly
  4. When satisfied, delete the old singleton document: 
     client.delete("catalogue")
`);
}

// ─── Run ──────────────────────────────────────────────────────────────────────

migrateCatalogue().catch((err) => {
  console.error("\n❌  Migration failed:", err.message);
  process.exit(1);
});
