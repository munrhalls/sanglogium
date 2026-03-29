#!/usr/bin/env node
/**
 * Comprehensive VFS Semantic Validity Audit
 *
 * This script performs a holistic audit of catalogue semantic validity:
 * 1. Analyzes current product-to-catalogue mappings
 * 2. Defines "should be" state based on semantic analysis
 * 3. Identifies all gaps and discrepancies
 * 4. Outputs comprehensive audit report
 */

import { createClient } from '@sanity/client';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

config();

// Load catalogue index
const catalogueIndex = JSON.parse(
  readFileSync(new URL('../data/catalogue-index.json', import.meta.url))
);

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-11-14',
  useCdn: false
});

// ============================================================================
// SEMANTIC CATEGORY DEFINITIONS - What products BELONG in each category
// ============================================================================

const SEMANTIC_CATEGORIES = {
  // HEADPHONES BRANCH
  'open-back': {
    description: 'Open-back headphones - headphones with open earcups that allow sound to pass through',
    expectedProductTypes: [
      'headphones', 'over-ear headphones', 'open-back headphones',
      'open back', 'circumaural open', 'audiophile headphones'
    ],
    expectedBrands: ['Sennheiser', 'Beyerdynamic', 'AKG', 'Audio-Technica', 'HiFiMAN', 'Audeze', 'Focal'],
    excludeTerms: ['closed-back', 'closed back', 'IEM', 'earbud', 'wireless', 'bluetooth', 'gaming'],
    keywords: ['open', 'back', 'over-ear', 'circumaural']
  },
  'closed-back': {
    description: 'Closed-back headphones - sealed earcups for isolation',
    expectedProductTypes: ['headphones', 'over-ear headphones', 'closed-back headphones', 'monitoring headphones'],
    expectedBrands: ['Sony', 'Audio-Technica', 'Beyerdynamic', 'Shure', 'Sennheiser'],
    excludeTerms: ['open-back', 'earbud', 'IEM'],
    keywords: ['closed', 'back', 'sealed', 'isolation']
  },
  'planar-magnetic': {
    description: 'Planar magnetic driver headphones - thin diaphragm with magnetic array',
    expectedProductTypes: ['planar magnetic headphones', 'planars', 'magnetic headphones'],
    expectedBrands: ['Audeze', 'HiFiMAN', 'Dan Clark Audio', 'Fostex', 'Monoprice'],
    excludeTerms: ['dynamic driver', 'electrostatic', 'balanced armature'],
    keywords: ['planar', 'magnetic', 'orthodynamic']
  },
  'dynamic': {
    description: 'Dynamic driver headphones - traditional cone/dome driver design',
    expectedProductTypes: ['dynamic headphones', 'moving coil headphones'],
    expectedBrands: ['Sennheiser', 'Sony', 'Beyerdynamic', 'Audio-Technica', 'AKG'],
    excludeTerms: ['planar', 'electrostatic', 'balanced armature'],
    keywords: ['dynamic', 'driver', 'moving coil']
  },
  'electrostatic': {
    description: 'Electrostatic headphones - thin membrane between charged plates',
    expectedProductTypes: ['electrostatic headphones', 'stats', 'e-stats'],
    expectedBrands: ['Stax', 'HiFiMAN', 'Shure', 'Koss'],
    excludeTerms: ['dynamic', 'planar', 'IEM'],
    keywords: ['electrostatic', 'estat', 'stat', 'electrostat']
  },
  'monitors-iems': {
    description: 'In-ear monitors (IEMs) - professional earphones for musicians/audiophiles',
    expectedProductTypes: ['IEM', 'in-ear monitor', 'in-ear headphone', 'earphone', 'CIEM'],
    expectedBrands: ['Shure', '64 Audio', 'Moondrop', 'Campfire Audio', 'JH Audio', 'Westone'],
    excludeTerms: ['over-ear', 'headphone', 'earbud', 'bluetooth', 'wireless'],
    keywords: ['IEM', 'in-ear', 'monitor', 'earphone', 'universal', 'custom']
  },
  'true-wireless-tws': {
    description: 'True wireless earbuds - completely wireless Bluetooth earbuds',
    expectedProductTypes: ['TWS', 'true wireless', 'wireless earbuds', 'bluetooth earbuds'],
    expectedBrands: ['Sony', 'Apple', 'Sennheiser', 'Bose', 'Jabra', 'Samsung'],
    excludeTerms: ['wired', 'cable', 'IEM', 'over-ear'],
    keywords: ['wireless', 'bluetooth', 'true wireless', 'TWS', 'earbuds', 'no cable']
  },

  // AUDIO ELECTRONICS - AMPLIFICATION
  'desktop-amps': {
    description: 'Desktop headphone amplifiers - stationary amps for home/office use',
    expectedProductTypes: ['headphone amplifier', 'amp', 'desktop amp'],
    expectedBrands: ['Schiit', 'JDS Labs', 'Topping', 'FiiO', 'iFi', 'Audio-GD'],
    excludeTerms: ['portable', 'battery', 'DAP', 'DAC-only'],
    keywords: ['desktop', 'amplifier', 'headphone amp', 'stationary']
  },
  'portable-amps': {
    description: 'Portable headphone amplifiers - battery-powered mobile amps',
    expectedProductTypes: ['portable amp', 'mobile amplifier', 'battery amp'],
    expectedBrands: ['FiiO', 'iFi', 'Sony', 'Astell&Kern'],
    excludeTerms: ['desktop', 'AC power', 'stationary'],
    keywords: ['portable', 'mobile', 'battery', 'travel']
  },

  // AUDIO ELECTRONICS - DIGITAL SOURCES
  'standalone-dacs': {
    description: 'Standalone DACs - digital-to-analog converters without amplification',
    expectedProductTypes: ['DAC', 'digital-to-analog converter', 'USB DAC'],
    expectedBrands: ['Schiit', 'Topping', 'SMSL', 'iFi', 'Chord'],
    excludeTerms: ['amp', 'amplifier', 'combo', 'integrated'],
    keywords: ['DAC', 'converter', 'digital', 'USB']
  },
  'dac-amp-combos': {
    description: 'DAC/Amp combos - integrated DAC and amplifier in one unit',
    expectedProductTypes: ['DAC/amp', 'combo unit', 'integrated DAC amp'],
    expectedBrands: ['Schiit', 'iFi', 'FiiO', 'Topping', 'Audio-GD'],
    excludeTerms: ['standalone DAC', 'amp only'],
    keywords: ['combo', 'DAC/amp', 'integrated', 'all-in-one']
  },
  'digital-players-daps': {
    description: 'Digital Audio Players (DAPs) - portable music players',
    expectedProductTypes: ['DAP', 'digital audio player', 'portable player', 'music player'],
    expectedBrands: ['Astell&Kern', 'Sony', 'FiiO', 'HiBy', 'iBasso', 'Lotoo'],
    excludeTerms: ['phone', 'tablet', 'streamer'],
    keywords: ['DAP', 'player', 'portable', 'music']
  },
  'network-streamers': {
    description: 'Network streamers - devices for streaming audio over network',
    expectedProductTypes: ['streamer', 'network player', 'music streamer'],
    expectedBrands: ['Bluesound', 'Auralic', 'Lumin', 'Innuos', 'HiFi Rose'],
    excludeTerms: ['DAP', 'portable', 'CD player'],
    keywords: ['streamer', 'network', 'streaming', 'wireless', 'WiFi']
  },

  // ACCESSORIES - CONNECTIVITY
  'headphone-cables': {
    description: 'Headphone cables - replacement or upgrade cables for headphones',
    expectedProductTypes: ['headphone cable', 'replacement cable', 'upgrade cable'],
    expectedBrands: ['Audio-Technica', 'Moon Audio', 'Cardas', 'Norne Audio'],
    excludeTerms: ['interconnect', 'USB cable', 'power cable'],
    keywords: ['headphone', 'cable', 'replacement', 'upgrade', '4.4mm', 'XLR']
  },
  'interconnects': {
    description: 'Interconnects - cables for connecting audio components',
    expectedProductTypes: ['interconnect', 'RCA cable', 'XLR cable', 'signal cable'],
    expectedBrands: ['AudioQuest', 'Cardas', 'Kimber', 'Monoprice'],
    excludeTerms: ['headphone cable', 'power cable', 'USB cable'],
    keywords: ['interconnect', 'RCA', 'XLR', 'signal', 'line']
  },
  'adapters': {
    description: 'Adapters - connectors and converters for audio connections',
    expectedProductTypes: ['adapter', 'connector', 'converter', 'dongle'],
    expectedBrands: ['Apple', 'AudioQuest', 'iFi', 'FiiO'],
    excludeTerms: ['cable', 'full length'],
    keywords: ['adapter', 'connector', 'plug', 'jack', 'converter']
  },

  // ACCESSORIES - MAINTENANCE
  'earpads': {
    description: 'Earpads - replacement cushions for headphones',
    expectedProductTypes: ['earpad', 'ear cushion', 'replacement pad'],
    expectedBrands: ['Dekoni', 'Brainwavz', 'Yaxi', 'Wicked Cushions'],
    excludeTerms: ['case', 'stand', 'cable'],
    keywords: ['earpad', 'cushion', 'pad', 'replacement', 'comfort']
  },
  'care-cleaning': {
    description: 'Care & cleaning - products for maintaining audio equipment',
    expectedProductTypes: ['cleaner', 'wipes', 'maintenance kit', 'cleaning solution'],
    expectedBrands: ['Whoosh', 'Gwee', 'Cleaning Kits'],
    excludeTerms: ['equipment', 'device', 'player'],
    keywords: ['clean', 'wipe', 'solution', 'maintenance', 'care']
  },

  // ACCESSORIES - STORAGE
  'headphone-stands': {
    description: 'Headphone stands - holders for displaying/storing headphones',
    expectedProductTypes: ['headphone stand', 'headphone holder', 'display stand'],
    expectedBrands: ['Just Mobile', 'Satechi', 'Twelve South', 'Brainwavz'],
    excludeTerms: ['case', 'cable', 'earpad'],
    keywords: ['stand', 'holder', 'display', 'hanger']
  },
  'carrying-cases': {
    description: 'Carrying cases - protective cases for transporting audio gear',
    expectedProductTypes: ['case', 'carrying case', 'hard case', 'pouch'],
    expectedBrands: ['Pelican', 'Slappa', 'Waterfield', 'DDHiFi'],
    excludeTerms: ['stand', 'cable', 'cleaner'],
    keywords: ['case', 'carrying', 'protective', 'storage', 'travel']
  }
};

// ============================================================================
// AUDIT FUNCTIONS
// ============================================================================

function unrollDescendantKeys(nodeId) {
  const slotMetadataMap = catalogueIndex.slotMetadataMap;

  if (!slotMetadataMap[nodeId]) {
    return [];
  }

  const result = new Set();
  const stack = [nodeId];

  while (stack.length > 0) {
    const currentId = stack.pop();
    if (result.has(currentId)) continue;

    result.add(currentId);
    const children = slotMetadataMap[currentId]?.children || [];
    stack.push(...children);
  }

  return Array.from(result);
}

function resolveSlugToId(slug) {
  return catalogueIndex.slugToIdMap[slug];
}

async function fetchProductsWithCatalogueKeys() {
  console.log('Fetching products with catalogue location keys...');

  const query = `*[_type == "product"]{
    _id,
    name,
    brand,
    catalogueLocationKeys,
    "categoryPath": categoryPath
  }`;

  try {
    const products = await client.fetch(query);
    console.log(`Found ${products.length} products`);
    return products;
  } catch (err) {
    console.error('Error fetching products:', err);
    return [];
  }
}

function analyzeProductSemanticMatch(product, categorySlug) {
  const semanticDef = SEMANTIC_CATEGORIES[categorySlug];
  if (!semanticDef) return { score: 0, reasons: ['No semantic definition'] };

  const name = (product.name || '').toLowerCase();
  const brand = (product.brand || '').toLowerCase();

  let score = 0;
  const reasons = [];
  const concerns = [];

  // Check positive keywords
  semanticDef.keywords.forEach(keyword => {
    if (name.includes(keyword.toLowerCase())) {
      score += 10;
      reasons.push(`Keyword match: "${keyword}"`);
    }
  });

  // Check brand match
  const brandMatch = semanticDef.expectedBrands.find(b =>
    brand.includes(b.toLowerCase())
  );
  if (brandMatch) {
    score += 5;
    reasons.push(`Brand match: ${brandMatch}`);
  }

  // Check product type indicators
  const typeMatches = semanticDef.expectedProductTypes.filter(type =>
    name.includes(type.toLowerCase())
  );
  if (typeMatches.length > 0) {
    score += 15;
    reasons.push(`Product type match: ${typeMatches.join(', ')}`);
  }

  // Check exclusion terms (penalty)
  semanticDef.excludeTerms.forEach(term => {
    if (name.includes(term.toLowerCase())) {
      score -= 20;
      concerns.push(`Exclusion term: "${term}"`);
    }
  });

  // Cap score at 100
  score = Math.max(0, Math.min(100, score));

  return { score, reasons, concerns };
}

function categorizeSemanticValidity(score) {
  if (score >= 80) return { status: 'VALID', severity: 'none' };
  if (score >= 60) return { status: 'LIKELY_VALID', severity: 'low' };
  if (score >= 40) return { status: 'UNCERTAIN', severity: 'medium' };
  if (score >= 20) return { status: 'LIKELY_INVALID', severity: 'high' };
  return { status: 'INVALID', severity: 'critical' };
}

// ============================================================================
// MAIN AUDIT LOGIC
// ============================================================================

async function performAudit() {
  console.log('\n========================================');
  console.log('VFS SEMANTIC VALIDITY AUDIT');
  console.log('========================================\n');

  const products = await fetchProductsWithCatalogueKeys();

  // Build mapping of catalogue keys to products
  const catalogueKeyToProducts = {};
  const productsWithoutKeys = [];

  products.forEach(product => {
    const keys = product.catalogueLocationKeys;
    if (!keys || keys.length === 0) {
      productsWithoutKeys.push(product);
    } else {
      keys.forEach(key => {
        if (!catalogueKeyToProducts[key]) {
          catalogueKeyToProducts[key] = [];
        }
        catalogueKeyToProducts[key].push(product);
      });
    }
  });

  // Analyze each leaf category
  const leafCategories = Object.entries(catalogueIndex.slugToIdMap);
  const auditResults = [];

  console.log(`\nAnalyzing ${leafCategories.length} leaf categories...\n`);

  for (const [slug, id] of leafCategories) {
    const metadata = catalogueIndex.slotMetadataMap[id];
    const assignedProducts = catalogueKeyToProducts[id] || [];
    const subtreeKeys = unrollDescendantKeys(id);

    // Get all products in this subtree
    const subtreeProducts = [];
    subtreeKeys.forEach(key => {
      if (catalogueKeyToProducts[key]) {
        subtreeProducts.push(...catalogueKeyToProducts[key]);
      }
    });

    const semanticDef = SEMANTIC_CATEGORIES[slug];

    // Analyze each assigned product
    const productAnalyses = assignedProducts.map(product => {
      const analysis = analyzeProductSemanticMatch(product, slug);
      const validity = categorizeSemanticValidity(analysis.score);
      return {
        productId: product._id,
        productName: product.name,
        brand: product.brand,
        score: analysis.score,
        status: validity.status,
        severity: validity.severity,
        reasons: analysis.reasons,
        concerns: analysis.concerns
      };
    });

    // Calculate category health
    const validProducts = productAnalyses.filter(p => p.score >= 60).length;
    const invalidProducts = productAnalyses.filter(p => p.score < 40).length;
    const totalAssigned = assignedProducts.length;

    auditResults.push({
      slug,
      id,
      title: metadata?.title || slug,
      description: semanticDef?.description || 'No semantic definition',
      totalAssigned,
      subtreeProductCount: subtreeProducts.length,
      validCount: validProducts,
      invalidCount: invalidProducts,
      healthScore: totalAssigned > 0 ? (validProducts / totalAssigned) * 100 : 0,
      productAnalyses,
      expectedTypes: semanticDef?.expectedProductTypes || [],
      missingSemanticDef: !semanticDef
    });
  }

  // Generate report
  return generateReport(auditResults, productsWithoutKeys, products.length);
}

function generateReport(results, unmappedProducts, totalProductCount) {
  const timestamp = new Date().toISOString();

  // Calculate summary stats
  const categoriesWithProducts = results.filter(r => r.totalAssigned > 0);
  const categoriesWithoutProducts = results.filter(r => r.totalAssigned === 0);
  const categoriesWithInvalid = results.filter(r => r.invalidCount > 0);
  const missingDefinitions = results.filter(r => r.missingSemanticDef);

  const totalAssigned = results.reduce((sum, r) => sum + r.totalAssigned, 0);
  const totalInvalid = results.reduce((sum, r) => sum + r.invalidCount, 0);
  const averageHealth = results.length > 0
    ? results.reduce((sum, r) => sum + r.healthScore, 0) / results.length
    : 0;

  let report = `# VFS SEMANTIC VALIDITY AUDIT REPORT
Generated: ${timestamp}

## EXECUTIVE SUMMARY

**Overall System Health: ${averageHealth.toFixed(1)}%**

### Key Metrics
- **Total Products in System**: ${totalProductCount}
- **Products with Catalogue Assignment**: ${totalAssigned} (${((totalAssigned/totalProductCount)*100).toFixed(1)}%)
- **Unmapped Products**: ${unmappedProducts.length} (${((unmappedProducts.length/totalProductCount)*100).toFixed(1)}%)
- **Total Leaf Categories**: ${results.length}
- **Categories with Products**: ${categoriesWithProducts.length}
- **Empty Categories**: ${categoriesWithoutProducts.length}
- **Categories with Invalid Assignments**: ${categoriesWithInvalid.length}
- **Missing Semantic Definitions**: ${missingDefinitions.length}

### Critical Findings
`;

  // Add critical issues
  const criticalIssues = [];

  if (unmappedProducts.length > totalProductCount * 0.5) {
    criticalIssues.push(`- **MASSIVE GAP**: ${unmappedProducts.length} products (${((unmappedProducts.length/totalProductCount)*100).toFixed(1)}%) have NO catalogue assignment`);
  }

  if (categoriesWithoutProducts.length > results.length * 0.3) {
    criticalIssues.push(`- **EMPTY CATEGORIES**: ${categoriesWithoutProducts.length} categories (${((categoriesWithoutProducts.length/results.length)*100).toFixed(1)}%) have ZERO products`);
  }

  if (totalInvalid > 0) {
    criticalIssues.push(`- **SEMANTIC MISMATCHES**: ${totalInvalid} products are likely in wrong categories`);
  }

  if (missingDefinitions.length > 0) {
    criticalIssues.push(`- **INCOMPLETE AUDIT**: ${missingDefinitions.length} categories lack semantic definitions`);
  }

  if (criticalIssues.length === 0) {
    report += `- No critical issues identified\n`;
  } else {
    report += criticalIssues.join('\n') + '\n';
  }

  // Detailed category analysis
  report += `\n## DETAILED CATEGORY ANALYSIS\n\n`;

  for (const category of results) {
    const status = category.totalAssigned === 0
      ? '🔴 EMPTY'
      : category.healthScore >= 80
        ? '🟢 HEALTHY'
        : category.healthScore >= 60
          ? '🟡 NEEDS ATTENTION'
          : '🔴 CRITICAL';

    report += `### ${category.title} (${category.slug})
**Status**: ${status} | **Health Score**: ${category.healthScore.toFixed(1)}%

**Description**: ${category.description}

**Metrics**:
- Directly Assigned Products: ${category.totalAssigned}
- Subtree Total Products: ${category.subtreeProductCount}
- Valid Assignments: ${category.validCount}
- Invalid Assignments: ${category.invalidCount}

**Expected Product Types**:
${category.expectedTypes.map(t => `- ${t}`).join('\n') || '- None defined'}

`;

    if (category.productAnalyses.length > 0) {
      report += `**Assigned Products Analysis**:\n\n`;
      for (const product of category.productAnalyses) {
        const emoji = product.score >= 80 ? '✅' : product.score >= 60 ? '⚠️' : '❌';
        report += `${emoji} **${product.productName}** (${product.brand || 'Unknown Brand'})\n`;
        report += `   - Score: ${product.score}/100 | Status: ${product.status}\n`;
        if (product.reasons && product.reasons.length > 0) {
          report += `   - Reasons: ${product.reasons.join(', ')}\n`;
        }
        if (product.concerns && product.concerns.length > 0) {
          report += `   - ⚠️ Concerns: ${product.concerns.join(', ')}\n`;
        }
        report += `\n`;
      }
    } else {
      report += `**No products assigned**\n\n`;
    }

    report += `---\n\n`;
  }

  // Gap analysis
  report += `\n## GAP ANALYSIS\n\n`;

  report += `### High-Priority Empty Categories (Expected > 10 products)\n\n`;
  const highPriorityEmpty = categoriesWithoutProducts.filter(c =>
    ['open-back', 'closed-back', 'planar-magnetic', 'desktop-amps',
     'standalone-dacs', 'digital-players-daps', 'network-streamers'].includes(c.slug)
  );

  if (highPriorityEmpty.length > 0) {
    for (const cat of highPriorityEmpty) {
      report += `- **${cat.title}** (${cat.slug})\n`;
      report += `  Expected products: High-value category with no inventory\n`;
    }
  } else {
    report += `- All high-priority categories have some products\n`;
  }

  report += `\n### Unmapped Products Sample (showing ${Math.min(20, unmappedProducts.length)} of ${unmappedProducts.length})\n\n`;
  unmappedProducts.slice(0, 20).forEach(p => {
    report += `- ${p.name} (${p.brand || 'No Brand'})\n`;
  });

  // Recommendations
  report += `\n## RECOMMENDATIONS\n\n`;

  report += `### Immediate Actions\n`;
  if (unmappedProducts.length > 0) {
    report += `1. **URGENT**: Assign ${unmappedProducts.length} unmapped products to appropriate categories\n`;
  }
  if (categoriesWithoutProducts.length > 0) {
    report += `2. **HIGH**: Populate ${categoriesWithoutProducts.length} empty categories with relevant products\n`;
  }
  if (totalInvalid > 0) {
    report += `3. **HIGH**: Review ${totalInvalid} semantically mismatched assignments\n`;
  }

  report += `\n### Strategic Improvements\n`;
  report += `1. Implement automated semantic validation on product assignment\n`;
  report += `2. Add required catalogueLocationKeys validation in Sanity\n`;
  report += `3. Create category-specific product ingestion pipelines\n`;
  report += `4. Build semantic tagging system for automatic categorization\n`;
  report += `5. Add category coverage monitoring alerts\n`;

  return report;
}

// Run the audit
performAudit()
  .then(report => {
    const outputPath = join(process.cwd(), 'audit-reports', `semantic-validity-audit-${new Date().toISOString().split('T')[0]}.md`);
    writeFileSync(outputPath, report);
    console.log('\n✅ Audit complete! Report saved to:', outputPath);
    console.log('\nReport preview:');
    console.log(report.split('\n').slice(0, 50).join('\n'));
  })
  .catch(err => {
    console.error('Audit failed:', err);
    process.exit(1);
  });
