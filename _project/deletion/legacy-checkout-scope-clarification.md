# Legacy Checkout Scope Clarification

## Scope Definition
**Current Scope:** Basket page -> Checkout button click -> Inventory reservation
**Out of Scope:** Full checkout flow (address, payment, etc.)

## Files NOT Considered Legacy (Keep):
- `components/checkout/AddressForm.tsx` - Part of full checkout flow
- `components/checkout/PaymentForm.tsx` - Part of full checkout flow  
- `components/checkout/StripePaymentForm.tsx` - Part of full checkout flow

## Files Considered Legacy (Deleted):
1. `store/checkout/checkoutMachine.ts` - Old FSM for basket->checkout
2. `app\(store)\checkout/` - Old checkout context and types
3. `app\(store)\basket\CheckoutButton.tsx` - Old basket checkout button
4. `app\components\features\basket\checkout/` - Old basket checkout flow
5. `app\components\CheckoutForm.tsx` - Old checkout form
6. `app\actions\checkout/` - Old checkout actions
7. `app\hooks\useInitializeCheckoutCart.ts` - Old cart initialization
8. `app\(store)\test-checkout/` - Old test checkout page
9. `sanity\lib\checkoutClient.ts` - Unused client

## Fresh Implementation (Basket -> Reservation):
- `components/checkout/reservation/CheckoutButton.tsx` - NEW reservation button
- `lib/checkout/reservation/` - NEW reservation backend
- `store/checkout/reservedBasketSlice.ts` - NEW reservation store
- `app/api/checkout/reserve/` - NEW reservation API

## Clarification
The legacy files were specifically for the basket->checkout transition. The full checkout flow (address, payment) remains and is NOT part of this cleanup.
