# Lessons Index

**Purpose:** Searchable keyword → lesson mapping for pre-work retrieval.

**Last Updated:** 2026-03-31

---

## Keyword: ai-leverage

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/ai-leverage-infrastructure.md](workflows/ai-leverage-infrastructure.md) | High | 7 true bottlenecks identified: context loss, sequencing violations, data assumption, etc. |

---

## Keyword: context-loss

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/ai-leverage-infrastructure.md](workflows/ai-leverage-infrastructure.md) | High | 10-30 min/session friction — fixed with context templates |

---

## Keyword: sequencing

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/ai-leverage-infrastructure.md](workflows/ai-leverage-infrastructure.md) | Critical | 17-day failure pattern — Pass 1→2→3 enforcement required |

---

## Keyword: infrastructure

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/ai-leverage-infrastructure.md](workflows/ai-leverage-infrastructure.md) | High | Workflow hardening: data verification, pre-sprint checks, MCP retrieval |

---

## Keyword: bottleneck

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/ai-leverage-infrastructure.md](workflows/ai-leverage-infrastructure.md) | High | 7 true bottlenecks with evidence-based time sink quantification |

---

## Keyword: baseline

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/pre-flight-baseline-check.md](workflows/pre-flight-baseline-check.md) | High | Always verify baseline build before sprint work |

---

## Keyword: nuqs

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/url-state-shallow-routing.md](patterns/url-state-shallow-routing.md) | Medium | Use `shallow: true` for high-frequency URL state to avoid server roundtrips |

---

## Keyword: url-state

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/url-state-shallow-routing.md](patterns/url-state-shallow-routing.md) | Medium | nuqs + shallow routing for instant filter/sort UI feedback |

---

## Keyword: performance

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/url-state-shallow-routing.md](patterns/url-state-shallow-routing.md) | Medium | Router navigation causes 200-500ms lag; use shallow client updates |

---

## Keyword: groq

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/groq-schema-assumption.md](failures/groq-schema-assumption.md) | Critical | Never assume field types — always read schema first |
| [failures/groq-reference-syntax.md](failures/groq-reference-syntax.md) | Critical | Reference syntax (->) on non-reference string fields returns empty results silently |
| [failures/diagnostic-query-mismatch.md](failures/diagnostic-query-mismatch.md) | High | Diagnostic traced data flow but failed to verify GROQ against schema |

---

## Keyword: sanity

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/groq-reference-syntax.md](failures/groq-reference-syntax.md) | Critical | Schema drift: brand field changed from reference to string, query didn't |
| [patterns/vfs-catalog-architecture.md](patterns/vfs-catalog-architecture.md) | High | Virtual File System pre-computed at build time for O(1) lookups |

---

## Keyword: build

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/es-module-commonjs-mismatch.md](failures/es-module-commonjs-mismatch.md) | High | `require()` in ES module scope fails — use `import` |
| [failures/pre-existing-infrastructure-errors.md](failures/pre-existing-infrastructure-errors.md) | Medium | Distinguish sprint regressions from pre-existing build issues |
| [failures/svg-import-assumption.md](failures/svg-import-assumption.md) | Medium | Don't assume SVGR — verify build tooling first |

---

## Keyword: svg

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/svg-import-assumption.md](failures/svg-import-assumption.md) | Medium | Direct SVG import requires SVGR config — use Next.js Image instead |

---

## Keyword: module

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/es-module-commonjs-mismatch.md](failures/es-module-commonjs-mismatch.md) | High | ES module scope: `import` only, no `require` |

---

## Keyword: implement

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/implement-phase-gates.md](workflows/implement-phase-gates.md) | Medium | Rigid phase gates vs continuous execution mode |

---

## Keyword: debug

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/debug-data-assumption.md](failures/debug-data-assumption.md) | High | Verify actual data before code changes — build passing ≠ bug fixed |

---

## Keyword: diagnostic

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/diagnostic-query-mismatch.md](failures/diagnostic-query-mismatch.md) | High | Trace complete code path including query construction |

---

## Keyword: testing

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/debug-data-assumption.md](failures/debug-data-assumption.md) | High | Mocked tests may hide real data issues |

---

## Keyword: component

| Lesson | Severity | Summary |
|--------|----------|---------|
| [patterns/functional-grouping.md](patterns/functional-grouping.md) | High | Complete functional groups (e.g., filter system) not isolated components |

---

## Keyword: workflow

| Lesson | Severity | Summary |
|--------|----------|---------|
| [workflows/implement-phase-gates.md](workflows/implement-phase-gates.md) | Medium | Need pre-flight branch checks and execution mode flags |
| [workflows/pre-flight-baseline-check.md](workflows/pre-flight-baseline-check.md) | High | Always verify baseline build before sprint work to prevent false correlation |

---

## Keyword: pre-flight

| Lesson | Severity | Summary |
|--------|----------|---------|
| [auto-lessons.md:472-527](auto-lessons.md) | High | 7 systematic friction reductions: context templates, data verification, pre-sprint checks |

---

## Keyword: ai-leverage

| Lesson | Severity | Summary |
|--------|----------|---------|
| [auto-lessons.md:472-527](auto-lessons.md) | High | Infrastructure sprint: 40-60 min saved per session via context scripts, verification gates |

---

## Keyword: friction-reduction

| Lesson | Severity | Summary |
|--------|----------|---------|
| [auto-lessons.md:472-527](auto-lessons.md) | High | Cognitive reconstruction overhead eliminated with scripts and workflow enforcement |

---

## Keyword: context-management

| Lesson | Severity | Summary |
|--------|----------|---------|
| [auto-lessons.md:472-527](auto-lessons.md) | High | Context templates eliminate 10-30 min/session rebuild overhead |

---

## Keyword: verification-gates

| Lesson | Severity | Summary |
|--------|----------|---------|
| [auto-lessons.md:389-469](auto-lessons.md) | Critical | Data verification before hypothesis prevents 15-20 min wasted on unverified fixes |
| [auto-lessons.md:472-527](auto-lessons.md) | High | Data Verification Gate + Pre-Sprint Infrastructure Check |

---

## Keyword: sequencing

| Lesson | Severity | Summary |
|--------|----------|---------|
| [auto-lessons.md:472-527](auto-lessons.md) | Critical | Pass 1→2→3, Layer 1→2→3→4 enforcement prevents 17-day pattern failures |

---

## Keyword: schema

| Lesson | Severity | Summary |
|--------|----------|---------|
| [failures/groq-schema-assumption.md](failures/groq-schema-assumption.md) | Critical | Read schema file before writing GROQ — never assume field types |
| [failures/groq-reference-syntax.md](failures/groq-reference-syntax.md) | Critical | Always verify field type before using reference syntax |
| [failures/diagnostic-query-mismatch.md](failures/diagnostic-query-mismatch.md) | High | Schema-to-query validation required |

---

## Search by Technology

### Next.js
- [failures/es-module-commonjs-mismatch.md](failures/es-module-commonjs-mismatch.md)
- [failures/svg-import-assumption.md](failures/svg-import-assumption.md)

### React
- [failures/es-module-commonjs-mismatch.md](failures/es-module-commonjs-mismatch.md)

### TypeScript
- [patterns/vfs-catalog-architecture.md](patterns/vfs-catalog-architecture.md)

### Sanity
- [failures/groq-reference-syntax.md](failures/groq-reference-syntax.md)
- [failures/diagnostic-query-mismatch.md](failures/diagnostic-query-mismatch.md)
- [patterns/vfs-catalog-architecture.md](patterns/vfs-catalog-architecture.md)

---

## Search by Severity

### Critical
- [failures/groq-reference-syntax.md](failures/groq-reference-syntax.md) — Silent failures, wrong field syntax

### High
- [failures/es-module-commonjs-mismatch.md](failures/es-module-commonjs-mismatch.md) — Build breaks
- [failures/debug-data-assumption.md](failures/debug-data-assumption.md) — Ineffective debugging
- [failures/diagnostic-query-mismatch.md](failures/diagnostic-query-mismatch.md) — Incomplete diagnosis
- [patterns/functional-grouping.md](patterns/functional-grouping.md) — Architecture quality

### Medium
- [failures/pre-existing-infrastructure-errors.md](failures/pre-existing-infrastructure-errors.md)
- [failures/svg-import-assumption.md](failures/svg-import-assumption.md)
- [workflows/implement-phase-gates.md](workflows/implement-phase-gates.md)

---

## New Lesson Template

```markdown
| Lesson | Severity | Summary |
|--------|----------|---------|
| [path/name.md](path/name.md) | [Critical/High/Medium/Low] | [One-line summary] |
```
