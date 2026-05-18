# Proposed Beads Issues for SessionStorage Optimization

## Existing Beads Issues

**Current Issue**: sang-logium-ou2 (Packlink API integration - successful rate calculation validation)
- Status: IN_PROGRESS
- Scope: Packlink PRO API rate calculation validation
- Relation: Independent of sessionStorage optimization (separate concern)

---

## Proposed New Issues

### Issue 1: Address slice sessionStorage optimization

**Title**: Address slice sessionStorage optimization - reduce shipping page round trips

**Type**: task
**Priority**: P1
**Description**:
Modify address slice to save shippingAddress to sessionStorage after CMS save, eliminating one round trip on shipping page. Reduces shipping page from 2 sequential round trips (CMS fetch + Packlink API) to 1 round trip (Packlink API only).

**Scope**:
1. Add sessionStorage save to address slice (app/(store)/checkout/layout.tsx)
2. Update shipping page to read shippingAddress from sessionStorage (app/(store)/checkout/shipping/page.tsx)
3. Update /api/shipping/rates to accept optional shippingAddress in request body (app/api/shipping/rates/route.ts)
4. Add fallback to CMS fetch if sessionStorage missing
5. Update integration tests (address-slice.test.ts, shipping-rates.test.ts)
6. Update E2E test (address-flow.spec.ts)

**Dependencies**:
- None (can proceed independently of sang-logium-ou2)

**Definition of Done**:
- [ ] shippingAddress saved to sessionStorage after CMS save
- [ ] shipping page reads shippingAddress from sessionStorage
- [ ] /api/shipping/rates accepts optional shippingAddress in request body
- [ ] Fallback to CMS fetch if sessionStorage missing
- [ ] Integration tests updated and passing
- [ ] E2E test updated and passing
- [ ] Manual verification: Submit address, check sessionStorage, navigate to shipping, verify options load

**Documentation Reference**:
- docs/checkout/address slice/SessionStorage Optimization Goal.md
- docs/checkout/shipping/Address-Shipping Data Flow Whiteboard.md (Option 1)

---

## Rationale for Single Issue

**Why one issue instead of multiple?**
- All 5 tasks are part of a single optimization (reducing round trips)
- Tasks are tightly coupled (changes in one affect others)
- Single issue provides clear tracking of the optimization feature
- Matches existing pattern (sang-logium-ou2 is a single focused task)

**If splitting is preferred:**
- Issue 1: Address slice sessionStorage save (layout.tsx + tests)
- Issue 2: Shipping slice sessionStorage integration (page.tsx + route.ts + tests)
- But this adds coordination overhead without clear benefit

---

## Recommended Action

Create single beads issue: **Address slice sessionStorage optimization - reduce shipping page round trips**

This issue can proceed independently of the existing sang-logium-ou2 (Packlink API integration) issue.
