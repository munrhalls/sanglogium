#!/usr/bin/env node
/**
 * Dependency Risk Mapping Script
 *
 * Purpose: Identify cross-component dependencies and regression risks
 * Output: Risk assessment tables for sprint pre-flight checks
 *
 * STRICT CONSTRAINTS:
 * - Read-only analysis of imports and file relationships
 * - Generates "Files at Risk" tables for sprint specs
 * - Never modifies source code
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');

// ─────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'meta-llama/llama-3.3-70b-instruct:free';
const DATE = new Date().toISOString().split('T')[0];
const OUTPUT_DIR = path.join(ROOT, '../_archived_sanglogium', 'research', 'nightly', DATE);

// High-risk shared components (from acceleration audit)
const CRITICAL_FILES = [
  'ProductCard.tsx',
  'ProductGrid.tsx',
  'tailwind.config.ts',
  'globals.css',
  'getProductsByVfsKeys.ts',
  'FilterSidebar.tsx'
];

// ─────────────────────────────────────────────────────────────────
// DEPENDENCY GRAPH BUILDING
// ─────────────────────────────────────────────────────────────────
async function buildDependencyGraph() {
  const graph = {
    components: {},
    sharedFiles: [],
    riskLevels: {}
  };

  // Find all component files
  const componentDirs = [
    path.join(ROOT, 'app', 'components'),
    path.join(ROOT, 'app', '(store)')
  ];

  for (const dir of componentDirs) {
    const files = await findFiles(dir, ['.tsx', '.ts']);

    for (const file of files) {
      const relativePath = path.relative(ROOT, file);
      const content = await fs.readFile(file, 'utf-8');

      // Extract imports
      const imports = extractImports(content);

      // Find where this file is used (reverse dependencies)
      const usedBy = [];

      graph.components[relativePath] = {
        imports,
        usedBy,
        riskLevel: 'Low'
      };
    }
  }

  // Calculate reverse dependencies
  for (const [file, data] of Object.entries(graph.components)) {
    for (const importedFile of data.imports) {
      if (graph.components[importedFile]) {
        graph.components[importedFile].usedBy.push(file);
      }
    }
  }

  // Calculate risk levels
  for (const [file, data] of Object.entries(graph.components)) {
    const usageCount = data.usedBy.length;

    if (usageCount >= 3) {
      data.riskLevel = 'Critical';
      graph.sharedFiles.push({ file, usageCount, reason: 'Used in 3+ locations' });
    } else if (usageCount >= 2) {
      data.riskLevel = 'High';
      graph.sharedFiles.push({ file, usageCount, reason: 'Used in 2 locations' });
    } else if (CRITICAL_FILES.some(cf => file.includes(cf))) {
      data.riskLevel = 'High';
      graph.sharedFiles.push({ file, usageCount: data.usedBy.length, reason: 'Known critical file' });
    }
  }

  return graph;
}

function extractImports(content) {
  const imports = [];

  // ES6 imports
  const es6Matches = content.matchAll(/import\s+.*?\s+from\s+['"]([^'"]+)['"];?/g);
  for (const match of es6Matches) {
    imports.push(resolveImportPath(match[1]));
  }

  // Dynamic imports
  const dynamicMatches = content.matchAll(/import\(['"]([^'"]+)['"]\)/g);
  for (const match of dynamicMatches) {
    imports.push(resolveImportPath(match[1]));
  }

  return [...new Set(imports)].filter(Boolean);
}

function resolveImportPath(importPath) {
  // Handle aliases
  if (importPath.startsWith('@/')) {
    return importPath.replace('@/', '');
  }

  // Skip node_modules
  if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
    return null;
  }

  return importPath;
}

// ─────────────────────────────────────────────────────────────────
// RISK ANALYSIS
// ─────────────────────────────────────────────────────────────────
function analyzeRisks(graph) {
  const risks = [];

  // Identify cross-page risks
  const pageContexts = {
    homepage: [],
    plp: [],
    pdp: [],
    basket: [],
    shared: []
  };

  for (const [file, data] of Object.entries(graph.components)) {
    const contexts = [];

    if (file.includes('homepage') || file.includes('(store)/page.tsx')) {
      contexts.push('homepage');
    }
    if (file.includes('products') || file.includes('filters')) {
      contexts.push('plp');
    }
    if (file.includes('product/[')) {
      contexts.push('pdp');
    }
    if (file.includes('basket')) {
      contexts.push('basket');
    }

    // Check usedBy contexts
    for (const usedByFile of data.usedBy) {
      if (usedByFile.includes('homepage')) contexts.push('homepage');
      if (usedByFile.includes('products')) contexts.push('plp');
      if (usedByFile.includes('product/[')) contexts.push('pdp');
      if (usedByFile.includes('basket')) contexts.push('basket');
    }

    const uniqueContexts = [...new Set(contexts)];

    if (uniqueContexts.length > 1) {
      risks.push({
        file,
        type: 'Cross-Context',
        severity: uniqueContexts.length >= 3 ? 'Critical' : 'High',
        contexts: uniqueContexts,
        usedByCount: data.usedBy.length,
        mitigation: `Regression test on: ${uniqueContexts.join(', ')}`
      });
    }
  }

  // Identify data flow risks
  const dataFiles = Object.keys(graph.components).filter(f =>
    f.includes('sanity/lib') || f.includes('getProducts') || f.includes('vfs')
  );

  for (const file of dataFiles) {
    const data = graph.components[file];
    if (data.usedBy.length > 1) {
      risks.push({
        file,
        type: 'Shared Data Layer',
        severity: data.usedBy.length >= 3 ? 'High' : 'Medium',
        usedByCount: data.usedBy.length,
        mitigation: 'All changes affect multiple consumers'
      });
    }
  }

  // Design system risks
  if (graph.components['tailwind.config.ts']) {
    risks.push({
      file: 'tailwind.config.ts',
      type: 'Design System',
      severity: 'Critical',
      usedByCount: 'All components',
      mitigation: 'READ-ONLY — never modify existing tokens'
    });
  }

  return risks;
}

// ─────────────────────────────────────────────────────────────────
// AI ANALYSIS
// ─────────────────────────────────────────────────────────────────
async function callOpenRouter(prompt, maxRetries = 3) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not set');
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://github.com/munrhalls/sanglogium',
          'X-Title': 'Sang Logium Dependency Risk'
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are a code architecture analyst. Identify dependency risks and regression containment strategies.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} ${error}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;

    } catch (error) {
      if (attempt === maxRetries) throw error;
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
}

async function aiAnalyzeRisks(risks, graph) {
  if (risks.length === 0) {
    return {
      status: '✅ Clean',
      summary: 'No significant dependency risks detected.',
      recommendations: []
    };
  }

  const criticalCount = risks.filter(r => r.severity === 'Critical').length;
  const highCount = risks.filter(r => r.severity === 'High').length;

  const prompt = `
Analyze these dependency risks for sprint planning:

RISKS:
${risks.map(r => `- [${r.severity}] ${r.type}: ${r.file}\n  Contexts: ${r.contexts?.join(', ') || 'N/A'}\n  Used by: ${r.usedByCount} files\n  Mitigation: ${r.mitigation}`).join('\n')}

CONTEXT:
- ProductCard.tsx is CRITICAL (used in homepage + PLP + PDP related products)
- tailwind.config.ts is CRITICAL (global design system)
- FilterSidebar is HIGH (core PLP functionality)
- Goal: Generate "Files at Risk" table for sprint specs

TASK:
Output JSON with:
- status: "⚠️ Risk Detected" if any Critical/High, "✅ Clean" otherwise
- summary: 1-2 sentences
- top_risks: 3 most critical with specific mitigation
- sprint_recommendations: Pre-flight checklist items
- files_at_risk_table: markdown table format

Valid JSON only.
`;

  try {
    const aiResponse = await callOpenRouter(prompt);
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      status: (criticalCount > 0 || highCount > 0) ? '⚠️ Risk Detected' : '✅ Clean',
      summary: `Found ${criticalCount} critical, ${highCount} high risks`,
      top_risks: risks.filter(r => r.severity === 'Critical').slice(0, 3),
      sprint_recommendations: risks.map(r => `Test ${r.file} in all contexts before sprint`),
      files_at_risk_table: generateRiskTable(risks)
    };

  } catch (error) {
    return {
      status: '⚠️ Risk Detected',
      summary: `Found ${risks.length} risks (AI analysis failed)`,
      top_risks: risks.slice(0, 3),
      sprint_recommendations: ['Manual dependency review required'],
      files_at_risk_table: generateRiskTable(risks)
    };
  }
}

function generateRiskTable(risks) {
  const criticalAndHigh = risks.filter(r => r.severity === 'Critical' || r.severity === 'High');

  return `
| File | Risk Level | Used In | Protection Strategy |
|------|------------|---------|---------------------|
${criticalAndHigh.slice(0, 10).map(r => `| ${r.file} | ${r.severity} | ${r.contexts?.join(', ') || r.usedByCount + ' files'} | ${r.mitigation} |`).join('\n')}
`;
}

// ─────────────────────────────────────────────────────────────────
// REPORT GENERATION
// ─────────────────────────────────────────────────────────────────
function generateReport(graph, risks, aiAnalysis) {
  const sharedComponents = graph.sharedFiles.sort((a, b) => b.usageCount - a.usageCount);

  return `# Dependency Risk Report — ${DATE}

**Status:** ${aiAnalysis.status}
**Critical Risks:** ${risks.filter(r => r.severity === 'Critical').length}
**High Risks:** ${risks.filter(r => r.severity === 'High').length}
**Shared Components:** ${sharedComponents.length}
**Generated:** ${new Date().toISOString()}

## Summary

${aiAnalysis.summary}

## Top Risks (Address First)

${aiAnalysis.top_risks ? aiAnalysis.top_risks.map((risk, i) => `
### ${i + 1}. ${risk.file}

**Risk Type:** ${risk.type}
**Severity:** ${risk.severity}
**Used By:** ${risk.usedByCount} files
**Contexts:** ${risk.contexts?.join(', ') || 'N/A'}
**Mitigation:** ${risk.mitigation}
`).join('\n') : risks.slice(0, 3).map((risk, i) => `
### ${i + 1}. ${risk.file}

**Risk Type:** ${risk.type}
**Severity:** ${risk.severity}
**Mitigation:** ${risk.mitigation}
`).join('\n')}

## Files at Risk of Regression

${aiAnalysis.files_at_risk_table || generateRiskTable(risks)}

## Shared Components Analysis

| Component | Usage Count | Risk Level | Reason |
|-----------|-------------|------------|--------|
${sharedComponents.map(c => `| ${c.file} | ${c.usageCount} | ${graph.components[c.file]?.riskLevel || 'Unknown'} | ${c.reason} |`).join('\n')}

## Cross-Context Dependencies

${risks.filter(r => r.type === 'Cross-Context').map(r => `
### ${r.file}

**Appears in:** ${r.contexts.join(', ')}
**Change Impact:** ALL contexts must be tested
**Sprint Impact:** High (affects multiple pages)
`).join('\n') || 'No cross-context dependencies detected.'}

## Sprint Pre-Flight Checklist

${aiAnalysis.sprint_recommendations ? aiAnalysis.sprint_recommendations.map(r => `- [ ] ${r}`).join('\n') : ''}
- [ ] Review "Files at Risk" table before sprint start
- [ ] Add regression tests for shared components
- [ ] Verify cross-context dependencies documented
- [ ] Run npm run build before any changes
- [ ] Run npm run build after each scope contract

## Risk Mitigation Templates

### For ProductCard.tsx Changes

\`\`\`markdown
## Pre-Sprint Regression Containment

### Files at Risk

| File | Risk Level | Current Role | Protection Strategy |
|------|------------|--------------|---------------------|
| ProductCard.tsx | **CRITICAL** | Homepage + PLP + PDP | Test ALL contexts |

### Cross-Cut Risk Analysis

\`\`\`
ProductCard Risk Detail:
├── Used in: Homepage featured + PLP ProductGrid + PDP RelatedProducts
├── Gap fix: Changes affect all 3 contexts
└── Mitigation:
    1. Test homepage featured section
    2. Test PLP product grid
    3. Test PDP related products carousel
    4. Verify hover states consistent
\`\`\`
\`\`\`

### For Design System Changes

\`\`\`markdown
### Scope Lock Rules (VIOLATION = SPRINT FAILURE)

1. **NO** modifications to \`globals.css\`
2. **NO** new Tailwind config tokens — use EXISTING only
3. **NO** hardcoded colors (text-gray-600 → use text-secondary)
4. **ALL** design system changes must reference tailwind.config.ts tokens
\`\`\`

## Automation Opportunities

| Manual Task | Automation | Priority |
|-------------|------------|----------|
| "Files at Risk" table generation | ✅ This script | Done |
| Regression test suggestions | Partial | Medium |
| Cross-context impact analysis | ✅ This script | Done |
| Build verification | GitHub Actions | Existing |

## Historical Risk Patterns

Based on _project/lessons/ analysis:

| Pattern | Lesson | Prevention |
|---------|--------|------------|
| ProductCard change breaks homepage | Lesson 3 | Always test homepage after ProductCard edits |
| GROQ change breaks filters | Lesson 7 | Schema-query validation |
| Tailwind token change breaks build | Lesson 4 | Build verification gate |

---

*This report auto-generates "Files at Risk" tables for sprint specs.*
*Generated by Nightly Research Loop — Dependency Risk Analysis*
`;
}

// ─────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────
async function findFiles(dir, extensions) {
  const files = [];

  async function walk(currentDir) {
    try {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await walk(fullPath);
        } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory might not exist
    }
  }

  await walk(dir);
  return files;
}

// ─────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────
async function main() {
  console.log('🔍 Starting Dependency Risk Analysis...');

  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    // Build dependency graph
    console.log('\n📋 Building dependency graph...');
    const graph = await buildDependencyGraph();
    console.log(`  ✓ Analyzed ${Object.keys(graph.components).length} components`);
    console.log(`  ✓ Found ${graph.sharedFiles.length} shared components`);

    // Analyze risks
    console.log('\n📋 Analyzing risks...');
    const risks = analyzeRisks(graph);
    console.log(`  ✓ Found ${risks.length} risks`);
    console.log(`  ✓ Critical: ${risks.filter(r => r.severity === 'Critical').length}`);
    console.log(`  ✓ High: ${risks.filter(r => r.severity === 'High').length}`);

    // AI analysis
    console.log('\n🤖 Running AI analysis...');
    const aiAnalysis = await aiAnalyzeRisks(risks, graph);

    // Generate report
    console.log('📝 Generating report...');
    const report = generateReport(graph, risks, aiAnalysis);

    // Write report
    const outputPath = path.join(OUTPUT_DIR, `DR-${DATE}.md`);
    await fs.writeFile(outputPath, report, 'utf-8');

    console.log(`\n✅ Report saved: ${outputPath}`);
    console.log(`📊 Status: ${aiAnalysis.status}`);
    console.log(`🎯 Risks: ${risks.length} total`);
    console.log(`⚠️  Critical/High: ${risks.filter(r => r.severity === 'Critical' || r.severity === 'High').length}`);

    // Exit code
    if (risks.some(r => r.severity === 'Critical')) {
      process.exit(1);  // Critical risks found
    } else {
      process.exit(0);  // Success
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error);

    try {
      await fs.mkdir(OUTPUT_DIR, { recursive: true });
      const errorReport = `# Dependency Risk Report — ${DATE}

**Status:** ⚠️ Analysis Error
**Error:** ${error.message}

## Manual Dependency Check

\`\`\`bash
# Find shared components
grep -r "import.*ProductCard" app/ --include="*.tsx" | wc -l

# Find cross-context dependencies
grep -l "homepage" app/components/**/*.tsx | xargs grep -l "plp\|products"

# Check tailwind.config.ts usage
grep -r "from.*tailwind" app/ --include="*.tsx" | head -10
\`\`\`
`;
      await fs.writeFile(path.join(OUTPUT_DIR, `DR-${DATE}.md`), errorReport, 'utf-8');
    } catch (writeError) {
      console.error('Failed to write error report:', writeError);
    }

    process.exit(2);
  }
}

main();
