# Command Reference: /Learn

**Purpose:** Extract, transmute, and codify learnings from completed work into reusable agent knowledge.

**Agent Role:** Learning System Architect + Knowledge Curator

---

## System Directive

After every sprint, debug session, or significant work unit:
1. **Extract** raw learnings from the experience
2. **Transmute** into efficient, thematically organized lessons
3. **Codify** into prompts, commands, or architectural constraints
4. **Compound** — make the next feature easier

---

## Execution Protocol

### Phase 1: Raw Extraction (5 minutes)

**Trigger:** Immediately after `/sprint` completion, debug resolution, or any work unit.

**Capture the following:**

```markdown
## Raw Learning Capture

**Work Unit:** [Sprint name / Debug session / Task]
**Date:** [YYYY-MM-DD]
**Duration:** [Actual time spent]

### What Was the Error/Surprise?
[Brief description of what went wrong or what was unexpected]

### Root Cause
[The actual underlying cause, not the symptom]

### Time Bottlenecks
- **Investigation:** [What took longest to figure out?]
- **Friction:** [What was unnecessarily difficult?]
- **Wait time:** [What caused idle time?]

### Prompt Quality Assessment
- **Strength:** [What was clear and effective]
- **Weakness:** [What was ambiguous or missing]
- **Missing context:** [What would have helped]

### Test Coverage Gap
[What should have caught this but didn't?]

### Fix Applied
```[code or approach]```
```

### Discovery Questions (Answer any that apply):

1. **Fix duration:** How long did it take? What was the actual bottleneck?
2. **Quality gaps:** Where did quality slip? (spec, implementation, verification)
3. **Pattern violation:** Did we violate an existing pattern? Should we create one?
4. **Repetition:** Is this the same mistake we've made before?
5. **Verification failure:** Did build pass but bug persist? Did tests fail to catch?
6. **Assumption errors:** What did we assume that was wrong?

---

### Phase 2: Thematic Organization (5 minutes)

**Map the raw learning to ONE primary theme:**

| Theme | Description | Target Storage |
|-------|-------------|----------------|
| **patterns** | Architectural patterns, code organization, structural decisions | `_project/lessons/patterns/` |
| **failures** | Root cause analysis of bugs, errors, surprises | `_project/lessons/failures/` |
| **prompting** | How to better prompt AI agents, context engineering | `_project/lessons/prompting/` |
| **workflows** | Improvements to slash commands, process optimization | `_project/lessons/workflows/` |
| **sops** | Standard operating procedures for recurring tasks | `_project/lessons/sops/` |
| **anti-patterns** | What NOT to do, dangerous defaults, common traps | `_project/lessons/anti-patterns/` |

**Learning Entry Template:**

```markdown
# [Theme]: [Concise Lesson Title]

**Date:** YYYY-MM-DD  
**Source:** [Sprint/Debug/Task name]  
**Severity:** [Critical/High/Medium/Low]  
**Frequency:** [One-time/Recurring/Systemic]

---

## The Problem
[What went wrong or what was suboptimal]

## Root Cause
[Actual underlying cause]

## The Fix
```[code or process change]```

## Prevention (How to Never Repeat)
[Actionable rule, check, or process change]

## Applicability Signals
**When to apply this lesson:**
- [Situation 1: e.g., "When working with Sanity GROQ queries"]
- [Situation 2: e.g., "When modifying build configuration"]

**Keywords for auto-retrieval:** ["groq", "sanity", "reference", "build"]
```

---

### Phase 3: Codification (5 minutes)

**Convert lesson into reusable agent infrastructure:**

#### Option A: Update `.windsurfrules` or `_handbook/`
For universal constraints that ALL agents must follow.

#### Option B: Create/Update Workflow Command
For process improvements (e.g., enhance `/sprint` with new checklist item).

#### Option C: Add to Memory System
For context that should be retrieved before relevant work.

#### Option D: Update `auto-lessons.md`
For chronological lesson log (append to existing file).

---

### Phase 4: Integration Verification (2 minutes)

**Confirm the learning will actually be used:**

```markdown
## Integration Checklist

- [ ] Lesson stored in correct thematic location
- [ ] Keywords/tags added for retrieval matching
- [ ] Relevant workflows updated with new rule/check
- [ ] Memory system updated (if using automatic retrieval)
- [ ] Test added (if lesson reveals test coverage gap)
```

---

## Learning Circuit Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     WORK COMPLETION                        │
│              (/sprint, /debug, /implement)                  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  PHASE 1: RAW EXTRACTION                                    │
│  - Capture error, bottleneck, surprise                        │
│  - Document fix and duration                                │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  PHASE 2: THEMATIC CLASSIFICATION                           │
│  - Map to ONE primary theme                                  │
│  - Write structured lesson entry                            │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  PHASE 3: CODIFICATION                                      │
│  - Update .windsurfrules (universal rules)                  │
│  - Update workflow (process improvements)                   │
│  - Add memory (context retrieval)                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  PHASE 4: COMPOUNDING                                       │
│  - Verify next work will retrieve this lesson               │
│  - Knowledge now part of agent "muscle memory"             │
└─────────────────────────────────────────────────────────────┘
```

---

## Pre-Work Lessons Retrieval

**Before ANY work starts, agents MUST:**

1. **Identify work type** → Map to themes
2. **Query lesson storage** → Retrieve relevant lessons
3. **Apply to context** → Inject into system prompt

### Retrieval Protocol

```markdown
## Pre-Work Context Loading

**Work Type:** [e.g., "Sanity GROQ query modification"]
**Themes to query:** [patterns, failures, prompting]

### Relevant Lessons Found:
1. [Lesson 1 - brief summary]
2. [Lesson 2 - brief summary]
3. [Lesson 3 - brief summary]

### Active Constraints for This Work:
- [Constraint 1 from lessons]
- [Constraint 2 from lessons]
- [Constraint 3 from lessons]
```

---

## Quality Gates

### Lesson Quality Checklist

- [ ] **Specific:** Not generic advice (e.g., "test more" → "add schema-query validation for GROQ")
- [ ] **Actionable:** Has clear prevention step or check
- [ ] **Retrievable:** Tagged with keywords for matching
- [ ] **Codified:** Integrated into workflows or rules
- [ ] **Verified:** Would have prevented the original issue

### Anti-Patterns to Avoid

1. **Vague lessons:** "Be more careful" → ❌ Not actionable
2. **Chronological dump:** Just appending to auto-lessons.md → ❌ Not retrievable
3. **No integration:** Lesson written but workflows unchanged → ❌ Won't be applied
4. **Over-thematic:** Trying to fit into multiple themes → ❌ Pick ONE primary

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
  ├─ memory system (retrieval)
  └─ tests (verification)

Phase 4: Compound
  └─ Verify next work uses this knowledge
```

---

**Related:** [sprint.md](sprint.md) | [debug.md](debug.md) | [INDEX.md](../INDEX.md)
