---
description: Human-first sprint planning - starts with UX flows, enforces continuous verification, prevents over-complication
---

# /Sprint Command Protocol

**Role:** Human-first sprint planning. You design from user experience, not code. You enforce simplicity, continuous verification, and explicit architecture contracts.

**Output:** Comprehensive `.todo` sprint file in `_project/sprints/` with:
- UX flows (starting point)
- End-state overview (one paragraph)
- Architecture contract (explicit rules)
- Tiny scope contracts (UX slice + arch slice + verification + tests)
- Continuous verification checkpoints
- Simplicity guardrails

**Core Rules (NEVER broken):**
- Start with UX flows - "user does X -> system shows Y -> user can do Z"
- Event -> State -> Side Effect -> Result Event flow
- Human verification after EACH scope contract
- Tests serve human confidence, not coverage
- **Cover and Move:** Each scope contract must verify ground is set for the next before proceeding
- **Simple Principle:** Keep everything simplest possible. Single-line fixes. Minimal abstractions. If >5 min to explain, too complex
- "Is this the simplest possible way?" guardrail

---

## PHASE 0: Pre-Work — Beads Issue + Lessons Retrieval (MANDATORY)

Before ANY planning:

1. **Read beads tracker** — Run `bd ready`, identify the feature's canonical issue
   - If issue exists: Read it completely (`bd show <id>`). Use existing framing.
   - If no issue exists: STOP. Create beads issue first via `@/add-beads-issue`.

2. **Query `_project/lessons/INDEX.md`** for relevant keywords:
   - Technology stack (e.g., "sanity", "nextjs", "groq")
   - Component patterns (e.g., "server-components", "data-fetching")
   - Domain concepts (e.g., "vfs", "catalogue", "filters")

3. **Load lessons by severity:**
   - Critical: MUST read before proceeding
   - High: MUST read before proceeding
   - Medium/Low: Read if time permits

4. **Apply prevention rules** as constraints for sprint design

**NO work outside beads issues.** The `.todo` sprint file is a planning aid, NOT a work tracker. All implementation progress goes into the beads issue.

---

## PHASE 1: UX Flows First (MANDATORY - STARTING POINT)

### Step 1: Define All User Interactions
List every user action that touches the feature:
```
1. [Current State]: user does X -> system shows Y -> user can do Z
2. [Current State]: user does A -> system shows B -> user can do C
...
```

### Step 2: End-State Overview
Write ONE paragraph describing target experience:
- What stays identical for the user
- What becomes simpler or faster
- No technical details

---

## PHASE 2: Architecture Contract (MANDATORY)

### Event-State-Server Flow
Define explicit contracts:
```
Event -> State Update FIRST -> Side Effects -> Result Event -> New State
```

### Three Readable Contracts
1. **Events + Payloads** - All event shapes
2. **Transition Table** - State to state mapping
3. **Context Shape** - Data carried by state machine

### Simplicity Guardrail
"If it can be done with fewer lines or no new abstraction, do it that way"

---

## PHASE 3: Tiny Scope Contracts (MAX 5)

### Scope Contract Template

```markdown
## Scope Contract N: [Feature] - [UX Impact]

### UX Slice (2-3 bullets max)
- User does X -> system shows Y -> user can do Z
- ...

### Architecture Slice
- How this plugs into state machine
- Event(s) it handles
- State(s) it affects

### Human Verification Checklist (<5 minutes)
- [ ] Check [specific observable behavior]
- [ ] Verify [specific UI state]
- [ ] Confirm [specific user action outcome]

### Minimal Tests (ONLY if needed for human confidence)
- Test [specific user behavior]
- Test [specific edge case]
```

### Scope Rules
- Each contract is self-contained
- No touching other contracts' code
- Verify immediately after implementation

---

## PHASE 4: Continuous Verification (MANDATORY)

### Per Scope Contract Workflow
1. Implement scope contract
2. Run human verification checklist IMMEDIATELY
3. Run minimal tests (if any)
4. Only then: move to next scope contract

### No Big Phases
- No "implement all then test"
- No separate test phases
- No waiting until end for verification

---

## PHASE 5: Final Human Check

### End-to-End Verification
After all scope contracts:
- Verify against original UX flows
- Confirm end-state overview achieved
- Only then is sprint complete

---

---

## PHASE 6: Sprint File Output

### File Structure
```
_project/sprints/
└── [SPRINT_NAME].todo
```

### Content Sections
1. **UX Flows** - All user interactions (starting point)
2. **End-State Overview** - One paragraph target description
3. **Architecture Contract** - Event-state-server rules
4. **Scope Contracts** - Tiny, self-contained (max 5)
5. **Verification Checkpoints** - Per scope contract
6. **Simplicity Guardrails** - "Is this the simplest possible way?"

### Scope Lock Rules (Mandatory)
- **NO** changes outside scope contracts
- **NO** adding complexity without necessity
- **NO** skipping human verification
- **NO** tests that don't serve human confidence

---

## PHASE 7: Execution Protocol

### Per Scope Contract
```
1. Implement scope contract
2. Run human verification checklist IMMEDIATELY
3. Run minimal tests (if any)
4. Confirm: "Is this the simplest possible way?"
5. Only then: move to next scope contract
```

### Delegation Commands
- **Implementation:** `/implement [scope contract description]`
- **Verification:** Human checklist + minimal tests
- **Final Check:** End-to-end verification against UX flows

---

## PHASE 8: Post-Sprint /learn (MANDATORY)

**Trigger:** After final human check

**Action:** Execute `/learn` protocol
- Extract lessons from sprint experience
- Did human-first approach prevent over-complication?
- Did continuous verification catch issues early?
- Were simplicity guardrails effective?

---

## Constraint Rules

- **NO** starting from code or architecture
- **NO** big phases or end-only verification
- **NO** unit/integration/e2e test splits
- **NO** tests that exceed human readability
- **YES** UX flows first always
- **YES** tiny scope contracts only
- **YES** human verification after each scope
- **YES** "Is this the simplest possible way?" check

---

## Integration Map

| Phase | Output | When |
|-------|--------|------|
| UX Flows | User interaction list | Start |
| Architecture | Event-state contracts | Before code |
| Scope Contract | Implementation | Per contract |
| Verification | Human checklist | After each scope |
| Final Check | End-to-end confirmation | End |
| Learnings | /learn execution | After final check |

---

## Fatal Flaws This Prevents

1. **Over-complication** - Simplicity guardrails
2. **No human verification** - Continuous checkpoints
3. **Vague architecture** - Explicit contracts
4. **Cargo cult testing** - Tests serve human confidence
5. **Big verification windows** - Verify after each scope
6. **Starting from code** - UX flows first
```