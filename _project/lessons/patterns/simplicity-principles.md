# Simplicity Principles Pattern

**Date:** 2026-04-18  
**Source:** Queue skeleton development conversation trace  
**Severity:** Critical  
**Frequency:** Universal (applies to all development work)

## The Problem
Modifying existing working code to add new features creates risk, makes rollback difficult, and often leads to over-engineering in the name of "DRY".

## Root Cause
- Modifying existing working code instead of creating separate implementation
- Adding parameters to existing functions instead of creating new functions
- Trying to reuse at cost of complexity
- Over-engineering for "DRY" (Don't Repeat Yourself)
- Optimizing for fewer lines of code instead of simpler code

## The Fix

**Correct Pattern (from Sanity logging implementation):**
- **Separate function** (traceSanity) instead of parameterizing existing trace
- **Separate Redis key** (SANITY_TRACE_LIST_KEY) instead of sharing
- **Parallel API endpoint** (/api/checkout-queue/sanity-trace) instead of modifying existing
- **Separate UI section** (Sanity CMS Logs) instead of modifying existing display

**Why Separate is Simpler:**
- No risk to existing working code
- Can be removed without affecting existing code
- Can be verified independently
- Clear boundary between old and new
- Rollback is simple (delete new files)

## Simplicity Principles

**1. Separate Over Modify**
- Create separate parallel implementation
- Don't modify existing working code
- Clear boundary between concerns
- Zero risk to existing functionality

**2. Duplicate Over Complex**
- Copy code if it keeps it simple
- Don't create abstractions for the sake of DRY
- Duplication is fine if it keeps code simple
- Remove complexity, not lines of code

**3. Remove Over Optimize**
- Less complexity is better than fewer lines
- Don't optimize prematurely
- Simple solutions are easier to maintain
- Avoid clever patterns

**4. Simple Over Clever**
- Maintainability over cleverness
- Obvious code over clever code
- Straightforward over tricky
- Readable over concise

## Anti-Patterns to Avoid

**❌ WRONG:**
- Modifying existing working code to add new feature
- Adding parameters to existing function
- Creating abstraction to share code
- Optimizing for fewer lines of code
- Using clever patterns to reduce duplication

**✅ CORRECT:**
- Create separate parallel implementation
- Duplicate code if it keeps it simple
- Separate concerns even if it means duplication
- Remove complexity, not lines of code
- Use obvious, straightforward code

## Prevention

**MANDATORY:** All development work must:
1. Prefer separate implementation over modifying existing code
2. Duplicate code if it keeps it simple (DRY is not absolute)
3. Remove complexity, not lines of code
4. Use simple, obvious code over clever patterns
5. Prioritize maintainability over cleverness

## Applicability

**When to apply:**
- All feature development
- All code modifications
- All refactoring
- All new implementations

**Keywords:** ["simplicity", "separate-over-modify", "duplicate-over-complex", "remove-complexity", "simple-over-clever"]
