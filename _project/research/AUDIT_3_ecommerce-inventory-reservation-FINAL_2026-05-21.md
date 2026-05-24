# Audit: FINAL Research Artifact

**Audit Date:** 2026-05-21
**Artifact Audited:** `ecommerce-inventory-reservation-cms-fifo-queue-cleanup_FINAL_2026-05-21.md`
**Scope:** Verify the research itself — claims, logic, completeness, red flags, overcomplications

---

## 1. Target State (What This Research Should Be)

```
[RESEARCH HEADER — Topic, Date, Context]
[SCOPE BOUNDARY — Explicitly IN/OUT]
  [ARCHITECTURAL PATTERN VALIDATION — Canonical sources only]
    [Production examples with URLs]
    [Sanity behavior verified against docs]
  [IMPLEMENTATION ANALYSIS — Code inspection only]
    [Sequential trace of every code path]
    [Gap table with file:line evidence]
  [VERDICT — Pattern yes/no, Implementation yes/no]
    [Actionable fixes with exact locations]
  [HONEST GAPS — What cannot be verified]
    [Methodology limitations disclosed]
```

### What This Research Actually Is
```
[RESEARCH HEADER]
[SCOPE — OK]
  [PATTERN VALIDATION — Mostly OK, but sources not retrieved, only cited]
    [URLs cited but content not quoted — trust assumption]
  [IMPLEMENTATION — OK for found code, but missed code paths exist]
    [Sequential trace of processor only — not full system]
    [Gap table with evidence]
  [VERDICT — Pattern yes, Implementation partial]
    [Fixes with locations]
  [HONEST GAPS — Present, but some could be closed]
    [Some gaps are closable with more effort]
```

---

## 2. Document Structure Audit

| Section | Present | Quality | Issue |
|---------|---------|---------|-------|
| Scope boundary | ✅ Yes | Good | Clear IN/OUT |
| Methodology statement | ✅ Yes | Good | "Every claim verified" |
| Pattern validation | ✅ Yes | Weak | Sources cited but not quoted — reader must trust URLs |
| Sanity transaction table | ✅ Yes | Good | Values from canonical docs with URLs |
| Sequential code trace | ⚠️ Partial | OK | Only processor traced; missed payment-intent until final pass |
| Gap table | ✅ Yes | Good | File:line citations |
| "Previous research got wrong" | ✅ Yes | Good | Self-correction is healthy |
| Honest gaps | ✅ Yes | Good | Disclosure of uncertainty |
| Inferences | ✅ Yes | Good | Clearly marked |
| Verdict | ✅ Yes | Good | Clear yes/no |
| Actionable fixes | ✅ Yes | Good | Prioritized, with locations |
| Verification log | ✅ Yes | Good | Evidence mapping |

---

## 3. Gap Analysis (G-XX)

### G-01: The FIFO Queue's Justification Is Unverified
**Current:** "The FIFO queue is a compensation for Sanity's read-write cycle isolation gap"
**Target:** Proof that the queue is necessary, or admission that it might not be
**Evidence:** `processor.ts:133-137`
```typescript
const tx = sanity.transaction()
for (const item of request.basketReservation) {
  tx.patch(item._id, (p) => p.inc({ reservedStock: item.quantity }))
}
await tx.commit()
```
**The Issue:** `inc({ reservedStock: quantity })` is an arithmetic patch, not a read-modify-write. It does not read `reservedStock` first. Sanity's exclusive-lock isolation already serializes concurrent `inc` operations on the same document. Two concurrent transactions calling `inc` on the same product will be serialized by Sanity's locks, not by the FIFO queue.

**What the queue actually does:** It serializes the ENTIRE request (doc creation + stock increment + response build). But the only part that needs serialization is the stock increment, and Sanity already handles that.

**Unless:** A stock pre-check is added (Gap #1). Then the read-write cycle (fetch stock → decide → transaction) WOULD need isolation, and the FIFO queue would be justified.

**Verdict:** The research claims the queue compensates for a read-write isolation gap, but the current code has no read-write cycle in the critical section. This claim is **false for the current implementation** but would become true if a pre-check is added. The research should either:
- Admit the queue's purpose is unclear in the current code, OR
- Frame the queue as preparation for a future pre-check

**Severity:** Medium — The queue adds complexity, Redis dependency, and timeout risk. If unnecessary, it should be removed.

---

### G-02: Source URLs Are Cited, Not Quoted
**Current:** Table cites "Official Docs" with URLs
**Target:** Key claims should include direct quotes from sources
**Issue:** The research says "Sanity docs say X" but doesn't quote the relevant text. A reader must open the URL to verify. If the URL changes or requires auth, the claim is unverifiable from the document alone.

**Example:** The corrected research quotes Sanity's transaction docs: "transactions have repeatable read isolation via exclusive locks." The FINAL research only provides the URL.

**Fix:** Include direct quotes (≤2 sentences) for all canonical claims.

**Severity:** Low — URLs are canonical and unlikely to break, but the artifact is weaker without inline quotes.

---

### G-03: "What I Cannot Verify" Contains Closable Gaps
**Current:** 4 items in "What I Cannot Verify"
**Target:** All closable gaps should be closed; only genuinely inaccessible items remain

| Item | Closable? | How |
|------|-----------|-----|
| `unit_amount` cents vs dollars | ✅ Yes | Check `sanity-cms/schemaTypes/productType.ts` or product seed data |
| Does any code call `createOrder()` | ✅ Yes | `grep -r "createOrder\|addOrder" --include="*.ts" --include="*.tsx"` was already done; just be explicit about it |
| What happens on payment success | ⚠️ Partially | `scripts/` folder might have order creation scripts; also check Stripe webhook config in dashboard |
| Cleanup timeout in production | ❌ No | Requires production log access |

**The research could close 2 of 4 items with minimal effort.** Leaving them open suggests laziness, not genuine inaccessibility.

**Severity:** Low — But "honest gaps" loses credibility if gaps are easily closed.

---

### G-04: `verifiedPrice` Assessment Might Be Wrong
**Current:** "`verifiedPrice` is stored but not used" (Gap #5), "dead data, not a security vulnerability" (Section 2.3)
**Target:** Verify whether ANY code consumes `verifiedPrice`

**What was checked:**
- `payment-intent/route.ts` fetches fresh prices from Sanity
- No other code was found that reads `verifiedPrice`

**What might have been missed:**
- `app/api/shipping/rates/route.ts` (shipping cost calculations)
- Any admin/manager views that display reservation details
- Future planned code that might use it

**The schema field `verifiedPrice` was created for a reason.** Calling it "dead data" without finding the original PRD or design doc is a bold claim. It might be dead, or it might be prematurely implemented for a future feature.

**Fix:** Add `grep -r "verifiedPrice" --include="*.ts" --include="*.tsx" --include="*.mjs"` to the verification log. If only the processor and schema reference it, then "dead data" is justified.

**Severity:** Low — The claim is probably correct, but the confidence level is higher than the evidence supports.

---

### G-05: "Order creation flow is not connected" Is Understated
**Current:** Listed as Gap #6 (Medium severity)
**Target:** Recognize this as a CRITICAL project gap, not a medium research gap

**Evidence:**
- `addOrder.ts` creates an `order` document with `status: "pending_payment"` — it expects to be called BEFORE payment
- But `payment-intent/route.ts` creates a Stripe PaymentIntent, which handles the payment
- After payment, the return page (`return/page.tsx`) fetches `/api/order?session_id=${sessionId}`
- `app/api/order/` is EMPTY
- No webhook handler exists to receive Stripe payment confirmation

**Implication:** This is not just "order creation is not connected." It means:
1. No order is created when payment succeeds
2. No `stock` is decremented on physical inventory
3. No reservation is released on payment success (cleanup might get it later, but only after TTL)
4. The customer sees a success page with order details... fetched from where?

**The research treats this as a medium-priority gap.** In a real ecommerce system, this is a P0 blocker. The research should either:
- Flag it as a P0 project gap (not a research gap), OR
- State clearly: "This research only covers the reservation system; the order lifecycle is out of scope"

**Severity:** Medium — The gap is real, but the prioritization is wrong.

---

### G-06: The 8-Gap Table Lacks a Rigorous Severity Framework
**Current:** Severity assigned by researcher judgment (Critical, High, Medium, Low)
**Target:** Severity should be derived from impact × likelihood, not intuition

| Gap | Impact | Likelihood | Calculated Severity | Assigned Severity | Match? |
|-----|--------|------------|---------------------|-------------------|--------|
| No stock pre-check | Customer over-reserves; negative available stock; possible oversell | Every checkout | **Critical** | Critical | ✅ |
| Cleanup not idempotent | Negative reservedStock; inventory corruption | Every cleanup run after partial failure | **Critical** | Critical | ✅ |
| No batch limit | Cleanup timeout; expired stock stays locked | High-traffic events | **High** | High | ✅ |
| Catch block lacks rollback | Orphaned reservations with no stock impact | Any error after doc creation | **High** | High | ✅ |
| `verifiedPrice` dead data | Minor storage waste; confusion | Always | **Low** | Medium | ❌ Overrated |
| Order flow not connected | No order on payment; no stock decrement; no reservation release on success | Every successful payment | **Critical** | Medium | ❌ Underrated |
| `Promise.all` on sync map | Minor overhead | Every request | **Low** | Low | ✅ |
| TTL parsed in 3 places | Minor inconsistency | Every request | **Low** | Low | ✅ |

**Gap #5 and #6 severity assignments are questionable.**

**Severity:** Low — But severity frameworks matter for action prioritization.

---

### G-07: The Research Never Checked if `basketReservation` Items Are Valid Products
**Current:** `isBasketReservation` checks `_id`, `quantity`, `price_data` shape
**Target:** Should the processor verify that requested products exist in Sanity?

**Evidence:** `types.ts:62-77`
```typescript
if (typeof it._id !== 'string' || it._id.length === 0) return false
```

The `_id` is checked for type but NOT for existence. A client could send a fake product ID. The processor would:
1. Create a reservation doc with the fake ID
2. Fail the `inc` transaction (product doesn't exist)
3. Catch block pops queue, releases lock
4. Orphaned reservation doc remains

**This is a real bug** that the research didn't find because it only looked at gaps the tests didn't cover, not at gaps in the type guard itself.

**Severity:** Medium — The type guard is the first line of defense; it should validate existence or the processor should.

---

### G-08: No Analysis of How the Basket Store Interacts with Reservations
**Current:** Research traces `processor.ts` → `cleanup.ts` → `payment-intent/route.ts`
**Target:** Trace how the frontend basket store triggers reservation creation

**Evidence:** `app/components/features/checkout/reservation/CheckoutButton.tsx` was mentioned in grep results but never read.

**What was missed:**
- When does the checkout button call `/api/checkout-queue`?
- Does the basket store clear after reservation creation?
- What happens if the customer goes back to the basket after clicking checkout?

**Severity:** Low — Out of scope for inventory reservation research, but relevant for full-system understanding.

---

## 4. Red Flags in the Research Itself

| Red Flag | Location | Why Serious |
|----------|----------|-------------|
| "Every claim verified" but FIFO queue justification is speculative | Part 1, last paragraph | The queue's purpose is asserted, not proven |
| Sources cited but not quoted | Part 1 tables | Reader must trust URLs; no inline evidence |
| "No documented production examples of Sanity for reservations" — but search was limited | Part 4 | Search terms were generic; "Sanity ecommerce inventory" might yield examples |
| `createOrder()` gap called "Medium" | Gap table | Should be P0 for the project, even if out of research scope |
| `verifiedPrice` called "dead data" without full grep | Section 2.3 | Confidence exceeds evidence |
| No mention of `CheckoutButton.tsx` | Entire doc | Frontend trigger for the entire flow was never examined |

---

## 5. What Was Actually Good (To Preserve)

| Element | Why It Works |
|---------|--------------|
| Self-correction section (2.3) | Demonstrates intellectual honesty |
| "Honest gaps" section | Sets proper epistemic boundaries |
| Inference marking (Part 3) | Separates fact from deduction |
| File:line citations | Verifiable, specific, professional |
| Gap table with evidence | Structured, actionable |
| Removal of false positives | Cleaned up previous errors |
| No speculation in final | Stuck to what could be verified |

---

## 6. Corrected Action Items

| Priority | Action | Rationale |
|----------|--------|-----------|
| P0 | **Clarify FIFO queue justification** — either prove it's needed or admit uncertainty | Current justification is unverified; might be unnecessary complexity |
| P0 | **Reclassify Gap #6 (order flow) as P0 project blocker** | Every successful payment creates no order; this is not a medium-priority gap |
| P1 | **Add direct quotes from canonical sources** | Improves verifiability if URLs change |
| P1 | **Close "What I Cannot Verify" items that are closable** | Check productType schema for `unit_amount` documentation; confirm grep was exhaustive |
| P1 | **Verify `verifiedPrice` is truly unused** | Full grep across all file types; check if it's displayed in any UI |
| P2 | **Read `CheckoutButton.tsx`** | Complete the frontend-to-backend trace |
| P2 | **Check if `basketReservation` `_id` validation includes existence check** | Fake product IDs create orphaned docs |

---

## 7. Final Assessment

**The research is solid but not perfect.** It successfully:
- ✅ Verified the architectural pattern against canonical sources
- ✅ Found and documented critical implementation gaps
- ✅ Corrected previous false positives
- ✅ Marked inferences honestly

**It still has:**
- ⚠️ One unverified claim (FIFO queue justification)
- ⚠️ One potentially wrong severity assignment (order flow gap)
- ⚠️ Some easily closable "honest gaps"
- ⚠️ Missing frontend trigger analysis

**Verdict on the research itself:** **B+** — Professional, evidence-based, self-correcting. Would be A with: (1) proven queue justification, (2) closed honest gaps, (3) direct source quotes, (4) complete frontend-to-backend trace.
