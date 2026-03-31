# Workflows: AI-Leverage Infrastructure Hardening

**Date:** 2026-03-31
**Source:** Research: AI-Leverage True Bottlenecks + Sprint Creation
**Severity:** High
**Frequency:** Recurring — applies to every sprint/session

---

## The Problem

AI-leverage infrastructure exists (deterministic protocols, scoped workflows) but **7 true bottlenecks** create measurable friction:

1. **Context Loss** — 10-30 min/session manual rebuild
2. **Sequencing Violations** — 17+ day failures (documented)
3. **Configuration Theater** — 73% non-DoD commits = effort inflation
4. **Data Assumption** — 15-20 min wasted on unverified fixes
5. **Pre-existing Errors** — 15 min false correlation investigations
6. **Scope Drift** — 2-3x rework from unclear boundaries
7. **No Regression Containment** — unknown downstream impact

**Evidence:** `GIT_COMMIT_VELOCITY_AUDIT.md:98`, `core-building-pattern.md:252`, `auto-lessons.md:128-143`

---

## Root Cause

- **Gap between architecture and enforcement** — Protocols exist but not operationalized
- **No retrieval tier** — MCP server static only; context manually rebuilt each session
- **No automated gates** — Sequencing, verification assumed not enforced

---

## The Fix

### Immediate (Sprint Created)
```
SPRINT_2026_03_31_AI_LEVERAGE_INFRASTRUCTURE.md
├── 7 scope contracts → one per bottleneck
├── Context templates (VFS/Sanity/FSM/Checkout)
├── Data verification gate → debug.md
├── Pre-sprint infrastructure check → implement.md
└── /learn protocol → full codification
```

### Workflow Updates Applied
- ✅ `debug.md` — Data Verification Gate (mandatory before hypothesis)
- ✅ `sprint.md` — PRE-SPRINT LESSONS RETRIEVAL + POST-SPRINT /LEARN
- ✅ `learn.md` — Full protocol (was vague note)

---

## Prevention (Actionable Rules)

### Rule 1: Context First
**When starting complex task:**
```bash
# Instead of: "Let me explain the VFS structure..."
node scripts/context-for-vfs-task.mjs  # Instant context
```

### Rule 2: Data Before Hypothesis
**When debugging:**
```typescript
// Instead of: "The issue is probably _ref vs _id"
console.log('[Debug] Actual data:', data);  // Verify first
```

### Rule 3: Baseline Before Sprint
**When starting sprint:**
```bash
npm run build  # Document if this fails BEFORE sprint work
```

### Rule 4: /Learn After Every Sprint
**When completing sprint:**
```bash
/learn  # Extract and codify immediately
```

---

## Applicability

**When to apply:**
- Starting AI-assisted development session
- Creating multi-scope-contract sprint
- Debugging complex integration (VFS, Sanity, FSM)
- Reviewing commit velocity for effort inflation

**Keywords:** ["workflows", "context-loss", "sequencing", "data-assumption", "bottleneck", "velocity", "friction", "infrastructure"]

---

## Compound Effect

**Next work unit will benefit:**
- Context templates → instant domain setup
- Data verification gate → no unverified fixes
- Pre-sprint check → no false correlations
- /learn integration → continuous improvement

**Estimated time saved per complex session:** 40-60 minutes
