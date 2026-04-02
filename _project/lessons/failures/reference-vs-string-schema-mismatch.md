# Reference vs String: Schema-Data Mismatch

**Date:** 2026-04-02
**Source:** Brand Filter Debug Session
**Severity:** Critical
**Frequency:** Recurring (data migration risk)

## The Problem
Product page showed "Failed to load category products" error. Playwright tests failed because brand filter returned 0 products despite data existing in Sanity.

## Root Cause
Schema defined `brand` as a reference type (`type: "reference"`) but actual product documents contained string values for brand field. GROQ query used `brand->name` dereference syntax which failed to match string values.

## The Fix
1. Created migration script to convert string brands to brand reference documents
2. Used `SANITY_STUDIO_READ_WRITE_CREATE` token for write permissions
3. Updated GROQ query to properly dereference: `brand->name == "focal"`

## Prevention
- **ALWAYS** verify actual data before querying: `*[_type == "product"]{brand}[0...5]`
- **NEVER** assume schema and data are synchronized
- Run `npm run typegen` after schema changes to catch type mismatches
- Write data integrity tests: verify field types match schema expectations

## Applicability
**When to apply:**
- After any schema type change (string → reference, object → array, etc.)
- When queries return empty unexpectedly
- Before deploying GROQ query changes

**Keywords:** ["sanity", "groq", "reference", "schema", "migration", "brand", "type-mismatch"]
