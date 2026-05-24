# PRIMARY OBJECTIVE - AUTHORITATIVE SOURCE

**This is the primary, latest objective for basket page. All other documents in this scope - and relevant code - are legacy and should be dismissed, clean up will come after execution**

**HAPPY PATH TRACER ONLY - No error handling, no edge cases. Just prove the pipe works.**

## Pre-requirements
- Install iron-session package
- Configure iron-session middleware for checkout_session cookie
- Create session utility (getCheckoutSession) in lib/session

## Objective
- Wire client-side Basket Checkout button to call initCheckoutSession Server Action
- Write initCheckoutSession Server Action that encrypts [{ productId, quantity }] into iron-session cookie
- Assert session writes payload and redirects to /checkout/address
- Modify /checkout/address/page.tsx to read session IDs from iron-session and print to server console
