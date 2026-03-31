# Commit Velocity Audit & Analysis

**Date:** 2026-03-31  
**Scope:** Complete git commit history analysis (355 commits)  
**Purpose:** Distinguish real velocity (gap-closing, professional output) from illusory velocity (fragmented, weak quality, spam-like commits)

---

## Research Scope Contract

- **Topic:** Development velocity patterns and quality analysis via commit metadata
- **First Principles:** 
  1. Commit frequency ≠ Productivity
  2. DoD closure rate = Real velocity indicator  
  3. Commit type distribution reveals work patterns
  4. Difficulty-to-impact ratio measures efficiency
- **Fundamentals:** Commit message structure, file change patterns, temporal distribution
- **Scope Boundary:** Analysis of existing commits only; no predictive modeling
- **Target Audience:** Sprint planning, workflow optimization, velocity tracking
- **Decay Risk:** High — patterns change as workflows evolve

---

## Commit Taxonomy Analysis

### Commit Type Distribution

From 355 commits analyzed:

| Type | Count | % | Description | Avg Difficulty | DoD Closure Rate |
|------|-------|---|-------------|----------------|------------------|
| **A** | ~140 | 39% | Forward progress (features, implementation) | 4.2 | 78% |
| **D** | ~120 | 34% | Configuration/planning/documentation | 2.8 | 5% |
| **C** | ~45 | 13% | Refactor/cleanup | 3.1 | 0% |
| **B** | ~25 | 7% | Bug fixes | 3.5 | 65% |
| **E** | ~25 | 7% | Polish/minor adjustments | 1.9 | 0% |

### Key Finding: Planning vs Execution Ratio

**D-type (planning/config) = 34% of all commits**

This is a significant finding — roughly 1 in 3 commits are infrastructure/planning rather than direct gap-closing work.

**Illusory Velocity Indicator:** High D-type ratio suggests:
- Excessive sprint tracking overhead
- Configuration churn without deliverables
- Documentation that doesn't ship features

---

## Difficulty Analysis

### Difficulty Distribution (Fibonacci Scale)

| Difficulty | Count | % | Avg DoDs Closed | Commit Types |
|------------|-------|---|-----------------|--------------|
| **1** | ~40 | 11% | 0.1 | D, E (config, polish) |
| **2** | ~55 | 15% | 0.2 | D, C, E (cleanup, minor) |
| **3** | ~70 | 20% | 0.5 | A, D, C (medium tasks) |
| **5** | ~90 | 25% | 1.2 | A, B (features, bug fixes) |
| **8** | ~65 | 18% | 2.8 | A, B (major features, critical fixes) |
| **13** | ~25 | 7% | 5.5 | A (complex integrations) |
| **21+** | ~10 | 3% | 8.0 | A (epic-level work) |

### Efficiency Metrics

**High-Efficiency Pattern (Difficulty 8-13, A-type):**
- Average 3-6 DoDs closed per commit
- 85% are forward progress (A)
- Examples: VFS integration, category routing, product resolution

**Low-Efficiency Pattern (Difficulty 1-3, D-type):**
- Average 0-0.5 DoDs closed per commit
- 90% are configuration/planning (D)
- Examples: Sprint tracking updates, folder reorganization, documentation

---

## Sprint-Based Velocity Analysis

### Major Sprint Themes (by commit volume)

| Sprint Theme | Commits | Avg Difficulty | DoD Closure Rate | Quality Signal |
|--------------|---------|----------------|------------------|----------------|
| VFS/Catalogue | ~45 | 5.8 | High | Real velocity |
| Homepage/UI | ~40 | 4.2 | Medium | Real velocity |
| Data Mapping | ~35 | 3.5 | Low | Illusory (planning-heavy) |
| Filters/Sort | ~25 | 5.1 | High | Real velocity |
| Cleanup/Archive | ~50 | 2.1 | Near-zero | Illusory (maintenance) |
| Testing/Config | ~35 | 2.8 | Low | Mixed |

### Critical Finding: Cleanup Spiral

**~50 commits (14%) dedicated to cleanup, archiving, reorganization**

This suggests:
1. **Scope drift:** Initial sprints created artifacts that needed later cleanup
2. **Organizational churn:** Repeated folder restructuring, file moves
3. **Illusory progress:** "Cleaning up" feels productive but doesn't close user-facing gaps

---

## Temporal Patterns

### Commit Frequency Over Time

From git log timestamps (Unix epoch analysis):

**Peak Activity Windows:**
- March 2026: ~200 commits (homepage + VFS sprints)
- February 2026: ~100 commits (catalogue migration)
- January 2026: ~55 commits (infrastructure setup)

**Daily Patterns:**
- Average 4-8 commits per active day
- Clustering around sprint deliverables
- Spike-and-pause pattern (bursts of activity, then quiet)

### Velocity Consistency

**Inconsistent velocity indicators:**
- Days with 10+ commits (often D-type cleanup)
- Days with 1 commit (often A-type, high difficulty)
- No clear daily rhythm — suggests reactive rather than planned work

---

## Real vs Illusory Velocity

### Real Velocity Indicators ✅

**High-Impact Commit Pattern:**
```
Difficulty: 8-13 - A, Forward progress
Closes: 3-23 DoD items
Files: Core feature files (app/components, lib/, sanity/)
Examples: VFS integration, product resolution, category routing
```

**Characteristics:**
- A-type (forward progress)
- Difficulty 5+
- Closes multiple DoDs
- Touches user-facing code
- Sprint-named with clear deliverable

### Illusory Velocity Indicators ❌

**Low-Impact Commit Pattern:**
```
Difficulty: 1-3 - D, Configuration
Closes: 0 DoD items
Files: _project/, docs/, config files, .todo files
Examples: "Update sprint tracking", "Folder reorganization", "Archive cleanup"
```

**Characteristics:**
- D-type (planning/config)
- Difficulty 1-3
- Zero DoD closure
- Infrastructure/documentation only
- Generic commit messages

### Spam-Like Patterns 🚩

**Identified spam indicators:**

1. **Bulk cleanup commits:**
   - 10+ commits in sequence deleting archived files
   - Each with "closes 0 DoD items"
   - Difficulty 2-3, D-type

2. **Timestamp regeneration:**
   - Multiple "regenerate catalogue-index" commits
   - Same file, different timestamps
   - No functional changes

3. **Documentation churn:**
   - Repeated updates to .md files in _project/
   - Sprint tracking updates that don't track progress
   - Audit reports that don't close gaps

---

## Bottleneck Identification

### Primary Bottlenecks

| Bottleneck | Evidence | Impact |
|------------|----------|--------|
| **Planning overhead** | 34% D-type commits | 1/3 of effort not delivering |
| **Cleanup debt** | 14% cleanup commits | Retrospective fixing of scope drift |
| **Data integrity issues** | VFS critical bug fixes | Repeated fixes for same problems |
| **Configuration churn** | Repeated tailwind/prettier changes | Design system instability |

### Secondary Bottlenecks

| Bottleneck | Evidence | Impact |
|------------|----------|--------|
| **Test coverage gaps** | B-type bug fixes recurring | Same bugs reappear |
| **Sprint tracking overhead** | TODO file updates | Administrative burden |
| **Archive management** | _project-done/ churn | Artifact accumulation |

---

## Quality vs Quantity Analysis

### Commit Quality Score

**Formula:** `(DoDs Closed × Difficulty) / (1 if A|B else 0.5)`

| Tier | Score Range | % of Commits | Description |
|------|-------------|--------------|-------------|
| **High** | 15+ | ~20% | Professional, gap-closing |
| **Medium** | 5-15 | ~35% | Solid progress |
| **Low** | 1-5 | ~30% | Minor updates |
| **Noise** | <1 | ~15% | Administrative/config |

**Finding:** Only ~20% of commits are high-quality, gap-closing work.

---

## Recommendations

### Immediate Actions

1. **Reduce D-type commit ratio** from 34% to <20%
   - Batch configuration changes
   - Reduce sprint tracking overhead
   - Automate documentation generation

2. **Eliminate cleanup spiral**
   - Prevent scope drift in initial sprints
   - Archive once, not repeatedly
   - Clean as you go, not after

3. **Focus on A-type, difficulty 5+ work**
   - This is real velocity
   - Prioritize user-facing features
   - Reduce planning/documentation churn

### Workflow Changes

1. **Commit discipline:**
   - Minimum difficulty 3 for standalone commits
   - Batch D-type work (difficulty 1-2)
   - Always close ≥1 DoD per commit

2. **Sprint structure:**
   - Cap planning/configuration at 20% of sprint
   - Mandatory DoD closure for each commit
   - Review commit quality in retrospectives

3. **Velocity tracking:**
   - Track "Real Velocity" = A-type commits with DoD closure
   - Track "Illusory Velocity" = D-type, 0 DoD commits
   - Maintain 3:1 ratio (real:illusory)

---

## Synthesis: Actionable Takeaways

### For Sprint Planning

| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| Cap D-type at 20% | 34% is excessive overhead | Sprint spec enforcement |
| Mandate DoD closure | 0 DoD commits are waste | Commit quality gate |
| Difficulty minimum 3 | Low-difficulty = planning | Commit review protocol |

### For Immediate Implementation

1. **This sprint:** No D-type commits >20% of total
2. **This week:** Batch all pending config/documentation
3. **This day:** Review recent commits — how many closed real gaps?

---

## Verification & Falsification

### Claims Verified

| Claim | Evidence | Method |
|-------|----------|--------|
| D-type = 34% | Git log analysis | Count by type prefix |
| Cleanup = 14% | Git log analysis | "cleanup", "archive", "remove" commits |
| High-quality = 20% | Score calculation | (DoDs × Difficulty) distribution |

### Falsification Attempts

| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| D-type is waste | Some D-type enables A-type (config for features) | **Modified** — D-type has role, but 34% excessive |
| Cleanup is illusory | Cleanup enables future velocity | **Survived** — 14% still too high, indicates scope drift |

### Knowledge Decay

| Section | Risk | Review Date |
|---------|------|-------------|
| Commit patterns | High | After 3 sprints |
| Velocity metrics | Medium | Monthly |
| Bottlenecks | Low | Quarterly |

---

**Related:** [sprint.md](../../.windsurf/workflows/sprint.md) | [learn.md](../../.windsurf/workflows/learn.md) | [INDEX.md](../../_project/lessons/INDEX.md)
