#!/usr/bin/env node

/**
 * VFS Context Template
 * 
 * Run: node scripts/context-for-vfs-task.mjs
 * 
 * Provides instant context for Virtual File System debugging and development.
 * Eliminates 10-30 min/session context rebuild friction.
 */

const VFS_CONTEXT = {
  overview: `
# Virtual File System (VFS) Context

## Purpose
The VFS is a pre-computed catalogue navigation system that enables O(1) category 
lookups and subtree queries. It replaces recursive database traversals with 
path-based prefix matching.

## Key Principle
VFS is pre-computed at build time via daily automatic rebuild (cron).
NEVER query the database recursively for category trees.
`,

  files: {
    data: [
      "data/catalogue-index.json — The VFS data file (slugToIdMap, slotMetadataMap, tree)"
    ],
    buildScripts: [
      "scripts/build-catalogue-index.mjs — Generates catalogue-index.json from Sanity",
      "scripts/validate-catalogue-mappings.mjs — Validates data integrity",
      "scripts/vfs-query-products.mjs — Test VFS-based product queries"
    ],
    lib: [
      "lib/catalogue/semanticConfig.ts — Semantic matching configuration",
      "lib/catalogue/semanticMatching.ts — Product-to-category matching logic"
    ]
  },

  keyConcepts: {
    slugToIdMap: {
      description: "Maps URL slugs to catalogue item IDs",
      example: '"headphones/open-back" → "o7c6baiuobsr7ni2y2vf22sh"',
      usage: "Instant lookup for category pages"
    },
    slotMetadataMap: {
      description: "Metadata for each catalogue slot (headers and links)",
      fields: ["title", "url", "slug", "breadcrumbs", "children", "type", "path"],
      usage: "Navigation rendering, breadcrumbs, parent-child relationships"
    },
    unrollDescendantKeys: {
      description: "Function to get all descendant IDs for a parent category",
      purpose: "Subtree product queries (e.g., all headphones = open-back + closed-back + ...)"
    },
    buildGroqKeysParam: {
      description: "Builds GROQ query parameter from VFS keys",
      pattern: "count(catalogueLocationKeys[@ in $keys]) > 0"
    }
  },

  criticalIssues: {
    subtreeCorrectness: {
      status: "KNOWN ISSUE — March 2026 Audit",
      problem: "slotMetadataMap missing intermediate header nodes (e.g., 'By Design' headers)",
      impact: "Subtree queries include invalid IDs that break GROQ queries",
      workaround: "Use only leaf-level slugs for product queries until build script fixed",
      rootCause: "Build script inconsistency between tree generation and metadata map generation"
    }
  },

  commonTasks: {
    debugCategoryLookup: [
      "1. Check slugToIdMap for the slug",
      "2. Get ID from mapping",
      "3. Check slotMetadataMap[ID] for metadata",
      "4. If type='header', use unrollDescendantKeys to get children"
    ],
    addNewCategory: [
      "1. Create catalogue item in Sanity Studio",
      "2. Run: node scripts/build-catalogue-index.mjs",
      "3. Verify: check slugToIdMap and slotMetadataMap in data/catalogue-index.json",
      "4. Test: node scripts/vfs-query-products.mjs"
    ],
    fixMissingMetadata: [
      "1. Identify missing ID in slotMetadataMap",
      "2. Check if ID exists in tree structure",
      "3. If yes: build script bug — fix scripts/build-catalogue-index.mjs",
      "4. If no: data issue — check Sanity catalogue items"
    ]
  },

  verificationCommands: {
    syntax: "node -c scripts/context-for-vfs-task.mjs",
    testVfs: "node scripts/vfs-query-products.mjs",
    validate: "node scripts/validate-catalogue-mappings.mjs",
    rebuild: "node scripts/build-catalogue-index.mjs"
  }
};

function printSection(title, content) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${"=".repeat(60)}\n`);
  
  if (typeof content === "string") {
    console.log(content);
  } else if (Array.isArray(content)) {
    content.forEach(item => console.log(`  • ${item}`));
  } else if (typeof content === "object") {
    Object.entries(content).forEach(([key, value]) => {
      if (typeof value === "object" && !Array.isArray(value)) {
        console.log(`\n  [${key}]`);
        Object.entries(value).forEach(([k, v]) => {
          if (Array.isArray(v)) {
            console.log(`    ${k}:`);
            v.forEach(item => console.log(`      • ${item}`));
          } else {
            console.log(`    ${k}: ${v}`);
          }
        });
      } else if (Array.isArray(value)) {
        console.log(`\n  [${key}]`);
        value.forEach(item => console.log(`    • ${item}`));
      } else {
        console.log(`  ${key}: ${value}`);
      }
    });
  }
}

function main() {
  console.log(VFS_CONTEXT.overview);
  
  printSection("FILES — Data", VFS_CONTEXT.files.data);
  printSection("FILES — Build Scripts", VFS_CONTEXT.files.buildScripts);
  printSection("FILES — Library", VFS_CONTEXT.files.lib);
  printSection("KEY CONCEPTS", VFS_CONTEXT.keyConcepts);
  printSection("CRITICAL ISSUES", VFS_CONTEXT.criticalIssues);
  printSection("COMMON TASKS", VFS_CONTEXT.commonTasks);
  printSection("VERIFICATION COMMANDS", VFS_CONTEXT.verificationCommands);
  
  console.log(`\n${"=".repeat(60)}`);
  console.log("  VFS Context Output Complete");
  console.log(`${"=".repeat(60)}\n`);
}

main();
