#!/usr/bin/env node
/**
 * Continuous Research Loop — 24/7 Scientific Process
 *
 * Purpose: Autonomous iteration on Sanglogium gaps to professional level
 * Cost: $0 (uses local Ollama instance)
 * Frequency: Every 10 minutes (configurable)
 * Output: _project/research/continuous/[timestamp]-[type].md
 *
 * Scientific Process:
 * 1. OBSERVE: Read current codebase state
 * 2. HYPOTHESIS: Generate gap-closure candidate
 * 3. VALIDATE: Check against existing patterns/lessons
 * 4. DOCUMENT: Write findings or discard
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  initVectorStore,
  storeHypothesis,
  hasSimilarHypothesis,
  getStats
} from '../../lib/research/vectorStore.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');

// ─────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────
const OLLAMA_URL = 'http://localhost:11434/api/generate';
const MODEL = process.env.RESEARCH_MODEL || 'llama3.2:3b'; // phi3:mini for smaller
const INTERVAL_MINUTES = parseInt(process.env.RESEARCH_INTERVAL) || 10;
const OUTPUT_DIR = path.join(ROOT, '_project', 'research', 'continuous');

// Research dimensions for Sanglogium with effort/impact weights
const RESEARCH_DIMENSIONS = [
  { name: 'design-system-compliance', effort: 2, impact: 7 },
  { name: 'component-completeness', effort: 4, impact: 8 },
  { name: 'data-integrity', effort: 3, impact: 9 },
  { name: 'groq-query-optimization', effort: 2, impact: 6 },
  { name: 'test-coverage-gaps', effort: 5, impact: 7 },
  { name: 'performance-bottlenecks', effort: 3, impact: 8 },
  { name: 'accessibility-compliance', effort: 4, impact: 6 },
  { name: 'seo-optimization', effort: 2, impact: 5 },
  { name: 'security-hardening', effort: 3, impact: 9 },
  { name: 'documentation-gaps', effort: 2, impact: 4 }
];

// Weighted scoring: higher impact, lower effort = higher score
function calculatePriorityScore(risk, effort, impact) {
  const riskMultiplier = risk === 'Critical' ? 2.0 : risk === 'High' ? 1.5 : 1.0;
  const effortPenalty = effort * 0.4;
  const impactBonus = impact * 0.6;
  return (impactBonus - effortPenalty) * riskMultiplier;
}

// ─────────────────────────────────────────────────────────────────
// OBSERVE PHASE
// ─────────────────────────────────────────────────────────────────
async function observeCodebase() {
  const observations = {
    timestamp: new Date().toISOString(),
    dimensions: {}
  };

  // Check each research dimension
  for (const dimension of RESEARCH_DIMENSIONS) {
    observations.dimensions[dimension.name] = await analyzeDimension(dimension);
  }

  return observations;
}

async function analyzeDimension(dimension) {
  const checks = {
    'design-system-compliance': async () => {
      const globals = await readFile('app/globals.css');
      const tailwind = await readFile('tailwind.config.ts');
      const hardcodedColors = globals.match(/#[0-9a-fA-F]{3,6}/g) || [];
      return {
        hardcodedColors: hardcodedColors.length,
        tokensDefined: tailwind.includes('theme:') ? 'Yes' : 'No',
        risk: hardcodedColors.length > 0 ? 'Medium' : 'Low',
        effort: dimension.effort,
        impact: dimension.impact
      };
    },

    'component-completeness': async () => {
      const components = await listFiles('app/components');
      return {
        componentCount: components.length,
        sharedComponents: components.filter(c => c.includes('shared') || c.includes('ui')).length,
        risk: components.length < 10 ? 'High' : 'Low',
        effort: dimension.effort,
        impact: dimension.impact
      };
    },

    'data-integrity': async () => {
      try {
        const catalogueIndex = await readFile('data/catalogue-index.json');
        const json = JSON.parse(catalogueIndex);
        return {
          hasVFS: !!json.tree,
          hasMetadataMap: !!json.slotMetadataMap,
          risk: (!json.tree || !json.slotMetadataMap) ? 'Critical' : 'Low',
          effort: dimension.effort,
          impact: dimension.impact
        };
      } catch {
        return { hasVFS: false, risk: 'Critical', effort: dimension.effort, impact: dimension.impact };
      }
    },

    'groq-query-optimization': async () => {
      const sanityLib = await listFiles('sanity/lib');
      const hasGroq = sanityLib.some(f => f.endsWith('.ts'));
      return {
        queryFiles: sanityLib.length,
        risk: !hasGroq ? 'High' : 'Low',
        effort: dimension.effort,
        impact: dimension.impact
      };
    },

    'test-coverage-gaps': async () => {
      const tests = await listFiles('tests');
      return {
        testFiles: tests.length,
        risk: tests.length < 3 ? 'High' : 'Medium',
        effort: dimension.effort,
        impact: dimension.impact
      };
    }
  };

  const checkFn = checks[dimension.name] || (async () => ({
    risk: 'Unknown',
    effort: dimension.effort,
    impact: dimension.impact
  }));
  return await checkFn();
}

// ─────────────────────────────────────────────────────────────────
// HYPOTHESIS PHASE
// ─────────────────────────────────────────────────────────────────
async function generateHypothesis(observations) {
  // Calculate priority scores for all dimensions with risk
  const scoredDimensions = Object.entries(observations.dimensions)
    .filter(([_, data]) => data.risk === 'High' || data.risk === 'Critical')
    .map(([name, data]) => ({
      name,
      risk: data.risk,
      effort: data.effort || 3,
      impact: data.impact || 5,
      score: calculatePriorityScore(data.risk, data.effort || 3, data.impact || 5)
    }))
    .sort((a, b) => b.score - a.score); // Highest score first

  if (scoredDimensions.length === 0) {
    return null; // No gaps detected
  }

  // Check for RESEARCH_FOCUS_DIMENSION override
  const focusDimension = process.env.RESEARCH_FOCUS_DIMENSION;
  let targetDimension;

  if (focusDimension && scoredDimensions.find(d => d.name === focusDimension)) {
    targetDimension = focusDimension;
    console.log(`   Focus dimension override: ${targetDimension}`);
  } else {
    targetDimension = scoredDimensions[0].name;
    console.log(`   Selected dimension (score ${scoredDimensions[0].score.toFixed(2)}): ${targetDimension}`);
  }

  const prompt = `You are analyzing a Next.js 15 e-commerce codebase for gaps to professional level.

CURRENT STATE OBSERVATION:
Dimension: ${targetDimension}
Data: ${JSON.stringify(observations.dimensions[targetDimension], null, 2)}

TASK: Generate ONE specific, actionable hypothesis for closing this gap.

HYPOTHESIS FORMAT:
{
  "hypothesis": "Adding X will close gap Y",
  "rationale": "Why this will work (2-3 sentences)",
  "implementation": "High-level steps (3-5 bullet points)",
  "validation": "How to verify this worked",
  "estimatedEffort": "Hours (1-4)",
  "priority": "Critical/High/Medium/Low"
}

RULES:
- Be specific, not generic
- Base on observed data above
- Focus on one concrete improvement
- Ensure hypothesis is testable

Output ONLY valid JSON. No markdown, no explanation.`;

  try {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        stream: false,
        options: { temperature: 0.3 }
      })
    });

    if (!response.ok) throw new Error(`Ollama error: ${response.status}`);

    const data = await response.json();
    const text = data.response;

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return {
        dimension: targetDimension,
        ...JSON.parse(jsonMatch[0]),
        generatedAt: new Date().toISOString()
      };
    }

    return null;
  } catch (error) {
    console.error('Hypothesis generation failed:', error);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────
// VALIDATE PHASE (with semantic deduplication)
// ─────────────────────────────────────────────────────────────────
const SIMILARITY_THRESHOLD = 0.85;

async function validateHypothesis(hypothesis, observations) {
  // Check if hypothesis contradicts existing lessons
  const contradictions = [];

  try {
    const lessonsIndex = await readFile('_project/lessons/INDEX.md');
    const keywords = hypothesis.hypothesis.toLowerCase().split(' ');

    if (lessonsIndex.includes('NO GLOBALS') && hypothesis.hypothesis.includes('globals.css')) {
      contradictions.push('Violates lesson: No global CSS modifications');
    }

    if (lessonsIndex.includes('VFS') && hypothesis.hypothesis.includes('VFS') && !observations.dimensions['data-integrity'].hasVFS) {
      contradictions.push('VFS not yet functional, hypothesis premature');
    }
  } catch {
    // Lessons not found, continue
  }

  // Semantic deduplication via vector store
  console.log('   Checking for semantic duplicates...');
  const isDuplicate = await hasSimilarHypothesis(hypothesis.hypothesis, SIMILARITY_THRESHOLD);

  if (isDuplicate) {
    return {
      valid: false,
      reason: 'Similar hypothesis already exists (semantic match > 0.85)',
      confidence: 'High'
    };
  }

  return {
    valid: contradictions.length === 0,
    contradictions,
    confidence: contradictions.length === 0 ? 'High' : 'Low'
  };
}

// ─────────────────────────────────────────────────────────────────
// DOCUMENT PHASE
// ─────────────────────────────────────────────────────────────────
async function documentFindings(hypothesis, validation, observations) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${timestamp}-${hypothesis.dimension}.md`;
  const filepath = path.join(OUTPUT_DIR, filename);

  const content = `# Continuous Research Finding

**Generated:** ${new Date().toISOString()}
**Dimension:** ${hypothesis.dimension}
**Priority:** ${hypothesis.priority}
**Status:** ${validation.valid ? '✅ Validated' : '❌ Rejected'}
**Confidence:** ${validation.confidence}

## Hypothesis

${hypothesis.hypothesis}

## Rationale

${hypothesis.rationale}

## Implementation

${hypothesis.implementation}

## Validation

${hypothesis.validation}

## Current State Observation

\`\`\`json
${JSON.stringify(observations.dimensions[hypothesis.dimension], null, 2)}
\`\`\`

## Estimated Effort

${hypothesis.estimatedEffort} hours

${validation.contradictions ? `
## Validation Issues

${validation.contradictions.map(c => `- ${c}`).join('\n')}
` : ''}

## Next Steps

- [ ] Review hypothesis against current sprint priorities
- [ ] Convert to sprint doc if accepted
- [ ] Discard if conflicts with roadmap

---

*Generated by Continuous Research Loop*
*Model: ${MODEL}*
*Interval: ${INTERVAL_MINUTES} minutes*
`;

  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.writeFile(filepath, content, 'utf-8');

  // Store in vector store for semantic deduplication
  if (validation.valid) {
    const id = `${timestamp}-${hypothesis.dimension}`;
    await storeHypothesis(
      id,
      hypothesis.hypothesis,
      hypothesis.dimension,
      {
        priority: hypothesis.priority,
        estimatedEffort: hypothesis.estimatedEffort,
        filepath: path.relative(ROOT, filepath)
      }
    );
  }

  return filepath;
}

// ─────────────────────────────────────────────────────────────────
// CONTROL INTERFACE
// ─────────────────────────────────────────────────────────────────
const CONTROL_DIR = path.join(ROOT, '_project', 'research');
const SIGNAL_FILES = {
  pause: path.join(CONTROL_DIR, '.pause'),
  resume: path.join(CONTROL_DIR, '.resume'),
  focus: path.join(CONTROL_DIR, '.focus')
};

async function checkControlSignals() {
  try {
    // Check for pause signal
    await fs.access(SIGNAL_FILES.pause);
    console.log('⏸️  Pause signal detected — iteration skipped');
    return { action: 'pause' };
  } catch {
    // No pause signal, continue
  }

  // Check for resume signal (clear it)
  try {
    await fs.access(SIGNAL_FILES.resume);
    await fs.unlink(SIGNAL_FILES.resume);
    console.log('▶️  Resume signal detected — continuing');
    return { action: 'resume' };
  } catch {
    // No resume signal
  }

  // Check for focus signal
  try {
    const focusContent = await fs.readFile(SIGNAL_FILES.focus, 'utf-8');
    const focusDimension = focusContent.trim();
    if (focusDimension && RESEARCH_DIMENSIONS.find(d => d.name === focusDimension)) {
      // Set focus for this iteration
      process.env.RESEARCH_FOCUS_DIMENSION = focusDimension;
      console.log(`🎯 Focus signal detected: ${focusDimension}`);
      return { action: 'focus', dimension: focusDimension };
    }
  } catch {
    // No focus signal
  }

  return { action: 'continue' };
}

async function clearFocusSignal() {
  try {
    await fs.unlink(SIGNAL_FILES.focus);
  } catch {
    // File doesn't exist, ignore
  }
}

// ─────────────────────────────────────────────────────────────────
// MAIN LOOP
// ─────────────────────────────────────────────────────────────────
async function researchIteration() {
  const startTime = Date.now();
  console.log(`\n🔬 Research iteration started at ${new Date().toISOString()}`);

  // Check control signals
  const control = await checkControlSignals();
  if (control.action === 'pause') {
    console.log('   Loop is paused — waiting for resume signal');
    return;
  }

  try {
    // Phase 1: Observe
    console.log('👁️  Observing codebase...');
    const observations = await observeCodebase();
    console.log(`   Found ${Object.keys(observations.dimensions).length} dimensions analyzed`);

    // Phase 2: Hypothesize
    console.log('🧠 Generating hypothesis...');
    const hypothesis = await generateHypothesis(observations);

    if (!hypothesis) {
      console.log('   No high-risk gaps detected — skipping hypothesis');
      return;
    }

    console.log(`   Generated: ${hypothesis.hypothesis.substring(0, 60)}...`);

    // Phase 3: Validate
    console.log('✓  Validating hypothesis...');
    const validation = await validateHypothesis(hypothesis, observations);
    console.log(`   Validation: ${validation.valid ? '✅ Valid' : '❌ Rejected'} (${validation.confidence})`);

    // Phase 4: Document
    console.log('📝 Documenting findings...');
    const filepath = await documentFindings(hypothesis, validation, observations);
    console.log(`   Saved to: ${path.relative(ROOT, filepath)}`);

    const duration = (Date.now() - startTime) / 1000;
    console.log(`✅ Iteration complete in ${duration.toFixed(1)}s`);

  } catch (error) {
    console.error('❌ Research iteration failed:', error);
  }
}

// ─────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────
async function readFile(filepath) {
  try {
    return await fs.readFile(path.join(ROOT, filepath), 'utf-8');
  } catch {
    return '';
  }
}

async function listFiles(dirpath) {
  try {
    const fullPath = path.join(ROOT, dirpath);
    const entries = await fs.readdir(fullPath, { withFileTypes: true, recursive: true });
    return entries
      .filter(e => e.isFile())
      .map(e => path.relative(fullPath, path.join(e.parentPath || fullPath, e.name)));
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────
// DAEMON MODE
// ─────────────────────────────────────────────────────────────────
async function startDaemon() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  CONTINUOUS RESEARCH LOOP — 24/7 Scientific Process        ║
╠════════════════════════════════════════════════════════════╣
║  Model:        ${MODEL.padEnd(35)} ║
║  Interval:     ${String(INTERVAL_MINUTES + ' minutes').padEnd(35)} ║
║  Output:       ${'_project/research/continuous/'.padEnd(35)} ║
║  Cost:         $0 (local Ollama)${' '.repeat(19)} ║
╚════════════════════════════════════════════════════════════╝
`);

  // Test Ollama connection
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    if (!response.ok) throw new Error('Ollama not responding');
    const data = await response.json();
    console.log('✅ Ollama connected');
    console.log(`   Available models: ${data.models.map(m => m.name).join(', ')}
`);
  } catch (error) {
    console.error('❌ Ollama not available at localhost:11434');
    console.error('   Install: https://ollama.com/download');
    console.error('   Then run: ollama pull ' + MODEL);
    process.exit(1);
  }

  // Initialize vector store
  const vectorStoreReady = await initVectorStore();
  if (vectorStoreReady) {
    const stats = await getStats();
    console.log(`✅ Vector store ready (${stats.count} hypotheses stored)`);
  }

  // Run immediately, then schedule
  await researchIteration();

  // Schedule next iteration
  console.log(`\n⏰ Next iteration in ${INTERVAL_MINUTES} minutes...\n`);
  setInterval(researchIteration, INTERVAL_MINUTES * 60 * 1000);
}

// ─────────────────────────────────────────────────────────────────
// SINGLE RUN MODE (for testing)
// ─────────────────────────────────────────────────────────────────
async function runOnce() {
  console.log('🔬 Running single research iteration...\n');
  await researchIteration();
  console.log('\n✅ Done');
}

// ─────────────────────────────────────────────────────────────────
// CLI
// ─────────────────────────────────────────────────────────────────
const mode = process.argv[2] || 'daemon';

if (mode === 'daemon') {
  startDaemon();
} else if (mode === 'once') {
  runOnce();
} else {
  console.log('Usage: node continuous-loop.mjs [daemon|once]');
  console.log('  daemon: Run continuously (default)');
  console.log('  once:   Single iteration for testing');
}
