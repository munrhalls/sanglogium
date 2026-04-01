---
description: Sprint planning with systematic scope contracts and sequenced DoDs — delegates execution to /implement, /build, /test
---

# /Sprint Command Protocol

**Role:** Sprint planning and orchestration. You design WHAT to build, WHEN to verify, and WHO executes. You do NOT execute — you delegate to `/implement`, `/build`, and `/test`.

**Output:** Comprehensive `.todo` sprint file in `_project/sprints/` with:
- Scope contracts (max 10)
- Sequenced DoDs per contract
- Delegation commands for sub-workflows
- Regression containment plan

**Does NOT:**
- Execute code changes (delegate to `/implement`)
- Run tests (delegate to `/test`)
- Build components (delegate to `/build`)

---

## PHASE 0: Pre-Work Lessons Retrieval (MANDATORY)

Before ANY planning, query `_project/lessons/INDEX.md` for relevant keywords:

1. **Extract keywords** from target state:
   - Technology stack (e.g., "sanity", "nextjs", "groq")
   - Component patterns (e.g., "server-components", "data-fetching")
   - Domain concepts (e.g., "vfs", "catalogue", "filters")

2. **Query INDEX.md** for matching keywords

3. **Load lessons by severity:**
   - Critical: MUST read before proceeding
   - High: MUST read before proceeding
   - Medium/Low: Read if time permits

4. **Apply prevention rules** as constraints for sprint design

---

## PHASE 1: Research and Audit

### Step 1: Read Context
- `tailwind.config.ts` — design system tokens
- `@/_project/core-building-pattern.md` — Pass/Layer sequencing
- Current implementation files (read-only)
- Audit reports (if available)

### Step 2: End-State Delineation
Create ASCII spatial maps:
```
Desktop (1280px):
[NAV HEADER — full width]
[PAGE CONTENT — max-w-content, mx-auto, px-8]
  [AREA A — width, behavior]
  [AREA B — width, behavior]

Mobile (375px):
[SAME AREAS — stacked/altered behavior]
```

### Step 3: Gap Analysis
| ID | Component | Current | Target | Severity |
|----|-----------|---------|--------|----------|
| G-01 | [Name] | [Current] | [Target] | High |

---

## PHASE 2: Scope Contract Generation

### Scope Contract Template

```markdown
## Scope Contract N: [Component] — [Gap Coverage]

### Target State
[What done looks like]

### DoD (Sequenced)
- [ ] Pass 1: Skeleton (semantic HTML, debug borders)
- [ ] Pass 2: Data (real data, no styling)
- [ ] Pass 3 — Layer 2: Desktop layout (1280px)
- [ ] Pass 3 — Layer 3: Desktop surface (1280px)
- [ ] Pass 3 — Layer 4: Desktop interaction (1280px)
- [ ] Pass 3 — Layer 2: Mobile layout (375px)
- [ ] Pass 3 — Layer 3: Mobile surface (375px)
- [ ] Pass 3 — Layer 4: Mobile interaction (375px)

### Delegation
**Execution:** `/implement [scope from this contract]`
**Build:** `/build [COMPONENT] [PASS] [LAYER] [BREAKPOINT]` per DoD
**Verify:** `/test` after each Pass 3 Layer completion
```

### Sequencing Rules
- **Pass 1:** All components skeleton (no styling, no logic)
- **Pass 2:** All components data (real data flows)
- **Pass 3:** One component at a time, Layer 1→4, desktop then mobile

---

## PHASE 3: Regression Containment

### Identify at Risk
| File | Risk | Mitigation |
|------|------|------------|
| `[file]` | [description] | [test/hook] |

### Pre-Sprint Baseline
**Action:** Invoke `/test` for baseline capture
- Scope: Current state before sprint
- DoDs: Existing functionality
- Output: BASELINE CAPTURED

---

## PHASE 4: Output Sprint File

### File Structure
```
_project/sprints/
└── [SPRINT_NAME].todo
```

### Content Sections
1. **Sprint Metadata** — Date, target state, scope lock rules
2. **Scope Contracts** — Numbered SC1, SC2... with DoDs
3. **RWD Strategy** — Breakpoint behavior per component
4. **Files at Risk** — Regression mitigation
5. **Delegation Commands** — /implement, /build, /test per contract
6. **Evidence Log** — Placeholder for /test results (filled during execution)

### Scope Lock Rules (Mandatory)
- **NO** globals.css changes
- **NO** homepage changes (unless in scope)
- **NO** data structure changes
- **NO** improvements outside scope contracts

---

## PHASE 5: Execution Delegation (During Sprint)

### Per Scope Contract Execution

```
FOR EACH Scope Contract:
  1. User: /implement "[scope contract description]"
     → /implement executes with /test per DoD

  2. /implement invokes /build for Pass/Layer execution

  3. /implement invokes /test after each DoD completion
     → Evidence dashboard generated
     → Blocking: Must PASS before next DoD

  4. Scope Contract marked complete when all DoDs pass /test
```

### Final Verification
**Action:** Invoke `/test` for full sprint
- Scope: All scope contracts
- DoDs: All sprint DoDs
- Output: FINAL EVIDENCE DASHBOARD

**Sprint Lock Criteria:**
- All specification tests pass (100%)
- All critical regressions contained
- Build gate passed

---

## PHASE 6: Post-Sprint /learn (MANDATORY)

**Trigger:** After sprint lock

**Action:** Execute `/learn` protocol
- Extract lessons from sprint experience
- Codify to `_project/lessons/`
- Update INDEX.md
- Update .windsurfrules if universal constraint discovered

---

## Constraint Rules

- **NO** prose descriptions without ASCII spatial maps
- **NO** gaps without G-XX IDs
- **NO** RWD without breakpoint values (1280px, 375px)
- **NO** DoD without corresponding /test delegation
- **YES** max 10 scope contracts per sprint
- **YES** /implement delegation per scope contract
- **YES** /test invocation after each DoD
- **YES** /learn execution post-sprint

---

## Integration Map

| /Sprint Output | Delegated To | When |
|----------------|--------------|------|
| Scope Contract N | /implement | Execution phase |
| DoD: Pass 1 Skeleton | /implement | Per DoD |
| DoD: Pass 2 Data | /implement | Per DoD |
| DoD: Pass 3 Layer X | /build + /test | Per Layer |
| Baseline capture | /test | Sprint start |
| Final verification | /test | Sprint end |
| Learnings capture | /learn | Sprint end |

---

## Verification Commands (For Sprint File)

```bash
# Validate sprint structure
npm run build

# Verify no regressions (baseline vs current)
npx playwright test --grep "regression"
```
```