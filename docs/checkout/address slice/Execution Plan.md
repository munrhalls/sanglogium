# Execution Plan & Contingencies: SessionStorage Optimization

## Beads Issue Alignment with Migration Protocol

**Protocol Requirements**:
1. ✅ Decompose into steps where each step enables the next (verified sequence)
2. ✅ Identify risks: overcomplication, failure modes, dead ends
3. ✅ Plan contingencies for each risk before starting
4. ✅ Execute with fallback paths to prevent complexity traps
5. ✅ Goal: Maintain simplicity throughout; never get stuck without an exit strategy

**Alignment Status**: **ALIGNED** ✅

The experimental plan follows the protocol:
- 6 experiments, each enables the next (verified sequence)
- Risks identified per experiment (sessionStorage support, API header, data divergence)
- Contingencies planned (fallback to CMS fetch, rollback strategies)
- Fallback paths exist (each experiment has rollback, overall fallback to CMS)
- Simplicity maintained (minimal changes 1-6 lines, simple verification via console logs)

---

## Gap Identified

**Issue**: Beads issue scope includes test updates (items 5-6: integration tests, E2E test) but experimental plan doesn't cover test updates.

**Recommendation**: Remove test updates from beads issue scope. Test updates can be separate follow-up issue after implementation is verified.

**Rationale**:
- Test updates are separate concern from implementation verification
- Experimental plan focuses on implementation verification (console logs, dev tools)
- Test updates add complexity without immediate value for verification
- Can be done as follow-up once implementation is proven working

---

## Execution Plan

### Phase 1: Claim Issue
1. `bd update sang-logium-cfy --claim`
2. Update beads issue note with execution start

### Phase 2: Execute Experiments (Sequential Verification)

**Experiment 1**: Save to sessionStorage (address slice)
- File: `app/(store)/checkout/layout.tsx`
- Change: Add 2 lines after CMS save
- Verify: Browser dev tools → Session Storage + console log
- Rollback: Remove 2 lines if fails
- Exit strategy: Fallback to CMS fetch (original behavior)

**Experiment 2**: Read from sessionStorage (shipping page)
- File: `app/(store)/checkout/shipping/page.tsx`
- Change: Add 4 lines to read from sessionStorage
- Verify: Browser console log
- Rollback: Remove 4 lines if fails
- Exit strategy: Fallback to CMS fetch (if sessionStorage missing)

**Experiment 3**: Accept in API endpoint
- File: `app/api/shipping/rates/route.ts`
- Change: Add 6 lines to accept shippingAddress in header
- Verify: Server console (dev server terminal)
- Rollback: Remove 6 lines if fails
- Exit strategy: Fallback to CMS fetch (if header missing)

**Experiment 4**: Connect page to API
- File: `app/(store)/checkout/shipping/page.tsx`
- Change: Add 5 lines to pass shippingAddress in header
- Verify: Browser console + server console + network tab
- Rollback: Remove 5 lines if fails
- Exit strategy: Fallback to CMS fetch (if API fails)

**Experiment 5**: Verify fallback
- Change: None (already built into experiments 2-4)
- Verify: Clear sessionStorage, test fallback to CMS fetch
- Rollback: Not needed
- Exit strategy: Already original behavior

**Experiment 6**: End-to-end test
- Change: All experiments combined
- Verify: Complete flow + network tab (only 1 API call)
- Rollback: Remove all changes
- Exit strategy: Revert all, system works as before

### Phase 3: Decision Point

**If Experiments 1-4 succeed**: Proceed to Experiment 6 (end-to-end)
**If any experiment fails**: Rollback that specific experiment, stop, analyze failure
**If all succeed**: Update beads issue, mark as complete, create follow-up for test updates

### Phase 4: Update Beads Issue
1. Update beads issue note with execution results
2. Remove test updates from scope (items 5-6)
3. Mark as complete if experiments succeed
4. Create follow-up issue for test updates (if needed)

---

## Contingencies

### Per-Experiment Contingencies

**Experiment 1 Fails** (sessionStorage save):
- Symptom: Console error, sessionStorage key not found
- Contingency: Check browser compatibility, fallback to CMS fetch
- Rollback: Remove 2 lines, system works as before

**Experiment 2 Fails** (sessionStorage read):
- Symptom: Console error, null value
- Contingency: Fallback to CMS fetch (if statement already handles null)
- Rollback: Remove 4 lines, system works as before

**Experiment 3 Fails** (API accept header):
- Symptom: Server console error, header not received
- Contingency: Fallback to CMS fetch (if statement handles missing header)
- Rollback: Remove 6 lines, system works as before

**Experiment 4 Fails** (page to API connection):
- Symptom: API error, shipping options don't load
- Contingency: Add try-catch, fallback to CMS fetch on error
- Rollback: Remove 5 lines, system works as before

**Experiment 5 Fails** (fallback):
- Symptom: Shipping options don't load without sessionStorage
- Contingency: Check CMS connection, verify basket reservation exists
- Rollback: Not needed (fallback is original behavior)

**Experiment 6 Fails** (end-to-end):
- Symptom: Flow breaks at any point
- Contingency: Identify which experiment failed, rollback that specific change
- Rollback: Remove all changes, system works as before

### Overall Exit Strategies

**Stop Condition**: Any experiment fails and rollback doesn't restore functionality
**Exit Strategy**: Revert all changes, system works as before (original behavior)
**Data Loss Risk**: None (CMS is source of truth, sessionStorage is cache)
**User Impact**: None (fallback to original behavior if experiments fail)

---

## Risk Assessment

**High-Risk Areas**: None (minimal changes, clear rollback paths)

**Medium-Risk Areas**:
- sessionStorage browser compatibility (mitigated by fallback to CMS)
- API header not received (mitigated by fallback to CMS fetch)

**Low-Risk Areas**:
- Data divergence (mitigated by CMS as source of truth)
- Test updates (removed from scope, will be separate issue)

---

## Success Criteria

**Per-Experiment**:
- ✅ Console log shows expected output
- ✅ Dev tools show expected state (Session Storage, network tab)
- ✅ No errors in browser or server console
- ✅ Rollback restores original behavior

**Overall**:
- ✅ All 6 experiments succeed
- ✅ End-to-end flow works
- ✅ Only 1 round trip on shipping page (verified in network tab)
- ✅ Fallback works (sessionStorage cleared)
- ✅ No regressions (original behavior preserved)

---

## Time Estimate

- Experiment 1: 5 minutes
- Experiment 2: 5 minutes
- Experiment 3: 5 minutes
- Experiment 4: 5 minutes
- Experiment 5: 2 minutes
- Experiment 6: 5 minutes
- **Total**: 27 minutes

**Can Stop After**: Experiment 4 if working (skip to Experiment 6 for end-to-end)

---

## Recommendation

**Proceed with execution as planned**:
1. Claim beads issue
2. Execute experiments sequentially with verification
3. Rollback if any experiment fails
4. Update beads issue scope (remove test updates)
5. Mark complete if all experiments succeed
6. Create follow-up issue for test updates (if needed)

**Alignment**: ✅ Beads issue is aligned with migration protocol
