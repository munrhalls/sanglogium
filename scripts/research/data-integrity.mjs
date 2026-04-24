#!/usr/bin/env node
/**
 * Data Integrity Validation Script
 *
 * Purpose: Automated analysis of VFS, Sanity schema, and data consistency
 * Output: Markdown report with status (Clean/Warning/Critical)
 *
 * STRICT CONSTRAINTS:
 * - Read-only: Never modifies source files
 * - Analysis-only: Generates recommendations, not fixes
 * - Structured output: Consistent report format for decision gates
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
const MODEL = 'meta-llama/llama-3.3-70b-instruct:free';  // Fallback: mistralai/mistral-small-3.1-24b-instruct:free
const DATE = new Date().toISOString().split('T')[0];
const OUTPUT_DIR = path.join(ROOT, '../_archived_sanglogium', 'research', 'nightly', DATE);

// ─────────────────────────────────────────────────────────────────
// DATA INTEGRITY CHECKS
// ─────────────────────────────────────────────────────────────────
async function checkVFSIntegrity() {
  const issues = [];

  try {
    // Check if catalogue-index.json exists and is valid JSON
    const catalogueIndexPath = path.join(ROOT, 'data', 'catalogue-index.json');
    const catalogueIndex = JSON.parse(await fs.readFile(catalogueIndexPath, 'utf-8'));

    // Validate structure
    if (!catalogueIndex.tree) {
      issues.push({
        severity: 'Critical',
        type: 'VFS Structure',
        message: 'catalogue-index.json missing "tree" property',
        file: 'data/catalogue-index.json',
        lesson: 'Lesson 6: VFS data consistency'
      });
    }

    if (!catalogueIndex.slotMetadataMap) {
      issues.push({
        severity: 'Critical',
        type: 'VFS Metadata',
        message: 'catalogue-index.json missing "slotMetadataMap" property',
        file: 'data/catalogue-index.json',
        lesson: 'Lesson 6: VFS data consistency'
      });
    }

    // Check for slotMetadataMap completeness (Lesson 6 issue)
    if (catalogueIndex.tree && catalogueIndex.slotMetadataMap) {
      const treeIds = new Set();

      // Collect all IDs from tree
      function collectIds(node) {
        if (node._id) treeIds.add(node._id);
        if (node.children) node.children.forEach(collectIds);
      }
      catalogueIndex.tree.forEach(collectIds);

      // Check if all tree IDs exist in slotMetadataMap
      const metadataIds = new Set(Object.keys(catalogueIndex.slotMetadataMap));
      const missingIds = [...treeIds].filter(id => !metadataIds.has(id));

      if (missingIds.length > 0) {
        issues.push({
          severity: 'Critical',
          type: 'VFS Subtree Completeness',
          message: `${missingIds.length} tree IDs missing from slotMetadataMap`,
          file: 'data/catalogue-index.json',
          details: missingIds.slice(0, 5).join(', ') + (missingIds.length > 5 ? '...' : ''),
          lesson: 'Lesson 6: VFS subtree correctness'
        });
      }
    }

    // Check slugToIdMap
    if (!catalogueIndex.slugToIdMap) {
      issues.push({
        severity: 'Warning',
        type: 'VFS Mapping',
        message: 'catalogue-index.json missing "slugToIdMap"',
        file: 'data/catalogue-index.json'
      });
    }

  } catch (error) {
    if (error.code === 'ENOENT') {
      issues.push({
        severity: 'Critical',
        type: 'VFS Missing',
        message: 'catalogue-index.json does not exist',
        file: 'data/catalogue-index.json',
        lesson: 'Lesson 6: VFS data consistency'
      });
    } else if (error instanceof SyntaxError) {
      issues.push({
        severity: 'Critical',
        type: 'VFS Corruption',
        message: 'catalogue-index.json contains invalid JSON',
        file: 'data/catalogue-index.json'
      });
    } else {
      issues.push({
        severity: 'Warning',
        type: 'VFS Access',
        message: `Error reading catalogue-index.json: ${error.message}`,
        file: 'data/catalogue-index.json'
      });
    }
  }

  return issues;
}

async function checkProductSchema() {
  const issues = [];

  try {
    // Read product schema
    const schemaPath = path.join(ROOT, 'sanity', 'schemaTypes', 'productType.ts');
    const schemaContent = await fs.readFile(schemaPath, 'utf-8');

    // Check for required fields
    const requiredFields = ['name', 'brand', 'image', 'catalogueLocationKeys'];
    for (const field of requiredFields) {
      if (!schemaContent.includes(`name: "${field}"`) && !schemaContent.includes(`'${field}'`)) {
        issues.push({
          severity: 'Warning',
          type: 'Schema Field',
          message: `Product schema may be missing "${field}" field`,
          file: 'sanity/schemaTypes/productType.ts'
        });
      }
    }

    // Check brand field type (Lesson 7: reference vs string)
    const brandFieldMatch = schemaContent.match(/name:\s*["']brand["'][^}]+type:\s*["']([^"']+)["']/s);
    if (brandFieldMatch) {
      const brandType = brandFieldMatch[1];
      if (brandType === 'reference') {
        issues.push({
          severity: 'Info',
          type: 'Schema Type',
          message: 'Brand field is reference type — ensure GROQ uses brand->name',
          file: 'sanity/schemaTypes/productType.ts'
        });
      } else if (brandType === 'string') {
        issues.push({
          severity: 'Info',
          type: 'Schema Type',
          message: 'Brand field is string type — ensure GROQ uses direct brand match (not brand->name)',
          file: 'sanity/schemaTypes/productType.ts',
          lesson: 'Lesson 7: GROQ schema-query contract'
        });
      }
    }

  } catch (error) {
    issues.push({
      severity: 'Warning',
      type: 'Schema Access',
      message: `Error reading product schema: ${error.message}`,
      file: 'sanity/schemaTypes/productType.ts'
    });
  }

  return issues;
}

async function checkGROQQueries() {
  const issues = [];

  try {
    // Find all files with GROQ queries
    const libDir = path.join(ROOT, 'sanity', 'lib');
    const files = await findFiles(libDir, '.ts');

    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');

      // Check for GROQ patterns
      if (content.includes('groq`') || content.includes('count(') || content.includes('==')) {
        // Check for brand->name pattern (Lesson 7 warning)
        if (content.includes('brand->name')) {
          issues.push({
            severity: 'Warning',
            type: 'GROQ Syntax',
            message: 'Query uses brand->name (reference syntax) — verify brand is reference type in schema',
            file: path.relative(ROOT, file),
            lesson: 'Lesson 7: Schema-query mismatch'
          });
        }

        // Check for catalogueLocationKeys pattern
        if (content.includes('catalogueLocationKeys') && !content.includes('[@ in')) {
          issues.push({
            severity: 'Info',
            type: 'GROQ Pattern',
            message: 'Query uses catalogueLocationKeys — ensure proper array traversal syntax [@ in $keys]',
            file: path.relative(ROOT, file)
          });
        }
      }
    }

  } catch (error) {
    issues.push({
      severity: 'Warning',
      type: 'GROQ Analysis',
      message: `Error analyzing GROQ queries: ${error.message}`
    });
  }

  return issues;
}

// ─────────────────────────────────────────────────────────────────
// AI ANALYSIS (OpenRouter)
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
          'X-Title': 'Sang Logium Nightly Research'
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are a data integrity analyst. Provide structured analysis in markdown format. Be concise and actionable.'
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
      console.error(`Attempt ${attempt} failed, retrying...`);
      await new Promise(r => setTimeout(r, 1000 * attempt));  // Exponential backoff
    }
  }
}

async function aiAnalyzeIssues(issues) {
  if (issues.length === 0) {
    return {
      status: '✅ Clean',
      summary: 'No data integrity issues detected.',
      recommendations: []
    };
  }

  const criticalCount = issues.filter(i => i.severity === 'Critical').length;
  const warningCount = issues.filter(i => i.severity === 'Warning').length;

  // Build prompt for AI
  const prompt = `
Analyze the following data integrity issues for a Next.js e-commerce codebase:

ISSUES FOUND:
${issues.map(i => `- [${i.severity}] ${i.type}: ${i.message} (${i.file})`).join('\n')}

CONTEXT:
- This codebase uses Sanity CMS with a Virtual File System (VFS) for product catalog navigation
- VFS has tree structure (parent-child relationships) and slotMetadataMap (node details)
- Products have catalogueLocationKeys field linking them to VFS nodes
- Known issue patterns: Lesson 6 (VFS subtree completeness), Lesson 7 (schema-query mismatch)

TASK:
1. Categorize issues by sprint impact (which active sprint is affected)
2. Identify which lessons from _project/lessons/ apply
3. Recommend specific actions (not generic advice)
4. Output structured JSON with:
   - status: "❌ Critical" if any Critical issues, "⚠️ Warning" if only Warnings, "✅ Clean" if none
   - sprint_impact: which sprint is affected (e.g., "PLP_FIXES SC3")
   - summary: 1-2 sentence summary
   - top_issues: array of 3 most important issues with action items
   - recommendations: array of specific next steps

Respond with ONLY valid JSON. No markdown, no explanation.
`;

  try {
    const aiResponse = await callOpenRouter(prompt);

    // Try to extract JSON
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback: manual analysis
    return {
      status: criticalCount > 0 ? '❌ Critical' : warningCount > 0 ? '⚠️ Warning' : '✅ Clean',
      summary: `Found ${criticalCount} critical, ${warningCount} warning issues`,
      sprint_impact: criticalCount > 0 ? 'PLP_FIXES' : 'None immediately blocked',
      top_issues: issues.slice(0, 3),
      recommendations: issues.map(i => `Fix ${i.type} issue in ${i.file}`)
    };

  } catch (error) {
    console.error('AI analysis failed:', error);
    return {
      status: criticalCount > 0 ? '❌ Critical' : '⚠️ Warning',
      summary: `Found ${issues.length} issues (AI analysis failed: ${error.message})`,
      sprint_impact: 'Unknown',
      top_issues: issues.slice(0, 3),
      recommendations: ['Review issues manually']
    };
  }
}

// ─────────────────────────────────────────────────────────────────
// REPORT GENERATION
// ─────────────────────────────────────────────────────────────────
function generateReport(issues, aiAnalysis) {
  const report = `# Data Integrity Report — ${DATE}

**Status:** ${aiAnalysis.status}
**Sprint Impact:** ${aiAnalysis.sprint_impact || 'None detected'}
**Generated:** ${new Date().toISOString()}
**Check:** Data Integrity (VFS, Schema, GROQ)

## Summary

${aiAnalysis.summary}

${aiAnalysis.sprint_impact && aiAnalysis.sprint_impact !== 'None immediately blocked' ? `
⚠️ **Action Required:** Review this report before executing ${aiAnalysis.sprint_impact}
` : ''}

## Top Issues

${aiAnalysis.top_issues ? aiAnalysis.top_issues.map((issue, i) => `
### ${i + 1}. [${issue.severity}] ${issue.type}

**Location:** \`${issue.file}\`
**Issue:** ${issue.message}
${issue.details ? `**Details:** ${issue.details}  ` : ''}
${issue.lesson ? `**Lesson:** ${issue.lesson}  ` : ''}
`).join('\n') : issues.slice(0, 3).map((issue, i) => `
### ${i + 1}. [${issue.severity}] ${issue.type}

**Location:** \`${issue.file}\`
**Issue:** ${issue.message}
`).join('\n')}

## All Issues Found

| # | Severity | Type | File | Issue |
|---|----------|------|------|-------|
${issues.map((issue, i) => `| ${i + 1} | ${issue.severity} | ${issue.type} | ${issue.file} | ${issue.message.substring(0, 50)}${issue.message.length > 50 ? '...' : ''} |`).join('\n')}

## Recommendations

${aiAnalysis.recommendations ? aiAnalysis.recommendations.map(r => `- ${r}`).join('\n') : issues.map(i => `- Fix ${i.type} in ${i.file}`).join('\n')}

## Related Lessons

${issues.filter(i => i.lesson).map(i => `- ${i.lesson}`).filter((v, i, a) => a.indexOf(v) === i).join('\n') || '- No specific lessons identified'}

## Prevention

- [ ] Add validation to build script
- [ ] Run this check before sprint execution
- [ ] Update schema documentation

---

*This report was generated automatically by the Nightly Research Loop.*
*For false positives or to adjust validation rules, see \`.github/workflows/nightly-research.yml\`*
`;

  return report;
}

// ─────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────
async function findFiles(dir, extension) {
  const files = [];

  async function walk(currentDir) {
    try {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await walk(fullPath);
        } else if (entry.isFile() && entry.name.endsWith(extension)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory might not exist, skip
    }
  }

  await walk(dir);
  return files;
}

// ─────────────────────────────────────────────────────────────────
// MAIN EXECUTION
// ─────────────────────────────────────────────────────────────────
async function main() {
  console.log('🔍 Starting Data Integrity Validation...');
  console.log(`📅 Date: ${DATE}`);
  console.log(`📁 Output: ${OUTPUT_DIR}`);

  try {
    // Ensure output directory exists
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    // Run all checks
    console.log('\n📋 Running checks...');

    const vfsIssues = await checkVFSIntegrity();
    console.log(`  ✓ VFS Integrity: ${vfsIssues.length} issues`);

    const schemaIssues = await checkProductSchema();
    console.log(`  ✓ Product Schema: ${schemaIssues.length} issues`);

    const groqIssues = await checkGROQQueries();
    console.log(`  ✓ GROQ Queries: ${groqIssues.length} issues`);

    // Combine all issues
    const allIssues = [...vfsIssues, ...schemaIssues, ...groqIssues];

    // AI analysis
    console.log('\n🤖 Running AI analysis...');
    const aiAnalysis = await aiAnalyzeIssues(allIssues);

    // Generate report
    console.log('📝 Generating report...');
    const report = generateReport(allIssues, aiAnalysis);

    // Write report
    const outputPath = path.join(OUTPUT_DIR, `DI-${DATE}.md`);
    await fs.writeFile(outputPath, report, 'utf-8');

    console.log(`\n✅ Report saved: ${outputPath}`);
    console.log(`📊 Status: ${aiAnalysis.status}`);
    console.log(`🎯 Issues: ${allIssues.length} total`);

    // Exit with appropriate code
    if (allIssues.some(i => i.severity === 'Critical')) {
      process.exit(1);  // Critical issues found
    } else {
      process.exit(0);  // Success (warnings are acceptable)
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error);

    // Write error report
    try {
      await fs.mkdir(OUTPUT_DIR, { recursive: true });
      const errorReport = `# Data Integrity Report — ${DATE}

**Status:** ⚠️ Analysis Error
**Error:** ${error.message}
**Stack:** ${error.stack}

The validation script encountered an error. Please check:
1. OPENROUTER_API_KEY is set in environment
2. data/catalogue-index.json exists and is valid JSON
3. Network connectivity to OpenRouter API

## Manual Check Required

\`\`\`bash
# Verify VFS data
node scripts/build-catalogue-index.mjs

# Check for errors
npm run build
\`\`\`
`;
      await fs.writeFile(path.join(OUTPUT_DIR, `DI-${DATE}.md`), errorReport, 'utf-8');
    } catch (writeError) {
      console.error('Failed to write error report:', writeError);
    }

    process.exit(2);  // Script error
  }
}

main();
