# Command Reference: /Implement

---

## Purpose

Deterministic feature implementation with zero regression guarantee.

**Agent Role:** SWE 1.5 (Software Engineer 1.5 level execution)

---

## Input (Human Required)

### Explicit Rough Scope
```
[Define the exact target state to be reached. What should exist after this work?]
```

### Explicit Rough DoDs
```
[Define rough Definitions of Done. How will we know this is complete?]
```

---

## Phase 1: Plan and Contain (MANDATORY)

**Agent MUST output this section BEFORE modifying any files.**

### 1.1 Explicit Refined Scope
Translate Rough Scope into strict, optimized technical target state.

**Rules:**
- Optimize the "how" but strictly adhere 100% to the "what"
- No scope expansion
- No future architecture considerations

### 1.2 Explicit Refined DoDs
Translate Rough DoDs into atomic, sequential, mechanical tasks.

**Format:**
```
DoD 1.1 — [Task Name]
- [ ] [Specific action]
- [ ] [Specific action]
Verification: [exact command]
```

### 1.3 Read-Only Context Paths
Map human scope to exact repository paths for context only.

**Format:**
```
- [file path] - [what to learn from it]
- [file path] - [what to learn from it]
```

**Rule:** Modifying these is FORBIDDEN.

### 1.4 Allowed Write Scope Paths
Map human scope to exact repository paths that MAY be modified.

**Format:**
```
- [file path] - [what to change]
- [file path] - [what to change]
```

**Rule:** If exact paths cannot be confidently resolved, HALT and request from user.

### 1.5 Verification Command
Exact PowerShell command to prove zero regressions.

**Examples:**
- `npm run build`
- `npm run lint`
- `npx jest tests/specific.test.ts`
- `npm run test:e2e`

---

## Phase 2: Execution Rules

### 2.1 Sequential Execution
1. Execute DoDs in **exact sequential order**
2. Lock each DoD before advancing
3. No parallel work on multiple DoDs

### 2.2 Scope Containment
- Modify ONLY files in Allowed Write Scope Paths
- Any file outside list is CRITICAL FAILURE
- If need expands, HALT and renegotiate scope

### 2.3 Styling & CSS Constraint
```
❌ DO NOT modify global CSS files
✅ DO use scoped Tailwind utility classes
✅ DO apply directly on target elements
```

### 2.4 Risk Minimization
- Prefer single-line changes when sufficient
- Avoid over-engineering
- Zero risk to unrelated components

---

## Phase 3: Verification & Output

### 3.1 Execute Verification Command
```powershell
[Verification command from Phase 1.5]
```

### 3.2 Failure Response
If command fails:
1. **Revert** the specific change
2. **Re-evaluate** the approach
3. **Fix** and re-run verification
4. Do NOT proceed until 100% pass

### 3.3 Visual Verification Checkpoint
**PAUSE** and prompt human:
```
[MECHANICAL VERIFICATION PASSED]

Verification command: [command]
Output: [success message]

Please verify UI/DOM state:
- [ ] Component renders correctly
- [ ] Styling matches expectations
- [ ] No visual regressions
- [ ] Interactive elements work

Type "approved" to proceed to commit, or describe issues found.
```

### 3.4 Commit Generation
Only after explicit human approval:

1. Read `COMMIT_TEMPLATE.txt`
2. Generate message using taxonomy
3. Present for copy-paste (do NOT auto-execute)

---

## Layer Sequencing (For UI Work)

When implementing frontend components, follow this sequence:

### Pass 1 — Skeleton Pass
- All components render
- No styling
- No data
- Build passes

### Pass 2 — Data Pass
- Real data flows
- No styling
- Type checking passes

### Pass 3 — Desktop Build (1280px)
Layer 1 — Structure: Semantic HTML/JSX, no classes
Layer 2 — Layout: Tailwind flex/grid/spacing only
Layer 3 — Surface: Colors, typography, brand tokens
Layer 4 — Interaction: Hover states, transitions

### Pass 4 — Mobile Build (375px)
Same 4 layers, mobile viewport

---

## Common Implement Patterns

### New Component
```
Phase 1:
1. Scope: Create [ComponentName] at [path]
2. DoDs: Skeleton → Data → Desktop → Mobile
3. Read-Only: Similar components, design system
4. Write: [path].tsx, [path].test.tsx
5. Verify: npm run build + visual check
```

### Feature Addition
```
Phase 1:
1. Scope: Add [feature] to [existing component]
2. DoDs: Implement → Test → Verify
3. Read-Only: Component source, tests, types
4. Write: [specific file]
5. Verify: [specific test command]
```

### Refactor
```
Phase 1:
1. Scope: Restructure [X] without changing behavior
2. DoDs: Analyze → Move → Update imports → Verify
3. Read-Only: All affected files
4. Write: [move targets only]
5. Verify: All tests pass + build passes
```

---

## Error Handling

### Scope Unclear
```
HALT: I cannot confidently resolve exact paths from Rough Scope.

Please provide:
- Exact file path for [component]
- Confirmation: should I create [file] or modify [existing]?
```

### Read-Only Violation Detected
```
CRITICAL: I need to modify [file] which is in Read-Only Context Paths.

Options:
A) Add to Allowed Write Scope Paths (confirm scope expansion)
B) Find workaround using only write-permitted files
C) HALT and reassess approach

Please advise.
```

### Verification Keeps Failing
```
VERIFICATION FAILURE: [command] has failed 3 attempts.

Attempts made:
1. [What was tried] → [Result]
2. [What was tried] → [Result]
3. [What was tried] → [Result]

Recommendations:
A) Widen scope to include [additional files]
B) Escalate to Debug Agent for root cause
C) Reduce scope to achievable subset

Please advise.
```

---

## Quick Reference Card

```
/implement [rough scope] [rough DoDs]

Phase 1: Plan and Contain (OUTPUT ONLY)
  ↓
Phase 2: Execute (MODIFY FILES)
  ↓
Phase 3: Verify (RUN COMMAND)
  ↓
Human Visual Verification (PAUSE)
  ↓
Generate Commit Message (PRESENT)
```

---

**Related:** [debug.md](debug.md) | [test.md](test.md) | [commit.md](commit.md)
