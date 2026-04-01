# SPRINT: Continuous Research Loop v1.5 Improvements

**Sprint ID:** SPRINT_2026_04_01_RESEARCH_LOOP_V1_5  
**Duration:** 4 hours  
**Target:** Implement Option A quick fixes from research audit (70% of v2 benefits, 20% effort)  
**Output:** `_project/sprints/active/SPRINT_2026_04_01_RESEARCH_LOOP_V1_5.md`

---

## Pre-Sprint Context

### Source Research
- **Research Audit:** `_project/research/CONTINUOUS_LOOP_RESEARCH_AUDIT.md`
- **Current Implementation:** `scripts/research/continuous-loop.mjs`
- **Decision:** Option A (Quick Fixes) — validate ROI before v2 investment

### Critical Gaps Addressed
| Gap ID | Finding | Fix Approach |
|--------|---------|--------------|
| G-02 | No vector memory system | ChromaDB integration |
| G-04 | Naive prioritization | Effort/impact scoring algorithm |
| Partial G-02 | Text-based deduplication | Semantic similarity matching |

---

## Pre-Sprint Lessons Applied

From `_project/lessons/INDEX.md`:

| Keyword | Lesson | Constraint Applied |
|---------|--------|-------------------|
| `module` | ES modules only — no `require()` | All new code uses `import` |
| `baseline` | Verify baseline build before sprint | `npm run build` must pass before changes |
| `data-assumption` | Verify actual data before changes | Test ChromaDB integration with real vectors |
| `testing` | Mocked tests hide real issues | Integration test with real Ollama instance |

---

## Scope Lock Rules

1. **NO changes to research dimensions** — keep existing 10 dimensions
2. **NO changes to Ollama integration** — proven working, don't touch
3. **NO changes to PM2 configuration** — keep existing setup
4. **NO multi-agent refactor** — that's v2 scope, out of bounds
5. **YES to ChromaDB addition** — additive only, doesn't break existing
6. **YES to algorithm improvements** — inside existing functions only

---

## Regression Risk Analysis

| Risk Area | Impact | Mitigation |
|-----------|--------|------------|
| Ollama connection logic | HIGH | Don't modify existing connection test |
| File output format | MEDIUM | Keep existing markdown format |
| PM2 process management | LOW | No changes to pm2 config |
| Existing hypotheses | LOW | Keep text dedup as fallback |

**Regression Tests Required:**
- Ollama connection still works after changes
- Existing hypotheses still generated when ChromaDB unavailable
- File output format unchanged

---

## Scope Contracts

### SC1: ChromaDB Vector Store Integration — Gap G-02

**Target State:** Research loop stores hypotheses in ChromaDB for semantic retrieval

**DoD (Definition of Done):**

**Pass 1 — Infrastructure (No Logic):**
- [ ] Add `chromadb` dependency to package.json
- [ ] Create `lib/vector-store.ts` with ChromaDB client initialization
- [ ] Type definitions for hypothesis embeddings

**Pass 2 — Integration (Real Connection):**
- [ ] Initialize ChromaDB collection on daemon start
- [ ] Test connection to local ChromaDB (default port 8000)
- [ ] Graceful fallback when ChromaDB unavailable (log warning, continue)

**Pass 3 — Build (Full Implementation):**
- [ ] Generate embeddings for each hypothesis using Ollama embeddings API
- [ ] Store hypothesis + embedding + metadata in ChromaDB
- [ ] Retrieve similar hypotheses via vector similarity search
- [ ] Desktop verification: `node scripts/research/continuous-loop.mjs once`

**Verification:**
```bash
npm run build
node scripts/research/continuous-loop.mjs once
# Check: ChromaDB collection created, hypothesis stored with embedding
```

---

### SC2: Semantic Deduplication — Gap G-02 (Partial)

**Target State:** Detect semantic duplicates via vector similarity, not just text match

**DoD (Definition of Done):**

**Pass 1 — Algorithm Design:**
- [ ] Define similarity threshold (0.85 cosine similarity)
- [ ] Design query: find hypotheses with similarity > threshold
- [ ] Fallback to text dedup if ChromaDB unavailable

**Pass 2 — Integration:**
- [ ] Query ChromaDB for similar hypotheses before generating new
- [ ] Compare with today's hypotheses via vector similarity
- [ ] Return "duplicate detected" if similarity > 0.85

**Pass 3 — Build:**
- [ ] Replace `content.includes(hypothesis.hypothesis.substring(0, 50))` with vector query
- [ ] Add semantic similarity score to log output
- [ ] Keep text dedup as secondary check
- [ ] Desktop verification: Generate 2 similar hypotheses, verify second is rejected

**Verification:**
```bash
node scripts/research/continuous-loop.mjs once
node scripts/research/continuous-loop.mjs once
# Second run should detect semantic duplicate
```

---

### SC3: Effort/Impact Prioritization — Gap G-04

**Target State:** Prioritize dimensions by effort × impact score, not just first-match

**DoD (Definition of Done):**

**Pass 1 — Scoring Algorithm:**
- [ ] Define impact weights per dimension (based on audit findings)
- [ ] Define effort estimates per dimension type
- [ ] Formula: `priority_score = impact_weight / effort_estimate`

**Pass 2 — Integration:**
- [ ] Calculate score for each high-risk dimension
- [ ] Sort dimensions by priority_score descending
- [ ] Select top-scoring dimension for hypothesis generation

**Pass 3 — Build:**
- [ ] Replace `highRiskDimensions[0]` with sorted selection
- [ ] Add priority score to hypothesis metadata
- [ ] Log selected dimension with reasoning
- [ ] Desktop verification: Verify highest-score dimension selected

**Impact Weights (from audit):**
| Dimension | Impact Weight | Reason |
|-----------|---------------|--------|
| data-integrity | 10 | VFS critical for product queries |
| design-system-compliance | 8 | Affects all UI components |
| test-coverage-gaps | 7 | Prevents regressions |
| component-completeness | 6 | Shared component quality |
| groq-query-optimization | 5 | Performance impact |
| performance-bottlenecks | 5 | User experience |
| accessibility-compliance | 4 | Compliance requirement |
| security-hardening | 4 | Risk mitigation |
| seo-optimization | 3 | Discovery impact |
| documentation-gaps | 2 | Maintenance |

**Verification:**
```bash
node scripts/research/continuous-loop.mjs once
# Check logs: "Selected dimension: X (priority_score: Y)"
```

---

## Sprint Sequencing

```
Hour 0-2:   SC1 ChromaDB Integration
Hour 2-3:   SC2 Semantic Deduplication  
Hour 3-4:   SC3 Prioritization Algorithm
```

---

## /Test Integration Points

### Pre-Sprint Baseline
| Test | Command | Expected |
|------|---------|----------|
| Build passes | `npm run build` | ✅ No errors |
| Current loop runs | `node scripts/research/continuous-loop.mjs once` | ✅ Generates hypothesis |

### Per-Scope-Contract Tests

**SC1 Tests:**
```typescript
// tests/research/chromadb.integration.test.ts
- ChromaDB client initializes
- Collection created on start
- Hypothesis stored with embedding
- Query returns similar hypotheses
```

**SC2 Tests:**
```typescript
// tests/research/deduplication.unit.test.ts
- Similar hypothesis detected (cosine > 0.85)
- Different hypothesis allowed (cosine < 0.85)
- Fallback to text match when ChromaDB down
```

**SC3 Tests:**
```typescript
// tests/research/prioritization.unit.test.ts
- Priority scores calculated correctly
- Highest score selected first
- Tie-breaking by dimension order
```

### Post-Sprint Final Verification
| Test | Command | Expected |
|------|---------|----------|
| Full build | `npm run build` | ✅ Pass |
| Loop generates | `node scripts/research/continuous-loop.mjs once` | ✅ With ChromaDB, prioritization |
| Deduplication | Run twice with similar state | ✅ Second rejected as duplicate |

---

## Test Evidence Log

### Pre-Sprint Baseline
| Date | /test Invocation | Tests | Pass Rate | Verdict |
|------|------------------|-------|-----------|---------|
| | | | | |

### Per Scope Contract
| Scope Contract | /test Date | DoD Tests | Pass Rate | Verdict |
|----------------|------------|-----------|-----------|---------|
| SC1 ChromaDB | | | | |
| SC2 Deduplication | | | | |
| SC3 Prioritization | | | | |

### Final Evidence Dashboard
| Check | Status |
|-------|--------|
| Build gate | |
| SC1 tests | |
| SC2 tests | |
| SC3 tests | |
| Integration test | |

---

## Files at Risk of Regression

| File | Risk | Mitigation |
|------|------|------------|
| `scripts/research/continuous-loop.mjs` | HIGH | Keep all existing logic, add new functions only |
| `pm2.research.config.json` | LOW | No changes |
| `package.json` | LOW | Add chromadb to dependencies only |
| `_project/research/continuous/*.md` | LOW | Output format unchanged |

---

## Expected Outcomes

### Success Criteria
- [ ] ChromaDB stores hypotheses with embeddings
- [ ] Semantic deduplication reduces duplicates by 80%
- [ ] Prioritization selects highest-impact dimensions first
- [ ] All existing functionality preserved (regression-free)
- [ ] 4 hours total effort

### Value Validation
After sprint completion, measure:
- Duplicate rate before/after (target: <10% duplicates)
- Hypothesis quality score (target: higher impact dimensions selected)
- Sprint conversion rate (target: more hypotheses → actual sprints)

---

## Post-Sprint Decision Gate

**If validation successful →** Proceed to Option B (v2 Multi-Agent Architecture)  
**If validation fails →** Revert to text-only deduplication, investigate issues

---

*Sprint prepared following /sprint workflow protocol*  
*Lessons loaded from _project/lessons/INDEX.md*  
*Research audit: _project/research/CONTINUOUS_LOOP_RESEARCH_AUDIT.md*
