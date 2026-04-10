// guest only for now

1. Checkout click
   ↓ e -> fsm -> status 'Initializing...' ->
2. Client: Generate FRESH idempotency key (UUIDv4)
            Check JWT (create if missing)
            Create/verify guest cookie session
            Store key in FSM context
   ↓ e -> fsm -> status 'Processing...'
3. Client → Server: Call server action with:
   - idempotencyKey: "xyz-123"
   - guestJwt: "abc"
   - sessionId: "guest_session_id"
         - only id because authority = server, uses id to retrieve session from redis
         - IMPORTANT: client basketData always has precedence over session, session = only "bag" to store freshest payment intent, while old payment intent is deleted
   - client basketData: [...]
   ↓
4. Server: Check idempotency key cache
   │ CACHE HIT? → Return cached result (validation already done, stock already reserved)
   │               Skip to step 9
   │
   └ CACHE MISS? → Continue to 5
   ↓
5. Server: Validate basket (parallel Sanity + Stripe)
   - Check stock availability
   - Check price matches
   ↓
6. Server: Reserve stock (per product)
   - Increment reservedStock count
   - Set expiration (15 min TTL)
   ↓
7. Check for outdated PaymentIntent reference in guest session. If present, add idempotent job to call stripe api to delete it. (if fails, retries later at gradually longer intervals for reasonable max n (e.g. 5) times).
Then: Server: Create Stripe PaymentIntent
   ↓
8. Server: Cache result keyed by idempotencyKey
   { xyz-123: { validationResult, reservationIds, clientSecret } }
   ↓
9. Server: Return to client
   - Validation passed
   - clientSecret (for Stripe)
   - reservationIds
   ↓
10. Client: FSM status → ADDRESS_SLICE
    Navigate to address page