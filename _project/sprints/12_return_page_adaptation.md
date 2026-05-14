# Sprint: Return / Success Page Adaptation (Chunk 4)

## PHASE 0: Pre-Work Lessons Retrieval

**Status:** No `_project/lessons/INDEX.md` exists.

**Verified System Understanding:**

| Source | Finding |
|--------|---------|
| `app/(store)/checkout/return/page.tsx` | Uses old `session_id` pattern, fetches `/api/order?session_id=xxx`, placeholder `clearBasket`. UI: CheckCircle, next steps, order summary, links. Wrapped in Suspense. |
| `store/basketStore.ts` | `clear()` action (line 143): `set({ items: [] })`. Zustand + persist. |
| `docs/checkout/payment/Chunk Decomposition.md` (75-91) | Static success page. No order fetch. Read `payment_intent` from query params. Clear basket on mount. Preserve existing UI. |
| `docs/checkout/payment/README.md` (47) | `return_url` = `/checkout/return?payment_intent={id}` |

**Critical Constraint:** Page loads BEFORE webhook fires. Do NOT fetch the order.

---

## PHASE 1: UX Flows First

**Current State:** Reads `session_id`, fetches order (spinner), shows order summary, placeholder `clearBasket`.

**Target State:**
1. Payment complete → redirect to `/checkout/return?payment_intent=pi_xxx`
2. Page reads `payment_intent` — no API call, no spinner
3. Basket cleared on mount via real `useBasketStore.clear()`
4. Static success: CheckCircle, payment intent ID, next steps, links
5. Missing `payment_intent` → error with "Go Home"

**End-State Overview:** Instant static success page after payment. No spinner, no API call, no webhook dependency. Basket cleared automatically. Existing UI preserved. Adaptation is subtractive.

---

## PHASE 2: Architecture Contract

```
PAGE_MOUNT → extract payment_intent from searchParams
  → PARAM_EXTRACTED → clearBasket() → render success UI
OR
  → PARAM_MISSING → render error UI
```

**Context:** `{ status: 'success' | 'error', paymentIntentId: string | null }`

**Simplicity:** Single `useEffect` for `clearBasket`. No data fetching. No loading state.

---

## PHASE 3: Tiny Scope Contracts

---

### Scope Contract 1: Remove Old `session_id` Logic

**UX Slice:** Removes spinner — page becomes instant.

**Architecture Slice:** Delete from `page.tsx`:
- `sessionId`, `Order`/`OrderItem` interfaces
- `order`, `loading`, `error` state
- `useEffect` fetching `/api/order`
- Loading spinner JSX, order summary section

Keep: `useSearchParams`, `Suspense`, CheckCircle, next steps, links, footer.

**Verification:**
- [ ] `npx tsc --noEmit` passes
- [ ] Zero `session_id` references
- [ ] Zero `/api/order` references
- [ ] CheckCircle, steps, links still present

---

### Scope Contract 2: Read `payment_intent` from Query Params

**UX Slice:** Payment intent ID displayed. Missing param → error.

**Architecture Slice:**
```tsx
const paymentIntentId = searchParams.get("payment_intent")
if (!paymentIntentId) {
  return <div>Invalid payment session <Link href="/">Go Home</Link></div>
}
```

**Verification:**
- [ ] `/checkout/return?payment_intent=pi_test123` → success with "pi_test123"
- [ ] `/checkout/return` → error "Invalid payment session"
- [ ] `/checkout/return?payment_intent=` → error

---

### Scope Contract 3: Wire Up Real `clearBasket`

**UX Slice:** Basket empty after payment.

**Architecture Slice:**
```tsx
import { useBasketStore } from "@/store/basketStore"
const clearBasket = useBasketStore((s) => s.clear)
useEffect(() => { clearBasket() }, [clearBasket])
```
Remove placeholder and TODO comments.

**Verification:**
- [ ] Add item → pay → land on return → basket empty
- [ ] No TODO comments remain

---

### Scope Contract 4: Display Payment Intent ID

**UX Slice:** Subtle reference ID below success message.

**Architecture Slice:**
```tsx
<p className="text-center text-sm text-gray-500">
  Payment reference: {paymentIntentId}
</p>
```

**Verification:**
- [ ] ID visible, subtle styling, matches query param

---

### Scope Contract 5: Integration Verification

**UX Slice:** Full flow works end-to-end.

**Verification:**
- [ ] Full flow: basket → address → shipping → payment → return
- [ ] Success page loads instantly (no spinner)
- [ ] Payment intent ID matches Stripe Dashboard
- [ ] Basket empty after returning to store
- [ ] All links functional

---

## PHASE 4: Continuous Verification

**Order:** Scope 1 → 2 → 3 → 4 → 5. Verify after each. "Is this the simplest possible way?" before proceeding.

---

## PHASE 5: Final Human Check

- [ ] `/checkout/return?payment_intent=pi_test123` → success with CheckCircle, ID, steps, links
- [ ] `/checkout/return` → error with "Go Home"
- [ ] Full payment flow → correct redirect → instant success page
- [ ] Basket empty after payment
- [ ] Zero `session_id` references
- [ ] Zero `/api/order` references
- [ ] Zero TODO comments
- [ ] `npx tsc --noEmit` passes

---

## PHASE 6: Simplicity Guardrails

- **No new abstractions** — single component, one `useEffect`
- **No new dependencies** — uses existing `useBasketStore`
- **No API calls** — static page, immune to webhook timing
- **Subtractive change** — more lines removed than added
- **Preserve existing UI** — don't redesign what works

---

## PHASE 7: Scope Lock Rules

- **NO** changes outside `app/(store)/checkout/return/page.tsx`
- **NO** adding complexity without necessity
- **NO** skipping human verification
- **NO** fetching the order (race condition)
- **NO** touching basket store or other checkout pages

---

## PHASE 8: Post-Sprint /learn

- Did the static-page approach eliminate the race condition cleanly?
- Was the subtractive approach simpler than expected?
- Did continuous verification catch any issues early?

---

## Appendix: Files Affected

| Action | File |
|--------|------|
| MODIFY | `app/(store)/checkout/return/page.tsx` |
