# Lessons Index

**Purpose:** Searchable keyword → lesson mapping for pre-work retrieval.

**Last Updated:** 2026-03-31

---

## Keyword: groq

| Lesson | Severity | Summary |
|--------|----------|---------|
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

---

## Keyword: schema

| Lesson | Severity | Summary |
|--------|----------|---------|
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
