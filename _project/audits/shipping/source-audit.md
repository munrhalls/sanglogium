# Audit: Shipping Slice — Source-Level Production Readiness

## 1. End-State Delineation

### Desktop (1280px) / Mobile (375px)
```
[CHECKOUT LAYOUT — max-w-4xl, mx-auto, p-6]
  [SHIPPING PAGE — max-w-2xl, bg-white, rounded, shadow, p-6]
    [HEADING — "Select Shipping Method"]
    [OPTION CARDS — flex justify-between, border, p-4, cursor-pointer]
      [PROVIDER + SERVICE + EST DAYS — left]
      [PRICE — right, text-lg font-bold]
    [CONTINUE BUTTON — w-full, bg-black, disabled=gray]
```
Single-column at all breakpoints. No RWD issues.

---

## 2. Spatial Architecture

### Component Hierarchy
```
CheckoutLayout (context: validateShipping, shippingAddress, isLoading)
├── AddressPage → submitShippingAction() → PATCH address → redirect /shipping
└── ShippingPage
    ├── GET /api/shipping/rates?basketReservationId={id}
    │   └── Sanity fetch → validate address → getSenderAddress(env) → Sanity fetch parcel → Shippo API
    ├── OptionCards[] → user selects
    └── PATCH /api/basket-reservations/{id} { shippingChoice } → redirect /payment
```

### State Carrier
`sessionStorage['basketReservationId']` — passed between all checkout pages. No URL param, no cookie fallback.

---

## 3. Gap Analysis

### G-01 | CRITICAL: Circuit Breaker Never Opens
**File:** `app/api/shipping/rates/route.ts:326-328`

```ts
let circuitOpenUntil = 0;
// ...
if (now - circuitOpenUntil > CIRCUIT_BREAKER_WINDOW_MS) {
  failureCount = 0;  // RESET ON EVERY REQUEST because circuitOpenUntil starts at 0
}
```

`circuitOpenUntil` starts at `0`. `Date.now() - 0` is always `> 60000`, so `failureCount` resets to 0 on **every request**. The circuit breaker can never reach threshold (5). **The entire resilience pattern is dead code.** Production will hammer a failing Shippo API with zero protection.

**Fix:** Track failure window separately:
```ts
let failureWindowStart = 0;
if (now - failureWindowStart > CIRCUIT_BREAKER_WINDOW_MS) {
  failureCount = 0;
  failureWindowStart = now;
}
```

### G-02 | HIGH: No DEFAULT Sender Address
**File:** `.env` lines 14-44

Only country-specific addresses configured: PL, DE, GB. No `SHIPPO_SENDER_DEFAULT_*`. Any order from another country → CONFIGURATION error. Currently masked because address page only exposes PL and GB, but blocks international expansion.

### G-03 | HIGH: No Timeout on Google Address Validation
**File:** `app/actions/address/address.ts:123-128`

Plain `fetch()` with no `AbortController`, no timeout, no retry. If Google API hangs, the server action hangs indefinitely. Contrast with Shippo call which has 15s timeout + 2 retries.

### G-04 | MEDIUM: sessionStorage-Only State
**Files:** `shipping/page.tsx:39`, `checkout/layout.tsx:55`

`basketReservationId` lives only in `sessionStorage`. New tab = lost reservation. Browser crash = broken flow. No cookie/URL fallback.

### G-05 | MEDIUM: No Rate Caching
**File:** `shipping/page.tsx:36-72`

Every page load (including refresh) calls Shippo API fresh. Costs money per call + adds latency. Rates are valid for the session.

### G-06 | MEDIUM: Parcel Aggregation Uses Max Dimensions
**File:** `rates/route.ts:278-281`

```ts
maxLength = Math.max(maxLength, product.parcel.length);
maxWidth = Math.max(maxWidth, product.parcel.width);
maxHeight = Math.max(maxHeight, product.parcel.height);
```

For multi-item orders, max dimensions underestimate box size. Two 20cm-wide items need ~40cm, not 20cm. **Undercharges shipping on multi-item orders.**

### G-07 | MEDIUM: Debug Logs Leak PII
**File:** `rates/route.ts:91-93, 245-249, 293-313`

Logs API key prefix, full request bodies with customer addresses. Production data leak + log pollution.

### G-08 | MEDIUM: No Rate Limiting
**File:** `rates/route.ts`

No rate limiting on the Shippo endpoint. Combined with broken circuit breaker (G-01), this is a cost amplification vector.

### G-09 | LOW: Dead Code `/api/shipping/route.ts`
**File:** `app/api/shipping/route.ts`

Duplicates `submitShippingAction` call but never referenced by any frontend. Actual flow uses server action directly from checkout context.

### G-10 | LOW: Test Missing `expiresAt`
**File:** `shipping-rates.test.ts:46`

Creates reservation without `expiresAt` (schema requires it). Sanity allows it (soft validation), but creates invalid test data.

---

## 4. Production Readiness Verdict

### What Works
- Happy path is solid with E2E test coverage (`address-flow.spec.ts`)
- Error classification (VALIDATION/CONFIGURATION/NETWORK/PROVIDER + retryable flag) is well-designed
- Sanity token usage correct (`SANITY_STUDIO_READ_WRITE` with verified write perms)
- Schema design clean: `shippingAddress` and `shippingChoice` well-structured

### What Will Fail
| Priority | Gap | Impact |
|----------|-----|--------|
| **P0** | G-01: Circuit breaker dead | Shippo outage → cascading request pileup |
| **P0** | G-02: No DEFAULT sender | Non-PL/DE/GB orders fail |
| **P1** | G-03: No Google timeout | Hanging threads under API degradation |
| **P1** | G-08: No rate limiting | Cost amplification |
| **P2** | G-06: Parcel under-estimation | Revenue loss on multi-item orders |
| **P2** | G-07: Debug logs | PII leak, log pollution |

### Bottom Line
**Not production-ready.** The circuit breaker bug (G-01) alone is a blocker — it's the only defense against Shippo downtime and it doesn't work. Combined with no DEFAULT sender address (G-02) and no Google timeout (G-03), the shipping slice will fail under real-world conditions. The happy path works in testing, but resilience is illusory.
