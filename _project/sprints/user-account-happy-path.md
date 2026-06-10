# Sprint: User Account — Happy Path Completion
**Beads issue:** sang-logium-mik  
**Objective:** 100% accurate, 100% system-coherent user account — happy path only, 0 gaps, 0 red flags, 0 overcomplications, 0 false positives  
**Date:** June 2026

---

## UX Flows (Starting Point)

### Flow 1: Authenticated user sees their orders
1. User is signed in → completes checkout → payment succeeds
2. User navigates to `/account/orders`
3. System shows their completed order: order number, date, status, total

### Flow 2: Discovery — sign up from nav
1. Unauthenticated user sees "Sign In" AND "Sign Up" in nav header
2. User clicks "Sign Up" → lands on `/sign-up` form
3. Existing sign-up → verify email → sign-in flow runs unchanged

### Flow 3: Sign out from any surface — consistent destination
1. User clicks Sign Out from navbar dropdown OR account page button
2. Both redirect to `/sign-in`
3. Nav immediately shows unauthenticated state

### Flow 4: Account page baseline (verify complete, no new work)
1. User signs in → lands on `/account`
2. Sees: welcome with name/email, My Orders link, Change Password, Sign Out
3. Clicks My Orders → sees real order list (or clean empty state if none yet)

---

## End-State Overview

An authenticated user who completes a purchase sees that order in their `/account/orders` page. The nav offers both Sign In and Sign Up when unauthenticated. Signing out from any surface (navbar or account page) consistently redirects to `/sign-in`. All existing auth flows (registration, email verification, sign-in, forgot/reset password) remain 100% unchanged. Guest checkout continues to work exactly as before.

---

## Architecture Contract

### Data flow: userId through checkout (the critical chain)

```
payment-intent-session/route.ts
  → reads auth session via getSession() from lib/auth/dal
  → adds userId to enrichedMetadata (empty string if guest)
  → PI metadata now carries userId

return/route.ts
  → reads auth session via getSession() from lib/auth/dal
  → adds userId to capturedSessionData (undefined if guest)

createOrderFromPaymentIntent.ts
  → return path: reads userId from capturedSessionData.userId
  → webhook path: reads userId from pi.metadata.userId
  → sets userId on orderDoc when present, isGuest: !userId

webhooks/stripe/route.ts
  → calls createOrderFromPaymentIntent(pi) — no sessionData
  → already reads all data from pi.metadata — picks up userId automatically after Scope 1
```

### Invariants (must not break)
- Guest checkout: no auth session → `isGuest: true`, no `userId` field — unchanged
- Authenticated checkout: `userId = session.user.id` (Better Auth UUID string)
- `userId` on order = Better Auth `user.id` = `authId` on `userProfile` (same value, different field name)
- Orders GROQ query uses `backendClient` (SANITY_STUDIO_READ_WRITE token) — never public client
- `getSession()` from `lib/auth/dal` returns `null` if unauthenticated — all callers must handle null

---

## Scope Contract 1: Checkout → Account Linkage

**UX impact:** Authenticated user's order appears in their order history after payment

### UX Slice
- User is signed in, pays → order created with `userId` + `isGuest: false`
- Guest user pays → order created with `isGuest: true`, no `userId` (unchanged)

### Architecture Slice — 3 files, minimal changes

**File 1:** `app/api/checkout/payment-intent-session/route.ts`
- Import `getSession` from `@/lib/auth/dal`
- Call `const authSession = await getSession()` (returns null if unauthenticated)
- Add to `enrichedMetadata`: `userId: authSession?.userId ?? ''`

**File 2:** `app/api/checkout/return/route.ts`
- Import `getSession` from `@/lib/auth/dal`
- Call `const authSession = await getSession()` at top of handler
- Add to `capturedSessionData`: `userId: authSession?.userId`

**File 3:** `lib/checkout/createOrderFromPaymentIntent.ts`
- Add `userId?: string` to `OrderSessionData` interface
- In `resolveOrderData`: extract `userId = sessionData?.userId ?? pi.metadata?.userId ?? undefined`
- Return `userId` from `resolveOrderData`
- In `orderDoc`: add `...(userId ? { userId, isGuest: false } : { isGuest: true })`
- Remove hardcoded `isGuest: true`

### Human Verification Checklist (< 5 min)
- [ ] Sign in → add items to basket → complete checkout → open Sanity Studio → verify order document has `userId` field set + `isGuest: false`
- [ ] Sign out → add items → complete checkout → verify order has `isGuest: true`, no `userId`

### Minimal Tests
None — Sanity Studio visual verification is direct evidence.

---

## Scope Contract 2: Orders Page — Real Data

**UX impact:** `/account/orders` shows actual completed orders (currently hardcoded placeholder)

**Prerequisite:** Scope 1 must be complete. Orders with `userId` must exist in Sanity before this page shows anything.

### UX Slice
- `/account/orders` renders real orders for the signed-in user
- Each order shows: order number, date, status, pricing total
- If no orders yet: clean "No orders yet" empty state (same as now but intentional)

### Architecture Slice — 1 file

**File:** `app/(store)/account/orders/page.tsx`
- Add import for `backendClient` from `@/sanity-cms/lib/backendClient`
- `userId = session.userId` (already available from `verifySession()`)
- GROQ query:
  ```groq
  *[_type == "order" && userId == $userId] | order(dates.orderedAt desc) {
    orderNumber, status, pricing, dates, items[]
  }
  ```
- Replace hardcoded `<p>No orders yet.</p>` with conditional render:
  - Orders found: map to order list rows
  - No orders: "No orders yet." (same copy, now conditional and correct)

### Human Verification Checklist (< 5 min)
- [ ] Sign in as user who completed a test order in Scope 1 → navigate to `/account/orders` → order appears
- [ ] Sign in as user with no orders → "No orders yet." shows (clean empty state, no crash)

### Minimal Tests
None — direct page navigation is sufficient.

---

## Scope Contract 3: Nav Coherence

**UX impact:** Unauthenticated users can find "Sign Up" in the nav. Sign out is consistent from all surfaces.

### UX Slice
- Unauthenticated nav: shows "Sign Up" link alongside "Sign In"
- Sign out from navbar → redirects to `/sign-in` (was: stays on page)
- Sign out from account page → already redirects to `/sign-in` (no change)

### Architecture Slice — 1 file

**File:** `app/components/layout/header/NavbarActions.tsx`
- Import `UserPlus` icon from `@phosphor-icons/react` (alongside existing `UserIcon`, `SignInIcon`)
- When `!isAuthenticated`: render two NavActionItems:
  - `SignInIcon + "Sign In"` → `href="/sign-in"` (existing, unchanged)
  - `UserPlus + "Sign Up"` → `href="/sign-up"` (new)
- Change `handleSignOut`: replace `router.refresh()` with `router.push("/sign-in")`

### Human Verification Checklist (< 5 min)
- [ ] Open store unauthenticated → nav header shows both "Sign In" AND "Sign Up"
- [ ] Click "Sign Up" from nav → lands on `/sign-up`
- [ ] Sign in → sign out from navbar dropdown → lands on `/sign-in`
- [ ] Confirm sign out from account page button also lands on `/sign-in` (unchanged)

### Minimal Tests
None.

---

## Continuous Verification — Per Scope

| After Scope | Verification |
|---|---|
| Scope 1 | Sanity Studio: check order document for `userId` field |
| Scope 2 | Browser: `/account/orders` as authenticated user with one order |
| Scope 3 | Browser: unauthenticated nav + sign-out flow |

---

## Simplicity Guardrails

- **Scope 1:** ~8 lines of new code total across 3 files. No new abstractions. No new files.
- **Scope 2:** Replace 1 placeholder with 1 GROQ query + conditional render. No new files.
- **Scope 3:** Add 1 import + 1 NavActionItem + change 1 line. No new files.
- Total new code: < 25 lines across 5 files.
- **"Is this the simplest possible way?"** — yes. Each scope is a single, surgical change.

---

## Scope Lock Rules

- ✅ Scope 1 → then Scope 2 (orders page needs real userId data to verify)
- ✅ Scope 2 → then Scope 3 (nav coherence is independent but kept last as polish)
- ❌ No Scope 2 implementation before Sanity Studio confirms Scope 1 works
- ❌ No touching account page UI polish, address book, profile editing, Stripe customer linkage — out of scope for happy path

---

## What Is Explicitly OUT OF SCOPE

Per intelligence Section 8.2 — coherence gaps that are NOT happy path:

- `returnTo` parameter on sign-in (no redirect_back logic) — future sprint
- Google OAuth button shown when env var missing — env config, not code
- Dead code in `sign-up/actions.ts` — safe to leave, not a UX gap
- `userProfile.stripeCustomerId` — never written, not user-facing
- `userProfile.addresses[]` — address book, separate feature
- Individual order detail page — Scope 2 of beads issue, locked

---

## Post-Sprint

Run `/learn` after final human check.  
Update beads issue `sang-logium-mik` with evidence for each DoD item that passes.
