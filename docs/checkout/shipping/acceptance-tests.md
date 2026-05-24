# Acceptance Tests - Shipping Page

**Happy path tracer only. Manual verification on dev server.**

*Important*: session refers to iron-session, the checkout session
 
## Test 1: Shipping page reads session correctly
- Navigate to /checkout/shipping with valid address in session
- [ ] Server logs show session.address

## Test 2: Guard redirects to address if session missing
- Clear session, navigate to /checkout/shipping
- [ ] Redirects to /checkout/address

## Test 3: Server Component fetches parcel data from Sanity
- On shipping page with valid session
- [ ] Server logs show basket IDs read from session
- [ ] Server logs show product documents fetched from Sanity
- [ ] Server logs show parcel dimensions extracted (weight, width, height, length)

## Test 4: AlleKurier API call works
- On shipping page with valid session
- [ ] Server logs show AlleKurier API called successfully
- [ ] Server logs show shipping options returned

## Test 5: Shipping options display
- On shipping page with valid session
- [ ] Page displays shipping options (provider, service, price, delivery time)
- [ ] Prices display in Polish locale (e.g., "15,69 zł")

## Test 6: User selection works
- Click shipping option radio button
- [ ] Option is visually selected

## Test 7: Form submission submits only shippingCode
- Select shipping option, click "Continue to Payment"
- [ ] Server logs show form submission with shippingCode only (no price)

## Test 8: Server Action rebuilds payload and fetches price server-side
- After form submission
- [ ] Server logs show basket IDs read from session
- [ ] Server logs show product documents fetched from Sanity
- [ ] Server logs show parcel dimensions extracted
- [ ] Server logs show AlleKurier API called server-side with full payload
- [ ] Server logs show response filtered for selected shippingCode
- [ ] Server logs show price fetched and converted to cents

## Test 9: Server Action saves both shippingCode and shippingCost
- After form submission
- [ ] Server logs show session.shippingCode saved
- [ ] Server logs show session.shippingCost saved (in cents)

## Test 10: Redirect to payment
- After form submission
- [ ] Browser redirects to /checkout/payment

## Test 11: Payment page reads session with both fields
- On payment page
- [ ] Server logs show session contains { basket, address, shippingCode, shippingCost }
- [ ] Verify shippingCost is in cents (integer)
