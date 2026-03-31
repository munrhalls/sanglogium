# Failures Directory

**Purpose:** Root cause analyses of bugs, errors, and surprises that cost time. The "never again" lessons.

**Storage criteria:** Store here when:
- A bug took >10 minutes to diagnose or fix
- An error was surprising or non-obvious
- A "simple" task had unexpected complications
- The same mistake could be made again without prevention

---

## Lessons

| Lesson | Date | Severity | Summary |
|--------|------|----------|---------|
| [groq-reference-syntax.md](groq-reference-syntax.md) | 2026-03-31 | Critical | Reference syntax on non-reference fields returns silent empty results |
| [es-module-commonjs-mismatch.md](es-module-commonjs-mismatch.md) | 2026-03-31 | High | `require()` in ES module scope fails — use `import` |

---

## New Lesson Template

```markdown
# failures: [Concise Title — Max 5 words]

**Date:** YYYY-MM-DD  
**Source:** [Sprint/Debug/Task]  
**Severity:** [Critical/High/Medium/Low]  
**Frequency:** [One-time/Recurring/Systemic]  
**Status:** [Active/Superseded/Archived]

---

## The Problem
[Clear description]

## Root Cause
[Actual underlying cause]

## The Fix
```[code]```

## Prevention
[Actionable rule]

## Applicability

**When to apply:**
- [Situation 1]
- [Situation 2]

**Keywords:**
- "keyword1"
- "keyword2"

**Related:**
- [Link to related lesson]

---

## Codification Log

**Integrated into:**
- [ ] `_project/lessons/failures/` — This file
- [ ] INDEX.md — Keywords added
- [ ] Workflow update

**Date integrated:** YYYY-MM-DD
```

---

## Retrieval Keywords

**Common failure patterns:**
- "build" — Build-time errors, configuration issues
- "groq" — Sanity query issues
- "module" — ES module/CommonJS problems
- "schema" — Schema drift, type mismatches
- "debug" — Debugging methodology issues
- "import" — Import/export issues

---

**Related:** [INDEX.md](../INDEX.md) | [README.md](../README.md)
