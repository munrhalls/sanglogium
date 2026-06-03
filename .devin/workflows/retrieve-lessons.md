# Pre-Work Lessons Retrieval Protocol

**Purpose:** Before any work begins, retrieve and apply relevant lessons from the learning system.

**When to execute:** At the start of EVERY task, sprint, debug session, or implementation.

---

## Quick Start

```
┌─────────────────────────────────────────────────────────┐
│  BEFORE WORK: Load relevant lessons                      │
├─────────────────────────────────────────────────────────┤
│  1. Identify themes based on work type                  │
│  2. Query INDEX.md for relevant keywords                │
│  3. Load lessons into active context                    │
│  4. Apply constraints to current task                   │
└─────────────────────────────────────────────────────────┘
```

---

## Retrieval Protocol

### Step 1: Work Type Analysis (30 seconds)

**Map the incoming work to themes:**

| Work Type | Primary Themes to Query | Common Keywords |
|-----------|------------------------|-----------------|
| New feature development | `patterns`, `anti-patterns` | component, architecture, structure |
| Bug fix / Debug | `failures`, `anti-patterns` | error, debug, root-cause |
| Sanity/GROQ work | `failures`, `patterns` | groq, sanity, schema, reference |
| Build/DevOps issue | `failures`, `workflows` | build, module, import, config |
| UI/Component work | `patterns`, `anti-patterns` | component, svg, tailwind, styling |
| Workflow improvement | `workflows`, `sops` | process, automation, command |
| Prompt engineering | `prompting` | context, prompt, llm, agent |

**Questions to ask:**
1. What technology stack will this touch? (Next.js, Sanity, React, etc.)
2. What type of work is this? (new feature, bug fix, refactor, optimization)
3. What has gone wrong in this area before?

---

### Step 2: Keyword Search (30 seconds)

**Query `_project/lessons/INDEX.md` for:**
- Technology keywords ("sanity", "groq", "nextjs")
- Pattern keywords ("component", "schema", "build")
- Risk keywords from past failures

**Search strategy:**
```
Primary keyword: [main tech or pattern]
Secondary keywords: [related tech, failure modes]
Severity filter: Critical > High > Medium (prioritize)
```

---

### Step 3: Lesson Loading (1 minute)

**For each relevant lesson found:**

1. **Read the lesson file**
2. **Extract the prevention rule** — the "how to never repeat this"
3. **Note applicability conditions** — when does this apply?

**Loading template:**

```markdown
## Pre-Work Context Loaded

**Task:** [Brief description]
**Themes queried:** [patterns, failures, etc.]
**Keywords searched:** [keyword1, keyword2, keyword3]

### Lessons Retrieved:

#### 1. [Lesson Name]
**Source:** [file path]
**Severity:** [Critical/High/Medium/Low]

**The Problem:**
[One-line summary]

**Prevention Rule:**
[Actionable constraint for this work]

**Applies to current task?** [Yes/No — explain]

---

### Active Constraints for This Work:

**MUST CHECK:**
- [ ] [Constraint from Lesson 1]
- [ ] [Constraint from Lesson 2]
- [ ] [Constraint from Lesson 3]

**MUST AVOID:**
- [ ] [Anti-pattern from lessons]
- [ ] [Another anti-pattern]

**MUST VERIFY:**
- [ ] [Verification step from lessons]
```

---

### Step 4: Constraint Application

**Transform lessons into active constraints:**

```
Lesson: "GROQ reference syntax on non-reference fields returns silent empty results"

↓ Transmute to constraint ↓

Constraint: "Before using -> reference syntax in GROQ, verify the field 
            is actually a reference type in the Sanity schema"

↓ Apply to work ↓

Check: [ ] Read schema file to confirm field type
```

---

## Common Retrieval Patterns

### Pattern A: Sanity/GROQ Work

```markdown
## Pre-Work: Sanity/GROQ Task

**Keywords:** sanity, groq, schema, reference

**Lessons Retrieved:**
1. [failures/groq-reference-syntax.md] — CRITICAL
2. [failures/diagnostic-query-mismatch.md] — HIGH

**Active Constraints:**
- [ ] Verify field type before using reference syntax (->)
- [ ] Check schema file when modifying queries
- [ ] Verify query construction layer, not just data flow
- [ ] Add runtime data logging before deploying fix
```

---

### Pattern B: Component/UI Work

```markdown
## Pre-Work: Component Development

**Keywords:** component, svg, styling, build

**Lessons Retrieved:**
1. [failures/svg-import-assumption.md] — MEDIUM
2. [patterns/functional-grouping.md] — HIGH

**Active Constraints:**
- [ ] Don't assume SVGR — check build config first
- [ ] Complete functional groups, not isolated components
- [ ] Verify build tooling exists before Pass 3 styling
```

---

### Pattern C: Build/DevOps Issue

```markdown
## Pre-Work: Build/DevOps

**Keywords:** build, module, import, config

**Lessons Retrieved:**
1. [failures/es-module-commonjs-mismatch.md] — HIGH
2. [failures/pre-existing-infrastructure-errors.md] — MEDIUM

**Active Constraints:**
- [ ] Use ES module import syntax only (no require)
- [ ] Verify if build failure is pre-existing before blaming sprint work
- [ ] Check individual file compilation: `npx tsc --noEmit [file]`
```

---

### Pattern D: Debug Session

```markdown
## Pre-Work: Debug Session

**Keywords:** debug, data, verification, assumption

**Lessons Retrieved:**
1. [failures/debug-data-assumption.md] — HIGH
2. [failures/diagnostic-query-mismatch.md] — HIGH

**Active Constraints:**
- [ ] Verify actual data before any code changes
- [ ] Build passing ≠ bug fixed — need runtime verification
- [ ] Trace complete code path including query construction
- [ ] Add temporary data logging to see actual values
```

---

## Integration with Workflows

### In `/sprint` — Pre-Sprint Retrieval

Add to sprint.md Phase 1 (Current State Research):

```markdown
### 1.5 Load Relevant Lessons

**Query lessons based on:**
- Technology stack in this sprint
- Similar past sprints (check `_project/*.todo` files)
- Known risk areas

**Output:**
- [ ] Relevant lessons identified and loaded
- [ ] Constraints integrated into sprint spec
- [ ] Prevention checks added to DoDs
```

---

### In `/debug` — Pre-Debug Retrieval

Add to debug.md Phase 1:

```markdown
### 1.3 Load Past Failures in This Area

**Query:** `_project/lessons/INDEX.md` for keywords matching:
- Error message patterns
- Technology stack
- Component/file paths involved

**Purpose:** Don't repeat previously solved problems
```

---

### In `/implement` — Pre-Implementation Retrieval

Add to implement.md Phase 1:

```markdown
### 1.4 Apply Learned Constraints

**Query lessons for:**
- Files being modified
- Technologies being used  
- Patterns being applied

**Integrate constraints into implementation plan**
```

---

## Retrieval Verification

**Before proceeding with work, confirm:**

```markdown
## Lessons Retrieval Checklist

- [ ] Relevant themes identified
- [ ] INDEX.md queried for keywords
- [ ] High/Critical severity lessons loaded first
- [ ] Prevention rules extracted
- [ ] Constraints applied to current task
- [ ] Applicability verified (some lessons may not apply)
```

---

## Compound Effect Tracking

**After work completion, verify learning system improved outcome:**

```markdown
## Post-Work: Compound Effect Check

**Did retrieved lessons help?**
- [ ] Avoided previously encountered error
- [ ] Applied prevention rule successfully
- [ ] Work completed faster due to known patterns
- [ ] New lesson learned (trigger /learn protocol)

**If lessons didn't apply:**
- [ ] Lesson incorrectly tagged (update INDEX.md)
- [ ] New pattern discovered (document in patterns/)
- [ ] Retrieval keywords need refinement
```

---

## Quick Reference Card

```
╔════════════════════════════════════════════════════════════╗
║              PRE-WORK RETRIEVAL — 2 MINUTE DRILL          ║
╠════════════════════════════════════════════════════════════╣
║ 1. IDENTIFY → What tech? What work type? What's risky?    ║
║                                                                      ║
║ 2. QUERY → Check INDEX.md for keywords                      ║
║                                                                      ║
║ 3. LOAD → Read Critical/High severity lessons first       ║
║                                                                      ║
║ 4. APPLY → Convert to constraints for this work             ║
║                                                                      ║
║ 5. CHECK → Verify constraints are being followed            ║
╚════════════════════════════════════════════════════════════╝
```

---

**Related:** [learn.md](../03-commands/learn.md) | [INDEX.md](../lessons/INDEX.md) | [sprint.md](sprint.md)
