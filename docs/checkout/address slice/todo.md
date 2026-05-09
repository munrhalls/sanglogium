# Address Slice PRD

## Definition of Done

☐ [ ] **Verify ground**: Google API server action (submitShippingAction) works, basket reservation schema supports shippingAddress field, session storage holds basketReservationId from checkout

☐ [ ] **Create PATCH endpoint**: Add PATCH method to `/api/basket-reservations/[id]` to update shippingAddress field in Sanity document

☐ [ ] **Integrate Google API**: Replace reserveStock call in AddressForm with submitShippingAction to validate address before submission

☐ [ ] **Update reservation**: Call PATCH endpoint with verified address and basketReservationId from session storage

☐ [ ] **Redirect to shipping**: On successful address update, redirect to `/checkout/shipping` page

☐ [ ] **Manual verification**: Submit address form, verify Google API call in console, check Sanity document has shippingAddress, confirm redirect to shipping page.