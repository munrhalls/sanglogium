# Tasks Decomposition - Address Page (HAPPY PATH ONLY)

**Scope:** Happy path tracer only. Error handling and edge cases are out of scope.

## Task Graph

```
T1: Verify iron-session exists and contains basket data
  ↓
T2: Verify address page reads session correctly (add guard)
  ↓
T3: Integrate existing Google validation with iron-session
  ↓
T4: Modify form submission to save validated address to session
  ↓
T5: Implement redirect to /checkout/shipping after session save
  ↓
T6: Verify session state on existing shipping page
```

## Task Details

### T1: Verify iron-session exists and contains basket data
- Verify session cookie is present (created by basket page transition)
- Verify session.basket contains [{ id, quantity }]
- If missing, redirect to basket page (guard)
- **Prerequisite**: iron-session should already be configured from basket page scope

### T2: Verify address page reads session correctly (add guard)
- Verify page.tsx imports getCheckoutSession
- Verify session.basket is logged to console
- Add guard: if session.basket missing, redirect to basket
- **Output**: Page reads session with proper guard

### T3: Integrate existing Google validation with iron-session
- Current: AddressForm calls validateShipping via checkout context
- Current: submitShippingAction in actions/address/address.ts calls Google API
- Need: After Google validation returns ACCEPT, save to iron-session
- Modify or create Server Action that:
  - Calls submitShippingAction for validation
  - On ACCEPT, saves address to session
  - On FIX, returns error to user
- **Output**: Google validation integrated with session

### T4: Modify form submission to save validated address to session
- Modify AddressForm submission flow
- After validation succeeds, call session save action
- Delete downstream data (shippingCode, shippingCost) - cascade invalidation
- Save session with await session.save()
- **Output**: Session now contains { basket, address }

### T5: Implement redirect to /checkout/shipping after session save
- After session save, call redirect("/checkout/shipping")
- Ensure redirect happens server-side
- **Output**: User navigates to shipping page

### T6: Verify session state on existing shipping page
- Load /checkout/shipping in browser
- Check server console logs
- Verify session contains: { basket, address }
- **Output**: Tracer chunk complete
