Role: professional software architect. Write simple, robust, professional, well-checked, accurate integration test in tests/checkout/.. folder for the address shipping flow. That's your one and only task.

Constraint: Test is meant to fail since the address-to-reservation integration is not yet implemented. Happy path only. The test is meant to be specification for code implementation, and verification after code implementation.

Outside of scope:
- anything other than the integration test

# Integration Test: Address Page Flow

## Test Plan

Integration test will first call checkout-queue API to obtain basket reservation ID. Test stores reservation ID in session storage after queue response and retrieves it in shipping page. Test submits valid address data to shipping form and calls real Google API for verification. Test mutates Sanity basket reservation document using reservation ID to add verified address. Test verifies mutation succeeded by querying document and confirming address equals submitted data. Happy path only: valid address, successful Google API call, successful Sanity mutation. Test will fail initially since address-to-reservation integration is not yet implemented.

## Data Shapes (Direct File References)

- Address shapes: `app/actions/address/address.ts`
- Sanity schema: `sanity/schemaTypes/basketReservationType.ts`
- Test data: `c:\webdev\sang-logium/tests/checkout/test-data/test-addresses.ts`
- Test products: Sanity test dataset (10 products with "Test " prefix)

## Basket Reservation Pre-Setup

Test requires pre-existing basket reservation with ID in test dataset. Created via `scripts/create-test-basket-reservation.mjs`. Current test reservation ID: `C6Tof5mjTvwXcWUxnjCBRf`.
