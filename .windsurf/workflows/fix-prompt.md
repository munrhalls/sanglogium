---
description: Generate professional system-first research-first prompts for fixing issues in the codebase
---

# /fix-prompt [PROBLEM DESCRIPTION]

**Input:** Human describes a problem (e.g., "delete button causes page refresh", "loading state shows indefinitely", "error message unclear")
**Output:** Professional task prompt ready for execution, following system-first research-first methodology

---

## Philosophy

> **Fixes without understanding are technical debt.**

This workflow ensures every fix task includes:
- ✅ **Root cause diagnosis** before solution design
- ✅ **System context understanding** before code changes
- ✅ **Best practices research** before implementation
- ✅ **Verification criteria** before completion
- ✅ **Professional testing** (only if explicitly requested by human)

---

## Execution Protocol

### Phase 0: Test Requirement Detection (30 seconds)
**Goal:** Determine if testing is explicitly requested.

**Detection:** Check human prompt for explicit test instructions:
- Keywords: "test", "tests", "testing", "test coverage", "add tests", "with tests"
- If detected: Set `INCLUDE_TESTS = true`
- If not detected: Set `INCLUDE_TESTS = false`

**Output:**
```markdown
## Test Requirement
- **Include Tests:** [true/false]
```

---

### Phase 1: Problem Clarification (2 minutes)
**Goal:** Ensure the problem is clearly defined before proceeding.

**Questions to answer:**
1. What is the **observable behavior** (what user sees)?
2. Where does this occur (specific component/page/flow)?
3. Why is this unacceptable (UX impact, functional failure, security risk)?
4. Are there **reproduction steps** (if known)?

**Output:**
```markdown
## Problem Statement
- **Observable Behavior:** [What happens]
- **Location:** [Component/file path]
- **Impact:** [Why this matters]
- **Reproduction:** [Steps to trigger, if known]
```

---

### Phase 2: System Context Investigation (5 minutes)
**Goal:** Understand the existing system before proposing changes.

**Investigation areas:**
1. **Component architecture** — What components are involved? How do they interact?
2. **State management** — What state exists? How does it flow?
3. **Existing patterns** — How are similar features implemented elsewhere?
4. **Dependencies** — What external services/libraries are involved?

**Output:**
```markdown
## System Context
- **Affected Components:** [List components]
- **State Management:** [Zustand/Context/local state]
- **Related Patterns:** [Similar implementations to reference]
- **Dependencies:** [External systems involved]
```

---

### Phase 3: Root Cause Hypothesis (3 minutes)
**Goal:** Formulate initial hypotheses about why the problem occurs.

**Hypothesis generation:**
1. What is the **most likely cause** based on symptoms?
2. What **alternative causes** should be considered?
3. What **evidence** would confirm or refute each hypothesis?

**Output:**
```markdown
## Root Cause Hypotheses
- **Hypothesis 1:** [Description] — Evidence needed: [What to check]
- **Hypothesis 2:** [Description] — Evidence needed: [What to check]
- **Hypothesis 3:** [Description] — Evidence needed: [What to check]
```

---

### Phase 4: Best Practices Research (10 minutes)
**Goal:** Research professional approaches before implementing.

**Research areas:**
1. **Framework conventions** — What does React/Next.js/TypeScript recommend?
2. **Accessibility standards** — WCAG requirements for this interaction?
3. **Performance implications** — Any performance considerations?
4. **Security concerns** — Any security implications?
5. **Common patterns** — How do other projects solve this?

**Output:**
```markdown
## Best Practices Research
- **Framework Conventions:** [What docs say]
- **Accessibility:** [WCAG requirements]
- **Performance:** [Considerations]
- **Security:** [Implications]
- **Common Patterns:** [Industry approaches]
```

---

### Phase 5: Project Convention Alignment (3 minutes)
**Goal:** Ensure the fix aligns with project-specific standards.

**Convention checks:**
1. **Code style** — ESLint/Prettier rules, existing patterns
2. **Architecture** — Does this fit the existing architecture?
3. **Documentation** — What docs need updating?
4. **[CONDITIONAL] Test conventions** — *Only if `INCLUDE_TESTS = true`*: Review `tests/AGENTS.md`, `TestsContractConvention.md`, `TestsNamingConvention.md`

**Output:**
```markdown
## Project Convention Alignment
- **Code Style:** [Existing patterns to follow]
- **Architecture Fit:** [How this integrates]
- **Documentation Updates:** [What docs need changes]
- **[CONDITIONAL] Test Requirements:** [Black-box, AAA, "when" context, etc.] — *Only if `INCLUDE_TESTS = true`*
```

---

### Phase 6: Solution Design (5 minutes)
**Goal:** Design the professional fix based on research.

**Solution components:**
1. **Fix approach** — What exactly will change?
2. **Verification plan** — How do we confirm it works?
3. **Rollback plan** — What if it doesn't work?
4. **[CONDITIONAL] Test strategy** — *Only if `INCLUDE_TESTS = true`*: What tests verify the fix?

**Output:**
```markdown
## Solution Design
- **Approach:** [High-level fix description]
- **Code Changes:** [Specific files/lines to change]
- **Verification:** [Manual + automated verification]
- **Rollback:** [How to revert if needed]
- **[CONDITIONAL] Test Strategy:** [What tests to write/update] — *Only if `INCLUDE_TESTS = true`*
```

---

### Phase 7: Prompt Generation (2 minutes)
**Goal:** Assemble all research into a professional task prompt.

**Prompt structure:**
```markdown
# Task: [Brief Title]

## Problem Statement
[From Phase 1]

## System Context
[From Phase 2]

## Root Cause Analysis
[From Phase 3 — include diagnostic steps]

## Best Practices Research
[From Phase 4]

## Solution Requirements
[From Phase 5 + Phase 6]

## Deliverables
1. Root cause diagnosis with evidence
2. Solution implementation
3. Verification confirmation
4. [CONDITIONAL] Test coverage (black-box, following project conventions) — *Only if `INCLUDE_TESTS = true`*

## Constraints & Guidelines
- [CONDITIONAL] Follow project test conventions (black-box, AAA, "when" context) — *Only if `INCLUDE_TESTS = true`*
- [CONDITIONAL] No implementation detail testing — *Only if `INCLUDE_TESTS = true`*
- Maintain accessibility standards
- Ensure consistency with existing patterns

## Success Criteria
- [Criteria 1]
- [Criteria 2]
- [Criteria 3]
```

---

## Output Structure

Save the generated prompt to: `_project/tasks/[task-slug]_[date].md`

```markdown
# Task: [Title]

> **Generated:** [YYYY-MM-DD]
> **Problem:** [One-line summary]
> **Priority:** [High/Medium/Low]

[... all sections from Phases 1-7 ...]

## Execution Commands
```bash
# [CONDITIONAL] Run relevant tests — Only if `INCLUDE_TESTS = true`
npx vitest run [test-path]

# Type-check
npx tsc --noEmit

# Lint
npx eslint [file-path]
```
```

---

## Constraint Rules

- **NO** solution proposal without root cause diagnosis
- **NO** code changes without system context understanding
- **NO** implementation without best practices research
- **[CONDITIONAL] NO** fix without test coverage aligned with project conventions — *Only if `INCLUDE_TESTS = true`*
- **YES** verification criteria defined before implementation
- **YES** rollback plan considered
- **YES** accessibility and security implications reviewed

---

## Example Usage

**Input:** `/fix-prompt delete button in basket causes page refresh`

**Output:** Professional task prompt with:
- Problem statement (delete button refreshes page)
- System context (basket components, Zustand store, BasketItem/BasketControls)
- Root cause hypotheses (form submission, button type, event handler)
- Best practices (React button types, event.preventDefault, accessibility)
- Solution design (add type="button" or preventDefault)
- [CONDITIONAL] Test requirements (black-box test for delete without refresh) — *Only if human explicitly requested tests*
- Success criteria (delete works without page refresh, state updates correctly)

---

## Verification Commands

```bash
# Validate prompt completeness
npm run task:validate _project/tasks/[task-slug].md

# Check for missing sections
npm run task:audit _project/tasks/
```
