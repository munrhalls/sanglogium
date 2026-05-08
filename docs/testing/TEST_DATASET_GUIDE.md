# Test Dataset Guide

## Overview

This guide explains how to use the Sanity CMS test dataset for testing purposes.

## Dataset Switching Strategy

The project uses a simplified dataset switching approach:

### Auto-Switching (Application Code)

Application code uses centralized configuration in `sanity-config/env.ts`:

```typescript
export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET || (process.env.NODE_ENV === 'test' ? 'test' : 'production'),
  "Missing environment variable: NEXT_PUBLIC_SANITY_DATASET"
);
```

**Behavior:**
- When `NODE_ENV=test` and `NEXT_PUBLIC_SANITY_DATASET` not set → uses `test` dataset
- When `NODE_ENV` not 'test' and `NEXT_PUBLIC_SANITY_DATASET` not set → uses `production` dataset
- When `NEXT_PUBLIC_SANITY_DATASET` is explicitly set → uses that value (takes precedence)

### Environment Files

| File | Purpose | Dataset | Context |
|------|---------|---------|---------|
| `.env.local` | Local development | `production` | Application code, production scripts |
| `.env.test` | Testing | `test` | Test scripts, test helpers |
| `.env.example` | Template | `production` | Documentation |

## Usage by Context

### 1. Vitest Tests

**Automatic** - No configuration needed:

```typescript
// vitest.integration.config.ts sets NODE_ENV="test"
// Auto-switching logic handles dataset selection
```

**Test helper:**
```typescript
import { getTestProducts } from '@/tests/helpers/sanity-test-products.ts';
// Uses centralized env.ts with auto-switching
```

### 2. Test Scripts

**Load .env.test explicitly:**

```javascript
import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });
```

**Examples of test scripts:**
- `scripts/verify-test-dataset.mjs`
- `scripts/retrieve-test-products.mjs`
- `scripts/check-test-products.mjs`
- `scripts/create-test-products.mjs`
- `scripts/cleanup-test-dataset.mjs`

### 3. Production Scripts

**Load .env.local:**

```javascript
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
```

**Examples of production scripts:**
- Migration scripts
- Production verification scripts
- Data export scripts

## Test Dataset Products

The test dataset contains products with names matching "test" or "Test":

```typescript
const products = await getTestProducts();
// Returns array of test products with: _id, name, stock, reservedStock, price_data
```

## Best Practices

1. **Never use .env.local in test scripts** - Always use .env.test
2. **Never use .env.test in production scripts** - Always use .env.local
3. **Application code uses auto-switching** - Don't hardcode dataset
4. **Test helpers use centralized env.ts** - Don't create separate clients
5. **Verify dataset before operations** - Check you're on the right dataset

## Troubleshooting

**Problem: Test script hits production dataset**

**Solution:** Ensure script loads `.env.test` not `.env.local`:
```javascript
// ❌ Wrong
dotenv.config({ path: ".env.local" });

// ✅ Correct
dotenv.config({ path: ".env.test" });
```

**Problem: Vitest test hits production dataset**

**Solution:** Ensure vitest config sets `NODE_ENV="test"`:
```typescript
// vitest.integration.config.ts
env: {
  NODE_ENV: "test",
}
```

## Quick Reference

| Context | Env File | NODE_ENV | Dataset |
|---------|----------|----------|---------|
| Vitest tests | None (auto) | test | test |
| Test scripts | .env.test | test | test |
| App (dev) | .env.local | development | production |
| App (prod) | .env.local | production | production |
| Production scripts | .env.local | - | production |
