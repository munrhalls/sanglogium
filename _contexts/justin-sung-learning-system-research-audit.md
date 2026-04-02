# Justin Sung's Learning System: /research & /audit Workflows
## A Pragmatic, 0-Cost, Human-Implementable Framework

**Date:** April 2, 2026  
**Purpose:** Learnable decomposition of research and audit workflows  
**Target:** Human engineers seeking systematic AI-leverage skills  
**Constraint:** 0-cost, low-friction, implementable today  

---

## Level 0: The Highway (The Big Picture)

### What Are These Workflows?

```
┌─────────────────────────────────────────────────────────────────────┐
│                         TWO CORE WORKFLOWS                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  /research [TOPIC]                    /audit [FEATURE]              │
│  ─────────────────────                ────────────────────          │
│  "What should I know?"                  "What's wrong here?"          │
│                                                                      │
│  Output: Knowledge artifact             Output: Gap analysis          │
│  Depth: Deep, verified, scoped         Depth: Surface, ratings        │
│  Time: 30-60 minutes                   Time: 15-30 minutes          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### When to Use Which

| Scenario | Use | Why |
|----------|-----|-----|
| "How does X work?" | /research | Need verified knowledge |
| "Is this ready to build?" | /audit | Need gap analysis |
| "What's the best practice?" | /research | Need authoritative sources |
| "What's missing in this code?" | /audit | Need assessment |
| Pre-sprint planning | BOTH | Research THEN audit |
| Production incident | /audit first | Quick assessment needed |

---

## Level 1: The Chunks (Core Components)

### Chunk A: The Research Engine (8 Phases)

```
┌────────────────────────────────────────────────────────────┐
│              RESEARCH PHASES (In Order)                    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  1. SCOPE DEFINITION          → "What are we researching?"  │
│  2. SOURCE TRIANGULATION      → "Where do we look?"        │
│  3. FIRST PRINCIPLES          → "What's the fundamental?"  │
│  4. CODE VERIFICATION         → "Does this actually work?"│
│  5. BEST PRACTICES            → "What survives scrutiny?"  │
│  6. SOLUTIONS AUDIT           → "What are the options?"  │
│  7. VERIFICATION              → "Did we get it right?"    │
│  8. SYNTHESIS                 → "What do we do now?"      │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Chunk B: The Audit Engine (7 Phases)

```
┌────────────────────────────────────────────────────────────┐
│               AUDIT PHASES (In Order)                      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  1. DESIGN SYSTEM SUMMARY     → "What exists?"            │
│  2. BEST PRACTICES RESEARCH   → "What's the standard?"    │
│  3. COMPONENT AUDIT           → "What's broken?"          │
│  4. DESIGN RATINGS            → "How bad is it?"           │
│  5. GAP ANALYSIS              → "What's missing?"        │
│  6. CHANGE SPECIFICATIONS     → "How do we fix it?"       │
│  7. VERIFICATION CHECKLIST    → "Did we catch everything?"│
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Chunk C: The Meta-Skills (Both Workflows)

| Meta-Skill | Research Application | Audit Application |
|------------|----------------------|-------------------|
| **Verification** | Confirm every claim | Validate every rating |
| **Falsification** | Seek counter-evidence | Assume problems exist |
| **Scoping** | Prevent knowledge bloat | Prevent scope creep |
| **Synthesis** | Convert to action | Convert to fixes |

---

## Level 2: The Detailed Leaves (Actionable Components)

---

### LEAF 1.1: Research Scope Contract (5 min)

**Purpose:** Define boundaries before you start digging  
**Output:** 6-item checklist at top of research doc  
**Cost:** 0 (template below)  
**Friction:** Low (copy-paste, fill in blanks)

```markdown
## Research Scope Contract
- **Topic:** [One clear sentence]
- **First Principles:** [2-3 foundational truths]
- **Fundamentals:** [Code patterns to verify]
- **Scope Boundary:** [What's OUT]
- **Target Audience:** [Who will use this]
- **Decay Risk:** [High/Med/Low]
```

**Reality Check:**
- ✅ Prevents 3-hour tangents
- ✅ Makes research reviewable
- ✅ Forces clarity before work
- ⚠️ Can feel bureaucratic (but 5 min saves 60 min)

**When to Skip:** Emergency research where every second counts

---

### LEAF 1.2: Source Hierarchy (The Search Order)

**Purpose:** Know where to look (and in what order)  
**Output:** Source credibility table  
**Cost:** 0 (mental model)  
**Friction:** None

```
SOURCE HIERARCHY (Search in this order)
═══════════════════════════════════════════════════════

1. OFFICIAL DOCS          ← Always start here
   ├─ Framework docs (Next.js, React, etc.)
   ├─ Language specs (TypeScript handbook)
   └─ Tool docs (Sanity, Tailwind)
   
2. SOURCE OF TRUTH CODE   ← When docs are unclear
   ├─ GitHub repos (nextjs/next.js)
   ├─ Framework test suites
   └─ Official examples
   
3. AUTHORITATIVE VOICES   ← For nuance
   ├─ Core team members (Abramov, Markbåge)
   ├─ Maintainers (Osmani, Dodds)
   └─ Engineering blogs (Vercel, Meta)
   
4. COMMUNITY CONSENSUS    ← For pain points
   ├─ Reddit (r/nextjs, r/webdev)
   ├─ Stack Overflow
   └─ GitHub Discussions
   
5. COUNTER-EVIDENCE       ← For balance
   ├─ Critiques & anti-patterns
   ├─ Deprecation notices
   └─ Performance benchmarks
```

**Reality Check:**
- ✅ Prevents "I read a blog post, now I'm an expert"
- ✅ Builds credibility muscle
- ⚠️ Takes longer than random Google search
- ⚠️ Official docs sometimes wrong/outdated

**Pragmatic Shortcut:** For urgent tasks, do 1 + 4. Do full hierarchy for foundational decisions.

---

### LEAF 1.3: The Source Table (Template)

**Purpose:** Track what you found and its credibility  
**Output:** Markdown table  
**Cost:** 0  
**Friction:** Low (fill as you go)

```markdown
| Source | URL | Type | Credibility | Date | Key Claim | Status |
|--------|-----|------|-------------|------|-----------|--------|
| Next.js Docs | [link] | Official | Canonical | 2026-03 | "RSCs fetch on server" | ✅ Verified |
| GitHub Issue #123 | [link] | Source | High | 2026-02 | "Actually does X" | ✅ Verified |
| Random Blog | [link] | Community | Low | 2025-12 | "Claim Y" | ⚠️ Unverified |
```

**Reality Check:**
- ✅ Creates audit trail for your research
- ✅ Shows your work when questioned
- ✅ Prevents relying on unverified claims
- ⚠️ Adds documentation overhead

**0-Cost Implementation:** Copy template above, paste in research doc, fill as you go.

---

### LEAF 1.4: First Principles Extraction (10 min)

**Purpose:** Strip away implementation details to fundamental truths  
**Output:** 4-section analysis  
**Cost:** 0  
**Friction:** Medium (requires thinking)

**Template:**
```markdown
## First Principles Analysis

### Core Problem Being Solved
[One sentence — what friction does this address?]

### Underlying Constraints
1. [Constraint 1 — non-negotiable]
2. [Constraint 2 — non-negotiable]
3. [Constraint 3 — non-negotiable]

### Inherent Tradeoffs
| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| Pattern A | [Benefit] | [Cost] | [Scenario] |
| Pattern B | [Benefit] | [Cost] | [Scenario] |

### Failure Modes
1. **Misapplication:** [Using X when Y needed]
2. **Over-application:** [Using X everywhere]
3. **Under-application:** [Not using X when needed]
```

**Reality Check:**
- ✅ Prevents cargo-culting patterns
- ✅ Enables better decision-making
- ✅ Survives framework churn
- ⚠️ Harder than copying Stack Overflow
- ⚠️ Can be overkill for simple tasks

**When to Use:** Complex architectural decisions, new technology adoption  
**When to Skip:** "How do I center a div"

---

### LEAF 1.5: Code Verification Checklist (10 min)

**Purpose:** Don't trust docs — verify with actual code  
**Output:** 3-check verification  
**Cost:** 0  
**Friction:** Medium (requires code diving)

**Template:**
```markdown
## Code Fundamentals

### Fundamental: [Pattern Name]
**Claim:** [What docs say]

**Verification:**
- [ ] Located in our codebase: `[file path]`
- [ ] Test created: `[test path]`
- [ ] Source inspected: `[github link]`

**Actual Behavior:**
[What actually happens]

**Edge Cases:**
1. [Case 1 — what breaks it?]
2. [Case 2 — surprising behavior?]
```

**Reality Check:**
- ✅ Catches doc inaccuracies
- ✅ Builds deep understanding
- ✅ Prevents "it works on my machine"
- ⚠️ Time-intensive
- ⚠️ Framework code can be complex

**Pragmatic Approach:**
- Critical paths: Full verification
- Everything else: Trust docs + one test

---

### LEAF 1.6: Best Practice Synthesis (10 min)

**Purpose:** Identify what survives scrutiny  
**Output:** Practice evaluation with counter-evidence  
**Cost:** 0  
**Friction:** Medium

**Criteria for "Best Practice":**
- Must appear in 2+ authoritative sources
- Must have falsification attempts
- Must be timestamped

**Template:**
```markdown
## Best Practices (Verified)

### Practice: [Name]
**Consensus:** [High/Med/Low]

**Supporting Evidence:**
- [Source 1 — authoritative]
- [Source 2 — authoritative]

**Counter-Evidence (Falsification Attempts):**
- [Critique 1 — when does this fail?]

**Verdict:** ✅ Recommended / ⚠️ Context-Dependent / ❌ Avoid

**When to Use:** [Specific conditions]
**When to Skip:** [Specific conditions]
```

**Reality Check:**
- ✅ Prevents trendy-pattern adoption
- ✅ Survives scrutiny in code reviews
- ⚠️ "Best practices" change frequently
- ⚠️ Can lead to analysis paralysis

---

### LEAF 1.7: Solutions Landscape (10 min)

**Purpose:** Map options before choosing  
**Output:** Solution comparison table  
**Cost:** 0  
**Friction:** Low

**Template:**
```markdown
## Common Solutions Landscape

### Solution: [Name]
**Prevalence:** [Ubiquitous / Common / Niche]
**Type:** [Idiomatic / Workaround / Anti-pattern]

**Pros:**
- [Benefit 1]
- [Benefit 2]

**Cons:**
- [Cost 1 — often overlooked]
- [Cost 2 — often overlooked]

**Real-World Pain Points:**
- [What actually breaks?]

**Recommendation:** [When to use, when to avoid]
```

**Reality Check:**
- ✅ Prevents early commitment to wrong solution
- ✅ Shows you've done your homework
- ⚠️ Can be overkill for obvious choices

---

### LEAF 1.8: Verification & Falsification (10 min)

**Purpose:** Ensure no claim survives without scrutiny  
**Output:** Verification log  
**Cost:** 0  
**Friction:** Medium (requires intellectual honesty)

**The Falsification Questions:**
1. What would prove this research wrong?
2. What are the strongest critiques?
3. When did these recommendations change last?
4. What version numbers does this apply to?

**Template:**
```markdown
## Verification & Falsification Log

### Claims Verified
| Claim | Evidence | Method |
|-------|----------|--------|
| [Claim 1] | [Source] | [Doc/Code/Test] |

### Falsification Attempts
| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| [Claim 1] | [Critique] | [Survived/Modified/Abandoned] |

### Knowledge Decay Assessment
| Section | Risk | Review Date |
|---------|------|-------------|
| [Section] | [High/Med/Low] | [When to re-verify] |
```

**Reality Check:**
- ✅ Builds research credibility
- ✅ Prevents outdated knowledge
- ⚠️ Requires admitting you might be wrong
- ⚠️ Can be uncomfortable

---

### LEAF 1.9: Synthesis (5 min)

**Purpose:** Convert knowledge to action  
**Output:** Decision table + immediate actions  
**Cost:** 0  
**Friction:** Low

**Template:**
```markdown
## Synthesis: Actionable Takeaways

### For Our Project
| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| [Use X] | [Why] | [Where] |
| [Avoid Y] | [Why] | [What instead] |

### Immediate Actions
1. [Specific task]
2. [Specific task]

### Open Questions
- [What still needs investigation]
```

**Reality Check:**
- ✅ Prevents "great research, no action"
- ✅ Creates clear next steps
- ✅ Survives handoff to other team members

---

## Now the Audit Leaves

---

### LEAF 2.1: Design System Summary (5 min)

**Purpose:** Document what exists before judging it  
**Output:** Component inventory  
**Cost:** 0  
**Friction:** Low

**Template:**
```markdown
## Design System Summary

### Components Inventoried
| Component | Location | Status |
|-----------|----------|--------|
| [Name] | [Path] | [Good/Needs Work/Broken] |

### Patterns Observed
- [Pattern 1]
- [Pattern 2]

### Inconsistencies Found
- [Inconsistency 1]
```

**Reality Check:**
- ✅ Prevents judging what you haven't seen
- ✅ Creates baseline for comparison
- ⚠️ Can be tedious for large codebases

---

### LEAF 2.2: Best Practices Research (10 min)

**Purpose:** Know the standard before measuring against it  
**Output:** Research-verified best practices  
**Cost:** 0  
**Friction:** Medium

**Template:**
```markdown
## Research-Verified Best Practices

### Practice: [Name]
**Standard Source:** [e.g., "Material Design 3", "Apple HIG"]
**Our Implementation:** [Match / Partial / Missing]
**Gap Severity:** [Critical / High / Medium / Low]
```

**Reality Check:**
- ✅ Prevents arbitrary judgments
- ✅ Grounds critique in authority
- ⚠️ "Best practices" can conflict

---

### LEAF 2.3: Component-by-Component Audit (20 min)

**Purpose:** Systematic evaluation of each component  
**Output:** Rated component list  
**Cost:** 0  
**Friction:** Medium (requires attention to detail)

**Template:**
```markdown
## Component Audit: [Component Name]

**Location:** [File path]

### Structural Layer (HTML/Semantics)
| Criterion | Status | Notes |
|-----------|--------|-------|
| Semantic HTML | ✅/⚠️/❌ | [Notes] |
| Accessibility | ✅/⚠️/❌ | [Notes] |
| SEO | ✅/⚠️/❌ | [Notes] |

### Layout Layer (CSS/Positioning)
| Criterion | Status | Notes |
|-----------|--------|-------|
| Responsive | ✅/⚠️/❌ | [Notes] |
| Spacing | ✅/⚠️/❌ | [Notes] |
| Alignment | ✅/⚠️/❌ | [Notes] |

### Surface Layer (Visual Design)
| Criterion | Status | Notes |
|-----------|--------|-------|
| Typography | ✅/⚠️/❌ | [Notes] |
| Color | ✅/⚠️/❌ | [Notes] |
| Brand | ✅/⚠️/❌ | [Notes] |

### Interaction Layer (Behavior)
| Criterion | Status | Notes |
|-----------|--------|-------|
| States | ✅/⚠️/❌ | [Notes] |
| Feedback | ✅/⚠️/❌ | [Notes] |
| Performance | ✅/⚠️/❌ | [Notes] |
```

**Reality Check:**
- ✅ Catches issues systematically
- ✅ Creates clear improvement roadmap
- ⚠️ Time-intensive for many components
- ⚠️ Requires design system knowledge

**Pragmatic Approach:** 
- Critical components: Full 4-layer audit
- Others: Structural + Layout only

---

### LEAF 2.4: Design Ratings (5 min)

**Purpose:** Quantify quality for prioritization  
**Output:** A-F grades per component  
**Cost:** 0  
**Friction:** Low

**Rating Scale:**
| Grade | Meaning | Action |
|-------|---------|--------|
| **A** | Meets/exceeds standards | Maintain |
| **B** | Minor issues | Fix when convenient |
| **C** | Noticeable problems | Schedule fix |
| **D** | Major issues | Fix before release |
| **F** | Broken/missing | Fix immediately |

**Template:**
```markdown
## Design Ratings Summary

| Component | Structural | Layout | Surface | Interaction | Overall |
|-----------|------------|--------|---------|-------------|---------|
| [Name] | A | B | C | B | B |
```

**Reality Check:**
- ✅ Enables prioritization
- ✅ Shows stakeholders clear status
- ⚠️ Ratings can be subjective
- ⚠️ Grade inflation is real

---

### LEAF 2.5: Gap Analysis (10 min)

**Purpose:** Identify what's missing  
**Output:** Gap list with severity  
**Cost:** 0  
**Friction:** Medium

**Template:**
```markdown
## Gap Analysis

### Critical Gaps (Fix Before Release)
- [ ] [Gap 1] — [Why critical]

### High Priority (Fix This Sprint)
- [ ] [Gap 2] — [Why high]

### Medium Priority (Fix Next Sprint)
- [ ] [Gap 3] — [Why medium]

### Low Priority (Fix When Convenient)
- [ ] [Gap 4] — [Why low]
```

**Reality Check:**
- ✅ Prevents "I thought we already did that"
- ✅ Creates clear backlog
- ⚠️ Everything can't be critical

---

### LEAF 2.6: Change Specifications (10 min)

**Purpose:** Define exactly how to fix each gap  
**Output:** Detailed fix instructions  
**Cost:** 0  
**Friction:** Medium (requires solution design)

**Template:**
```markdown
## Change Specification: [Gap Name]

**Priority:** [Critical/High/Medium/Low]
**Component:** [Which component]

### Current State
[What's wrong — screenshot/code snippet]

### Target State
[What it should be]

### Implementation Steps
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Verification
- [ ] Criterion 1
- [ ] Criterion 2
```

**Reality Check:**
- ✅ Makes fixes actionable
- ✅ Enables handoff to other developers
- ⚠️ Can be overkill for simple fixes

---

### LEAF 2.7: Verification Checklist (5 min)

**Purpose:** Ensure nothing was missed  
**Output:** Pre-sprint checklist  
**Cost:** 0  
**Friction:** Low

**Template:**
```markdown
## Verification Checklist

Before starting work:
- [ ] All components inventoried
- [ ] Best practices researched
- [ ] Each component rated
- [ ] All gaps identified
- [ ] Changes specified
- [ ] Priorities assigned

After completing work:
- [ ] All critical gaps fixed
- [ ] Ratings improved
- [ ] Verification tests pass
- [ ] No regressions introduced
```

**Reality Check:**
- ✅ Catches forgotten tasks
- ✅ Creates accountability
- ⚠️ Can become checkbox theater

---

## Level 3: The Integration (How to Actually Use This)

### The Learning Path (Progressive Complexity)

```
WEEK 1: Master the Highway
├── Understand when to use /research vs /audit
├── Know the 8 research phases
└── Know the 7 audit phases

WEEK 2: Master the Chunks
├── Practice Scope Contracts
├── Practice Source Tables
└── Practice Component Audits

WEEK 3: Master the Leaves
├── Use all templates in real work
├── Time yourself (should get faster)
└── Build muscle memory

WEEK 4: Integration
├── Do a complete /research workflow
├── Do a complete /audit workflow
└── Combine them for pre-sprint planning
```

### The Combined Workflow (Pre-Sprint Planning)

```
PHASE 1: RESEARCH (30-60 min)
├── Scope Contract
├── Source Triangulation
├── First Principles
└── Synthesis: "What should we build?"
         ↓
PHASE 2: AUDIT (15-30 min)
├── Design System Summary
├── Component Audit
├── Gap Analysis
└── Synthesis: "What's ready vs broken?"
         ↓
OUTPUT: Sprint Spec with:
├── Clear scope boundaries
├── Known best practices
├── Gap remediation plan
└── Verification criteria
```

---

## The Pragmatism Filter (Reality Check Every Component)

### Filter Questions (Ask for Every Leaf)

| Question | If Yes | If No |
|----------|--------|-------|
| **Does this cost money?** | → Remove or find free alternative | Keep |
| **Does this require setup?** | → Is setup < 5 min? If not, simplify | Keep |
| **Does this add friction?** | → Is friction < cognitive load of not doing it? | Keep |
| **Can I do this right now?** | → Keep | → What's blocking? Remove or defer |
| **Will I actually do this?** | → Keep | → Simplify until you will |
| **Does this require tools I don't have?** | → Find 0-cost alternative | Keep |
| **Is this trustable?** | → Keep with verification step | → Add verification or remove |

### Components That Passed the Filter

✅ **Keep (0-Cost, Low-Friction, Trustable):**
- Scope Contract (5 min, template, prevents waste)
- Source Hierarchy (mental model, guides search)
- Source Table (copy-paste template, builds credibility)
- First Principles (thinking exercise, survives churn)
- Code Verification (3-check system, catches errors)
- Best Practice Synthesis (2-source rule, prevents fads)
- Component Audit (4-layer template, systematic)
- Design Ratings (A-F scale, quick prioritization)
- Gap Analysis (severity labels, clear backlog)
- Verification Checklist (prevents forgetting)

⚠️ **Modify (Add Pragmatic Constraints):**
- Full Code Verification → Only for critical paths
- Complete Source Hierarchy → 1 + 4 for urgent tasks
- 4-Layer Component Audit → 2-layer for non-critical

❌ **Remove (Too Much Friction):**
- Elaborate documentation systems
- Complex tooling requirements
- Multi-person review gates (for solo work)
- Formal approval processes

---

## The Navigation System (How to Find What You Need)

### By Task Type

| I Need To... | Go To... |
|--------------|----------|
| "Research a new technology" | LEAF 1.1 → 1.2 → 1.4 → 1.8 → 1.9 |
| "Choose between solutions" | LEAF 1.7 → 1.9 |
| "Verify a claim" | LEAF 1.5 → 1.8 |
| "Audit my codebase" | LEAF 2.1 → 2.3 → 2.4 → 2.5 → 2.7 |
| "Plan a sprint" | LEVEL 3: Combined Workflow |
| "Just started, what do I do?" | LEVEL 0: The Highway |

### By Time Available

| Time | Do This |
|------|---------|
| 5 min | Scope Contract (LEAF 1.1) or Design Ratings (LEAF 2.4) |
| 15 min | Source Triangulation (LEAF 1.2) or Component Audit (LEAF 2.3) |
| 30 min | Full /research or /audit (single phase) |
| 60 min | Complete /research workflow |
| 90 min | Combined pre-sprint workflow |

### By Skill Level

| Level | Focus On... |
|-------|-------------|
| Beginner | LEVEL 0 → LEVEL 1 (understand the chunks) |
| Intermediate | LEVEL 2 (practice individual leaves) |
| Advanced | LEVEL 3 (integration & customization) |

---

## The Trust System (Why Believe This?)

### Verification of This Learning System

| Claim | Evidence | Method |
|-------|----------|--------|
| Templates work | Based on actual workflow files | Source inspection |
| 0-cost | No tools required | Component analysis |
| Low-friction | All leaves ≤ 20 min | Time estimation |
| Pragmatic | Reality check section | Self-critique |

### Falsification Attempts

| Concern | Counter | Verdict |
|---------|---------|---------|
| "Too complex" | Can start with just LEVEL 0 | Survived — progressive disclosure |
| "Too time-consuming" | Leaves have time estimates, can skip | Survived — optional components |
| "Not applicable to my work" | Generic patterns, adapt as needed | Survived — framework-agnostic |
| "Just more bureaucracy" | Each component prevents real waste | Survived — pragmatic filter applied |

### Knowledge Decay

| Section | Decay Risk | Review |
|---------|------------|--------|
| Templates | Low | When workflow files change |
| Organization | Low | Stable structure |
| Pragmatism Filter | Medium | Quarterly |
| Tool recommendations | High | Monthly |

---

## Final Output: Your Implementation

### Immediate Actions (Today)

1. **Copy this file** to your `_contexts/` folder
2. **Bookmark the LEAF sections** you use most
3. **Try ONE leaf** on your next task (recommend: LEAF 1.1 or 2.4)
4. **Time yourself** — should match the estimates

### This Week

1. **Practice 3 leaves** from /research workflow
2. **Practice 3 leaves** from /audit workflow
3. **Combine them** for one pre-sprint planning session

### This Month

1. **Master all leaves** at your skill level
2. **Customize templates** for your specific work
3. **Build muscle memory** — should feel automatic

---

## Summary: The Whole System in One View

```
LEVEL 0: THE HIGHWAY
├── /research = "What should I know?" (8 phases)
├── /audit = "What's wrong here?" (7 phases)
└── Meta-skills: Verification, Falsification, Scoping, Synthesis

LEVEL 1: THE CHUNKS
├── Research: 8 phases (scope → sources → principles → code → practices → solutions → verify → synthesize)
├── Audit: 7 phases (design system → best practices → component audit → ratings → gaps → changes → verify)
└── Meta: Verification, Falsification, Scoping, Synthesis

LEVEL 2: THE LEAVES
├── 9 Research Leaves (templates, checklists, tables)
├── 7 Audit Leaves (templates, ratings, specifications)
└── All: 0-cost, low-friction, implementable today

LEVEL 3: THE INTEGRATION
├── Learning path (4 weeks)
├── Combined workflow (research + audit)
└── Navigation by task, time, or skill

THE FILTER
├── 7 pragmatism questions
├── Pass/Modify/Remove classification
└── Only trustworthy, doable components remain

THE NAVIGATION
├── By task type (what do I need?)
├── By time available (how long do I have?)
└── By skill level (where should I start?)
```

---

**Learning System Status:** Complete  
**Cost:** 0  
**Friction:** Low (progressive disclosure)  
**Trust:** Verified through self-critique  
**Implementability:** Immediate

**Your Next Step:** Pick one leaf. Use it today. Build from there.
