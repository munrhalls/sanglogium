// UX Flow Per Slice - Updated with Research Findings (2026-04-10)
// Key changes: Late PaymentIntent creation, compensation pattern, React 18 fixes
// Research source: docs/research/features/checkout/stripe-payment-flow-research.md

1. Checkout click
   down e -> fsm -> status 'processing' ->
2. Client: Generate FRESH idempotency key (UUIDv4)
            Check JWT (create if missing)
            Create/verify guest cookie session
            Disable checkout button, show loading state
            Store key in FSM context
   down
3. Client: Validate basket locally (quick checks)
   - All items have required fields
   - Quantities are valid
   - No obvious price mismatches
   down
4. Client: Navigate to address page
   - Pass idempotencyKey in state
   - FSM status: 'idle' (reset for address slice)

// === ADDRESS SLICE ===
5. Address form submit
   down e -> fsm -> status 'processing' ->
6. Client: Call server action with:
   - idempotencyKey: "checkout_${sessionId}_${timestamp}"
   - guestJwt: "abc"
   - sessionId: "guest_session_id"
   - addressData: { ... }
   - client basketData: [...]
   down
7. Server: Check idempotency key cache
   CACHE HIT? -> Return cached result (validation already done, stock already reserved)
               Skip to step 12

   CACHE MISS? -> Continue to 8
   down
8. Server: Reserve stock FIRST, then create PaymentIntent (compensation pattern)
   - Redis Lua script: check AND reserve stock
   - If insufficient stock: Return error immediately
   - Try:
       * Create Stripe PaymentIntent with:
         - amount: calculated from basket
         - automatic_payment_methods: { enabled: true }
         - metadata: { reservationId, sessionId }
         - idempotencyKey: `pi_${idempotencyKey}` (scoped to PI creation)
   - Catch (Stripe error):
       * COMPENSATION: immediately release Redis reservation
       * Return error: 'PAYMENT_SETUP_FAILED'
   - Set TTL (15 minutes) for auto-release
   down
9. Server: Validate basket (parallel Sanity + Stripe)
   - Check price matches against Sanity
   - Stock already reserved from step 8
   down
10. Server: Store in guest session
    - paymentIntentId: "pi_xxx"
    - reservationId: "reserve_xxx"
    - expiresAt: timestamp + 15min
    down
11. Server: Cache result keyed by idempotencyKey
    { idempotencyKey: { validationResult, reservationId, clientSecret, expiresAt } }
    down
12. Server: Return to client
    - Validation passed
    - clientSecret (for Stripe Elements)
    - reservationId
    - expiresAt (15 minutes from now)
    down
13. Client: Update FSM context
    - paymentIntentId, reservationId, expiresAt
    down
14. Client: FSM status -> 'idle'
    Navigate to payment page

// === PAYMENT SLICE ===
15. Payment page mount
    down
16. Client: Check expiresAt from FSM context
    - If expired: redirect to basket with error toast
    - Show countdown timer (optional UX)
    down
17. Client: Initialize Stripe Elements (React 18 StrictMode safe)
    // CRITICAL: Module-scope stripePromise (NOT inside component)
    // File: lib/stripe-promise.ts
    // export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

    // Component:
    const options = useMemo(
      () => ({ clientSecret, appearance: { theme: 'stripe' } }),
      [clientSecret]   // Prevents StripeElements remount bug B-1
    );

    // Only render Elements when clientSecret exists (prevents B-3)
    {clientSecret ? (
      <Elements stripe={stripePromise} options={options}>
        <PaymentForm />
      </Elements>
    ) : (
      <Spinner />
    )}
    down
17. Client: User submits payment
    down e -> fsm -> status 'processing' ->
18. Client: Validate form + collect wallets (required for Apple Pay/Google Pay)
    const { error: submitError } = await elements.submit();
    if (submitError) {
      FSM status: 'idle', errorMessage: submitError.message;
      return;
    }
    down
19. Client: Confirm payment with Stripe
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${origin}/checkout/success`,
      },
      redirect: 'if_required',  // Keep card payments in-app (prevents redirect)
    });
    down
20. Client response handling:
    ERROR (immediate) -> FSM status: 'idle', errorMessage: error.message
    SUCCESS (paymentIntent.status === 'succeeded' OR 'processing') -> FSM status: 'complete'
      -> Navigate to /checkout/success
    REDIRECT (3D Secure) -> Stripe handles automatically, returns to return_url

// === WEBHOOK HANDLERS (Route Handler: /api/webhooks/stripe) ===
// CRITICAL: Always verify Stripe-Signature header before processing
// Process idempotently (check if event.id already processed)

payment_intent.succeeded:
  - Commit reservation (mark as permanent in DB)
  - Create order record
  - Send confirmation email
  - Release idempotency cache (optional - keeps for replay safety)

payment_intent.payment_failed:
  - Release Redis stock reservation
  - Update guest session: clear paymentIntentId

payment_intent.canceled:
  - Release Redis stock reservation

// Safety net: Redis TTL auto-releases after 15 minutes

// === FSM STATE SHAPE (research-validated) ===
type CheckoutState = {
  status: 'idle' | 'processing' | 'complete';
  errorMessage: string | null;            // null when no error
  idempotencyKey: string | null;
  clientSecret: string | null;
  reservationId: string | null;
  expiresAt: number | null;               // Unix timestamp ms
};
// Note: 'idle' covers both "ready" and "error" states
// Check errorMessage !== null to display error UI
// This avoids a 4th 'error' state while representing errors cleanly

// === RESEARCH-BACKED IMPLEMENTATION NOTES ===
//
// 1. LATE PAYMENTINTENT CREATION:
//    - Created at address submit, not basket click
//    - Prevents "zombie PIs" polluting Stripe dashboard
//    - Amount known with certainty after address validation
//
// 2. COMPENSATION PATTERN (not truly atomic):
//    - Reserve stock in Redis FIRST (fast, local)
//    - Then create PaymentIntent in Stripe
//    - If Stripe fails: immediately release reservation
//    - True atomicity across Redis+Stripe impossible
//
// 3. REACT 18 STRICTMODE FIXES:
//    - B-1: useMemo on options prevents StripeElements remount
//    - B-2: Avoid PI creation in useEffect
//    - B-3: Conditional render prevents IntegrationError
//    - B-4: loadStripe at module scope, not in component
//
// 4. WEBHOOK AS AUTHORITATIVE:
//    - Client confirmPayment success only updates UI
//    - webhook payment_intent.succeeded triggers order creation
//    - Prevents lost orders from network failures
//
// 5. CRITICAL BUG PREVENTION:
//    - elements.submit() before confirmPayment (wallet support)
//    - redirect: 'if_required' keeps card payments in-app
//    - idempotencyKey scoped to PI creation only