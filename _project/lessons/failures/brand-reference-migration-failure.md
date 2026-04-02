# Brand Reference Migration Failure

**Date:** 2026-04-02
**Source:** Brand field migration debug
**Severity:** Critical
**Frequency:** Systemic (occurs during any Sanity reference migration)

## The Problem
React error: "Objects are not valid as a React child (found: object with keys {_ref, _type})" after migrating brand field from string to Sanity reference.

## Root Cause
Incomplete migration - updated Sanity schema but failed to update all TypeScript interfaces, GROQ queries, and component rendering logic to handle brand as reference object instead of string.

## The Fix
Updated 8 TypeScript interfaces, 8 GROQ queries, and 8 component files to:
- Change interfaces from `brand: string` to `brand: { _id: string, name: string, slug: string }`
- Update GROQ from `brand,` to `brand->{ _id, name, slug },`
- Change JSX from `{product.brand}` to `{product.brand.name}`

## Prevention
**MANDATORY**: When migrating Sanity fields from primitive to reference types:
1. Search entire codebase for field usage patterns BEFORE migration
2. Create comprehensive checklist of all files that need updates
3. Update ALL interfaces, queries, and components in single atomic change
4. Add build-time validation for reference field shapes

## Applicability
**When to apply:**
- Any Sanity schema migration changing field types
- Reference field additions/modifications
- Data structure changes affecting multiple components

**Keywords:** ["sanity-migration", "reference-fields", "react-rendering", "type-safety", "brand-field"]
