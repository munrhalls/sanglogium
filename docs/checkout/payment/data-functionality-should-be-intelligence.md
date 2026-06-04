# Payment Method Data Functionality — Verified Critical Intelligence

**Status:** VERIFIED against Stripe official docs (June 2026)  
**Scope:** Per-method data functionality for PL checkout via Stripe Payment Intents + Payment Elements  
**Stack:** Next.js 15, React 19, Sanity v3, iron-session  
**Verified by:** `docs.stripe.com` source-level cross-reference

---

## How Methods Are Enabled in This Codebase

`app/api/checkout/payment-intent-session/route.ts:61,66` uses:

```typescript
automatic_payment_methods: { enabled: true }
```

This delegates method visibility to **Stripe Dashboard > Settings > Payment methods**. No code changes are required to add/remove methods — only Dashboard toggles. The `PaymentElement` dynamically renders whatever is enabled.

Fallback comment exists at `route.ts:50-51` for explicit `payment_method_types`, but this is **legacy path** per Stripe docs.

---

## Per-Method Verified Intelligence

### 1. BLIK
| Attribute | Verified Value |
|-----------|----------------|
| Customer locations | Poland only |
| Currency | PLN only |
| Type | Authenticated bank debit |
| Test mode | Enter any 6-digit code (e.g. `123456`) → payment succeeds |
| Source | `docs.stripe.com/payments/blik/accept-a-payment` — "Test your integration" |

**Code status:** ✅ Recognized in `app/checkout/success/page.tsx:114-119` (hint shows "BLIK")

---

### 2. Przelewy24 (P24)
| Attribute | Verified Value |
|-----------|----------------|
| Customer locations | Poland |
| Currency | PLN or EUR |
| Type | Bank redirect |
| Test mode | Select any bank → redirected to test page → click "succeed" or "fail" |
| Source | `docs.stripe.com/payments/p24/accept-a-payment` — "Test your integration" |

**Code status:** ⚠️ Mentioned in `route.ts:49` comment as Dashboard requirement, but **NOT recognized in success page hint**.

**Important:** Stripe marks the standalone P24 guide as **Legacy**. Modern path is `automatic_payment_methods` + Dashboard enablement.

---

### 3. Klarna
| Attribute | Verified Value |
|-----------|----------------|
| Customer locations | Poland is in supported list |
| Currency | PLN (local currency only) |
| Type | Buy now, pay later (BNPL) |
| Test mode | Use Klarna test buyer credentials/environment |
| Source | `docs.stripe.com/payments/klarna/accept-a-payment` |

**Code status:** ⚠️ `PaymentMethodMessagingElement` displays **marketing messaging only** (orders >= 50 PLN). **NOT recognized in success page hint** as payment method. Requires Dashboard eligibility review.

---

### 4. Link
| Attribute | Verified Value |
|-----------|----------------|
| Customer locations | Poland (available). Not available: India. Restricted: Brazil, Thailand (Payment Element) |
| Currency | Follows underlying payment method |
| Type | Stripe digital wallet |
| Test mode | Use standard Stripe test card numbers within Link flow |
| Source | `docs.stripe.com/payments/link` — "Country availability" |

**Code status:** ⚠️ Appears via `ExpressCheckoutElement` if Dashboard-enabled. **NOT recognized in success page hint**.

---

### 5. PayPal
| Attribute | Verified Value |
|-----------|----------------|
| Customer locations | Worldwide |
| Currency | PLN explicitly supported (plus EUR, GBP, USD, CHF, CZK, DKK, NOK, SEK, AUD, CAD, HKD, NZD, SGD) |
| Type | Wallet |
| Test mode | Use PayPal sandbox account credentials in Stripe test mode |
| Source | `docs.stripe.com/payments/paypal` |

**Code status:** ❌ **Completely absent** from codebase. Not in UI, not in success page, not in Dashboard checklist comments.

**Caveat:** For Connect platforms / online marketplaces, requires **manual approval request** from Stripe Dashboard.

---

## What Other Methods Should Be Enabled for PL Checkout?

Per Stripe's Poland market guide (`stripe.com/resources/more/payments-in-poland`):

| Method | Priority | Rationale |
|--------|----------|-----------|
| Cards (Visa/Mastercard) | Baseline | Universal fallback |
| BLIK | **Essential** | 65%+ share of Polish e-commerce |
| Przelewy24 (P24) | **Essential** | Strong bank transfer adoption |
| Apple Pay / Google Pay | High | Mobile wallet adoption growing |
| Link | Medium | Returning customer convenience |
| Klarna | Medium | BNPL demand growing in Poland (>$1.7B in 2025) |
| PayPal | Low-Medium | Global wallet, PLN supported |

**Not available via Stripe:** PayPo (local Polish BNPL competitor to Klarna).

---

## Live Test Check — Simplest Verified Procedure

| Method | Environment | Steps |
|--------|-------------|-------|
| **BLIK** | Dev server (Stripe test mode) | 1. Ensure BLIK enabled in Dashboard test mode  <br>2. Checkout → select BLIK  <br>3. Enter `123456`  <br>4. Payment succeeds |
| **P24** | Dev server (Stripe test mode) | 1. Ensure P24 enabled in Dashboard test mode  <br>2. Checkout → select P24  <br>3. Select any bank  <br>4. On redirect test page, click "succeed" |
| **Klarna** | Dev server (Stripe test mode) | 1. Ensure Klarna enabled in Dashboard test mode  <br>2. Checkout → select Klarna  <br>3. Two-step auth: enter any 6-digit code (e.g. `123456`). Use `999999` to force fail  <br>4. Inside Klarna repayment flow: enter `4111 1111 1111 1111`, CVV `123`, exp any future date (alt: `4012 8888 8888 1881`)  <br>5. Payment succeeds |
| **Link** | Dev server (Stripe test mode) | 1. Ensure Link enabled in Dashboard test mode  <br>2. Checkout → enter **any valid email address** (e.g. `test@example.com`)  <br>3. When prompted for OTP, enter **`000000`** (fixed sandbox passcode; no SMS/email sent)  <br>4. When prompted for card, enter `4242 4242 4242 4242`, any future date, any CVC  <br>5. Payment succeeds |
| **PayPal** | Dev server (Stripe test mode) | 1. Ensure PayPal enabled in Dashboard test mode  <br>2. Checkout → select PayPal → click **Pay**  <br>3. **No PayPal Sandbox account required** for Payment Element listing  <br>4. Payment succeeds |
| **Cards** | Dev server (Stripe test mode) | Use standard test card: `4242 4242 4242 4242`, any future date, any CVC |

**Unified test approach:** All methods can be tested on `localhost:3000` with Stripe test keys (`sk_test_...`). No production environment needed.

---

## Verified Gaps in Current Implementation

1. **Missing success-page hints** (`app/checkout/success/page.tsx:114-119`)
   - Only recognizes `blik` and `card`
   - Missing: `p24`, `paypal`, `link`, `klarna`

2. **PayPal completely absent**
   - No UI mention, no success handling, no Dashboard checklist comment

3. **Klarna conflation risk**
   - `PaymentMethodMessagingElement` ≠ payment method option
   - Marketing banner does not guarantee Klarna checkout option is available

4. **Dashboard dependency — no runtime guard**
   - If BLIK/P24/Link are disabled in Dashboard, customers see only cards
   - No build-time or runtime check that required PL methods are enabled

5. **Legacy fallback comment**
   - `route.ts:50-51` references explicit `payment_method_types: ['card', 'blik', 'p24']`
   - P24 standalone guide is marked Legacy by Stripe; modern path is `automatic_payment_methods`

6. **Orphaned Flow B artifacts**
   - `app/(store)/checkout/payment/PaymentPageClient.tsx` reads `sessionStorage.basketReservationId`
   - `app/(store)/checkout/payment/_components/*` requires `basketReservationId`
   - These are part of a deprecated basket-reservation flow, not used by the current iron-session flow
   - Safe to remove after confirming the iron-session checkout still works end-to-end

---

## Verified Source References

| Claim | Source |
|-------|--------|
| BLIK test: any 6-digit code | `docs.stripe.com/payments/blik/accept-a-payment` |
| P24 test: bank select + redirect page | `docs.stripe.com/payments/p24/accept-a-payment` |
| P24 is Legacy product | `docs.stripe.com/payments/p24/accept-a-payment?payment-ui=elements` — "Caution: Legacy product" |
| Klarna Poland supported | `docs.stripe.com/payments/klarna` — Cross-border table; `docs.klarna.com` — Purchase countries |
| Link Poland available | `docs.stripe.com/payments/link` — "Country availability" |
| PayPal PLN supported | `docs.stripe.com/payments/paypal` — Presentment currency list |
| Poland market stats | `stripe.com/resources/more/payments-in-poland` |
| Payment Element product support | `docs.stripe.com/payments/payment-methods/payment-method-support` |

