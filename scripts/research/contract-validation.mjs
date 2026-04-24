#!/usr/bin/env node
/**
 * Schema-Query Contract Validation Script
 *
 * Purpose: Verify GROQ queries match Sanity schema types
 * Prevents: Lesson 6/7/8 failures (schema-query mismatch, reference syntax errors)
 *
 * STRICT CONSTRAINTS:
 * - Read-only analysis
 * - Cross-references GROQ against schema definitions
 * - Flags mismatches before they cause runtime failures
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

// ─────────────────────────────────────────────────────────────────
// SCHEMA PARSING
// ─────────────────────────────────────────────────────────────────
async function parseSchemaTypes() {
  const schemaDir = path.join(ROOT, 'sanity', 'schemaTypes');
  const schemas = {};

  try {
    const files = await fs.readdir(schemaDir);

    for (const file of files) {
      if (!file.endsWith('.ts')) continue;

      const content = await fs.readFile(path.join(schemaDir, file), 'utf-8');
      const schemaName = file.replace('.ts', '');

      // Extract field definitions using regex
      const fields = [];

      // Match defineField calls
      const fieldMatches = content.matchAll(/defineField\(\{[\s\S]*?name:\s*["']([^"']+)["'][\s\S]*?type:\s*["']([^"']+)["'][\s\S]*?\}\)/g);

      for (const match of fieldMatches) {
        const fieldBlock = match[0];
        const name = match[1];
        const type = match[2];

        // Check if it's a reference type
        const isReference = type === 'reference' || fieldBlock.includes('to: [');

        // Check if it's an array
        const isArray = type === 'array' || fieldBlock.includes('of: [');

        fields.push({
          name,
          type,
          isReference,
          isArray,
          isRequired: fieldBlock.includes('validation:') && fieldBlock.includes('required'),
          fullDefinition: fieldBlock
        });
      }

      schemas[schemaName] = { fields, file };
    }

  } catch (error) {
    console.error('Error parsing schemas:', error);
  }

  return schemas;
}

// ─────────────────────────────────────────────────────────────────
// GROQ PARSING
// ─────────────────────────────────────────────────────────────────
async function findGROQQueries() {
  const queries = [];

  // Search in sanity/lib directory
  const libDir = path.join(ROOT, 'sanity', 'lib');
  const files = await findFiles(libDir, '.ts');

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');

    // Find groq template literals
    const groqMatches = content.matchAll(/groq`([^`]+)`/g);

    for (const match of groqMatches) {
      queries.push({
        file: path.relative(ROOT, file),
        query: match[1].trim(),
        type: 'groq-template'
      });
    }

    // Find string-based queries with GROQ patterns
    const stringMatches = content.matchAll(/["']([^"']*(?:count\(|==|\[|->)[^"']*)["']/g);

    for (const match of stringMatches) {
      const str = match[1];
      if (str.includes('count(') || str.includes('->') || str.includes('["')) {
        queries.push({
          file: path.relative(ROOT, file),
          query: str,
          type: 'string-query'
        });
      }
    }
  }

  return queries;
}

// ─────────────────────────────────────────────────────────────────
// CONTRACT VALIDATION
// ─────────────────────────────────────────────────────────────────
function validateQueryAgainstSchema(query, schemas) {
  const issues = [];

  // Get product schema
  const productSchema = schemas['productType'];
  if (!productSchema) {
    return issues;  // Can't validate without schema
  }

  const fields = productSchema.fields;

  // Check for reference syntax (field->property)
  const referenceMatches = query.matchAll(/(\w+)->(\w+)/g);

  for (const match of referenceMatches) {
    const fieldName = match[1];
    const property = match[2];

    // Find field in schema
    const field = fields.find(f => f.name === fieldName);

    if (!field) {
      issues.push({
        severity: 'Warning',
        type: 'Unknown Field',
        message: `Query references unknown field "${fieldName}"`,
        query: query.substring(0, 50),
        lesson: 'Lesson 6: Field existence verification'
      });
    } else if (!field.isReference && !field.isArray) {
      // CRITICAL: Using -> on non-reference field (Lesson 7!)
      issues.push({
        severity: 'Critical',
        type: 'Schema-Query Mismatch',
        message: `Query uses "${fieldName}->${property}" but "${fieldName}" is ${field.type} (not reference)`,
        query: query.substring(0, 100),
        lesson: 'Lesson 7: GROQ schema-query contract',
        fix: `Use "${fieldName}" directly (not ${fieldName}->${property})`
      });
    }
  }

  // Check for direct field access that might be reference
  const directMatches = query.matchAll(/&&\s*(\w+)\s*==/g);

  for (const match of directMatches) {
    const fieldName = match[1];
    const field = fields.find(f => f.name === fieldName);

    if (field && field.isReference) {
      issues.push({
        severity: 'Warning',
        type: 'Potential Reference Issue',
        message: `Query uses direct "${fieldName}" but it's a reference type — verify direct access is correct`,
        query: query.substring(0, 50),
        lesson: 'Lesson 7: Reference type handling'
      });
    }
  }

  // Check for array traversal
  if (query.includes('[@ in') || query.includes('count(')) {
    // These patterns are correct for array fields
    // But let's verify the field is actually an array
    const arrayFieldMatches = query.matchAll(/count\((\w+)\[/g);

    for (const match of arrayFieldMatches) {
      const fieldName = match[1];
      const field = fields.find(f => f.name === fieldName);

      if (field && !field.isArray) {
        issues.push({
          severity: 'Warning',
          type: 'Array Traversal on Non-Array',
          message: `Query traverses "${fieldName}" as array but it's ${field.type}`,
          query: query.substring(0, 50)
        });
      }
    }
  }

  return issues;
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
          'X-Title': 'Sang Logium Contract Validation'
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are a GROQ and Sanity schema expert. Identify schema-query contract violations.'
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

async function aiAnalyzeContracts(issues, schemas) {
  if (issues.length === 0) {
    return {
      status: '✅ Clean',
      summary: 'No schema-query contract violations detected.',
      recommendations: ['Continue with planned sprints']
    };
  }

  const criticalCount = issues.filter(i => i.severity === 'Critical').length;

  const prompt = `
Analyze these GROQ schema-query contract violations:

VIOLATIONS:
${issues.map(i => `- [${i.severity}] ${i.type}: ${i.message}\n  Query: ${i.query}\n  Fix: ${i.fix || 'N/A'}`).join('\n')}

SCHEMAS AVAILABLE:
${Object.entries(schemas).map(([name, s]) => `- ${name}: ${s.fields.length} fields`).join('\n')}

CONTEXT:
- Lesson 7: GROQ query syntax must match schema type (reference vs string vs array)
- Using -> on non-reference field returns empty results (silent failure)
- Build passes but runtime fails

TASK:
Output JSON with:
- status: "❌ Critical" if any Critical, "⚠️ Warning" if only Warnings
- summary: 1-2 sentences
- sprint_impact: which sprint affected
- top_violations: 3 most critical with exact fix
- prevention: specific rule to add to workflow

Valid JSON only, no markdown.
`;

  try {
    const aiResponse = await callOpenRouter(prompt);
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      status: criticalCount > 0 ? '❌ Critical' : '⚠️ Warning',
      summary: `Found ${issues.length} contract violations`,
      sprint_impact: 'PLP_FIXES (filter logic)',
      top_violations: issues.slice(0, 3),
      prevention: 'Always verify GROQ field access matches schema type'
    };

  } catch (error) {
    return {
      status: criticalCount > 0 ? '❌ Critical' : '⚠️ Warning',
      summary: `Found ${issues.length} violations (AI analysis failed)`,
      sprint_impact: 'Unknown',
      top_violations: issues.slice(0, 3),
      prevention: 'Manual schema-query verification required'
    };
  }
}

// ─────────────────────────────────────────────────────────────────
// REPORT GENERATION
// ─────────────────────────────────────────────────────────────────
function generateReport(issues, schemas, aiAnalysis) {
  const criticalIssues = issues.filter(i => i.severity === 'Critical');
  const warningIssues = issues.filter(i => i.severity === 'Warning');

  return `# Schema-Query Contract Validation Report — ${DATE}

**Status:** ${aiAnalysis.status}
**Sprint Impact:** ${aiAnalysis.sprint_impact || 'None detected'}
**Critical Violations:** ${criticalIssues.length}
**Warnings:** ${warningIssues.length}
**Generated:** ${new Date().toISOString()}

## Summary

${aiAnalysis.summary}

${criticalIssues.length > 0 ? `
⚠️ **CRITICAL:** Schema-query mismatches will cause silent failures (GROQ returns empty results, no error)
` : ''}

## Critical Violations (Fix Before Sprint)

${criticalIssues.length === 0 ? 'None found. ✅' : criticalIssues.map((issue, i) => `
### ${i + 1}. ${issue.type}

**Query:** \`\`\`groq
${issue.query}
\`\`\`

**Problem:** ${issue.message}
**Lesson:** ${issue.lesson}
**Fix:** \`${issue.fix}\`
`).join('\n')}

## Warnings (Review)

${warningIssues.length === 0 ? 'None found. ✅' : warningIssues.map((issue, i) => `
### ${i + 1}. ${issue.type}

**Query:** \`${issue.query}\`
**Issue:** ${issue.message}
${issue.lesson ? `**Lesson:** ${issue.lesson}` : ''}
`).join('\n')}

## Schema Reference

| Schema | Fields | Query Files |
|--------|--------|-------------|
${Object.entries(schemas).map(([name, s]) => `| ${name} | ${s.fields.length} | ${s.file} |`).join('\n')}

## Prevention Rules

${aiAnalysis.prevention ? `- ${aiAnalysis.prevention}` : ''}
- [ ] Always verify GROQ field access matches schema type
- [ ] Use \`->\` only for reference types
- [ ] Use direct access for string/number/boolean types
- [ ] Use array traversal \`[@ in ...]\` only for array types
- [ ] Add this validation to pre-sprint checklist

## Test Coverage Gap

- [ ] Add schema-query contract test for all GROQ queries
- [ ] Add static analysis to catch \`->\` on non-reference fields
- [ ] Add CI check that validates GROQ against schema

---

*This report prevents Lesson 6/7/8 failures (schema-query mismatch).*
*Generated by Nightly Research Loop — Contract Validation Check*
`;
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
  console.log('🔍 Starting Schema-Query Contract Validation...');

  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    // Parse schemas
    console.log('\n📋 Parsing Sanity schemas...');
    const schemas = await parseSchemaTypes();
    console.log(`  ✓ Found ${Object.keys(schemas).length} schemas`);

    // Find GROQ queries
    console.log('\n📋 Finding GROQ queries...');
    const queries = await findGROQQueries();
    console.log(`  ✓ Found ${queries.length} queries`);

    // Validate each query
    console.log('\n📋 Validating contracts...');
    const allIssues = [];

    for (const query of queries) {
      const issues = validateQueryAgainstSchema(query.query, schemas);

      // Add file context to issues
      issues.forEach(issue => {
        issue.file = query.file;
        allIssues.push(issue);
      });
    }

    console.log(`  ✓ Found ${allIssues.length} contract issues`);

    // AI analysis
    console.log('\n🤖 Running AI analysis...');
    const aiAnalysis = await aiAnalyzeContracts(allIssues, schemas);

    // Generate report
    console.log('📝 Generating report...');
    const report = generateReport(allIssues, schemas, aiAnalysis);

    // Write report
    const outputPath = path.join(OUTPUT_DIR, `CV-${DATE}.md`);
    await fs.writeFile(outputPath, report, 'utf-8');

    console.log(`\n✅ Report saved: ${outputPath}`);
    console.log(`📊 Status: ${aiAnalysis.status}`);
    console.log(`🎯 Issues: ${allIssues.length} total (${allIssues.filter(i => i.severity === 'Critical').length} critical)`);

    // Exit code
    if (allIssues.some(i => i.severity === 'Critical')) {
      process.exit(1);
    } else {
      process.exit(0);
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error);

    try {
      await fs.mkdir(OUTPUT_DIR, { recursive: true });
      const errorReport = `# Contract Validation Report — ${DATE}

**Status:** ⚠️ Analysis Error
**Error:** ${error.message}

## Manual Check Required

\`\`\`bash
# Verify schema types
ls sanity/schemaTypes/

# Check GROQ queries
grep -r "groq\`" sanity/lib/ | head -10

# Look for -> syntax (potential issues)
grep -r "->" sanity/lib/ | grep -v node_modules
\`\`\`
`;
      await fs.writeFile(path.join(OUTPUT_DIR, `CV-${DATE}.md`), errorReport, 'utf-8');
    } catch (writeError) {
      console.error('Failed to write error report:', writeError);
    }

    process.exit(2);
  }
}

main();
