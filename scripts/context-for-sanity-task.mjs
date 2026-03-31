#!/usr/bin/env node

/**
 * Sanity Context Template
 * 
 * Run: node scripts/context-for-sanity-task.mjs
 * 
 * Provides instant context for Sanity CMS debugging and development.
 * Eliminates 10-30 min/session context rebuild friction.
 */

const SANITY_CONTEXT = {
  overview: `
# Sanity CMS Context

## Purpose
Sanity CMS is the content management system for sang-logium. It manages products,
categories, orders, users, and homepage content with strict type safety via Typegen.

## Key Principle
Sanity Typegen outputs are the ABSOLUTE source of truth for schema types.
NEVER manually define types that conflict with generated Sanity types.
`,

  files: {
    schemas: [
      "sanity/schemaTypes/productType.ts — Product definitions with catalogueLocationKeys",
      "sanity/schemaTypes/catalogueItemType.ts — Category/slot definitions",
      "sanity/schemaTypes/orderType.ts — Order FSM states and fields",
      "sanity/schemaTypes/userType.ts — Clerk user sync schema",
      "sanity/schemaTypes/heroType.ts — Homepage hero sections",
      "sanity/schemaTypes/homepageDataType.ts — Homepage composition",
      "sanity/schemaTypes/spotlightType.ts — Product spotlight references",
      "sanity/schemaTypes/blockContentType.ts — Rich text content",
      "sanity/schemaTypes/categoryFiltersType.ts — Filter configurations",
      "sanity/schemaTypes/categorySortablesType.ts — Sort options"
    ],
    typegen: [
      "sanity.types.ts — GENERATED: TypeScript types from schemas",
      "schema.json — GENERATED: JSON schema representation"
    ],
    lib: [
      "sanity/lib/client.ts — Sanity client configuration",
      "sanity/lib/backendClient.ts — Backend/client with token",
      "sanity/lib/api/ — API helper functions",
      "sanity/lib/deleteUtils.ts — Safe deletion utilities"
    ],
    studio: [
      "app/(studio)/studio/ — Embedded Sanity Studio"
    ]
  },

  keyConcepts: {
    typegen: {
      description: "Automatic TypeScript generation from Sanity schemas",
      command: "npm run typegen (sanity typegen generate)",
      criticalRule: "NEVER manually define types that conflict with generated types"
    },
    groq: {
      description: "Graph-Relational Object Queries",
      pattern: "*[_type == 'product' && condition] { ... }",
      expansion: "Use @portabletext/react for rich text rendering"
    },
    catalogueLocationKeys: {
      description: "Product field for VFS integration",
      schema: "array of strings, required",
      usage: "Links products to category slots for O(1) lookups",
      example: '["headphones/open-back", "headphones/planar-magnetic"]'
    },
    imageUrlBuilder: {
      description: "Sanity image transformation utility",
      import: "import imageUrlBuilder from '@sanity/image-url'",
      usage: "Generate optimized CDN URLs with crops/hotspots"
    }
  },

  fetchStrategy: {
    order: [
      "1. Sanity Schema — Define/document in schemaTypes/",
      "2. Localhost Studio — Test content structure",
      "3. GROQ Library — Write/test queries in vision tool",
      "4. React Server Component — Use async data fetching",
      "5. Prebuilt Props — Pass to Client Components",
      "6. Client Components — Receive props, no direct Sanity calls"
    ],
    note: "Data fetching MUST be parallelized on the server to reduce waterfall requests"
  },

  commonTasks: {
    addProductField: [
      "1. Edit sanity/schemaTypes/productType.ts",
      "2. Run: npm run typegen",
      "3. Verify: check sanity.types.ts for new field",
      "4. Update GROQ queries to include new field",
      "5. Test in Studio: localhost:3000/studio"
    ],
    writeGroqQuery: [
      "1. Open Sanity Vision: localhost:3333/vision (or /studio/vision)",
      "2. Write and test query with real data",
      "3. Copy to app/actions/ file",
      "4. Type with generated types from sanity.types.ts",
      "5. Use in Server Component with async/await"
    ],
    fixTypeMismatch: [
      "1. Check sanity.types.ts for correct type",
      "2. Compare with your manual type definition",
      "3. Either: a) Regenerate types, or b) Use generated type directly",
      "4. NEVER: Create conflicting manual type"
    ],
    updateProductSchema: [
      "1. Modify sanity/schemaTypes/productType.ts",
      "2. Consider migration for existing documents",
      "3. Run: npm run typegen",
      "4. Test query in Vision tool",
      "5. Update affected components"
    ]
  },

  verificationCommands: {
    typegen: "npm run typegen",
    studio: "npm run dev → visit localhost:3000/studio",
    vision: "In Studio → Vision tab for GROQ testing",
    build: "npm run build"
  },

  cmsWorkflow: {
    fetch: "Sanity Schema → Localhost Studio → GROQ Library → React Server Component → Prebuilt Props → Client Components"
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
  console.log(SANITY_CONTEXT.overview);
  
  printSection("FILES — Schemas", SANITY_CONTEXT.files.schemas);
  printSection("FILES — Typegen", SANITY_CONTEXT.files.typegen);
  printSection("FILES — Library", SANITY_CONTEXT.files.lib);
  printSection("FILES — Studio", SANITY_CONTEXT.files.studio);
  printSection("KEY CONCEPTS", SANITY_CONTEXT.keyConcepts);
  printSection("FETCH STRATEGY", SANITY_CONTEXT.fetchStrategy.order);
  printSection("COMMON TASKS", SANITY_CONTEXT.commonTasks);
  printSection("VERIFICATION COMMANDS", SANITY_CONTEXT.verificationCommands);
  
  console.log(`\n${"=".repeat(60)}`);
  console.log("  Sanity Context Output Complete");
  console.log(`${"=".repeat(60)}\n`);
}

main();
