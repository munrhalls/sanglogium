# Return Flow Integration - Acceptance Tests

**Happy path tracer only.**

**End-to-end verification. Run on dev server.**

## Test 1: Full happy path
- Complete payment with test card `4242 4242 4242 4242`
- [ ] Browser redirects to `/api/checkout/return?payment_intent=...`
- [ ] Route Handler redirects to `/checkout/success?payment_intent=...`
- [ ] Success page displays payment confirmation
- [ ] Order details render (or webhook lag state with refresh if webhook not yet created the order)

## Test 2: Cross-scope contract — return_url
- Payment form: `return_url` = `${origin}/api/checkout/return`
- [ ] Route Handler exists at that exact path

## Test 3: Cross-scope contract — field names
- `lib/session.ts`: `paymentIntentId` and `completedPaymentIntentId` are camelCase
- Sanity GROQ: `paymentIntentId` is camelCase
- [ ] All references use camelCase

## Test 4: Cross-scope contract — currency
- Stripe PI amount: integer grosz
- Sanity order total: integer grosz
- Display: `/ 100` formatted as PLN
- [ ] No float arithmetic, no "cents" terminology

## Test 5: Next checkout cycle
- After successful payment, navigate to `/basket`, add new item
- [ ] New checkout flow starts cleanly
- [ ] No stale `paymentIntentId` or `completedPaymentIntentId` interfering

## Test 6: Legacy code cleanup
- [ ] `app/(store)/checkout/return/page.tsx` does NOT exist
- [ ] No `session_id` references in checkout code
- [ ] No old Stripe Checkout flow remnants

## Test 7: Scope boundary — no webhook logic in return docs
- [ ] Return docs do NOT describe webhook handler implementation
- [ ] Return docs reference webhook as external dependency
- [ ] Success page NEVER writes to Sanity
