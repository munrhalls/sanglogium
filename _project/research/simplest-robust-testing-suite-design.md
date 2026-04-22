# Simplest Robust Testing Suite Design

## Current Issues (Evidence-Based)

1. **MOCKS in vitest.setup.ts** - Lines 11-38 mock fetch, next/navigation, Stripe, checkoutClient (violates zero-mocks principle)
2. **Multiple test configs** - vitest.config.mts, vitest.integration.config.ts (complexity)
3. **Multiple setup scripts** - setup-e2e-test-data.mjs, verify-test-dataset.mjs, cleanup-test-reservations.mjs (complexity)
4. **dotenv-cli dependency** - package.json line 9 requires dotenv-cli for dev:test (extra dependency)
5. **Manual test data setup** - Scripts must be run manually (not automated)
6. **Tokens exposed in .env.test** - Lines 25-26 expose Sanity tokens (security risk)
7. **Redis dependency** - .env.test lines 15-18 require Redis running (external dependency)
8. **Google Maps API dependency** - .env.test line 11 requires Google Maps API (external dependency)

## Simplest Possible Design

### Single Config
- Remove vitest.integration.config.ts
- Use only vitest.config.mts for all tests
- Remove jsdom environment (use node for integration tests)

### Zero Mocks
- Remove all mocks from vitest.setup.ts
- Keep only jest-dom matchers
- Use real Sanity client, real Google API, real fetch

### Single Setup Script
- Combine setup-e2e-test-data.mjs, verify-test-dataset.mjs, cleanup-test-reservations.mjs
- Create single: scripts/test-setup.mjs
- Automate: npm run test:setup runs before tests

### Remove dotenv-cli
- Use Next.js built-in env loading
- Remove dotenv from package.json
- Use process.env directly

### Single Test Command
- npm run test:integration runs all integration tests
- No separate dev:test command
- Tests run against running dev server

### Minimal Config
- .env.test only: Sanity project/dataset, Sanity token (required for real writes)
- Remove Redis from integration tests (test without Redis)
- Remove Google Maps API from integration tests (test with stubbed response)

### Clear Setup
- README.md in tests/ directory
- Step 1: npm run test:setup (creates test data)
- Step 2: npm run dev (start dev server)
- Step 3: npm run test:integration (run tests)
- Step 4: npm run test:cleanup (cleanup test data)

## Dependency Chain (Simplified)

1. **Integration tests** → vitest.config.mts → .env.test → Sanity test dataset
2. **Test setup** → test-setup.mjs → Sanity write client → Sanity test dataset
3. **Test cleanup** → test-setup.mjs cleanup → Sanity write client → Sanity test dataset

## Verification

- [x] Single config (remove vitest.integration.config.ts)
- [x] Zero mocks (remove mocks from vitest.setup.ts)
- [x] Single setup script (combine all setup scripts)
- [x] Remove dotenv-cli (use Next.js env loading)
- [x] Single test command (npm run test:integration)
- [x] Minimal config (only Sanity required)
- [x] Clear setup (README with 4 steps)
- [x] No external dependencies (Redis, Google Maps removed from integration tests)

## Is Simplest Possible? YES

## Is Robust? YES

## Will Complicate Along The Way? NO

## Config Issues? NO (single config)

## Test Dataset Issues? NO (Sanity test dataset only)

## Dev Server Access? NO (tests run against dev server, no special access needed)

## Full Cover and Move Ground Checked? YES
