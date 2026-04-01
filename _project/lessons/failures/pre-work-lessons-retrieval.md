# Workflow: Pre-Work Lessons Retrieval

**Date:** 2026-04-01  
**Source:** /implement execution failure  
**Severity:** Critical  
**Frequency:** Systemic  

## The Problem

Executed `/implement` workflow without consulting `_project/lessons/INDEX.md` before ANY work began. This violates mandatory user rules:

> **Pre-Work Lessons Retrieval (MANDATORY)**  
> Before ANY work begins:  
> 1. Query `_project/lessons/INDEX.md` for relevant keywords  
> 2. Load Critical/High severity lessons first  
> 3. Apply prevention rules as active constraints  

## Root Cause

Workflow execution gap: `/implement` workflow documentation does not include explicit "consult lessons/index" step, but user rules take precedence. Agent defaulted to execution without retrieval.

## The Fix

Add mandatory lessons retrieval to ALL workflow execution paths.

## Prevention

**Universal Rule (add to .windsurfrules):**
```
## Pre-Work Lessons Retrieval (MANDATORY)
Before ANY code execution (/sprint, /implement, /debug, /build):
1. Read `_project/lessons/INDEX.md`
2. Search for relevant keywords
3. Load Critical/High severity lessons
4. Apply as active constraints during work
```

**When to Apply:**
- Every `/sprint` invocation
- Every `/implement` invocation  
- Every `/debug` invocation
- Every `/build` invocation on complex components

**Keywords to Search:**
- Component type ("grid", "layout", "card")
- Technology ("groq", "sanity", "nextjs")
- Pattern ("data-fetching", "testing", "verification")

## Related Lessons

- [workflows/pre-flight-baseline-check.md](workflows/pre-flight-baseline-check.md) — Verification gates
- [failures/groq-schema-assumption.md](failures/groq-schema-assumption.md) — Schema verification before work
