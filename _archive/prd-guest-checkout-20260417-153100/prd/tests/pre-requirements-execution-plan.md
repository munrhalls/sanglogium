# Pre-Requirements Execution Plan

## Overview
This plan outlines the exact steps to prepare the environment for running the guest checkout inventory reservation tests. We'll execute the three critical pre-requirements in order.

## Current Environment Status

### Environment Variables (.env)
- **Sanity**: Configured with production dataset
- **Redis**: Upstash URL and token present
- **Stripe**: Test mode keys configured
- **Status**: All required variables exist

### Identified Issues
1. Sanity dataset is `production` - tests should use `test` dataset
2. Need to verify all connections work
3. Need to check schema compatibility
4. Need to verify Stripe prices exist

## Execution Plan

### Phase 1: Verify Environment
**Command**: `npm run verify:test-env`

**Expected Checks**:
1. Sanity connection
2. Redis connection  
3. Stripe connection
4. Test data exists
5. Schema compatibility
6. Environment variables

**Potential Issues & Solutions**:
- If Sanity fails: Check token permissions
- If Redis fails: Verify Upstash credentials
- If Stripe fails: Ensure test mode keys
- If schema fails: Run migration script
- If test data missing: Run setup script

### Phase 2: Schema Migration
**Command**: `npm run migrate:reservations`

**What it does**:
1. Checks for existing reservation data
2. Creates backup if data exists
3. Removes conflicting `reservations` field
4. Resets `reservedStock` to 0
5. Verifies migration success

**Safety Features**:
- Creates backup before deletion
- Only affects products with reservations field
- Verifies complete removal

### Phase 3: Create Test Data
**Command**: `npm run setup:test-data`

**Creates**:
- 2 test brands (Alpha, Beta)
- 3 test products:
  - Alpha: 5 stock (full availability)
  - Beta: 2 stock (limited stock)
  - Gamma: 0 stock (out of stock)

**Verifies**:
- Stripe prices exist
- Brand references correct
- Stock levels set properly

## Detailed Execution Steps

### Step 1: Environment Verification
```bash
# Run verification script
npm run verify:test-env
```

**If all checks pass**: Continue to Phase 2
**If checks fail**:
- Note which checks failed
- Fix specific issues
- Re-run verification until all pass

### Step 2: Schema Migration
```bash
# Run migration script
npm run migrate:reservations
```

**Expected Output**:
```
Starting safe migration of reservations field...

Checking for existing reservation data...
  No products with reservation data found - safe to proceed

Removing reservations field from products...

Verifying migration...
  Migration successful - no products have reservations field

Migration completed successfully!
```

### Step 3: Test Data Setup
```bash
# Run setup script
npm run setup:test-data
```

**Expected Output**:
```
Setting up test data for guest checkout inventory reservation tests...

Verifying Stripe prices...
  price_1Q6xrZ2eZvKYlo2C9u2kZvKYlo: PLN 100.00 - OK
All Stripe prices verified successfully!

Cleaning up existing test data...
  (Deletes any existing test data)

Creating test brands...
  Created brand: Test Brand Alpha
  Created brand: Test Brand Beta

Creating test products...
  Created product: Test Product Alpha - Full Stock
  Created product: Test Product Beta - Limited Stock
  Created product: Test Product Gamma - Out of Stock

Test Data Summary:
================
Test Product Alpha - Full Stock:
  Stock: 5
  Price: 100 PLN
  Stripe Price ID: price_1Q6xrZ2eZvKYlo2C9u2kZvKYlo

Test Product Beta - Limited Stock:
  Stock: 2
  Price: 200 PLN
  Stripe Price ID: price_1Q6xrZ2eZvKYlo2C9u2kZvKYlo

Test Product Gamma - Out of Stock:
  Stock: 0
  Price: 300 PLN
  Stripe Price ID: price_1Q6xrZ2eZvKYlo2C9u2kZvKYlo

Test data setup complete! Ready to run tests.
```

## Risk Mitigation

### Data Safety
- Migration script creates backups
- Test data uses unique names to avoid conflicts
- Scripts verify success before proceeding

### Rollback Plan
If anything goes wrong:
1. Migration backup stored in Sanity
2. Test data can be deleted with cleanup script
3. Environment variables can be restored from `.env.example`

### Verification After Each Step
After each phase, re-run verification:
```bash
npm run verify:test-env
```

## Success Criteria

### Environment Verification
- All 6 checks pass
- No errors reported

### Schema Migration
- No products have `reservations` field
- All products have `reservedStock: 0`
- Migration backup created (if needed)

### Test Data Creation
- 3 test products exist
- 2 test brands exist
- Stock levels correct (5, 2, 0)
- Stripe prices verified

## Post-Setup Verification

After completing all three phases:
```bash
# Final verification
npm run verify:test-env

# Should see:
All checks passed! Environment is ready for testing.

Next steps:
1. Run tests: npm run test:checkout
2. Or run tests with UI: npx playwright test --headed
```

## Troubleshooting Guide

### Common Issues

**"Sanity connection failed"**
- Check `SANITY_STUDIO_READ_WRITE_CREATE` token
- Ensure token has write permissions
- Verify project ID and dataset

**"Redis connection failed"**
- Check `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- Ensure Redis is accessible

**"Missing Stripe price"**
- Create price in Stripe test mode
- Update price ID in setup script
- Re-run setup

**"Conflicting reservations field"**
- Run migration script
- Verify field removed
- Re-run verification

### Getting Help
1. Check script output for specific errors
2. Review logs in Sanity Studio
3. Verify Stripe test dashboard
4. Check Upstash Redis console

## Ready for Tests

After successful completion of all three phases, the environment will be ready for Opus to implement:
- API endpoints
- UI components
- Integration layer

The test suite will then have:
- Proper environment configuration
- Compatible schema
- Test data for all scenarios
- Verified connections to all services
