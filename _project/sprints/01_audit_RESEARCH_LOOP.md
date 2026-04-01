# Audit: Continuous Research Loop System

**Audit Date:** 2026-04-01  
**Auditor:** Human Developer + AI Assistant  
**Purpose:** Clarify expectations, feedback mechanisms, control interfaces, and gaps to fully effective AI-research loop  
**Source:** `scripts/research/continuous-loop.mjs`, `_project/research/CONTINUOUS_LOOP_SETUP.md`

---

## 1. System Expectations — What Is Expected of the Research Loop

### Primary Purpose
The research loop is an **autonomous gap detection engine** that continuously scans the codebase for deviations from professional-level standards and generates actionable hypotheses to close those gaps.

### Expected Behaviors

| Expectation | Current Reality | Gap ID |
|-------------|---------------|--------|
| **Run 24/7 without human intervention** | ✅ Runs via PM2, auto-restarts on crash | — |
| **Generate novel, non-duplicate hypotheses** | ⚠️ Text-based dedup only (50-char match) | G-DEDUP-01 |
| **Prioritize highest-impact gaps first** | ❌ First-match from high-risk list | G-PRIORITY-01 |
| **Learn from past hypotheses** | ❌ No memory system | G-MEMORY-01 |
| **Provide clear human review interface** | ⚠️ Markdown files in directory | G-FEEDBACK-01 |
| **Accept human direction (themes/focus)** | ❌ No input mechanism | G-INPUT-01 |
| **Self-improve over time** | ❌ Static algorithm | G-IMPROVE-01 |

### Success Metrics (What "Working" Looks Like)

| Metric | Target | Current | Measurement |
|--------|--------|---------|-------------|
| Hypothesis uniqueness rate | >90% | ~60% | Manual review of daily output |
| Hypothesis→sprint conversion | >30% | Unknown | Track which hypotheses become sprints |
| False positive rate | <10% | ~20% | Invalid/irrelevant hypotheses |
| Human review time per hypothesis | <2 min | ~5 min | Time to read + decide |
| Loop uptime | >99% | Not tracked | PM2 logs |

---

## 2. Feedback Loop — Human Developer Interface

### Current Feedback Mechanism (Passive)

```
┌─────────────────────────────────────────────────────────────┐
│  CONTINUOUS LOOP                                            │
│  ├── Generates hypothesis → writes to .md file              │
│  └── Continues regardless of human action                 │
├─────────────────────────────────────────────────────────────┤
│  HUMAN REVIEW (Manual, Async)                               │
│  ├── Check `_project/research/continuous/`                  │
│  ├── Read markdown files                                  │
│  ├── Decide: sprint / backlog / discard                   │
│  └── (Optional) Delete rejected files                   │
└─────────────────────────────────────────────────────────────┘
```

### Where to Check Research Loop Output

| Location | What You'll Find | Check Frequency |
|----------|------------------|-----------------|
| `_project/research/continuous/` | Generated hypothesis .md files | Daily |
| `pm2 logs sanglogium-research` | Real-time loop activity | When debugging |
| `pm2 status` | Is loop running? | Weekly |
| Ollama terminal | Model activity | When troubleshooting |

### Missing Feedback Mechanisms (Gaps)

| Gap ID | Missing Feature | Impact |
|--------|-----------------|--------|
| G-FEEDBACK-01 | No "accept/reject" signal to loop | Loop can't learn from decisions |
| G-FEEDBACK-02 | No conversion tracking | Can't measure hypothesis quality |
| G-FEEDBACK-03 | No priority override | Loop ignores human sprint priorities |
| G-FEEDBACK-04 | No theme/focus direction | Loop explores randomly |

### Proposed Feedback Interface (v1.5)

```bash
# Human signals to loop
sanglogium-research signal --accept <hypothesis-id>     # Good hypothesis
sanglogium-research signal --reject <hypothesis-id>     # Bad hypothesis  
sanglogium-research signal --focus <dimension>          # Focus theme
sanglogium-research signal --pause                      # Stop generating
sanglogium-research signal --resume                     # Resume generating
```

---

## 3. ChromaDB / Vector Memory Integration

### Why Vector Memory Is Needed

| Current Problem | Vector Solution |
|-----------------|-----------------|
| Text dedup misses semantic duplicates | Cosine similarity catches "same idea, different words" |
| No queryable history | Vector search finds "similar past hypotheses" |
| No concept clustering | Embeddings group related hypotheses |
| Can't detect recurring gaps | Similarity search identifies patterns |

### ChromaDB Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  CHROMADB (Local Vector Store)                              │
│  ├── Collection: "research_hypotheses"                    │
│  ├── Documents: Hypothesis text + metadata                │
│  ├── Embeddings: 384-dim (nomic-embed-text via Ollama)    │
│  └── Query: Cosine similarity search                      │
├─────────────────────────────────────────────────────────────┤
│  INTEGRATION POINTS                                         │
│  1. Store: After hypothesis validation                     │
│  2. Query: Before hypothesis generation (dedup check)     │
│  3. Retrieve: Find similar past hypotheses                │
│  4. Cluster: Nightly batch analysis                       │
└─────────────────────────────────────────────────────────────┘
```

### Implementation Spec (v1.5)

**Dependency:**
```json
{
  "dependencies": {
    "chromadb": "^1.8.0"
  }
}
```

**Collection Schema:**
```typescript
interface HypothesisDocument {
  id: string;                    // uuid
  text: string;                  // hypothesis text
  dimension: string;             // research dimension
  embedding: number[];           // 384 floats
  metadata: {
    timestamp: string;
    status: 'generated' | 'accepted' | 'rejected' | 'converted';
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    estimatedEffort: number;
    actualOutcome?: string;
  };
}
```

**Usage Flow:**
```typescript
// 1. Before generating — check for duplicates
const similar = await collection.query({
  queryEmbeddings: [newHypothesisEmbedding],
  n_results: 5,
  where: { timestamp: { $gte: today } }
});

if (similar.distances[0] < 0.85) {
  return { duplicate: true, matchedId: similar.ids[0] };
}

// 2. After generation — store with embedding
await collection.add({
  ids: [hypothesisId],
  documents: [hypothesisText],
  embeddings: [embedding],
  metadatas: [{ dimension, priority, timestamp }]
});

// 3. Nightly — cluster for pattern detection
const clusters = await clusterEmbeddings(collection, minClusterSize=3);
// → "3 hypotheses about VFS issues in past week"
```

### Graceful Degradation

| ChromaDB State | Loop Behavior |
|----------------|---------------|
| Available | Full semantic dedup + clustering |
| Unavailable | Fallback to text dedup (current) |
| Partial (corrupted) | Log warning, reinitialize collection |

---

## 4. Gap Analysis — Current vs. Fully Effective Loop

### Dimension 1: Memory & Learning

| Current | Target | Gap ID | Fix Priority |
|---------|--------|--------|--------------|
| File-based output only | Vector store with queryable history | G-MEMORY-01 | **P0** |
| Text deduplication (50 char) | Semantic deduplication (cosine > 0.85) | G-DEDUP-01 | **P0** |
| No outcome tracking | Track accept/reject/convert → learn | G-LEARN-01 | P1 |
| Static dimension weights | Dynamic based on conversion rate | G-ADAPT-01 | P2 |

### Dimension 2: Prioritization

| Current | Target | Gap ID | Fix Priority |
|---------|--------|--------|--------------|
| First-match from high-risk list | Effort/impact weighted scoring | G-PRIORITY-01 | **P0** |
| No human priority input | Accept human sprint theme | G-INPUT-01 | P1 |
| No urgency detection | Detect blocking vs. cosmetic gaps | G-URGENCY-01 | P1 |
| Static intervals | Adaptive interval (busy → wait) | G-ADAPT-02 | P2 |

### Dimension 3: Human Interface

| Current | Target | Gap ID | Fix Priority |
|---------|--------|--------|--------------|
| Passive file output | Interactive CLI for review | G-UI-01 | P1 |
| No control signals | Start/stop/pause/focus commands | G-CONTROL-01 | **P0** |
| No conversion tracking | Dashboard: hypothesis → sprint | G-DASHBOARD-01 | P1 |
| No explanation | Why was this hypothesis generated? | G-EXPLAIN-01 | P2 |

### Dimension 4: Scientific Rigor

| Current | Target | Gap ID | Fix Priority |
|---------|--------|--------|--------------|
| Single observation | Multi-sample trend detection | G-TREND-01 | P1 |
| No falsification | Track rejected hypotheses | G-FALSIFY-01 | P2 |
| No confidence calibration | Calibrate on accuracy | G-CALIBRATE-01 | P2 |
| Isolated hypotheses | Hypothesis dependency graph | G-GRAPH-01 | P3 |

### Full Gap Summary

| Gap ID | Description | Severity | Effort | Sprint |
|--------|-------------|----------|--------|--------|
| G-MEMORY-01 | No vector memory system | **Critical** | 2h | v1.5 SC1 |
| G-DEDUP-01 | Text-based dedup | **Critical** | 1h | v1.5 SC2 |
| G-PRIORITY-01 | Naive prioritization | **Critical** | 1h | v1.5 SC3 |
| G-CONTROL-01 | No stop/pause/focus | **High** | 1h | v1.5 SC4 |
| G-INPUT-01 | No human theme input | Medium | 2h | v2.0 |
| G-LEARN-01 | No outcome learning | Medium | 4h | v2.0 |
| G-TREND-01 | No trend detection | Medium | 3h | v2.0 |
| G-UI-01 | No interactive CLI | Low | 4h | v2.0 |

---

## 5. Loop Input — Theme & Focus Control

### Current Input (None)

The loop has **no human input mechanism**. It autonomously selects dimensions based on internal risk assessment.

### Desired Input Mechanisms

| Input Type | Use Case | Implementation |
|------------|----------|----------------|
| **Theme focus** | "Focus on VFS issues this week" | Environment variable: `RESEARCH_FOCUS=vfs` |
| **Dimension disable** | "Skip SEO for now" | Config array: `skipDimensions: ['seo']` |
| **Urgent gap** | "Hypothesize about checkout bugs" | One-shot command with custom prompt |
| **Pause/Resume** | "Stop while I'm in deep sprint" | PM2 stop/start or signal file |
| **Speed control** | "Run hourly instead of 10min" | `RESEARCH_INTERVAL=60` (already exists) |

### Proposed Theme Input (v1.5)

**Environment Variable:**
```bash
# Focus on specific dimension
RESEARCH_FOCUS_DIMENSION=data-integrity npm run research:daemon

# Focus on keywords (partial match)
RESEARCH_FOCUS_KEYWORDS=VFS,catalogue,products npm run research:daemon

# Exclude dimensions
RESEARCH_SKIP_DIMENSIONS=seo,documentation npm run research:daemon
```

**Signal File:**
```bash
# Create focus signal
echo "data-integrity" > _project/research/.focus-theme

# Clear focus
rm _project/research/.focus-theme
```

---

## 6. Loop Control — Stop / Pause / Restart

### Current Control (Basic)

| Action | Command | Status |
|--------|---------|--------|
| **Start** | `pm2 start pm2.research.config.json` | ✅ Working |
| **Stop** | `pm2 stop sanglogium-research` | ✅ Working |
| **Restart** | `pm2 restart sanglogium-research` | ✅ Working |
| **Status** | `pm2 status` / `pm2 logs` | ✅ Working |
| **Single run** | `node scripts/research/continuous-loop.mjs once` | ✅ Working |

### Missing Controls

| Control | Use Case | Gap ID |
|---------|----------|--------|
| **Pause (keep process)** | Stop generating but stay ready | G-CONTROL-01 |
| **Resume** | Unpause | G-CONTROL-01 |
| **Drain** | Finish current iteration then pause | G-CONTROL-02 |
| **Emergency stop** | Kill immediately, no cleanup | G-CONTROL-03 |
| **Health check** | Is loop healthy? | G-CONTROL-04 |

### Proposed Control Interface (v1.5)

```bash
# CLI commands (npm scripts)
npm run research:start      # Start daemon
npm run research:stop       # Stop daemon
npm run research:pause      # Pause (finish current, then wait)
npm run research:resume     # Resume from pause
npm run research:status     # Show health + recent output
npm run research:once       # Single iteration
npm run research:focus      # Set theme interactively
```

**Implementation via signal files:**
```typescript
// In continuous-loop.mjs
const SIGNAL_DIR = '_project/research/.signals';

async function checkControlSignals() {
  const pauseFile = path.join(SIGNAL_DIR, 'pause');
  const stopFile = path.join(SIGNAL_DIR, 'stop');
  
  if (await fileExists(stopFile)) {
    console.log('🛑 Stop signal detected, shutting down...');
    await fs.unlink(stopFile);
    process.exit(0);
  }
  
  if (await fileExists(pauseFile)) {
    console.log('⏸️  Pause signal detected, waiting...');
    await waitForSignalClear(pauseFile);
  }
}
```

---

## 7. RWD Strategy — Responsive Research Loop

Not applicable (non-UI system).

---

## 8. Files at Risk of Regression

| File | Risk | Mitigation |
|------|------|------------|
| `scripts/research/continuous-loop.mjs` | **HIGH** | Add only, don't modify existing logic |
| `pm2.research.config.json` | LOW | No changes planned |
| `package.json` | LOW | Add `chromadb` only |
| `_project/research/continuous/*.md` | LOW | Output format unchanged |
| `lib/vector-store.ts` (new) | — | New file, no regression risk |

---

## 9. Verification Commands

### Pre-Implementation Baseline
```bash
# Verify current loop runs
npm run build
node scripts/research/continuous-loop.mjs once

# Check output directory
dir _project/research\continuous
```

### Post-Implementation Verification
```bash
# With ChromaDB
npm run research:once
# → Check: ChromaDB collection created, hypothesis stored

# Control interface
npm run research:pause
npm run research:status
npm run research:resume

# Deduplication test
npm run research:once
npm run research:once
# → Second should log "Duplicate detected"
```

---

## 10. Summary — Answers to Your Questions

### What is expected of the research loop?
**Autonomous gap detection** that continuously scans for deviations from professional standards and generates **novel, actionable, high-impact hypotheses** with minimal human supervision.

### What is the feedback loop?
**Current:** Passive file output → human reads → manual decision (no signal back to loop)  
**Target:** Interactive CLI with accept/reject/focus signals that the loop learns from.

### Where do I check the research loop?
- **Output:** `_project/research/continuous/`
- **Logs:** `pm2 logs sanglogium-research`
- **Status:** `pm2 status`

### What is ChromaDB/vector memory integration?
Local vector database storing hypothesis embeddings for **semantic deduplication**, **similarity search**, and **pattern clustering**. Replaces text dedup with cosine similarity.

### What are the gaps to fully effective loop?
**Critical (P0):** No memory, naive dedup, no prioritization, no control interface  
**v1.5 Sprint addresses:** Memory (ChromaDB), semantic dedup, effort/impact scoring, basic controls

### Where is the loop input theme?
**Current:** None  
**v1.5:** Environment variables `RESEARCH_FOCUS_DIMENSION` or signal files  
**v2.0:** Interactive CLI with persistent theme setting

### Where can we stop/pause/restart?
**Current:** PM2 stop/start/restart  
**v1.5:** npm scripts + signal files for pause/resume/focus  
**Full control via:** `npm run research:{start|stop|pause|resume|status}`

---

## 11. Recommended Immediate Actions

1. **Accept v1.5 Sprint scope** (SC1-SC4) — addresses P0 gaps
2. **Set up ChromaDB** (docker or pip install)
3. **Add npm scripts** for control interface
4. **Create signal directory** for theme/control files
5. **Run v1.5 sprint** → measure improvement → decide on v2.0

---

**End of Audit**

*Ready for /sprint command consumption*  
*Audit format: /audit workflow*  
*Gaps documented: G-MEMORY-01 through G-CONTROL-04*
