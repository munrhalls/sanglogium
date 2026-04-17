# Test Setup Guide

## Overview

This guide explains how to set up the test environment for the guest checkout inventory reservation tests.

## Prerequisites

### 1. Environment Variables

Required variables in `.env` (based on `.env.example`):

```bash
# Sanity CMS
SANITY_STUDIO_READ_WRITE_CREATE=sk_your_token_with_write_access
SANITY_STUDIO_PROJECT_ID=your_project_id
SANITY_STUDIO_DATASET=test

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 2. Stripe Test Prices

Create test prices in Stripe test mode:

1. Go to https://dashboard.stripe.com/test/prices
2. Click "Create price"
3. Set amount: `10000` (100.00 PLN)
4. Set currency: `pln`
5. Product: "Test Product for Checkout Tests"
6. Copy the price ID and update the test script

### 3. Sanity Schema

The schema must have these fields (already exists):
- `stock` (number) - Available quantity
- `reservedStock` (number) - Reserved quantity
- `brand` (reference) - Brand reference
- `stripePriceId` (string) - Stripe price ID
- `image` (image) - Product image
- `slug` (slug) - URL slug

**Important**: The conflicting `reservations` field must be removed to align with the PRD's token-based system.

## Setup Process

### Step 1: Clean Up Conflicting Schema

```bash
# Remove conflicting reservations field safely
node scripts/migrate-reservations-field.mjs
```

This will:
- Check for existing reservation data
- Create a backup if data exists
- Remove the `reservations` field from all products
- Verify the migration succeeded

### Step 2: Set Up Test Data

```bash
# Create test brands and products
node scripts/setup-test-data.mjs
```

This creates:
- 2 test brands (Alpha, Beta)
- 3 test products:
  - Test Product Alpha: 5 stock (full availability)
  - Test Product Beta: 2 stock (limited availability)
  - Test Product Gamma: 0 stock (out of stock)

### Step 3: Verify Environment

```bash
# Check all connections and data
node scripts/verify-test-environment.mjs
```

Verifies:
- Sanity connection and permissions
- Redis connection
- Stripe connection
- Test data exists
- Schema compatibility
- Environment variables

### Step 4: Run Tests

```bash
# Run checkout tests
npm run test:checkout

# Or run with visible browser
npx playwright test --headed tests/checkout/guest-checkout-inventory-reservation/
```

## Test Data Reference

### Test Products

| Product | Stock | Price | Stripe Price ID |
|---------|-------|-------|----------------|
| Test Product Alpha | 5 | 100 PLN | price_1Q6xrZ2eZvKYlo2C9u2kZvKYlo |
| Test Product Beta | 2 | 200 PLN | price_1Q6xrZ2eZvKYlo2C9u2kZvKYlo |
| Test Product Gamma | 0 | 300 PLN | price_1Q6xrZ2eZvKYlo2C9u2kZvKYlo |

### Test Scenarios Covered

1. **Full Availability** - Product Alpha with 5 stock
2. **Stock Decrement** - Product Beta with only 2 stock
3. **Out of Stock** - Product Gamma with 0 stock
4. **Idempotency** - Double-click protection
5. **No Cookies** - Authentication-free checkout
6. **Cancel & Rollback** - Stock restoration

## Troubleshooting

### Stripe Price Not Found

Error: `Missing Stripe price: price_xxxx`

Solution:
1. Create the missing price in Stripe test mode
2. Update the price ID in `scripts/setup-test-data.mjs`
3. Run setup again

### Sanity Permission Error

Error: `Sanity connection failed`

Solution:
1. Check `SANITY_STUDIO_READ_WRITE_CREATE` token
2. Ensure token has write permissions
3. Verify project ID and dataset

### Redis Connection Error

Error: `Redis connection failed`

Solution:
1. Check `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
2. Ensure Redis is accessible
3. Verify credentials are correct

### Schema Field Missing

Error: `Missing required fields: xxx`

Solution:
1. Ensure the field exists in `sanity/schemaTypes/productType.ts`
2. Run `npm run typegen` to update types
3. Restart the development server

### Conflicting Reservations Field

Error: `Conflicting "reservations" field still exists`

Solution:
1. Run the migration script: `node scripts/migrate-reservations-field.mjs`
2. Verify the field was removed from the schema
3. Restart the development server

## Clean Up

To remove test data after testing:

```bash
# Clean up test data (built into setup script)
node scripts/setup-test-data.mjs
```

This will remove all test products and brands while preserving real data.

## Package Scripts

Add these to `package.json`:

```json
{
  "scripts": {
    "setup:test-data": "node scripts/setup-test-data.mjs",
    "verify:test-env": "node scripts/verify-test-environment.mjs",
    "migrate:reservations": "node scripts/migrate-reservations-field.mjs",
    "test:checkout": "playwright test tests/checkout/guest-checkout-inventory-reservation/"
  }
}
```

## Architecture Notes

### Token-Based System (PRD Design)

The tests use the token-based reservation system from the PRD:
- Separate `reservation_tokens` collection
- Unique UUID tokens for each reservation
- Redis TTL for automatic expiration
- No authentication required

### Not Used

- The removed `reservations` field (conflicted with PRD)
- Cookie-based authentication
- JWT tokens
- Guest sessions

This ensures tests follow the exact specification in the PRD rather than alternative implementations.
