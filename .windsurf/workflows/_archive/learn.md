---
description: Extract, transmute, and codify learnings from completed work into reusable agent knowledge
---

# /Learn Command Protocol

**Role:** Learning System Architect + Knowledge Curator

**Purpose:** After every sprint, debug session, or significant work unit, extract and codify learnings into the compound engineering system.

---

## System Directive

After work completion:
1. **Extract** raw learnings from the experience
2. **Transmute** into efficient, thematically organized lessons
3. **Codify** into prompts, commands, or architectural constraints
4. **Compound** — make the next feature easier

---

## Execution Protocol

### Phase 1: Raw Extraction (5 minutes)

**Trigger:** Immediately after work completion, debug resolution, or any work unit.

**Capture:**
- What was the error/surprise?
- Root cause (not symptom)
- Time bottlenecks (investigation, friction, wait time)
- Prompt quality (strengths, weaknesses, missing context)
- Test coverage gap (what should have caught this?)
- Fix duration and approach

**Template:**
```markdown
## Raw Learning Capture

**Work Unit:** [Sprint/Debug/Task]
**Date:** [YYYY-MM-DD]
**Duration:** [Actual time]

### What Was the Error/Surprise?
[Brief description]

### Root Cause
[Actual underlying cause]

### Time Bottlenecks
- **Investigation:** [What took longest?]
- **Friction:** [What was unnecessarily difficult?]
- **Wait time:** [What caused idle time?]

### Prompt Quality
- **Strength:** [What was clear]
- **Weakness:** [What was ambiguous]
- **Missing:** [What would have helped]

### Test Coverage Gap
[What should have caught this?]

### Fix Applied
```[code]```
```

---

### Phase 2: Thematic Organization (5 minutes)

**Map to ONE primary theme:**

| Theme | Description | Target Storage |
|-------|-------------|----------------|
| **patterns** | Architectural patterns, structural decisions | `_project/lessons/patterns/` |
| **failures** | Root cause analyses of bugs/errors | `_project/lessons/failures/` |
| **prompting** | AI agent interaction optimization | `_project/lessons/prompting/` |
| **workflows** | Slash command improvements | `_project/lessons/workflows/` |
| **sops** | Standard operating procedures | `_project/lessons/sops/` |
| **anti-patterns** | What NOT to do, dangerous defaults | `_project/lessons/anti-patterns/` |

**Entry Template:**
```markdown
# [Theme]: [Concise Title]

**Date:** YYYY-MM-DD
**Source:** [Sprint/Debug]
**Severity:** [Critical/High/Medium/Low]
**Frequency:** [One-time/Recurring/Systemic]

## The Problem
[What went wrong]

## Root Cause
[Actual cause]

## The Fix
```[code]```

## Prevention
[Actionable rule]

## Applicability
**When to apply:**
- [Situation 1]
- [Situation 2]

**Keywords:** ["keyword1", "keyword2"]
```

---

### Phase 3: Codification (5 minutes)

**Convert lesson into infrastructure:**

| Target | When to Use | Example |
|--------|-------------|---------|
| `.windsurfrules` | Universal constraints | "ES modules only" |
| `workflows/*.md` | Process improvements | Add pre-flight checklist |
| `memory system` | Context retrieval | Keywords for auto-loading |
| `auto-lessons.md` | Chronological log | Append raw experience |

---

### Phase 4: Integration Verification (2 minutes)

```markdown
## Integration Checklist

- [ ] Lesson stored in correct thematic location
- [ ] Keywords/tags added for retrieval
- [ ] Relevant workflows updated
- [ ] INDEX.md updated (if new keywords)
- [ ] `.windsurfrules` updated (if universal)
```

---

## Quality Gates

### Good Lesson Criteria
- [ ] **Specific:** Not generic advice
- [ ] **Actionable:** Clear prevention step
- [ ] **Retrievable:** Tagged with keywords
- [ ] **Codified:** Integrated into workflows

### Anti-Patterns to Avoid
1. **Vague lessons:** "Be more careful" → ❌ Not actionable
2. **Chronological only:** Just appending to auto-lessons.md → ❌ Not retrievable
3. **No integration:** Lesson written but workflows unchanged → ❌ Won't be applied
4. **Over-thematic:** Multiple themes → ❌ Pick ONE primary

---

## Quick Reference

```
/learn

Phase 1: Extract
  ├─ What was the error?
  ├─ Root cause?
  ├─ Time bottlenecks?
  └─ Prompt quality?

Phase 2: Thematize
  ├─ patterns / failures / prompting
  ├─ workflows / sops / anti-patterns
  └─ Write structured entry

Phase 3: Codify
  ├─ .windsurfrules (universal)
  ├─ workflow files (process)
  ├─ INDEX.md (retrieval)
  └─ auto-lessons.md (log)

Phase 4: Verify
  └─ Confirm next work uses this knowledge
```

---

## Related Files:
- `_project/lessons/README.md` — Organization schema
- `_project/lessons/INDEX.md` — Searchable index