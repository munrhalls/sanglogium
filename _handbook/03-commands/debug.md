# Command Reference: /Debug

---

## Purpose

Root-cause analysis and minimal-fix application using Component Archaeology Principle.

**Agent Role:** Diagnostic Engineer + Surgical Fix Specialist

---

## Input (Human Required)

### Explicit Rough Scope
```
[Bug description: observed behavior vs expected behavior]
```

### Explicit Rough DoDs
```
[Definition of Done for bug fix: what confirms bug is resolved?]
```

---

## Phase 1: Plan and Contain (MANDATORY)

### Component Archaeology Analysis

#### 1. Problem Analysis
Describe what the problem is in precise technical terms.

**Questions to answer:**
- What is the observed behavior?
- What is the expected behavior?
- When does it occur? (reproduction steps)
- Where does it occur? (file, component, line)

#### 2. Relevant Components
List all components potentially involved in the bug.

**Format:**
```
- [Component A]: [role in bug]
- [Component B]: [role in bug]
- [Data flow]: [how data moves between them]
```

#### 3. Individual Component Analysis
For each relevant component:
- Current state
- Props being passed
- Logic that executes
- Potential failure points

#### 4. Component Chain Analysis
Understand how components interact as connected chain:
```
[Start] → [Component A] → [Component B] → [End]
         [data X]       [transform Y]
```

#### 5. Root Cause Hypothesis
State the most likely root cause:
- Location (file:line)
- Mechanism (race condition, null reference, logic error)
- Confidence level (high/medium/low)

### Containment Plan

#### Explicit Refined Scope
```
[Minimal technical change to fix root cause]
```

**Rule:** Prefer upstream fixes over downstream workarounds.

#### Explicit Refined DoDs
```
DoD 1.1 — [Fix action]
- [ ] [Specific change]
Verification: [test that proves fix]
```

#### Read-Only Context Paths
Files for context only (forbidden to modify).

#### Allowed Write Scope Paths
**CRITICAL:** Minimal files only. Prefer single-file changes.

#### Verification Command
Exact command to prove bug is fixed.

---

## Phase 2: Execution Rules

### 2.1 Sequential Execution
Execute DoDs in exact order.

### 2.2 Minimal Fix Principle
```
✅ Single-line changes when sufficient
✅ Fix root cause, not symptoms
✅ Add regression test if not caught by existing tests
```

### 2.3 Upstream First
```
❌ Workaround in consuming component
✅ Fix at data source
```

### 2.4 Styling & CSS
```
❌ Modify global CSS (unless bug IS in global styles)
✅ Use scoped Tailwind classes
```

### 2.5 Regression Test
If bug wasn't caught by existing tests:
- Add test that reproduces bug
- Verify test fails before fix
- Verify test passes after fix
- Keep test minimal

---

## Phase 3: Verification & Output

### 3.1 Execute Verification Command
Run exact command from Phase 1.

### 3.2 Manual Verification
Test the exact user flow that triggered the bug:
```
Reproduction steps:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Expected: [behavior]
Actual: [verify this matches expected]
```

### 3.3 Visual Verification Checkpoint
**PAUSE** for human confirmation:
```
[BUG FIX VERIFICATION COMPLETE]

Root cause: [description]
Fix applied: [description]
Verification: [passed]

Please confirm bug is resolved in UI/DOM.

Type "confirmed" to proceed to commit.
```

### 3.4 Commit Generation
Generate commit using B-category (Critical bug fix):
```
Difficulty: <1-13> - B, Critical bug fix ([scope]): [action] — → fixes CRITICAL bug blocking [DoD]
```

---

## Component Archaeology Deep Dive

### The 6 Steps (Mandatory)

1. **Analyze what the problem is**
   - Symptoms vs Root cause
   - User-visible vs System-level
   - Write precise description

2. **Determine relevant components**
   - Map the error boundary
   - Identify data dependencies
   - List all touched files

3. **Individual component analysis**
   ```
   Component: [Name]
   Props: [list]
   State: [description]
   Logic: [key functions]
   Failure points: [potential issues]
   ```

4. **Component chain analysis**
   ```
   Data flow diagram:

   [Source] --(data)--> [Transform A] --(data)--> [Transform B] --(data)--> [UI]
            [validation]         [mapping]          [render]
   ```

5. **Investigate before proposing**
   - Add console.log at key points
   - Check actual vs expected values
   - Verify assumptions with code reading
   - **DO NOT FIX YET**

6. **Solve as asked**
   - Implement ONLY the fix requested
   - No bonus improvements
   - No "while I'm here" changes

---

## Debug Patterns

### Null/Undefined Error
```
Analysis:
- Where is null coming from?
- What should it be?
- Which component first receives null?

Fix:
- Upstream: Ensure data is always provided
- Or: Add null check at earliest consumption point
```

### Race Condition
```
Analysis:
- What depends on what?
- What loads asynchronously?
- Where is the ordering assumption?

Fix:
- Add loading states
- Reorder operations
- Add synchronization point
```

### Type Mismatch
```
Analysis:
- Expected type: [X]
- Actual type: [Y]
- Where did transformation occur?

Fix:
- Update type definition
- Fix transform logic
- Add runtime validation
```

### Styling Regression
```
Analysis:
- What changed visually?
- Which CSS affects this element?
- Recent changes to styles?

Fix:
- Scoped fix, not global
- Check Tailwind class order
- Verify no arbitrary values
```

---

## Error Handling

### Root Cause Unclear
```
INVESTIGATION STALLED: Cannot determine root cause.

Tried:
- [Analysis step 1]
- [Analysis step 2]

Blockers:
- [What is unknown]

Options:
A) Add logging and reproduce
B) Escalate to human with current findings
C) Expand investigation scope

Please advise.
```

### Fix Would Require Large Scope
```
ROOT CAUSE IDENTIFIED: [description]

However, proper fix requires:
- Modifying [many files]
- Estimated scope: [hours]

Options:
A) Apply minimal workaround now, schedule proper fix
B) Expand scope to full fix
C) Accept current limitation, document for later

Please advise.
```

---

## Quick Reference Card

```
/debug [bug description] [expected behavior]

Phase 1: Component Archaeology (ANALYZE ONLY)
  1. Problem analysis
  2. Relevant components
  3. Individual analysis
  4. Chain analysis
  5. Root cause hypothesis
  6. Containment plan

Phase 2: Minimal Fix (IMPLEMENT)
  - Fix root cause
  - Add regression test
  - Verify no regressions

Phase 3: Verification (CONFIRM)
  - Run verification command
  - Manual reproduction test
  - Human visual confirmation
```

---

**Related:** [implement.md](implement.md) | [test.md](test.md)
