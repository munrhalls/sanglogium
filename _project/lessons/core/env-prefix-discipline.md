# Environment Variable Prefix Discipline

**Date:** 2026-04-13
**Source:** Real reservation test implementation failures
**Severity:** Critical
**Frequency**: Universal (applies to all configuration)

## The Problem
API endpoints returned 500 errors because environment variables were not using the required prefix. The reservation system expected `GUEST_CHECKOUT_` prefix but the actual variables had different names.

## Root Cause
Inconsistent environment variable naming between configuration schema and actual .env values. The AtomicReservationManager expected:
- `GUEST_CHECKOUT_SANITY_PROJECT_ID`
- `GUEST_CHECKOUT_SANITY_DATASET`
- `GUEST_CHECKOUT_SANITY_TOKEN`
- `GUEST_CHECKOUT_REDIS_HOST`
- `GUEST_CHECKOUT_REDIS_PORT`
- `GUEST_CHECKOUT_REDIS_DB`
- `GUEST_CHECKOUT_STRIPE_SECRET_KEY`

But .env.local had:
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `SANITY_API_TOKEN`
- No Redis variables with prefix

## The Fix
```typescript
// lib/checkout/reservation/config.ts - CORRECT
const envSchema = z.object({
  // Must have GUEST_CHECKOUT_ prefix
  GUEST_CHECKOUT_SANITY_PROJECT_ID: z.string(),
  GUEST_CHECKOUT_SANITY_DATASET: z.string(),
  GUEST_CHECKOUT_SANITY_TOKEN: z.string(),
  GUEST_CHECKOUT_REDIS_HOST: z.string(),
  GUEST_CHECKOUT_REDIS_PORT: z.string(),
  GUEST_CHECKOUT_REDIS_DB: z.string(),
  GUEST_CHECKOUT_STRIPE_SECRET_KEY: z.string(),
})

// .env.local - CORRECT
GUEST_CHECKOUT_SANITY_PROJECT_ID=2tdmkpky
GUEST_CHECKOUT_SANITY_DATASET=production
GUEST_CHECKOUT_SANITY_TOKEN=sk...
GUEST_CHECKOUT_REDIS_HOST=localhost
GUEST_CHECKOUT_REDIS_PORT=6379
GUEST_CHECKOUT_REDIS_DB=15
GUEST_CHECKOUT_STRIPE_SECRET_KEY=sk_test_...
```

## Prevention
**MANDATORY PREFIX DISCIPLINE:**

1. **Feature Prefix Convention**
   - All feature-specific env vars must use `{FEATURE}_` prefix
   - Example: `GUEST_CHECKOUT_`, `USER_AUTH_`, `PRODUCT_CATALOG_`

2. **Schema Validation**
   - Every feature must have a Zod schema validating prefixes
   - Fail fast on startup if variables are missing

3. **Documentation Template**
   ```typescript
   // At top of each config file
   /*
   Environment Variables Required:
   - {FEATURE}_VAR_NAME: Description
   - {FEATURE}_OTHER_VAR: Description
   
   Prefix: {FEATURE}_
   */
   ```

4. **Pre-flight Checklist**
   - Check .env.local matches schema prefixes
   - Verify all required variables are present
   - Test with missing variable to ensure proper error

## Applicability
**When to apply:**
- All new feature development
- Environment variable refactoring
- Configuration schema creation
- Debugging 500 errors on startup

**Keywords:** ["env-prefix", "environment-variables", "configuration", "500-errors", "schema-validation"]
