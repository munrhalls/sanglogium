---
description: Systematic research command targeting first principles, fundamentals, best practices with rigorous verification and falsification
---

# /research [TOPIC]

**Input:** Human defines research topic (e.g., "Next.js 15 Server Components data fetching patterns")
**Output:** `_project/research/[topic-slug].md` — verified, falsified, up-to-date research artifact

---

## Research Philosophy

> **Incorrect or faulty or partial-awareness or outdated or poor-relevance data is useless at best, dangerous and disastrous at worst.**

This command prioritizes **verification above all else**. Research is not complete until claims are:
- ✅ **Confirmed** against authoritative sources
- ✅ **Falsified** against counter-evidence
- ✅ **Timestamped** for relevance decay tracking
- ✅ **Scoped** to prevent partial-awareness traps

---

## Execution Protocol

### Phase 1: Scope Definition (5 minutes)
**Goal:** Define research boundaries to ensure holistic completeness without scope creep.

**Questions to answer:**
1. What is the **core problem** being researched?
2. What are the **first principles** underlying this domain?
3. What **code fundamentals** must be verified?
4. What **common solutions** exist and what are their tradeoffs?
5. What **best practices** are currently accepted?

**Output:** Research scope contract at top of file
```markdown
## Research Scope Contract
- **Topic:** [Clear single-sentence definition]
- **First Principles:** [2-3 foundational concepts]
- **Fundamentals:** [Core code patterns to verify]
- **Scope Boundary:** [Explicitly OUT of scope items]
- **Target Audience:** [Who will use this research?]
- **Decay Risk:** [High/Med/Low — how fast does this knowledge rot?]
```

---

### Phase 2: Multi-Source Triangulation (15-30 minutes)
**Goal:** Gather sources across the credibility spectrum.

**Source Hierarchy (search in this order):**
1. **Official Documentation** (canonical truth)
   - Next.js docs, React docs, TypeScript handbook
   - Sanity docs, Tailwind docs

2. **Source of Truth Code** (ground truth)
   - GitHub source repos (nextjs/next.js, facebook/react)
   - Framework test suites (show actual behavior)

3. **Authoritative Voices** (context and nuance)
   - Core team members (Dan Abramov, Sebastian Markbåge)
   - Maintainers (Addy Osmani, Kent C. Dodds)
   - Engineering blogs from companies running at scale (Vercel, Meta, Google)

4. **Community Consensus** (common patterns)
   - Reddit r/nextjs, r/webdev (real-world pain points)
   - Stack Overflow (what people actually struggle with)
   - GitHub discussions on popular repos

5. **Counter-Evidence** (falsification)
   - Critiques, "anti-pattern" posts, "don't use X" warnings
   - Deprecation notices, migration guides
   - Performance benchmarks showing downsides

**For each source, record:**
```markdown
| Source | URL | Type | Credibility | Date | Key Claim | Verification Status |
|--------|-----|------|-------------|------|-----------|---------------------|
| Next.js Docs | [link] | Official | Canonical | 2026-03 | "Server Components fetch data on server" | ✅ Verified |
```

---

### Phase 3: First Principles Extraction (10 minutes)
**Goal:** Strip away abstractions to fundamental truths.

**Questions to answer:**
1. What problem does this technology/pattern actually solve?
2. What constraints does it operate under?
3. What tradeoffs are inherent and non-negotiable?
4. What would break if we used it incorrectly?

**Output format:**
```markdown
## First Principles Analysis

### Core Problem Being Solved
[Single sentence — what fundamental friction does this address?]

### Underlying Constraints
1. [Constraint 1 — e.g., "HTTP is stateless"]
2. [Constraint 2 — e.g., "JavaScript is single-threaded"]
3. [Constraint 3 — e.g., "Network latency is unavoidable"]

### Inherent Tradeoffs
| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| Pattern A | [Benefit] | [Cost] | [Scenario] |
| Pattern B | [Benefit] | [Cost] | [Scenario] |

### Failure Modes
1. **Misapplication:** [Using X when Y is needed]
2. **Over-application:** [Using X everywhere]
3. **Under-application:** [Not using X when needed]
```

---

### Phase 4: Code Fundamentals Verification (10 minutes)
**Goal:** Verify how code actually behaves, not how docs claim it behaves.

**For each fundamental pattern:**
1. **Locate in codebase** — Does our project already use this?
2. **Verify with test** — Can we prove the behavior?
3. **Check against source** — What does the framework code actually do?

**Output format:**
```markdown
## Code Fundamentals

### Fundamental: [Pattern Name]
**Claim:** [What docs/books say]

**Verification:**
- [ ] Located in our codebase: `[file path]`
- [ ] Test created: `[test path]`
- [ ] Source inspected: `[github link to framework code]`

**Actual Behavior:**
[What actually happens when you run the code]

**Edge Cases:**
1. [Case 1 — what breaks it?]
2. [Case 2 — surprising behavior?]
```

---

### Phase 5: Best Practices Synthesis (10 minutes)
**Goal:** Identify practices that survive scrutiny across sources.

**Criteria for "Best Practice":**
- Must appear in 2+ authoritative sources
- Must have falsification attempts (what are the critiques?)
- Must be timestamped (when did this become "best"?)

**Output format:**
```markdown
## Best Practices (Verified)

### Practice: [Name]
**Consensus:** [High/Med/Low — how much agreement exists]

**Supporting Evidence:**
- [Source 1 — authoritative]
- [Source 2 — authoritative]

**Counter-Evidence (Falsification Attempts):**
- [Critique 1 — when does this fail?]

**Verdict:** ✅ Recommended / ⚠️ Context-Dependent / ❌ Avoid

**When to Use:** [Specific conditions]
**When to Skip:** [Specific conditions]
```

---

### Phase 6: Common Solutions Audit (10 minutes)
**Goal:** Map the landscape of typical approaches with tradeoffs.

**For each common solution:**
1. **Identify** — What do most developers do?
2. **Classify** — Is this idiomatic, workaround, or anti-pattern?
3. **Evaluate** — What are the hidden costs?

**Output format:**
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
- [From community sources — what actually breaks?]

**Recommendation:** [When to use, when to avoid]
```

---

### Phase 7: Verification & Falsification (10 minutes)
**Goal:** Ensure no claim survives without scrutiny.

**Verification Checklist:**
- [ ] Every source has retrieval date
- [ ] Every "best practice" has counter-evidence section
- [ ] Every code claim has verification path (test or source)
- [ ] First principles are stripped of implementation details
- [ ] Outdated sources are marked as [DEPRECATED]

**Falsification Questions:**
1. What would prove this research wrong?
2. What are the strongest critiques of these patterns?
3. When did these recommendations change last?
4. What version numbers does this apply to?

**Output:**
```markdown
## Verification & Falsification Log

### Claims Verified
| Claim | Evidence | Method |
|-------|----------|--------|
| [Claim 1] | [Source] | [Doc/Code/Test] |

### Falsification Attempts
| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| [Claim 1] | [Critique source] | [Survived/Modified/Abandoned] |

### Knowledge Decay Assessment
| Section | Risk | Review Date |
|---------|------|-------------|
| [Section] | [High/Med/Low] | [When to re-verify] |
```

---

### Phase 8: Synthesis & Actionable Takeaways (5 minutes)
**Goal:** Convert research into project-ready decisions.

**Output format:**
```markdown
## Synthesis: Actionable Takeaways

### For Our Project
| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| [Use X pattern] | [First principle + evidence] | [Where to apply] |
| [Avoid Y pattern] | [Counter-evidence] | [What to use instead] |

### Immediate Actions
1. [Specific task — e.g., "Refactor data fetching in /products to use X"]
2. [Specific task — e.g., "Add test for Y edge case"]

### Open Questions (Research Gaps)
1. [What couldn't be verified?]
2. [What needs deeper investigation?]
```

---

## Output Structure

Final research artifact saved to: `_project/research/[topic-slug]_[date].md`

```markdown
# Research: [Topic]

> **Retrieval Date:** [YYYY-MM-DD]
> **Researcher:** [AI/Human collaboration]
> **Decay Risk:** [High/Med/Low]
> **Next Review:** [Date]

## Executive Summary
[3-5 bullets covering: what this is, why it matters, what to do]

[... all sections from Phases 1-8 ...]

## Confidence Assessment
| Claim Type | Confidence | Basis |
|------------|------------|-------|
| First Principles | [High/Med/Low] | [Rationale] |
| Code Fundamentals | [High/Med/Low] | [Test/Source evidence] |
| Best Practices | [High/Med/Low] | [Consensus strength] |
| Common Solutions | [High/Med/Low] | [Community validation] |
```

---

## Constraint Rules

- **NO** claim without verification method
- **NO** best practice without counter-evidence section
- **NO** source older than [framework version] without [DEPRECATED] flag
- **NO** speculation presented as fact
- **YES** first principles stripped of all implementation detail
- **YES** explicit falsification attempts for every recommendation
- **YES** knowledge decay assessment with review dates

---

## Verification Commands

```bash
# Verify research artifact completeness
npm run research:verify _project/research/[topic-slug].md

# Check for outdated sources
npm run research:audit-dates _project/research/
```
