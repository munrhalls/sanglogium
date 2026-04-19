# PRD .todo Verification Specificity Pattern

**Date:** 2026-04-18  
**Source:** Queue skeleton development conversation trace  
**Severity:** Critical  
**Frequency:** Universal (applies to all PRD .todo files)

## The Problem
Vague verification specifications in PRD .todo files create interpretation gaps, prevent objective verification, and lead to "it works on my machine" debates.

## Root Cause
- Verification written as "add logging" instead of showing exact code
- Assertions written as "verify queue works" instead of exact expected output
- Test commands not copy-pasteable
- Success criteria subjective instead of objective

## The Fix

**Correct Pattern:**
```markdown
✔ [Requirement] @done(timestamp)
    ✔ Verification: `console.log('TRACE: Processing request', { requestId, queuePosition })` at start @done(timestamp)
    ✔ Verification: `console.log('TRACE: Request complete', { requestId, duration })` at end @done(timestamp)
    ✔ Test: `for i in {1..9}; do curl -X POST http://localhost:3000/api/checkout-queue -H "Content-Type: application/json" -d "{\"publicBasket\":[{\"_id\":\"prod-$i\",\"quantity\":$i}]}" & done; wait`, verify logs show exactly: "Processing request 1 → "Request complete 1" → "Processing request 2 → "Request complete 2" → ... → "Processing request 9" → "Request complete 9" @done(timestamp)
```

**Key Elements:**
- Verification is EXACT: shows exact console.log code to add
- Assertion is EXACT: shows exact expected log output format
- Test command is copy-pasteable: can be run directly in terminal
- No ambiguity allowed

## Anti-Patterns to Avoid

**❌ WRONG:**
```markdown
[ ] Add logging for queue processing
[ ] Verify queue works
[ ] Check logs
```

**✅ CORRECT:**
```markdown
✔ Verification: `console.log('TRACE: Processing request', { requestId, queuePosition })` at start
✔ Verification: `console.log('TRACE: Request complete', { requestId, duration })` at end
✔ Test: `for i in {1..9}; do curl ... & done; wait`, verify logs show exactly: "Processing request 1 → Request complete 1 → ..."
```

## Prevention

**MANDATORY:** All PRD .todo verification items must:
1. Show exact code to add (copy-pasteable)
2. Show exact expected output (no ambiguity)
3. Provide copy-pasteable test commands
4. Include justification (why this matters)
5. Include real feedback (what bugs this catches)

## Applicability

**When to apply:**
- All PRD .todo files
- All sprint specifications
- All requirement verification items

**Keywords:** ["prd-todo", "verification-specificity", "exact-verification", "copy-pasteable-tests", "objective-success-criteria"]
