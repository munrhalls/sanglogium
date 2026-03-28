# Command Reference: /Sprint

---

## Purpose

Professional sprint planning with systematic scope contracts and sequenced DoDs.

**Agent Role:** Professional Sprint Manager + Systems Architect

---

## System Directive

**Role:** Professional, robust web developer and professional sprint manager.

**Task:** Prepare comprehensive, systematic `.todo` sprint file to reach provided target state.

---

## Core Responsibilities

1. Research and understand current codebase
2. Observe, orient, decide, act (OODA loop)
3. Create professionally informed sprint `.todo` file with:
   - Systematic, professional scope contracts
   - Verification per scope contract
   - Meticulously sequenced layers of DoDs per scope contract
   - Simple, robust, minimal testing required per scope contract

---

## Themes of Scope and Layer Sequencing

### For Frontend UI Work (Mandatory)

**Pass 1 — Skeleton Pass:**
- All components, no styling
- Build passes
- No errors

**Pass 2 — Data Pass:**
- All components, real data
- No styling
- Data flows correctly

**Pass 3 — Build Pass:**
- One component at a time
- Full scope per component

**Within Pass 3 — Four Layers in Order:**
```
Layer 1 — Structure:    Semantic HTML/JSX skeleton. No classes. No logic.
Layer 2 — Layout:       Tailwind flex/grid/spacing/sizing only.
                        No colors. No typography. No borders.
Layer 3 — Surface:      Colors, typography, brand tokens, imagery.
Layer 4 — Interaction:  Hover states, transitions, animations.
```

---

## Sprint Generation Protocol

### Phase 1: Current State Research

**MUST systematically research:**

1. **Existing Codebase Structure**
   - Where are similar features implemented?
   - What patterns are used?
   - What dependencies exist?

2. **Design System State**
   - Check `tailwind.config.ts`
   - Review `globals.css`
   - Verify available tokens

3. **Related Sprints**
   - Check `_project/*.todo` files
   - Identify completed DoDs
   - Note unfinished work

4. **Potential Regression Risks**
   - What files will be touched?
   - What could break?
   - What tests exist?

### Phase 2: Scope Contract Definition

**Create Scope Contracts with:**

1. **Scope Contract Header:**
```markdown
### Scope Contract [N]: [Name]
**Rationale:** [Why this scope matters]
```

2. **Scope Definition:**
```markdown
**Scope:**
- [ ] [Specific deliverable]
- [ ] [Specific deliverable]
```

3. **Files at Risk:**
```markdown
**Files at Risk:**
- `[path]` - [risk description]
- `[path]` - [risk description]
```

4. **Regression Test Requirements:**
```markdown
**Regression Tests Required:**
- [ ] [Test for risk area A]
- [ ] [Test for risk area B]
```

### Phase 3: DoD Sequencing

**Structure DoDs in Phases:**

```markdown
## 🏗️ Sequenced DoD Layers

### Phase 0: Pre-Flight Regression Tests (MUST RUN FIRST)
**Purpose:** Establish baseline

#### DoD 0.1 — [Test Name]
- [ ] [Specific test action]
- [ ] [Specific test action]
- **Verification:** [exact command]
- **Code Location:** `[file path]`

### Phase 1: Skeleton Layer
[Pass 1 DoDs]

### Phase 2: Data Pass Layer
[Pass 2 DoDs]

### Phase 3: Desktop Build Layer (1280px)
[Layer 1-4 DoDs for desktop]

### Phase 4: Mobile Build Layer (375px)
[Layer 1-4 DoDs for mobile]

### Phase 5: Surface & Interaction
[Visual polish DoDs]

### Phase 6: Final Regression
[Verification DoDs]
```

### Phase 4: Design System Compliance

**MUST enforce adherence to global design system:**

1. Check `tailwind.config.ts` for styling tokens
2. Verify no one-off implementations
3. Contain risks of disconnected local fixes
4. Document design system checks in sprint

**Sprint Must Include:**
```markdown
## 🎨 Design System Compliance

- [ ] All colors use design tokens only
- [ ] Typography uses type-* classes
- [ ] Spacing uses spacing scale
- [ ] No hardcoded values (verified via AST)
- [ ] No arbitrary Tailwind values
```

---

## Sprint File Structure

### Standard Sections

```markdown
# [SPRINT_NAME].todo
# [Brief description]
# Reference: [related documents]
# Created: [date]

---

## 🎯 Sprint Objective
**[Clear statement of what will be achieved]**

**Current State:** [Where we are]
**Target State:** [Where we're going]

---

## 🧪 Test-First Mandate
**This sprint MUST begin with tests...**

---

## 📋 Scope Contracts

[Scope Contract 1]
[Scope Contract 2]
...

---

## 🏗️ Sequenced DoD Layers

[Phase 0-6 as defined above]

---

## 📊 Test Matrix

| Test Category | Count | Location | Status |
|---------------|-------|----------|--------|
| [Category] | [N] | `[path]` | ⬜ |

---

## 🔍 Key Architecture Decisions

### [Decision Name]
```[code or explanation]
```
**Rationale:** [Why this approach]

---

## 📁 File Inventory

### Core Files
- `[path]` — [purpose]

### Test Files
- `[path]` — [purpose]

---

## ✅ Sprint Completion Checklist

- [ ] All Phase 0 regression tests pass
- [ ] All Phase 1-X DoDs complete
- [ ] Build succeeds
- [ ] Documentation updated

---

## 📅 Estimated Effort

| Phase | Difficulty | Est. Time |
|-------|-----------|-----------|
| [Phase] | [1-13] | [time] |
| **Total** | **[sum]** | **[sum]** |

---

## 🚀 Execution Order

1. [Step 1]
2. [Step 2]
...
```

---

## Critical Rules

### Rule 1: Regression Risk First
**Sprint must begin by:**
- Identifying all code areas at risk of regressions
- Inserting regression test DoDs BEFORE implementation DoDs
- Executing regression tests after sprint

### Rule 2: Forward Progress Only
**Forward progress happens ONLY if:**
- Regression risks are fully contained
- Scope is strictly enforced
- No improvements outside scope

### Rule 3: Design System First
**MUST enforce:**
- Adherence to global design system first
- No one-off implementations
- No disconnected local fixes

### Rule 4: Scope Sequencing
**MUST sequence:**
- Skeleton before data
- Data before styling
- Desktop before mobile
- Structure → Layout → Surface → Interaction

---

## Quality Gates

### Before Sprint Starts
- [ ] Target state is clear
- [ ] Scope contracts defined
- [ ] Regression tests identified
- [ ] DoDs sequenced correctly
- [ ] Design system checks included
- [ ] Effort estimated (Fibonacci)

### During Sprint
- [ ] Each phase locked before next
- [ ] Regression tests pass
- [ ] No scope expansion
- [ ] Design system compliance verified

### After Sprint
- [ ] All DoDs ticked
- [ ] Final regression tests pass
- [ ] Build succeeds
- [ ] Documentation complete

---

## Quick Reference Card

```
/sprint [target state] [rough scope]

Phase 1: Research (UNDERSTAND)
  - Current codebase
  - Design system
  - Related sprints
  - Regression risks

Phase 2: Define (CONTRACT)
  - Scope contracts
  - Files at risk
  - Test requirements

Phase 3: Sequence (PLAN)
  - Skeleton → Data → Desktop → Mobile
  - Structure → Layout → Surface → Interaction
  - Phase 0 regression tests first

Phase 4: Document (OUTPUT)
  - Professional .todo file
  - Test matrix
  - Effort estimation
  - Execution order
```

---

**Related:** [implement.md](implement.md) | [INDEX.md](../INDEX.md)
