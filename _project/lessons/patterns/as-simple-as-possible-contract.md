# Pattern: AS-SIMPLE-AS-POSSIBLE Contract

**Date:** 2026-04-08
**Source:** Sprint critique and quick-workflow development
**Severity:** Critical
**Frequency:** Universal (applies to all development)

## The Problem
No contract to keep features and their parts from over-complicating, leading to 3-day waste cycles on non-functional code.

## Root Cause
Missing explicit simplicity constraints allowed complexity to accumulate without checks.

## The Fix
**AS-SIMPLE-AS-POSSIBLE CONTRACT:**
1. **5-Minute Explanation Rule:** If it takes more than 5 minutes to explain, it's too complex
2. **One-Page Documentation Rule:** If it needs more than one page to document, it's too complex
3. **Test-Length Rule:** If tests are longer than feature code, it's too complex
4. **Start Simple Rule:** Start with simplest possible implementation, add complexity only if absolutely necessary
5. **Question Everything Rule:** For every addition, ask "Is this really needed?"

## Prevention
**IMPLEMENTATION:**
1. **Add AS-SIMPLE-AS-POSSIBLE to all sprint templates**
2. **Review complexity at each checkpoint**
3. **Stop signs trigger immediate simplification**
4. **Complexity budget: 0 unless justified**

## Applicability
**When to apply:**
- All feature development
- All architecture decisions
- All test writing
- All documentation

**Keywords:** ["as-simple-as-possible", "simplicity-contract", "complexity-prevention", "guardrails"]
