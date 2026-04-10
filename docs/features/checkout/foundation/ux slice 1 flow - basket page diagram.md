# UX Slice 1 Flow - Basket Page Checkout Diagram

## Checkout Flow (Guest User)

```
┌─────────────────┐
│   BASKET PAGE   │
│  User clicks    │
│  "Checkout"     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ 1. CLIENT: GENERATE IDEMPOTENCY KEY    │
│    - Fresh UUIDv4 (e.g., "xyz-123")     │
│    - Check/create guest JWT             │
│    - Store key in FSM context           │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ 2. CLIENT → SERVER: CALL ACTION        │
│    Payload:                             │
│    ├─ idempotencyKey: "xyz-123"         │
│    ├─ guestJwt: "abc"                  │
│    └─ basketData: [...]                 │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ 3. SERVER: CHECK CACHE                 │
│                                        │
│    ┌─────────────┐   ┌─────────────┐   │
│    │ CACHE HIT?  │──▶│ Return cached│   │
│    │ (same key)  │   │ result       │   │
│    └─────────────┘   │ Skip to #9   │   │
│          │           └─────────────┘   │
│          NO                           │
│          ▼                             │
│    ┌─────────────┐                     │
│    │ CACHE MISS  │                     │
│    │ (new key)   │                     │
│    └──────┬──────┘                     │
│           ▼                            │
│ 4. VALIDATE BASKET                     │
│    ├─ Sanity: Stock check              │
│    └─ Stripe: Price check              │
│         (parallel)                     │
│           ▼                            │
│ 5. RESERVE STOCK                       │
│    ├─ Increment reservedStock          │
│    └─ Set 15min TTL                    │
│           ▼                            │
│ 6. CREATE PAYMENT INTENT               │
│    └─ Stripe clientSecret              │
│           ▼                            │
│ 7. CACHE RESULT                        │
│    {xyz-123: {validation,              │
│              reservationIds,            │
│              clientSecret}}             │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ 8. SERVER → CLIENT: RETURN             │
│    ├─ Validation passed                 │
│    ├─ clientSecret (Stripe)             │
│    └─ reservationIds                    │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ 9. CLIENT: FSM UPDATE                  │
│    ├─ Status: PROCESSING → SUCCESS     │
│    └─ Navigate to ADDRESS SLICE          │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│  ADDRESS PAGE   │
│  (Next Slice)   │
└─────────────────┘
```

## Key Concepts

| Element | Location | Purpose |
|---------|----------|---------|
| **Idempotency Key** | Client FSM context (in-memory) | Prevents double-processing same attempt |
| **Key Cache** | Server-side (Redis/DB) | Remembers "already processed this" |
| **Guest JWT** | HTTP-only cookie | Persistent guest identity |
| **Reservations** | Sanity products | Soft-lock stock for 15 minutes |

## Error Paths (Not Shown)

```
Validation Failed:
  ├─ Stock mismatch → Return discrepancy → User fixes basket → Retry
  ├─ Price mismatch → Return discrepancy → User approves/updates → Retry
  └─ Network error → Retry button → Same idempotency key

Success but redirect fails:
  └─ 5-second watchdog → FAIL_NETWORK → Release reservation
```

## State Transitions

```
IDLE ──START_VALIDATION──▶ PROCESSING ──PASS_VALIDATION──▶ SUCCESS ──▶ ADDRESS_SLICE
                              │
                              ├─FAIL_VALIDATION──▶ ERROR_VALIDATION
                              └─FAIL_NETWORK─────▶ ERROR_NETWORK
```
