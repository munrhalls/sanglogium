# Test Environment Configuration Pattern

**Date:** 2026-04-22
**Source:** Test Environment Streamlining
**Severity:** High
**Frequency:** Systemic

## The Problem
Test setup had redundant .env files, broken configurations, hardcoded dataset values, and inconsistent environment variable loading across Vitest and Playwright configs.

## Root Cause
No single source of truth for environment configuration. Multiple .env files (.env.test, .env.local) caused confusion and broken references.

## The Fix
**Single Source of Truth: NODE_ENV**

```typescript
// next.config.ts - Central dataset switching
env: {
  NEXT_PUBLIC_SANITY_DATASET: process.env.NODE_ENV === 'test' 
    ? 'test' 
    : process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
}
```

**Unified Dataset Access:**
```typescript
// All tests import from centralized env file
import { dataset } from '@/sanity/env'

const client = createClient({
  projectId,
  dataset, // Dynamic based on NODE_ENV
  apiVersion,
})
```

**Configuration Cleanup:**
- Remove dotenv.config() from Playwright configs
- Remove redundant .env files
- Use NEXT_PUBLIC_SANITY_DATASET everywhere (not SANITY_STUDIO_DATASET)
- Create .env.example documenting required variables

## Test Flows

### Integration Tests (Vitest)
- 16 files in tests/checkout-queue/integration/
- Zero mocks - connect to real Redis/Sanity
- Use NODE_ENV=test → dataset="test" automatically

### E2E Tests (Playwright)
- 6 files in tests/checkout/e2e/ and tests/checkout-queue/e2e/
- Playwright with real browser
- Environment loaded via NODE_ENV

### Component Tests
- Currently blocked: Playwright component testing with Next.js requires @playwright/experimental-ct-react
- Previous approach: Vitest with infrastructure mocks (next/image, next/navigation)
- Decision needed: Install experimental package or keep Vitest with minimal mocks

## Prevention
**Rule:** Single environment variable (NODE_ENV) drives all test configuration. No .env.test files, no hardcoded dataset values.

**Keywords:** ["test-environment", "sanity-dataset", "node-env", "environment-configuration"]
