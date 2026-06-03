---
description: Automated git commit diagnostics - measure real vs illusory velocity, identify bottlenecks, and output actionable recommendations
---

# /Commits-Diagnostics Command Protocol

**Role:** Velocity Auditor + Development Metrics Analyst

**Purpose:** Automatically analyze git commit history to distinguish real velocity (gap-closing work) from illusory velocity (planning/config overhead), identify bottlenecks, and generate actionable recommendations.

---

## System Directive

Analyze commit patterns to answer:
1. **What percentage of commits actually close gaps?** (Real velocity)
2. **What percentage is planning/config overhead?** (Illusory velocity)
3. **Where are the bottlenecks?** (Cleanup spirals, recurring bugs)
4. **How efficient is the development process?** (Difficulty-to-impact ratio)

---

## Execution Protocol

### Phase 1: Data Collection (2 minutes)

**Collect commit metadata:**

```bash
# Get commit log with metadata
git log --format="%h|%s|%an|%ad|%d" --date=short --all > /tmp/commits_raw.txt

# Count total commits
wc -l /tmp/commits_raw.txt

# Extract commit types from messages
grep -E "^\[([A-E])\]" /tmp/commits_raw.txt | wc -l
```

**Extract commit taxonomy:**
- **A:** Forward progress (features, implementation)
- **D:** Configuration/planning/documentation
- **C:** Refactor/cleanup
- **B:** Bug fixes
- **E:** Polish/minor adjustments

### Phase 2: Taxonomy Analysis (3 minutes)

**Calculate commit type distribution:**

```markdown
## Commit Type Distribution

| Type | Pattern | Count | % | Description |
|------|---------|-------|---|-------------|
| **A** | `\[A\]` | {{A_COUNT}} | {{A_PCT}}% | Forward progress |
| **D** | `\[D\]` | {{D_COUNT}} | {{D_PCT}}% | Config/planning |
| **C** | `\[C\]` | {{C_COUNT}} | {{C_PCT}}% | Refactor/cleanup |
| **B** | `\[B\]` | {{B_COUNT}} | {{B_PCT}}% | Bug fixes |
| **E** | `\[E\]` | {{E_COUNT}} | {{E_PCT}}% | Polish |
| **?** | No prefix | {{UNCOUNTED}} | {{UN_PCT}}% | Unclassified |

**Total Analyzed:** {{TOTAL_COMMITS}} commits
```

**Quality Gates:**
- D-type > 30% = ⚠️ **Warning:** Excessive planning overhead
- D-type > 40% = 🚨 **Critical:** Major velocity blocker
- Cleanup (C-type) > 15% = ⚠️ **Warning:** Cleanup spiral detected

### Phase 3: Velocity Metrics (3 minutes)

**Calculate difficulty distribution:**

```markdown
## Difficulty Analysis (Fibonacci Scale)

| Difficulty | Pattern | Count | % | Quality Signal |
|------------|---------|-------|---|----------------|
| **1** | `Difficulty: 1` | {{D1_COUNT}} | {{D1_PCT}}% | Trivial |
| **2** | `Difficulty: 2` | {{D2_COUNT}} | {{D2_PCT}}% | Minor |
| **3** | `Difficulty: 3` | {{D3_COUNT}} | {{D3_PCT}}% | Medium |
| **5** | `Difficulty: 5` | {{D5_COUNT}} | {{D5_PCT}}% | Substantial |
| **8** | `Difficulty: 8` | {{D8_COUNT}} | {{D8_PCT}}% | Major |
| **13+** | `Difficulty: 13` | {{D13_COUNT}} | {{D13_PCT}}% | Epic |

**Average Difficulty:** {{AVG_DIFFICULTY}}
**High-Value Commits (8+):** {{HIGH_VALUE_COUNT}} ({{HIGH_VALUE_PCT}}%)
**Low-Value Commits (1-3):** {{LOW_VALUE_COUNT}} ({{LOW_VALUE_PCT}}%)
```

### Phase 4: DoD Closure Analysis (2 minutes)

**Measure actual gap closure:**

```bash
# Extract DoD closure patterns
grep -E "closes? (DoD|DoDs|entire sprint)" /tmp/commits_raw.txt | wc -l
grep -E "closes? 0 DoD" /tmp/commits_raw.txt | wc -l
```

```markdown
## DoD Closure Analysis

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| **Commits with DoD closure** | {{DOD_CLOSURE_COUNT}} | >60% | {{DOD_STATUS}} |
| **Zero DoD commits** | {{ZERO_DOD_COUNT}} | <20% | {{ZERO_DOD_STATUS}} |
| **Average DoDs/Commit** | {{AVG_DODS}} | >1.0 | {{AVG_STATUS}} |
| **Sprint completion rate** | {{SPRINT_COMPLETION}} | >80% | {{SPRINT_STATUS}} |

**DoD Closure Rate:** {{DOD_RATE}}%
```

### Phase 5: Real vs Illusory Velocity (3 minutes)

**Calculate velocity breakdown:**

```markdown
## Velocity Classification

### Real Velocity ✅
**Criteria:** A-type, difficulty 5+, closes ≥1 DoD

| Metric | Count | % of Total |
|--------|-------|------------|
| **High-impact commits** | {{REAL_COUNT}} | {{REAL_PCT}}% |
| **Avg DoDs closed** | {{REAL_AVG_DODS}} | — |
| **Avg difficulty** | {{REAL_AVG_DIFF}} | — |

**Characteristics:**
- Forward progress (A-type)
- Substantial difficulty (5+)
- Closes user-facing gaps
- Sprint-named deliverables

---

### Illusory Velocity ❌
**Criteria:** D-type or difficulty 1-3 or 0 DoDs

| Metric | Count | % of Total |
|--------|-------|------------|
| **Planning/config** | {{ILLUSORY_D_COUNT}} | {{ILLUSORY_D_PCT}}% |
| **Low-difficulty** | {{ILLUSORY_LOW_COUNT}} | {{ILLUSORY_LOW_PCT}}% |
| **Zero DoD** | {{ILLUSORY_ZERO_COUNT}} | {{ILLUSORY_ZERO_PCT}}% |
| **Total Illusory** | {{TOTAL_ILLUSORY}} | {{TOTAL_ILLUSORY_PCT}}% |

**Characteristics:**
- Configuration/planning (D-type)
- Low difficulty (1-3)
- Zero DoD closure
- Infrastructure-only

---

### Velocity Ratio
**Real : Illusory = {{REAL_RATIO}} : {{ILLUSORY_RATIO}}**

**Target:** 3:1 or better
**Status:** {{VELOCITY_STATUS}}
```

### Phase 6: Bottleneck Identification (2 minutes)

**Detect recurring patterns:**

```bash
# Detect cleanup patterns
grep -E "(cleanup|archive|remove|delete|purge)" /tmp/commits_raw.txt | wc -l

# Detect bug fix patterns
grep -E "(bug fix|hotfix|critical fix)" /tmp/commits_raw.txt | wc -l

# Detect config churn
grep -E "(configuration|config|update.*config)" /tmp/commits_raw.txt | wc -l
```

```markdown
## Bottleneck Analysis

| Bottleneck | Evidence | Count | Impact |
|------------|----------|-------|--------|
| **Cleanup spiral** | cleanup/archive/remove commits | {{CLEANUP_COUNT}} | {{CLEANUP_PCT}}% |
| **Bug recurrence** | bug fix commits | {{BUGFIX_COUNT}} | {{BUGFIX_PCT}}% |
| **Config churn** | configuration commits | {{CONFIG_COUNT}} | {{CONFIG_PCT}}% |
| **Sprint tracking** | .todo, sprint tracking | {{TRACKING_COUNT}} | {{TRACKING_PCT}}% |

### Critical Findings
{{#if CLEANUP_SPIRAL}}
🚨 **Cleanup Spiral Detected:** {{CLEANUP_PCT}}% of commits are cleanup/archiving
- Indicates scope drift in initial sprints
- Suggests repeated reorganization
- Consider: Clean as you go, not after
{{/if}}

{{#if HIGH_CONFIG}}
⚠️ **High Configuration Overhead:** {{CONFIG_PCT}}% config commits
- Consider batching config changes
- Reduce sprint tracking overhead
- Automate documentation generation
{{/if}}

{{#if BUG_RECURRENCE}}
⚠️ **Bug Recurrence Pattern:** {{BUGFIX_PCT}}% bug fix commits
- Suggests test coverage gaps
- Indicates reactive vs preventive work
- Consider: Add regression tests
{{/if}}
```

### Phase 7: Recommendations (2 minutes)

**Generate actionable recommendations:**

```markdown
## Diagnostic Recommendations

### Immediate Actions (This Sprint)

{{#if HIGH_D_TYPE}}
1. **Reduce D-type commits** from {{D_PCT}}% to <20%
   - Batch configuration changes into single commits
   - Reduce sprint tracking file updates
   - Automate documentation where possible
{{/if}}

{{#if CLEANUP_SPIRAL}}
2. **Stop cleanup spiral**
   - Prevent scope drift in initial planning
   - Archive once, not repeatedly
   - Clean as you go during feature work
{{/if}}

{{#if LOW_DOD_RATE}}
3. **Increase DoD closure rate** from {{DOD_RATE}}% to >60%
   - Mandate ≥1 DoD closure per commit
   - Split planning from execution commits
   - Track DoDs closed, not commits made
{{/if}}

### Workflow Changes

1. **Commit discipline:**
   - Minimum difficulty 3 for standalone commits
   - Batch difficulty 1-2 work
   - Always reference sprint/DoD in message

2. **Sprint structure:**
   - Cap planning/configuration at 20% of sprint
   - Track "Real Velocity" = A-type with DoD closure
   - Review commit quality in retrospectives

3. **Velocity tracking:**
   - Maintain 3:1 real:illusory ratio
   - Measure DoDs closed per sprint, not commits
   - Flag high cleanup/config weeks

### Quality Metrics to Track

| Metric | Current | Target | Action |
|--------|---------|--------|--------|
| D-type % | {{D_PCT}}% | <20% | Batch config |
| DoD closure % | {{DOD_RATE}}% | >60% | Commit discipline |
| Real:Illusory | {{REAL_RATIO}}:{{ILLUSORY_RATIO}} | 3:1 | Focus on A-type |
| Cleanup % | {{CLEANUP_PCT}}% | <5% | Prevent scope drift |
```

---

## Output Format

### Diagnostic Summary (Top of Report)

```markdown
╔═══════════════════════════════════════════════════════════════╗
║           COMMIT VELOCITY DIAGNOSTIC SUMMARY                  ║
╠═══════════════════════════════════════════════════════════════╣
║ Total Commits Analyzed: {{TOTAL_COMMITS}}                           ║
║ Analysis Period: {{START_DATE}} to {{END_DATE}}                     ║
╠═══════════════════════════════════════════════════════════════╣
║  REAL VELOCITY (A-type, diff 5+, closes DoDs)                 ║
║  Count: {{REAL_COUNT}} ({{REAL_PCT}}%)                                         ║
║  Status: {{REAL_STATUS}}                                        ║
╠═══════════════════════════════════════════════════════════════╣
║  ILLUSORY VELOCITY (D-type, low diff, 0 DoD)                  ║
║  Count: {{TOTAL_ILLUSORY}} ({{TOTAL_ILLUSORY_PCT}}%)                                    ║
║  Status: {{ILLUSORY_STATUS}}                                    ║
╠═══════════════════════════════════════════════════════════════╣
║  RATIO: {{REAL_RATIO}}:{{ILLUSORY_RATIO}} | TARGET: 3:1                      ║
║  OVERALL: {{OVERALL_VERDICT}}                                 ║
╚═══════════════════════════════════════════════════════════════╝
```

### Quick Reference Card

```
╔════════════════════════════════════════════════════════════╗
║              /COMMITS-DIAGNOSTICS — 2 MINUTE ANALYSIS     ║
╠════════════════════════════════════════════════════════════╣
║  1. Collect: git log → /tmp/commits_raw.txt                ║
║  2. Taxonomy: Count A/D/C/B/E commit types                 ║
║  3. Metrics: Calculate difficulty distribution             ║
║  4. DoDs: Measure gap closure rate                         ║
║  5. Velocity: Classify real vs illusory                  ║
║  6. Bottlenecks: Detect cleanup/bugs/config patterns     ║
║  7. Recommend: Output actionable improvements              ║
╚════════════════════════════════════════════════════════════╝
```

---

## Quality Gates

### Good Velocity Indicators ✅
- [ ] D-type < 20% of total
- [ ] DoD closure rate > 60%
- [ ] Real:Illusory ratio ≥ 3:1
- [ ] Cleanup < 5% of total
- [ ] Average difficulty ≥ 4

### Warning Signs ⚠️
- [ ] D-type 20-30% (elevated planning overhead)
- [ ] DoD closure 40-60% (mixed efficiency)
- [ ] Cleanup 5-15% (some scope drift)
- [ ] Real:Illusory 2:1 (below target)

### Critical Issues 🚨
- [ ] D-type > 30% (excessive planning)
- [ ] DoD closure < 40% (low efficiency)
- [ ] Cleanup > 15% (cleanup spiral)
- [ ] Real:Illusory < 2:1 (velocity blocker)

---

## Integration with /Learn Protocol

After running `/commits-diagnostics`:

1. **If velocity issues found:**
   - Run `/learn` to extract lessons
   - Thematize as `workflows/` improvement
   - Update sprint planning to address bottlenecks

2. **If positive patterns found:**
   - Document in `patterns/efficient-velocity`
   - Codify successful practices
   - Share with team as best practices

---

## Related Commands

- `/sprint` — Sprint planning with velocity constraints
- `/learn` — Extract lessons from velocity patterns
- `/research` — Deep-dive velocity analysis

**Related Files:**
- `_project/research/commit-velocity-audit.md` — Prior research
- `.windsurfrules` — Velocity constraints
- `_handbook/03-commands/learn.md` — Lesson extraction
