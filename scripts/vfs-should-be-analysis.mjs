#!/usr/bin/env node
/**
 * Professional "Should Be" State Analysis
 *
 * This script analyzes the 582 existing products and creates a professional
 * mapping of what SHOULD be in each catalogue category based on semantic
 * analysis of product names and existing category paths.
 */

import { createClient } from '@sanity/client';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

config();

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-11-14',
  useCdn: false
});

// Load catalogue index
const catalogueIndex = JSON.parse(
  readFileSync(new URL('../data/catalogue-index.json', import.meta.url))
);

// ============================================================================
// ADVANCED SEMANTIC MATCHING RULES
// ============================================================================

const CATEGORY_MATCHING_RULES = {
  // HEADPHONES - By Design
  'open-back': {
    include: [
      /open[-\s]?back/i,
      /open back/i,
      /open-back headphone/i,
      /hd[-\s]?6(00|50|60)/i,  // Sennheiser open backs
      /hd[-\s]?5(80|60)/i,
      /dt[-\s]?1990|dt[-\s]?990|dt[-\s]?880/i,  // Beyerdynamic open
      /k7(01|02|12|xx)/i,  // AKG open
      /(sundara|arya|ananda|he400|he6|he1000)/i,  // HiFiMAN planars (often open)
      /(lcd|isine)/i,  // Audeze
    ],
    exclude: [
      /closed[-\s]?back/i,
      /bluetooth/i,
      /wireless/i,
      /gaming/i,
      /headset/i
    ],
    minScore: 20
  },

  'closed-back': {
    include: [
      /closed[-\s]?back/i,
      /closed back/i,
      /mdr[-\s]?z?1r/i,  // Sony closed
      /ah[-\s]?d7200|ah[-\s]?d5200/i,  // Denon closed
      /m50x|m40x|msr7/i,  // Audio-Technica closed
      /dt[-\s]?770|dt[-\s]?700/i,  // Beyerdynamic closed
      /mh[-\s]?751|mh[-\s]?752/i,  // Cooler Master (closed gaming)
      /momentum/i,  // Sennheiser closed
    ],
    exclude: [
      /open[-\s]?back/i,
      /earbud/i,
      /iem/i,
      /in[-\s]?ear/i
    ],
    minScore: 20
  },

  // HEADPHONES - By Driver
  'planar-magnetic': {
    include: [
      /planar/i,
      /orthodynamic/i,
      /(sundara|arya|ananda|he400|he500|he6|he1000|he(?:[0-9]{3,4}))/i,  // HiFiMAN
      /(lcd[-\s]?[0-9]+|isine|sine|el[-\s]?[0-9]+|mm[-\s]?[0-9]+)/i,  // Audeze
      /(ether|voce|aeon)/i,  // Dan Clark Audio
      /(th[-\s]?[0-9]+|tr[-\s]?[0-9]+)/i,  // Fostex planars
      /hedd/i,  // HEDD planar
    ],
    exclude: [
      /dynamic/i,
      /electrostat/i,
      /cable/i
    ],
    minScore: 25
  },

  'dynamic': {
    include: [
      /dynamic driver/i,
      /hd[-\s]?[0-9]{2,4}/i,  // Sennheiser dynamics
      /dt[-\s]?[0-9]{3,4}/i,  // Beyerdynamic
      /k[0-9]{2,3}/i,  // AKG
      /m[0-9]{2,3}x?/i,  // Audio-Technica
      /mdr/i,  // Sony
      /sr[0-9]{2,4}/i,  // Grado
      /hp/i,
    ],
    exclude: [
      /planar/i,
      /electrostat/i,
      /cable/i,
      /adapter/i
    ],
    minScore: 15
  },

  'electrostatic': {
    include: [
      /electrostat/i,
      /estat/i,
      /stax/i,
      /sr[-\s]?(009|007|lambda|omega|303)/i,  // Stax
      /shangri[-\s]?la/i,  // HiFiMAN electrostat
      /kse[0-9]{4}/i,  // Koss electrostats
    ],
    exclude: [
      /planar/i,
      /dynamic/i
    ],
    minScore: 30
  },

  // HEADPHONES - In-Ear & Wireless
  'monitors-iems': {
    include: [
      /iem/i,
      /in[-\s]?ear monitor/i,
      /[0-9]+ audio/i,  // 64 Audio
      /moondrop/i,
      /campfire/i,
      /jh audio/i,
      /westone/i,
      /shure.*se[0-9]+/i,  // Shure IEMs
      /ue[-\s]?[0-9]+/i,  // Ultimate Ears
      /andromeda|orion|jupiter|vega/i,  // Campfire models
      /(uni|custom)/i,  // CIEM indicators
      /earphone/i,
    ],
    exclude: [
      /bluetooth/i,
      /wireless/i,
      /true wireless/i,
      /tws/i,
      /earbud/i,
      /headphone/i,
    ],
    minScore: 20
  },

  'true-wireless-tws': {
    include: [
      /true[-\s]?wireless/i,
      /tws/i,
      /wf[-\s]?[0-9]+/i,  // Sony TWS
      /airpods/i,
      /galaxy[-\s]?buds/i,
      /quietcomfort.*earbuds/i,  // Bose TWS
      /momentum.*true/i,  // Sennheiser TWS
      /freebuds/i,  // Huawei
      /jabra/i,
      /earbud/i,
      /wireless.*earbuds/i,
      /bluetooth.*earbuds/i,
    ],
    exclude: [
      /headphone/i,
      /over[-\s]?ear/i,
      /cable/i,
    ],
    minScore: 20
  },

  // AUDIO ELECTRONICS - Amplification
  'desktop-amps': {
    include: [
      /amplifier/i,
      /amp/i,
      /headphone amp/i,
      /magni|vali|lyr|asgard|jotunheim/i,  // Schiit
      /atom/i,  // JDS
      /(l30|a30|dx3)/i,  // Topping
      /(k5|k9)/i,  // FiiO desktop
      /(zen can|cayin|burson)/i,
      /ha[-\s]?[0-9]+/i,  // Various amp models
      /integrated.*amp/i,
      /power.*amp/i,
      /phono.*stage/i,
    ],
    exclude: [
      /portable/i,
      /battery/i,
      /dac[-\s]?only/i,
      /player/i,
      /daps?/i,
    ],
    minScore: 20
  },

  'portable-amps': {
    include: [
      /portable.*amp/i,
      /battery.*amp/i,
      /(btr|utws)/i,  // FiiO portable
      /(xcan|xdsd)/i,  // iFi portable
      /(pha|nw|wm)/i,  // Sony portable
      /(ak|sp|sr)/i,  // Astell&Kern portable
    ],
    exclude: [
      /desktop/i,
      /stationary/i,
      /daps?/i,
    ],
    minScore: 25
  },

  // AUDIO ELECTRONICS - Digital Sources
  'standalone-dacs': {
    include: [
      /dac/i,
      /digital[-\s]?to[-\s]?analog/i,
      /modi|bifrost|gungnir|yggdrasil/i,  // Schiit
      /(e30|d30|d90|dx7)/i,  // Topping DACs
      /(k3|k5|k7|q3|q5|q7)/i,  // FiiO DACs
      /(zen dac|idsd|neo|one)/i,  // iFi DACs
      /chord.*(hugo|mojo|qutest)/i,  // Chord
      /rme/i,
      /smsl/i,
    ],
    exclude: [
      /dac.*amp.*combo/i,
      /integrated/i,
      /combo/i,
      /player/i,
      /daps?/i,
    ],
    minScore: 20
  },

  'dac-amp-combos': {
    include: [
      /combo/i,
      /all[-\s]?in[-\s]?one/i,
      /dac.*amp/i,
      /amp.*dac/i,
      /(fulla|hel)/i,  // Schiit combos
      /(dx3|dx5|dx7|dx9)/i,  // Topping combos
      /(k5|k7|k9)/i,  // FiiO combos
      /(zen dac|zen can|zen stack)/i,  // iFi combos
      /(fiio| topping).*pro/i,
    ],
    exclude: [
      /standalone/i,
      /dac[-\s]?only/i,
    ],
    minScore: 25
  },

  'digital-players-daps': {
    include: [
      /dap/i,
      /digital audio player/i,
      /music player/i,
      /portable player/i,
      /(ak|sp|sr|sa)[-\s]?[0-9]+/i,  // Astell&Kern
      /(nw|wm)[-\s]?[0-9]+/i,  // Sony Walkman
      /(m[0-9]+|m[0-9]+ pro)/i,  // FiiO DAPs
      /(r[0-9]+|r[0-9]+ pro)/i,  // HiBy DAPs
      /(dx|ibasso)/i,
      /lotoo/i,
      /cayin.*n[0-9]+/i,
      /shanling/i,
      /cassette/i,
      /cd player/i,
      /tape deck/i,
    ],
    exclude: [
      /network/i,
      /streamer/i,
      /home/i,
      /receiver/i,
    ],
    minScore: 25
  },

  'network-streamers': {
    include: [
      /streamer/i,
      /network player/i,
      /streaming/i,
      /bluesound/i,
      /auralic/i,
      /lumin/i,
      /innuos/i,
      /hifi[-\s]?rose/i,
      /bridge/i,
      /roon/i,
      /(node|vault|powernode)/i,
      /volumio/i,
      /(aries|altair|polaris)/i,  // Auralic
    ],
    exclude: [
      /portable/i,
      /daps?/i,
      /cd player/i,
    ],
    minScore: 25
  },

  // ACCESSORIES - Connectivity
  'headphone-cables': {
    include: [
      /headphone[-\s]?cable/i,
      /replacement[-\s]?cable/i,
      /upgrade[-\s]?cable/i,
      /(4\.4mm|2\.5mm|xlr|balanced).*cable/i,
      /cable.*(headphone|iem)/i,
      /meze.*cable/i,
      /audioquest.*(chicago|golden gate|evergreen|red river)/i,
    ],
    exclude: [
      /interconnect/i,
      /rca/i,
      /usb cable/i,
      /power cable/i,
      /hdmi/i,
      /adapter/i,
    ],
    minScore: 20
  },

  'interconnects': {
    include: [
      /interconnect/i,
      /rca[-\s]?cable/i,
      /xlr[-\s]?cable/i,
      /(toslink|optical|coaxial)/i,
      /audioquest.*(pearl|cinnamon|chicago|evergreen|golden gate)/i,
      /usb[-\s]?(a to b|type b)/i,
      /digital[-\s]?interconnect/i,
    ],
    exclude: [
      /headphone[-\s]?cable/i,
      /power cable/i,
      /hdmi/i,
    ],
    minScore: 20
  },

  'adapters': {
    include: [
      /adapter/i,
      /connector/i,
      /converter/i,
      /dongle/i,
      /(4\.4mm|2\.5mm|3\.5mm).*adapter/i,
      /balanced.*adapter/i,
      /(xlr|rca|trs).*adapter/i,
      /ground[-\s]?loop/i,
      /impedance/i,
    ],
    exclude: [
      /cable/i,
      /headphone/i,
      /amp/i,
    ],
    minScore: 25
  },

  // ACCESSORIES - Maintenance
  'earpads': {
    include: [
      /earpad/i,
      /ear[-\s]?cushion/i,
      /ear[-\s]?pad/i,
      /replacement[-\s]?pad/i,
      /(dekoni|brainwavz|yaxi|wicked)/i,
      /pads.*(hd|dt|m50)/i,
      /velour|leather.*pad/i,
    ],
    exclude: [
      /case/i,
      /stand/i,
      /cable/i,
    ],
    minScore: 30
  },

  'care-cleaning': {
    include: [
      /clean/i,
      /wipe/i,
      /maintenance/i,
      /care[-\s]?kit/i,
      /cleaning[-\s]?solution/i,
      /whoosh/i,
      /microfiber/i,
      /(brush|cloth|solution).*clean/i,
    ],
    exclude: [
      /equipment/i,
      /device/i,
      /cable/i,
    ],
    minScore: 25
  },

  // ACCESSORIES - Storage
  'headphone-stands': {
    include: [
      /headphone[-\s]?stand/i,
      /headphone[-\s]?holder/i,
      /stand.*headphone/i,
      /(just mobile|satechi|twelve south|brainwavz).*stand/i,
      /hanger/i,
      /display[-\s]?stand/i,
    ],
    exclude: [
      /case/i,
      /cable/i,
      /earpad/i,
    ],
    minScore: 25
  },

  'carrying-cases': {
    include: [
      /carrying[-\s]?case/i,
      /hard[-\s]?case/i,
      /protective[-\s]?case/i,
      /case.*(headphone|iem|earphone)/i,
      /(pelican|slappa|waterfield|ddhifi)/i,
      /pouch/i,
      /storage[-\s]?case/i,
      /travel[-\s]?case/i,
    ],
    exclude: [
      /stand/i,
      /cable/i,
      /earpad/i,
    ],
    minScore: 20
  }
};

// ============================================================================
// SEMANTIC ANALYSIS FUNCTIONS
// ============================================================================

function calculateMatchScore(product, categorySlug) {
  const rules = CATEGORY_MATCHING_RULES[categorySlug];
  if (!rules) return { score: 0, matches: [], mismatches: [] };

  const name = (product.name || '').toLowerCase();
  const brand = (product.brand || '').toLowerCase();
  const categoryPath = (product.categoryPath || []).join(' ').toLowerCase();
  const searchText = `${name} ${brand} ${categoryPath}`;

  let score = 0;
  const matches = [];
  const mismatches = [];

  // Check include patterns
  rules.include.forEach((pattern, idx) => {
    if (pattern.test(searchText)) {
      // Weight earlier patterns higher
      const weight = 30 - (idx * 0.5);
      score += weight;
      matches.push(pattern.toString());
    }
  });

  // Check exclude patterns
  rules.exclude.forEach(pattern => {
    if (pattern.test(searchText)) {
      score -= 25;
      mismatches.push(`Excluded: ${pattern.toString()}`);
    }
  });

  // Cap score
  score = Math.max(0, Math.min(100, score));

  return { score, matches, mismatches };
}

function findBestCategories(product) {
  const scores = [];

  for (const [slug, rules] of Object.entries(CATEGORY_MATCHING_RULES)) {
    const result = calculateMatchScore(product, slug);
    if (result.score >= rules.minScore) {
      scores.push({
        slug,
        score: result.score,
        matches: result.matches,
        mismatches: result.mismatches
      });
    }
  }

  // Sort by score descending
  return scores.sort((a, b) => b.score - a.score);
}

// ============================================================================
// MAIN ANALYSIS
// ============================================================================

async function analyzeProducts() {
  console.log('\n========================================');
  console.log('PROFESSIONAL "SHOULD BE" STATE ANALYSIS');
  console.log('========================================\n');

  const query = `*[_type == "product"]{
    _id,
    name,
    brand,
    catalogueLocationKeys,
    categoryPath,
    specifications
  }`;

  const products = await client.fetch(query);
  console.log(`Analyzing ${products.length} products...\n`);

  // Build category mappings
  const categoryMappings = {};
  const unmappedProducts = [];
  const multiCategoryProducts = [];

  // Initialize all categories
  Object.keys(CATEGORY_MATCHING_RULES).forEach(slug => {
    categoryMappings[slug] = {
      products: [],
      totalScore: 0,
      avgScore: 0
    };
  });

  // Analyze each product
  for (const product of products) {
    const bestMatches = findBestCategories(product);

    if (bestMatches.length === 0) {
      unmappedProducts.push({
        id: product._id,
        name: product.name,
        brand: product.brand,
        categoryPath: product.categoryPath
      });
    } else {
      // Take top match as primary
      const primary = bestMatches[0];
      categoryMappings[primary.slug].products.push({
        id: product._id,
        name: product.name,
        brand: product.brand,
        score: primary.score,
        matches: primary.matches.slice(0, 3), // Top 3 matches
        secondaryCategories: bestMatches.slice(1, 3).map(m => m.slug) // Next best 2
      });

      categoryMappings[primary.slug].totalScore += primary.score;

      if (bestMatches.length > 1) {
        multiCategoryProducts.push({
          id: product._id,
          name: product.name,
          primary: primary.slug,
          secondary: bestMatches.slice(1).map(m => ({ slug: m.slug, score: m.score }))
        });
      }
    }
  }

  // Calculate averages
  for (const [slug, data] of Object.entries(categoryMappings)) {
    if (data.products.length > 0) {
      data.avgScore = data.totalScore / data.products.length;
    }
  }

  return generateReport(products.length, categoryMappings, unmappedProducts, multiCategoryProducts);
}

function generateReport(totalProducts, categoryMappings, unmappedProducts, multiCategoryProducts) {
  const timestamp = new Date().toISOString();

  // Calculate summary stats
  const mappedCount = totalProducts - unmappedProducts.length;
  const mappingRate = ((mappedCount / totalProducts) * 100).toFixed(1);

  const categoryStats = Object.entries(categoryMappings)
    .map(([slug, data]) => ({
      slug,
      count: data.products.length,
      avgScore: data.avgScore,
      confidence: data.avgScore >= 40 ? 'HIGH' : data.avgScore >= 25 ? 'MEDIUM' : 'LOW'
    }))
    .sort((a, b) => b.count - a.count);

  const highConfidence = categoryStats.filter(c => c.confidence === 'HIGH');
  const mediumConfidence = categoryStats.filter(c => c.confidence === 'MEDIUM');
  const lowConfidence = categoryStats.filter(c => c.confidence === 'LOW');

  let report = `# PROFESSIONAL "SHOULD BE" STATE ANALYSIS
Generated: ${timestamp}

## EXECUTIVE SUMMARY

### Mapping Potential
- **Total Products**: ${totalProducts}
- **Mappable Products**: ${mappedCount} (${mappingRate}%)
- **Unmappable Products**: ${unmappedProducts.length} (${((unmappedProducts.length/totalProducts)*100).toFixed(1)}%)
- **High Confidence Mappings**: ${highConfidence.length} categories
- **Medium Confidence Mappings**: ${mediumConfidence.length} categories
- **Low Confidence Mappings**: ${lowConfidence.length} categories
- **Multi-Category Products**: ${multiCategoryProducts.length}

### Projected Category Distribution (Should Be State)

| Category | Projected Products | Confidence | Avg Match Score |
|----------|-------------------|------------|-----------------|
`;

  for (const stat of categoryStats) {
    const metadata = catalogueIndex.slotMetadataMap[catalogueIndex.slugToIdMap[stat.slug]];
    report += `| ${metadata?.title || stat.slug} | ${stat.count} | ${stat.confidence} | ${stat.avgScore.toFixed(1)} |\n`;
  }

  // Category details
  report += `\n## DETAILED CATEGORY PROJECTIONS\n\n`;

  for (const [slug, data] of Object.entries(categoryMappings)) {
    if (data.products.length === 0) continue;

    const metadata = catalogueIndex.slotMetadataMap[catalogueIndex.slugToIdMap[slug]];
    const rules = CATEGORY_MATCHING_RULES[slug];

    report += `### ${metadata?.title || slug} (${slug})
**Projected Product Count**: ${data.products.length}
**Average Match Confidence**: ${data.avgScore.toFixed(1)}/100
**Mapping Confidence**: ${data.avgScore >= 40 ? 'HIGH ✅' : data.avgScore >= 25 ? 'MEDIUM ⚠️' : 'LOW ❌'}

**Semantic Definition**:
${rules ? `- Expected types: ${rules.include.slice(0, 3).map(p => p.toString().replace(/\\/gi, '').replace(/\//g, '').slice(0, 40)).join(', ')}...` : 'No rules defined'}

**Top Products (Should Be Assigned)**:
`;

    // Show top 15 products for this category
    data.products
      .sort((a, b) => b.score - a.score)
      .slice(0, 15)
      .forEach((p, idx) => {
        const confidenceEmoji = p.score >= 60 ? '✅' : p.score >= 40 ? '⚠️' : '❓';
        report += `${idx + 1}. ${confidenceEmoji} **${p.name}** (${p.brand || 'Unknown'}) - Score: ${p.score.toFixed(0)}\n`;
      });

    if (data.products.length > 15) {
      report += `- ... and ${data.products.length - 15} more products\n`;
    }

    report += `\n---\n\n`;
  }

  // Unmapped products analysis
  report += `\n## UNMAPPABLE PRODUCTS ANALYSIS\n\n`;
  report += `**Count**: ${unmappedProducts.length} products could not be semantically matched to any category\n\n`;
  report += `**Likely Reasons**:\n`;
  report += `1. Products may belong to categories outside current VFS scope\n`;
  report += `2. Product names may lack descriptive keywords\n`;
  report += `3. May require new category additions\n`;
  report += `4. May be accessories/cables not covered in current rules\n\n`;

  report += `**Sample Unmapped Products**:\n`;
  unmappedProducts.slice(0, 30).forEach((p, idx) => {
    report += `${idx + 1}. ${p.name} (${p.brand || 'No Brand'})\n`;
    if (p.categoryPath && p.categoryPath.length > 0) {
      report += `   └─ Original Path: ${p.categoryPath.join(' > ')}\n`;
    }
  });

  // Multi-category products
  report += `\n## MULTI-CATEGORY PRODUCTS\n\n`;
  report += `Products that semantically fit multiple categories (candidates for multiple assignments):\n\n`;

  multiCategoryProducts.slice(0, 20).forEach((p, idx) => {
    report += `${idx + 1}. **${p.name}**\n`;
    report += `   - Primary: ${p.primary}\n`;
    report += `   - Secondary: ${p.secondary.map(s => `${s.slug} (${s.score.toFixed(0)})`).join(', ')}\n`;
  });

  // Gaps and recommendations
  report += `\n## CURRENT vs SHOULD BE GAP ANALYSIS\n\n`;

  report += `### Critical Gaps\n\n`;

  const emptyCategories = Object.entries(categoryMappings)
    .filter(([slug, data]) => data.products.length === 0)
    .map(([slug]) => slug);

  if (emptyCategories.length > 0) {
    report += `**Categories with ZERO mappable products**: ${emptyCategories.length}\n`;
    report += `These categories may need:\n`;
    report += `- Product acquisition to fill gaps\n`;
    report += `- Category definition refinement\n`;
    report += `- Semantic rule expansion\n\n`;
  }

  const lowVolumeCategories = categoryStats.filter(c => c.count < 5);
  if (lowVolumeCategories.length > 0) {
    report += `**Low-volume categories** (< 5 products): ${lowVolumeCategories.length}\n`;
    lowVolumeCategories.forEach(c => {
      report += `- ${c.slug}: ${c.count} products\n`;
    });
    report += `\n`;
  }

  // Recommendations
  report += `\n## STRATEGIC RECOMMENDATIONS\n\n`;

  report += `### Immediate (This Sprint)\n`;
  report += `1. **Implement high-confidence mappings**: ${highConfidence.reduce((sum, c) => sum + c.count, 0)} products can be auto-assigned\n`;
  report += `2. **Review medium-confidence mappings**: ${mediumConfidence.reduce((sum, c) => sum + c.count, 0)} products need manual verification\n`;
  report += `3. **Address unmapped products**: ${unmappedProducts.length} products need category determination\n\n`;

  report += `### Short-term (Next 2 Sprints)\n`;
  report += `1. Implement automated semantic matching pipeline\n`;
  report += `2. Build product ingestion with real-time categorization\n`;
  report += `3. Add category coverage monitoring\n`;
  report += `4. Create multi-category product support\n\n`;

  report += `### Long-term (Next Quarter)\n`;
  report += `1. Expand category taxonomy based on product gaps\n`;
  report += `2. Implement ML-based categorization\n`;
  report += `3. Build category performance analytics\n`;
  report += `4. Create dynamic category suggestions based on inventory\n`;

  return report;
}

// Run analysis
analyzeProducts()
  .then(report => {
    const outputPath = join(process.cwd(), 'audit-reports', `should-be-state-analysis-${new Date().toISOString().split('T')[0]}.md`);
    writeFileSync(outputPath, report);
    console.log('\n✅ Analysis complete! Report saved to:', outputPath);
  })
  .catch(err => {
    console.error('Analysis failed:', err);
    process.exit(1);
  });
