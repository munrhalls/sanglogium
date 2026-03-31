# Patterns Directory

**Purpose:** Architectural decisions, code organization principles, design patterns that worked.

**Storage criteria:** Store here when:
- A structural approach proved effective
- An architectural decision has lasting implications
- A code organization principle should be reused
- A design pattern solves a recurring problem

---

## Lessons

| Lesson | Date | Severity | Summary |
|--------|------|----------|---------|
| [functional-grouping.md](functional-grouping.md) | 2026-03-31 | High | Complete functional groups, not isolated components |
| [vfs-catalog-architecture.md](vfs-catalog-architecture.md) | 2026-03-31 | High | Virtual File System pre-computed at build time |

---

## New Lesson Template

```markdown
# patterns: [Concise Title — Max 5 words]

**Date:** YYYY-MM-DD  
**Source:** [Sprint/Design/Task]  
**Severity:** [Critical/High/Medium/Low]  
**Frequency:** [One-time/Recurring/Systemic]  
**Status:** [Active/Superseded/Archived]

---

## The Problem
[What structural issue did this solve?]

## The Pattern
[The solution approach]

## Application Rules
[When and how to apply]

## Prevention
[How to ensure pattern is followed]

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
- [ ] `_project/lessons/patterns/` — This file
- [ ] INDEX.md — Keywords added
- [ ] `.windsurfrules` — If universal constraint

**Date integrated:** YYYY-MM-DD
```

---

## Retrieval Keywords

**Common pattern types:**
- "component" — UI component patterns
- "architecture" — System design patterns
- "data" — Data flow and fetching patterns
- "build" — Build-time computation patterns
- "catalog" — Category/hierarchy patterns

---

**Related:** [INDEX.md](../INDEX.md) | [README.md](../README.md)
