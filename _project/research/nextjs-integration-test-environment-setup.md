# Integration Test Environment Setup

## Research Scope Contract
- **Topic:** Proper environment variable configuration for Next.js integration tests with Sanity CMS
- **First Principles:** Environment variables should be inherited from test runner, not hardcoded in code; test isolation requires separate datasets
- **Fundamentals:** Next.js env loading, Sanity client configuration, Vitest environment setup
- **Scope Boundary:** Not about mocking, not about test design patterns, strictly about environment configuration
- **Target Audience:** Developers running integration tests with Sanity CMS
- **Decay Risk:** Medium — Next.js env handling changes between versions

---

## Key Finding

Next.js explicitly **does NOT load** `.env.local` when `NODE_ENV=test` (by design). This ensures consistent test results across different machines. The proper solution is:

1. **Create `.env.test` file** with test-specific configuration
2. **Remove hardcoded dataset values** from code
3. **Let environment drive configuration** through standard env variables

---

## Implementation

### Step 1: Create `.env.test` file
```bash
NODE_ENV=test
NEXT_PUBLIC_SANITY_DATASET=test
NEXT_PUBLIC_SANITY_PROJECT_ID=2tdmkpky
NEXT_PUBLIC_SANITY_API_VERSION=2024-11-14
SANITY_API_TOKEN=<your-test-token>
```

### Step 2: Remove hardcoded dataset from code
- Remove `dataset: "test"` from test writeClient
- Remove `dataset: "test"` from shipping route writeClient
- Let both use `process.env.NEXT_PUBLIC_SANITY_DATASET`

### Step 3: Ensure NODE_ENV=test in Vitest config
```typescript
export default defineConfig({
  test: {
    env: {
      NODE_ENV: "test",
    },
  },
})
```

### Step 4: Start dev server with test environment
```bash
NODE_ENV=test npm run dev
```

---

## Why This Works

- **No hardcoding**: Dataset comes from environment
- **No config issues**: Standard Next.js env loading
- **No stupid web dev**: No passing dataset in API calls
- **Idiomatic**: Follows Next.js best practices
- **Reproducible**: `.env.test` is checked into git, same for everyone
