---
description: Convert prototype to production - systematic rigor, tests, documentation, full verification
---

# /Harden Command Protocol

**Role:** Production conversion. Prototype code → Shippable, tested, documented code.

**Trigger:** After `/prototype` decision = HARDEN, or when moving any experimental code to production.

**Time Budget:** 2-4 hours per prototype.

**Output:** Production-ready code following all `.windsurfrules` constraints.

---

## RELIABILITY PROOF

**Why this works:**
- Explicit gate prevents prototype code leaking to production
- Full systematic workflow ensures quality
- Bus stop debugging catches issues before they compound
- Tests document verified behavior (not speculate)

**Failure modes (and how to prevent):**
| Failure | Prevention |
|---------|------------|
| Hardening takes >4 hours | If >4 hours, prototype was too big. Break into smaller prototypes next time. |
| Hardened code still buggy | Bus stop verification MANDATORY - no skipping stops |
| Loss of iteration speed | Hardening is RARE (20% of time). Prototyping is COMMON (80% of time). |
| No documentation | `/learn` trigger if novel pattern discovered |

---

## PROTOCOL

### Step 1: Assess Prototype (15 minutes)
```
HARDEN MODE ACTIVATED
- Source: /_prototypes/[name]/
- Target location: [where it belongs in production]
- Complexity: [Low/Med/High]
- Risk level: [Low/Med/High] (payments = high, UI = low)
```

**Decision checkpoint:** If complexity = High or risk = High, consider:
- Breaking into smaller hardening cycles
- Or: `/sprint` with full spec instead of hardening

### Step 2: Apply Scope Lock (5 minutes)
Define what hardening includes:
```
IN SCOPE:
- [Specific files to create/modify]
- [Specific functionality to preserve from prototype]

OUT OF SCOPE:
- [Everything else]
- [Future improvements - add to POST_LAUNCH_IMPROVEMENTS.md]
```

### Step 3: Code Migration (30-60 minutes)
1. **Create production files** in proper locations (NOT copy from prototype)
2. **Reference prototype** as working example, but write clean code
3. **Apply `.windsurfrules`** constraints immediately

### Step 4: Add Tests (30-60 minutes)
Follow `/test` workflow:
- Human verification FIRST
- Then tests documenting verified behavior
- NO mocking core functionality
- Tests must fail if reality changes

### Step 5: Bus Stop Verification (30-60 minutes)
Follow `/trace` workflow:
1. Define 8-10 bus stops
2. Add console.log traces
3. Verify each stop
4. First failure = root cause
5. Fix

### Step 6: Documentation (15 minutes)
- Update `progress.txt`: `[DATE] ✅ HARDENED: [feature]`
- If novel pattern: Run `/learn`
- Add to POST_LAUNCH_IMPROVEMENTS.md if future work identified

### Step 7: Cleanup (5 minutes)
- Delete prototype from `/_prototypes/[name]/`
- **Geometry Check**: Re-anchor end-state with `/contain`, verify no prototype assumptions leaked into production
- Verify no prototype code remains in production

---

## QUALITY GATES (Hard Stops)

| Gate | Criteria | If Failed |
|------|----------|-----------|
| **Structure** | Code in correct location per architecture | Reorganize |
| **Type Safety** | `npm run typecheck` passes | Fix types |
| **Rules** | `.windsurfrules` constraints applied | Review rules |
| **Tests** | Tests pass AND test reality | Fix tests or code |
| **Verification** | All bus stops pass | Debug first failure |

**Rule:** Cannot proceed past gate until it passes.

---

## HARDENING VS SPRINT

| Situation | Use |
|-----------|-----|
| Prototype exists, direction proven | `/harden` |
| No prototype, need full design | `/sprint` |
| Complex architecture change | `/sprint` |
| High-risk (payments, auth) | `/sprint` |
| Simple UI component from prototype | `/harden` |
| Feature variation of existing pattern | `/harden` |

---

## SUCCESS INDICATORS

- Completed in 2-4 hours
- All quality gates pass
- Prototype deleted after hardening
- `progress.txt` shows completion
- Code ready for production merge

## FAILURE INDICATORS

- Taking >4 hours (prototype too big)
- Quality gates bypassed
- Prototype code copied without cleanup
- No bus stop verification
- Tests mock core functionality

---

## INTEGRATION WITH EXISTING WORKFLOWS

`/harden` calls these workflows in sequence:
1. `/contain` - Scope lock
2. `/test` - Test creation
3. `/trace` - Bus stop verification
4. `/learn` - If pattern discovered

**Do not call `/sprint`** during hardening. Sprint is for greenfield design. Hardening is for proven-direction implementation.
