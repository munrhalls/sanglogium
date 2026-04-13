# Sanity Read/Write Client Separation Pattern

**Date:** 2026-04-13
**Source:** AtomicReservationManager write failures
**Severity:** Critical
**Frequency**: Universal (applies to all Sanity write operations)

## The Problem
AtomicReservationManager failed to update Sanity stock values because the default client is read-only (useCdn: true, no token). Error: "client is not defined" during write operations.

## Root Cause
Sanity's default client configuration optimizes for reads:
- `useCdn: true` - Faster reads but blocks writes
- No API token - Can't authenticate for writes
- Single client used for both read/write operations

## The Fix
```typescript
// sanity/lib/client.ts - CORRECT
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,  // OK for reads
  perspective: "published",
});

// Separate write client for mutations
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,  // MUST be false for writes
  token: process.env.SANITY_API_TOKEN,  // MUST have token
});

// AtomicReservationManager.ts - CORRECT
import { client, writeClient } from '@/sanity/lib/client'

// For reading
const products = await client.fetch(...)

// For writing
const transaction = writeClient.transaction()
await transaction.commit()
```

## Prevention
**MANDATORY CLIENT SEPARATION:**

1. **Two-Client Pattern**
   - `client` - Read operations only (CDN enabled)
   - `writeClient` - Write operations only (CDN disabled, token required)

2. **Import Discipline**
   ```typescript
   // ALWAYS import both
   import { client, writeClient } from '@/sanity/lib/client'
   
   // NEVER assume writeClient exists
   ```

3. **Function-Level Separation**
   ```typescript
   // Read function
   async function getProduct(id: string) {
     return client.fetch(`*[_id == $id][0]`, { id })
   }
   
   // Write function
   async function updateStock(id: string, delta: number) {
     return writeClient.patch(id).inc({ stock: delta }).commit()
   }
   ```

4. **Test Verification**
   - Verify writeClient has token: `process.env.SANITY_API_TOKEN ? 'YES' : 'NO'`
   - Test write operations actually persist
   - Check useCdn is false for writeClient

5. **Error Patterns**
   ```typescript
   // If you see these errors, check client separation:
   // - "client is not defined"
   // - "Permission denied"
   // - "Cannot patch with CDN client"
   ```

## Applicability
**When to apply:**
- Any Sanity mutations (patch, create, delete)
- Transaction operations
- CMS write workflows
- Testing with real data updates

**Keywords:** ["sanity", "read-write", "client-separation", "cdn", "api-token", "mutations"]
