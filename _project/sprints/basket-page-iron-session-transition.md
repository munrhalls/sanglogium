# Sprint: Basket Page Iron Session Transition

## PHASE 0: Pre-Work Lessons Retrieval

**Keywords:** iron-session, nextjs, server-actions, session-cookies, checkout, basket

**Result:** No lessons directory found - proceeding with fresh sprint design.

---

## PHASE 1: UX Flows First

### Current State User Interactions
1. User adds product to basket
2. User views basket page with items
3. User clicks "Checkout" button
4. System calls `/api/checkout-queue` endpoint
5. System stores `basketReservationId` in sessionStorage
6. System redirects to `/checkout` (address page)
7. Address page reads from sessionStorage to get reservation ID

### Target State User Interactions
1. User adds product to basket
2. User views basket page with items
3. User clicks "Checkout" button
4. System calls Server Action `initCheckoutSession`
5. System encrypts `[{ productId, quantity }]` into iron-session cookie
6. System redirects to `/checkout/address`
7. Address page reads from iron-session cookie
8. Server console logs session.basket array

### End-State Overview
User experience remains identical - click checkout, go to address page. What changes: session data moves from sessionStorage (client-side, insecure) to iron-session cookie (server-side encrypted, HttpOnly). This is a security and architectural improvement, not a UX change.

---

## PHASE 2: Architecture Contract

### Event-State-Server Flow
```
Event: User clicks Checkout button
  ↓
State Update: Client reads Zustand basket state [{ productId, quantity }]
  ↓
Side Effect: Call initCheckoutSession Server Action
  ↓
Result Event: Server Action encrypts payload into iron-session cookie
  ↓
New State: Redirect to /checkout/address with session cookie set
```

### Readable Contracts

**1. Events + Payloads**
```typescript
// Client Event
onClickCheckout() -> calls initCheckoutSession(basket: Array<{ productId: string; quantity: number }>)

// Server Action Event
initCheckoutSession(items: Array<{ productId: string; quantity: number }>) -> Promise<void>
```

**2. Transition Table**
```
Basket Page (client) → Server Action → iron-session cookie → Address Page (server)
```

**3. Context Shape**
```typescript
interface CheckoutSession {
  basket: Array<{ productId: string; quantity: number }>;
}
```

### Simplicity Guardrail
"If it can be done with fewer lines or no new abstraction, do it that way"
- Use existing Server Action pattern from `app/actions/address/address.ts`
- Use existing Zustand basket store structure
- Minimal session shape: only IDs and quantities

---

## PHASE 3: Tiny Scope Contracts

## Scope Contract 1: Install and Configure iron-session

### UX Slice
- No user-visible changes

### Architecture Slice
- Install iron-session package
- Create `lib/session.ts` with `getCheckoutSession()` utility
- Configure iron-session middleware for `checkout_session` cookie

### Human Verification Checklist
- [ ] Package installed in package.json
- [ ] `lib/session.ts` file exists with `getCheckoutSession()` function
- [ ] Session configuration has password from env

### Minimal Tests
- None (infrastructure setup)

---

## Scope Contract 2: Write initCheckoutSession Server Action

### UX Slice
- No user-visible changes yet

### Architecture Slice
- Create `app/actions/checkout/index.ts`
- Implement `initCheckoutSession(items)` Server Action
- Action encrypts payload into iron-session and redirects to `/checkout/address`

### Human Verification Checklist
- [ ] Server Action file exists
- [ ] Function signature matches: `initCheckoutSession(items: Array<{ productId: string; quantity: number }>)`
- [ ] Uses `getCheckoutSession()` from lib/session
- [ ] Calls `session.save()` before redirect

### Minimal Tests
- None (verified in Scope Contract 4)

---

## Scope Contract 3: Wire Checkout Button to Server Action

### UX Slice
- User clicks "Checkout" button → calls Server Action instead of API endpoint

### Architecture Slice
- Modify `CheckoutButton.tsx` to call `initCheckoutSession` Server Action
- Pass basket items from Zustand store
- Remove `/api/checkout-queue` call (legacy, cleanup later)

### Human Verification Checklist
- [ ] CheckoutButton imports `initCheckoutSession` from actions
- [ ] Button onClick calls Server Action with basket items
- [ ] Button shows loading state during call

### Minimal Tests
- None (verified in Scope Contract 5)

---

## Scope Contract 4: Verify Session Cookie Creation

### UX Slice
- User clicks Checkout → cookie created in browser

### Architecture Slice
- No code changes (verification only)

### Human Verification Checklist
- [ ] Start dev server
- [ ] Add product to basket
- [ ] Click Checkout
- [ ] DevTools → Application → Cookies shows `checkout_session` cookie
- [ ] Cookie has HttpOnly flag

### Minimal Tests
- None (manual verification)

---

## Scope Contract 5: Address Page Reads Session

### UX Slice
- No user-visible changes

### Architecture Slice
- Modify `/checkout/address/page.tsx` to read from iron-session
- Convert to Server Component (currently client component)
- Add `console.log(session.basket)` for verification

### Human Verification Checklist
- [ ] Address page is Server Component
- [ ] Page calls `getCheckoutSession()`
- [ ] Server console logs session.basket array
- [ ] Array matches basket state from checkout

### Minimal Tests
- None (manual verification)

---

## PHASE 4: Continuous Verification

### Per Scope Contract Workflow
1. Implement scope contract
2. Run human verification checklist IMMEDIATELY
3. Only then: move to next scope contract

### No Big Phases
- No "implement all then test"
- No separate test phases
- No waiting until end for verification

---

## PHASE 5: Final Human Check

### End-to-End Verification
After all scope contracts:
- [ ] Add product to basket
- [ ] Click Checkout button
- [ ] Verify cookie created
- [ ] Verify redirect to `/checkout/address`
- [ ] Verify server console logs session.basket
- [ ] Verify session.basket matches basket state

### Confirm End-State
- Session data now in encrypted cookie (not sessionStorage)
- Address page reads from server-side session
- UX unchanged for user

---

## PHASE 6: Simplicity Guardrails

### "Is this the simplest possible way?" Checks
- [ ] Can we use existing Server Action pattern? YES
- [ ] Can we use existing basket store structure? YES
- [ ] Can we minimize session payload? YES (only IDs and quantities)
- [ ] Can we avoid new abstractions? YES (no state machine, no new patterns)

### Complexity Warnings
- **WARNING:** Address page currently client component → needs conversion to Server Component to read iron-session
- **MITIGATION:** Simple conversion, add "use server" directive, read session in component body

---

## PHASE 7: Execution Protocol

### Per Scope Contract
```
1. Implement scope contract
2. Run human verification checklist IMMEDIATELY
3. Confirm: "Is this the simplest possible way?"
4. Only then: move to next scope contract
```

### Delegation Commands
- **Implementation:** `/implement [scope contract N]`
- **Verification:** Human checklist per scope
- **Final Check:** End-to-end verification
