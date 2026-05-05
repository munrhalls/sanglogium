#!/usr/bin/env node
/**
 * Autoresearch Loop — Minimal Karpathy-Style Research Agent
 *
 * Purpose: Autonomous gap-finding for Sang Logium using scientific method
 * Pattern: Observe → Hypothesize → Validate → Document (ratchet loop)
 *
 * Usage:
 *   node scripts/research/autoresearch.mjs once      # single run
 *   node scripts/research/autoresearch.mjs daemon    # continuous (terminal)
 *
 * Cost: $0 (OpenRouter free tier: meta-llama/llama-3.3-70b-instruct:free)
 * Output: _project/research/autoresearch/YYYY-MM-DD-HHMM.md
 *
 * Safety:
 *   - Read-only: never modifies source files
 *   - Git-tracked: all outputs committed to repo
 *   - Idempotent: duplicate findings rejected
 *   - Bounded: single hypothesis per iteration, 1-4 hour effort ceiling
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

// ─────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = process.env.RESEARCH_MODEL || 'meta-llama/llama-3.3-70b-instruct:free';
const INTERVAL_MINUTES = parseInt(process.env.RESEARCH_INTERVAL) || 60;
export const OUTPUT_DIR = path.join(ROOT, '_project', 'research', 'autoresearch');
export const MEMORY_FILE = path.join(OUTPUT_DIR, 'memory.json');
const PROGRAM_FILE = path.join(OUTPUT_DIR, 'program.md');

// ─────────────────────────────────────────────────────────────────
// PHASE 1: OBSERVE
// ─────────────────────────────────────────────────────────────────
export async function observeCodebase() {
  const observation = {
    timestamp: new Date().toISOString(),
    gitBranch: safeExec('git branch --show-current'),
    lastCommit: safeExec('git log -1 --format="%h %s"'),
    uncommittedFiles: safeExec('git status --short')?.split('\n').filter(Boolean).length || 0,
    dimensions: {}
  };

  // Quick checks across key dimensions
  observation.dimensions.tests = await observeTests();
  observation.dimensions.build = await observeBuild();
  observation.dimensions.docs = await observeDocs();
  observation.dimensions.types = await observeTypes();
  observation.dimensions.todos = await observeTodos();

  return observation;
}

async function observeTests() {
  const testFiles = await findFiles(path.join(ROOT, 'tests'), ['.spec.ts', '.spec.tsx', '.test.ts', '.test.tsx']);
  const e2eFiles = testFiles.filter(f => f.includes('e2e'));
  const unitFiles = testFiles.filter(f => !f.includes('e2e'));

  return {
    total: testFiles.length,
    e2e: e2eFiles.length,
    unit: unitFiles.length,
    hasVitest: await fileExists('vitest.config.mts'),
    hasPlaywright: await fileExists('playwright.config.ts'),
    risk: testFiles.length < 5 ? 'High' : testFiles.length < 10 ? 'Medium' : 'Low'
  };
}

async function observeBuild() {
  try {
    const pkg = JSON.parse(await readFile('package.json'));
    const hasBuildScript = !!pkg.scripts?.build;
    const hasTypeCheck = !!pkg.scripts?.['ts-check'];

    return {
      hasBuildScript,
      hasTypeCheck,
      dependencies: Object.keys(pkg.dependencies || {}).length,
      devDependencies: Object.keys(pkg.devDependencies || {}).length,
      risk: !hasTypeCheck ? 'High' : 'Low'
    };
  } catch {
    return { risk: 'High' };
  }
}

async function observeDocs() {
  const docs = await findFiles(path.join(ROOT, 'docs'), ['.md']);
  const research = await findFiles(path.join(ROOT, '_project', 'research'), ['.md']);

  return {
    docsCount: docs.length,
    researchCount: research.length,
    hasBasketDocs: await fileExists('docs/basket/MAJOR ADR.md'),
    hasCheckoutDocs: await fileExists('docs/checkout/Checkout plan.md'),
    risk: docs.length < 3 ? 'High' : 'Low'
  };
}

async function observeTypes() {
  const tsConfig = await readFile('tsconfig.json');
  const hasStrict = tsConfig.includes('"strict"');

  return {
    hasStrict,
    risk: !hasStrict ? 'Medium' : 'Low'
  };
}

async function observeTodos() {
  const appFiles = await findFiles(path.join(ROOT, 'app'), ['.ts', '.tsx']);
  const componentFiles = await findFiles(path.join(ROOT, 'components'), ['.ts', '.tsx']);
  const allFiles = [...appFiles, ...componentFiles];

  let todoCount = 0;
  let fixmeCount = 0;

  for (const file of allFiles.slice(0, 50)) { // sample first 50 for speed
    const content = await fs.readFile(file, 'utf-8').catch(() => '');
    todoCount += (content.match(/TODO/gi) || []).length;
    fixmeCount += (content.match(/FIXME/gi) || []).length;
  }

  return {
    todoCount,
    fixmeCount,
    sampledFiles: allFiles.length,
    risk: (todoCount + fixmeCount) > 10 ? 'Medium' : 'Low'
  };
}

// ─────────────────────────────────────────────────────────────────
// PHASE 2: HYPOTHESIZE
// ─────────────────────────────────────────────────────────────────
async function generateHypothesis(observation) {
  // Mock mode for testing: bypass API, return parsed JSON from env
  const mockResponse = process.env.AUTORESEARCH_MOCK_RESPONSE;
  if (mockResponse) {
    try {
      const parsed = JSON.parse(mockResponse);
      return { ...parsed, generatedAt: new Date().toISOString(), model: 'mock' };
    } catch {
      console.error('❌ AUTORESEARCH_MOCK_RESPONSE is not valid JSON');
      return null;
    }
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error('❌ OPENROUTER_API_KEY not set. Get one at https://openrouter.ai/keys');
    return null;
  }

  // Find the highest-risk dimension
  const riskyDimensions = Object.entries(observation.dimensions)
    .filter(([_, d]) => d.risk === 'High' || d.risk === 'Critical')
    .map(([name, data]) => ({ name, ...data }));

  const targetDimension = riskyDimensions.length > 0
    ? riskyDimensions[0].name
    : 'general';

  const program = await readProgram();

  const prompt = `${program}

---

CURRENT CODEBASE OBSERVATION:
${JSON.stringify(observation, null, 2)}

TARGET DIMENSION: ${targetDimension}

TASK: Generate ONE specific, actionable research finding.

OUTPUT FORMAT (valid JSON only):
{
  "hypothesis": "Specific gap identified (1 sentence)",
  "rationale": "Why this matters (2 sentences max)",
  "suggestedAction": "Concrete next step (1 sentence)",
  "validation": "How to verify this was fixed",
  "effort": "1-4 hours",
  "priority": "Critical/High/Medium/Low",
  "dimension": "${targetDimension}"
}

RULES:
- Be specific to THIS codebase, not generic advice
- Focus on the highest-risk dimension
- Suggest something a human can do in 1-4 hours
- Never suggest rewrites or massive refactoring`;

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://github.com/munrhalls/sanglogium',
        'X-Title': 'Sang Logium Autoresearch'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: 'You are a concise code quality analyst. Output only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        ...parsed,
        generatedAt: new Date().toISOString(),
        model: MODEL
      };
    }

    return null;
  } catch (error) {
    console.error('❌ Hypothesis generation failed:', error.message);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────
// PHASE 3: VALIDATE (deduplication)
// ─────────────────────────────────────────────────────────────────
export async function validateHypothesis(hypothesis) {
  try {
    const memory = await loadMemory();

    // Exact text match
    const exactMatch = memory.find(m =>
      m.hypothesis.toLowerCase().trim() === hypothesis.hypothesis.toLowerCase().trim()
    );
    if (exactMatch) {
      return { valid: false, reason: 'Exact duplicate found', confidence: 'High' };
    }

    // Keyword overlap (simple but effective)
    const normalizeWords = (text) => text.toLowerCase()
      .split(/\s+/)
      .map(w => w.replace(/[^a-z0-9]/g, ''))
      .filter(w => w.length > 4); // only meaningful words
    const hypothesisWords = new Set(normalizeWords(hypothesis.hypothesis));
    for (const m of memory) {
      const memoryWords = new Set(normalizeWords(m.hypothesis));
      if (hypothesisWords.size === 0 || memoryWords.size === 0) continue;
      const intersection = new Set([...hypothesisWords].filter(w => memoryWords.has(w)));
      const overlap = intersection.size / Math.min(hypothesisWords.size, memoryWords.size);
      if (overlap > 0.7) {
        return { valid: false, reason: `Keyword overlap ${(overlap * 100).toFixed(0)}% with prior finding`, confidence: 'Medium' };
      }
    }

    return { valid: true, confidence: 'High' };
  } catch {
    return { valid: true, confidence: 'Low (memory error)' };
  }
}

// ─────────────────────────────────────────────────────────────────
// PHASE 4: DOCUMENT
// ─────────────────────────────────────────────────────────────────
export async function documentFindings(hypothesis, validation, observation) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${timestamp}-${hypothesis.dimension}.md`;
  const filepath = path.join(OUTPUT_DIR, filename);

  const content = `# Autoresearch Finding

**Generated:** ${new Date().toISOString()}
**Dimension:** ${hypothesis.dimension}
**Priority:** ${hypothesis.priority}
**Effort:** ${hypothesis.effort}
**Status:** ${validation.valid ? '✅ Validated' : '❌ Rejected'}
**Model:** ${hypothesis.model}

## Finding

${hypothesis.hypothesis}

## Rationale

${hypothesis.rationale}

## Suggested Action

${hypothesis.suggestedAction}

## Validation

${hypothesis.validation}

## Current State

\`\`\`json
${JSON.stringify(observation.dimensions[hypothesis.dimension] || observation.dimensions, null, 2)}
\`\`\`

---

*Generated by autoresearch loop — minimalest possible, reliable, safe*
*To pause: kill the process or remove .github/workflows/autoresearch.yml*
`;

  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.writeFile(filepath, content, 'utf-8');

  // Update memory
  if (validation.valid) {
    await appendMemory(hypothesis);
  }

  return filepath;
}

// ─────────────────────────────────────────────────────────────────
// MEMORY (file-based, no ChromaDB needed)
// ─────────────────────────────────────────────────────────────────
export async function loadMemory() {
  try {
    const data = await fs.readFile(MEMORY_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function appendMemory(hypothesis) {
  const memory = await loadMemory();
  memory.push({
    hypothesis: hypothesis.hypothesis,
    dimension: hypothesis.dimension,
    priority: hypothesis.priority,
    timestamp: hypothesis.generatedAt
  });
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.writeFile(MEMORY_FILE, JSON.stringify(memory, null, 2), 'utf-8');
}

// ─────────────────────────────────────────────────────────────────
// PROGRAM (Karpathy-style instructions)
// ─────────────────────────────────────────────────────────────────
export async function readProgram() {
  try {
    return await fs.readFile(PROGRAM_FILE, 'utf-8');
  } catch {
    return `You are an autonomous research agent for Sang Logium, a Next.js 15 e-commerce project.

Your job: find ONE concrete, high-impact gap per iteration.

Focus areas in priority order:
1. Test coverage (missing tests, untested critical paths)
2. Type safety (missing types, any usage, strict mode gaps)
3. Build integrity (scripts that fail, missing checks)
4. Documentation (undocumented features, stale docs)
5. Code quality (TODOs, duplication, complexity)

Constraints:
- One finding per iteration
- Must be actionable in 1-4 hours
- Must be specific to this codebase
- Never suggest large rewrites`;
  }
}

// ─────────────────────────────────────────────────────────────────
// QUALITY AUDIT (detects amateur output)
// ─────────────────────────────────────────────────────────────────
export function auditHypothesisQuality(hypothesis) {
  const issues = [];
  const text = `${hypothesis.hypothesis || ''} ${hypothesis.suggestedAction || ''}`.toLowerCase();

  if (text.includes('rewrite')) issues.push('Contains "rewrite"');
  if (text.includes('refactor everything')) issues.push('Contains "refactor everything"');
  if (text.includes('start over')) issues.push('Contains "start over"');

  const effort = hypothesis.effort || '';
  const hourMatch = effort.match(/(\d+)(?:\s*-\s*\d+)?\s*hours?/i);
  if (hourMatch) {
    const maxHours = parseInt(hourMatch[1]);
    if (maxHours > 4) issues.push('Effort exceeds 4-hour ceiling');
  } else if (!effort.match(/[1-4]/)) {
    issues.push('Effort missing or unclear');
  }

  // Specificity: must reference a file extension, component name, or path
  const hasSpecificity = /\.(ts|tsx|js|jsx|css|mjs)/i.test(text) ||
    /\b[A-Z][a-zA-Z]+(Store|Component|Page|Form|Button|Card|Grid)\b/.test(text) ||
    /(app\/|components\/|tests\/|store\/)/.test(text);
  if (!hasSpecificity) issues.push('Missing specific file or component reference');

  return {
    professional: issues.length === 0,
    issues
  };
}

// ─────────────────────────────────────────────────────────────────
// MAIN LOOP
// ─────────────────────────────────────────────────────────────────
async function runIteration() {
  const startTime = Date.now();
  console.log(`\n🔬 Autoresearch iteration started at ${new Date().toISOString()}`);

  try {
    // Phase 1: Observe
    console.log('👁️  Observing codebase...');
    const observation = await observeCodebase();
    console.log(`   Tests: ${observation.dimensions.tests.total} | Docs: ${observation.dimensions.docs.docsCount} | TODOs: ${observation.dimensions.todos.todoCount}`);

    // Phase 2: Hypothesize
    console.log('🧠 Generating hypothesis...');
    const hypothesis = await generateHypothesis(observation);
    if (!hypothesis) {
      console.log('   No hypothesis generated (API issue or no gaps)');
      return;
    }
    console.log(`   → ${hypothesis.hypothesis.substring(0, 60)}...`);

    // Phase 3: Validate (deduplication + quality)
    console.log('✓  Validating...');
    const validation = await validateHypothesis(hypothesis);
    const quality = auditHypothesisQuality(hypothesis);

    if (!quality.professional) {
      validation.valid = false;
      validation.reason = `Quality gate: ${quality.issues.join(', ')}`;
      validation.confidence = 'High';
    }

    console.log(`   ${validation.valid ? '✅ Valid' : '❌ Rejected'} (${validation.reason || validation.confidence})`);

    // Phase 4: Document
    console.log('📝 Documenting...');
    const filepath = await documentFindings(hypothesis, validation, observation);
    console.log(`   Saved: ${path.relative(ROOT, filepath)}`);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ Done in ${duration}s`);

  } catch (error) {
    console.error('❌ Iteration failed:', error.message);
  }
}

async function runDaemon() {
  console.log(`
╔═══════════════════════════════════════════════╗
║  AUTORESEARCH LOOP — Karpathy Style           ║
╠═══════════════════════════════════════════════╣
║  Model:     ${MODEL.padEnd(36)} ║
║  Interval:  ${String(INTERVAL_MINUTES + ' min').padEnd(36)} ║
║  Output:    ${'_project/research/autoresearch/'.padEnd(36)} ║
║  Cost:      $0 (OpenRouter free tier)${' '.repeat(15)} ║
╚═══════════════════════════════════════════════╝
`);

  await runIteration();
  console.log(`\n⏰ Next iteration in ${INTERVAL_MINUTES} minutes... (Ctrl+C to stop)\n`);
  setInterval(runIteration, INTERVAL_MINUTES * 60 * 1000);
}

// ─────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────
function safeExec(cmd) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: 'utf-8', timeout: 5000 }).trim();
  } catch {
    return null;
  }
}

async function readFile(filepath) {
  try {
    return await fs.readFile(path.join(ROOT, filepath), 'utf-8');
  } catch {
    return '';
  }
}

async function fileExists(filepath) {
  try {
    await fs.access(path.join(ROOT, filepath));
    return true;
  } catch {
    return false;
  }
}

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
    } catch {
      // ignore
    }
  }
  await walk(dir);
  return files;
}

// ─────────────────────────────────────────────────────────────────
// CLI
// ─────────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const isMain = process.argv[1] && __filename === path.resolve(process.argv[1]);

if (isMain) {
  const mode = process.argv[2] || 'once';

  if (mode === 'daemon') {
    runDaemon();
  } else if (mode === 'once') {
    runIteration().then(() => process.exit(0));
  } else {
    console.log('Usage: node scripts/research/autoresearch.mjs [once|daemon]');
    console.log('  once:   Single iteration (default)');
    console.log('  daemon: Run continuously with interval');
    process.exit(1);
  }
}
