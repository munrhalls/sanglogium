# Integration Test Setup Dependency Chains

## Dependency Chain Verification

### Link 1: vitest.setup.ts → MOCKS
- **Depends on:** Mock implementations of fetch, next/navigation, Stripe, checkoutClient
- **Evidence:** vitest.setup.ts lines 11-38
- **Status:** UNVERIFIED - violates zero-mocks principle

### Link 2: vitest.config.mts → .env.test
- **Depends on:** dotenv-cli to load .env.test
- **Evidence:** package.json line 9, vitest.config.mts lines 8-22
- **Status:** VERIFIED but adds dependency complexity

### Link 3: vitest.integration.config.ts → vitest.integration.setup.ts
- **Depends on:** Separate setup file for integration tests
- **Evidence:** vitest.integration.config.ts line 25
- **Status:** VERIFIED but adds complexity (multiple configs)

### Link 4: Integration tests → Sanity test dataset
- **Depends on:** Sanity "test" dataset with write permissions
- **Evidence:** .env.test lines 3-4, 23-26
- **Status:** VERIFIED but tokens exposed in .env.test

### Link 5: Integration tests → Google Maps API
- **Depends on:** Google Maps API key
- **Evidence:** .env.test line 11
- **Status:** VERIFIED but key exposed

### Link 6: Integration tests → Redis
- **Depends on:** Redis localhost:6379 DB 15
- **Evidence:** .env.test lines 15-18
- **Status:** VERIFIED but requires Redis running

### Link 7: Test data setup → Manual scripts
- **Depends on:** setup-e2e-test-data.mjs, verify-test-dataset.mjs
- **Evidence:** scripts/setup-e2e-test-data.mjs, scripts/verify-test-dataset.mjs
- **Status:** VERIFIED but manual (not automated)

## Complexity Issues

1. **Multiple test configs** - vitest.config.mts, vitest.integration.config.ts
2. **Multiple setup scripts** - setup-e2e-test-data.mjs, verify-test-dataset.mjs, cleanup-test-reservations.mjs
3. **MOCKS in vitest.setup.ts** - violates zero-mocks principle
4. **dotenv-cli dependency** - extra dependency for dev:test
5. **Manual test data setup** - scripts must be run manually
6. **No single simple command** - multiple test commands with different configs
7. **Tokens exposed in .env.test** - security risk
8. **Redis dependency** - requires Redis running for integration tests

## Will Complicate Along The Way?

YES - Multiple configs, multiple setup scripts, mocks that violate principles will create:
- Config drift between configs
- Setup script maintenance burden
- Mock vs reality confusion (cargo cult testing risk)
- Environment setup complexity (Redis, Sanity, Google Maps)
- Token management complexity
- Test isolation issues (Redis DB 15 not guaranteed clean)

## Is Simplest Possible? NO

## Is Robust? NO

## Full Cover and Move Ground Checked? NO
