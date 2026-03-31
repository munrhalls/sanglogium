# Anti-Patterns Directory

**Purpose:** What NOT to do. Patterns that consistently cause problems.

**Storage criteria:** Store here when:
- An approach consistently fails
- A "common sense" solution creates problems
- Something should be actively prevented
- Dangerous defaults need documentation

---

## Lessons

| Lesson | Date | Severity | Summary |
|--------|------|----------|---------|
| [build-passing-not-bug-fixed.md](build-passing-not-bug-fixed.md) | 2026-03-31 | High | Build passing does not mean bug is fixed |

---

## New Lesson Template

```markdown
# anti-patterns: [Concise Title — Max 5 words]

**Date:** YYYY-MM-DD  
**Source:** [Where this trap occurred]  
**Severity:** [Critical/High/Medium/Low]  
**Frequency:** [One-time/Recurring/Systemic]  
**Status:** [Active/Superseded/Archived]

---

## The Anti-Pattern

[What NOT to do]

## Why This Is Dangerous

[Consequences and failure modes]

## The Trap

[How developers fall into this]

## Correct Approach

[What to do instead]

## Prevention Checklist

- [ ] Check 1
- [ ] Check 2

## Applicability

**When to apply this lesson:**
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
- [ ] `_project/lessons/anti-patterns/` — This file
- [ ] INDEX.md — Keywords added
- [ ] Relevant workflow updated

**Date integrated:** YYYY-MM-DD
```

---

## Retrieval Keywords

**Common anti-pattern types:**
- "assumption" — Assumption over verification
- "build" — Build vs runtime confusion
- "isolation" — Isolated component work
- "waterfall" — Pure waterfall approaches

---

**Related:** [INDEX.md](../INDEX.md) | [README.md](../README.md)
