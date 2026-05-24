# Acceptance Tests - Address Page (HAPPY PATH ONLY)

**Happy path tracer only. Manual verification on dev server.**

- Address page reads session correctly
  [x] Navigate to /checkout/address, verify server logs show session.basket

- Guard redirects to basket if session missing
  [] Clear session, navigate to /checkout/address, verify redirect to basket

- Google Address Validation works
  [x] Fill address form, submit, verify Google API returns ACCEPT or FIX

- Form submission saves validated address to session
  [x] Fill valid address, submit, check server logs for session.address

- Session contains both basket and address after submission
  [x] After form submit, check server logs show session: { basket, address }

- Redirect to /checkout/shipping after successful submission
  [x] Submit valid address form, verify browser redirects to /checkout/shipping

- Address data persists in session across redirect
  [x] After redirect to shipping page, check server logs confirm both basket and address is still in session
