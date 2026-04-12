# Test Pre-Requirements Audit Report

## Executive Summary

After reviewing all test specifications in `_project/prd/tests/`, this report identifies the pre-requirements needed to run the guest checkout inventory reservation tests successfully. The audit reveals critical dependencies across infrastructure, data, and configuration.

## Current Status

### Existing Pre-Requirements
- **Test Setup Guide** exists at `guides/test-setup-guide.md` with detailed setup instructions
- **Setup Scripts** available:
  - `scripts/migrate-reservations-field.mjs`
  - `scripts/setup-test-data.mjs`
  - `scripts/verify-test-environment.mjs`
- **Package Scripts** defined in `package.json`
- **Test Environment** partially configured

## Critical Pre-Requirements by Test Category

### 1. Environment Variables (ALL TESTS)

**Status**: Partially documented, needs verification

**Required Variables**:
```bash
# Sanity CMS
SANITY_STUDIO_READ_WRITE_CREATE=sk_your_token_with_write_access
SANITY_STUDIO_PROJECT_ID=your_project_id
SANITY_STUDIO_DATASET=test

# Redis
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Guest Checkout (PRD prefix)
GUEST_CHECKOUT_SANITY_PROJECT_ID
GUEST_CHECKOUT_REDIS_HOST
GUEST_CHECKOUT_STRIPE_SECRET_KEY
```

**Gap**: Environment variables need to be checked against actual `.env` file and PRD requirements.

### 2. Infrastructure Setup

#### Redis (Required by: redis-schema, fifo-queue, basic-reservation-flow)
- **Status**: Configuration exists, connection needs verification
- **Requirements**:
  - Redis server running (local or Upstash)
  - Multiple databases for test isolation
  - TTL support for 10-minute expiration
  - Connection pool for concurrent operations

#### Sanity CMS (Required by: basic-reservation-flow, environment-variables)
- **Status**: Schema exists, migration needed
- **Requirements**:
  - Remove conflicting `reservations` field
  - Verify required fields: `stock`, `reservedStock`, `brand`, `stripePriceId`
  - Write permissions for test data

#### Stripe (Required by: queue-request-response, basic-reservation-flow)
- **Status**: Test prices need creation
- **Requirements**:
  - Test mode account
  - Create test price: `price_1Q6xrZ2eZvKYlo2C9u2kZvKYlo`
  - Webhook endpoint configuration

### 3. Test Data Setup

#### Products (Required by: basic-reservation-flow)
- **Status**: Script exists, needs execution
- **Required Test Products**:
  - Product Alpha: 5 stock (full availability)
  - Product Beta: 2 stock (limited availability)  
  - Product Gamma: 0 stock (out of stock)

#### Brands (Required by: basic-reservation-flow)
- **Status**: Script exists, needs execution
- **Required Test Brands**:
  - Test Brand Alpha
  - Test Brand Beta

### 4. API Endpoints (Required by: queue-request-response, ui-events)

**Status**: Need implementation
- **Required Endpoints**:
  - `POST /api/checkout/reserve`
  - `POST /api/checkout/rollback`
  - `POST /api/webhooks/stripe`

### 5. UI Components (Required by: ui-user-interaction-events)

**Status**: Need implementation
- **Required Components**:
  - Checkout button with deduplication
  - Cancel button with confirmation
  - Reserved basket display
  - Stock decrement message
  - Out of stock message
  - Operation in progress message
  - Retry button for network failures

## Pre-Requirements Checklist

### Phase 1: Environment Setup
- [ ] Verify `.env` file exists with all required variables
- [ ] Check Redis connection is accessible
- [ ] Verify Sanity CMS connection and permissions
- [ ] Confirm Stripe test mode access

### Phase 2: Schema Migration
- [ ] Run `npm run migrate:reservations` to remove conflicting field
- [ ] Verify `reservations` field removed from product schema
- [ ] Run `npm run typegen` to update types

### Phase 3: Test Data Creation
- [ ] Run `npm run setup:test-data` to create test products/brands
- [ ] Verify test products created with correct stock levels
- [ ] Confirm Stripe price IDs match test data

### Phase 4: Environment Verification
- [ ] Run `npm run verify:test-env` to check all connections
- [ ] Verify all checks pass
- [ ] Address any failing checks

### Phase 5: API Implementation
- [ ] Implement `/api/checkout/reserve` endpoint
- [ ] Implement `/api/checkout/rollback` endpoint
- [ ] Implement `/api/webhooks/stripe` endpoint
- [ ] Add idempotency key handling
- [ ] Add proper error responses

### Phase 6: UI Implementation
- [ ] Implement checkout button with deduplication
- [ ] Implement cancel button with confirmation dialog
- [ ] Implement reserved basket state display
- [ ] Implement stock decrement/out of stock messages
- [ ] Implement operation in progress message for multi-tab
- [ ] Implement retry button for network failures

### Phase 7: Test Execution
- [ ] Run `npm run test:checkout` to execute all tests
- [ ] Verify all tests pass
- [ ] Check test coverage report

## Blocking Issues

### Critical Blockers
1. **API Endpoints Not Implemented** - Tests cannot run without actual endpoints
2. **UI Components Not Implemented** - UI tests need actual components
3. **Environment Variables Not Verified** - Unknown if `.env` is configured

### High Priority
1. **Schema Migration** - Conflicting field must be removed
2. **Test Data Creation** - Products must exist with correct stock
3. **Redis Database Isolation** - Tests need separate Redis DB

## Recommendations

### Immediate Actions (Before Running Tests)
1. **Verify Environment Variables**
   ```bash
   # Check if .env exists and has required variables
   node scripts/verify-test-environment.mjs
   ```

2. **Run Schema Migration**
   ```bash
   npm run migrate:reservations
   ```

3. **Create Test Data**
   ```bash
   npm run setup:test-data
   ```

### Implementation Requirements
1. **API Layer** - Implement all required endpoints with proper error handling
2. **UI Layer** - Implement React components with proper state management
3. **Integration Layer** - Connect UI to API endpoints with proper error handling

### Test Strategy
1. **Unit Tests First** - Test individual components in isolation
2. **Integration Tests** - Test API endpoints with mock data
3. **E2E Tests** - Test complete user flows
4. **Load Tests** - Test concurrent operations

## Risk Assessment

### High Risk
- **Data Corruption** - Schema migration could affect production data
- **Test Pollution** - Tests might affect real data
- **Performance Impact** - Tests might impact production systems

### Mitigation
- Use test dataset (`test` not `production`)
- Implement proper cleanup in test teardown
- Use isolated Redis databases
- Mock external services where possible

## Conclusion

The test specifications are comprehensive and well-designed, but significant pre-requirements must be met before execution. The main blockers are the missing API endpoints and UI components. Once these are implemented and the environment is properly configured, the tests should provide excellent coverage of the guest checkout inventory reservation system.

**Next Steps**:
1. Implement missing API endpoints
2. Implement required UI components
3. Verify environment configuration
4. Run setup scripts
5. Execute tests with proper monitoring
