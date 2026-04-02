# Raw Learning Capture

**Work Unit:** End-to-End Debugging Methodology  
**Date:** 2026-04-02  
**Duration:** 22 minutes (vs 5 minutes optimal)

### What Was the Error/Surprise?
User revealed that the optimal debugging approach would have been: trace end-to-end → verify each bus stop → isolate broken stop → write targeted test. Instead, we implemented first, then tested, then debugged.

### Root Cause
Started with implementation assumptions instead of systematic flow verification. Traced problems through testing rather than through systematic bus stop verification.

### Time Bottlenecks
- **Investigation:** 22 minutes total (vs 5 minutes optimal)
- **Friction:** Had to write tests to discover what tracing would have shown immediately
- **Wait time:** Multiple test runs to isolate issues that tracing would have identified upfront

### Prompt Quality
- **Strength:** Clear end-to-end flow request
- **Weakness:** Started implementation before full trace verification
- **Missing:** Systematic bus stop verification methodology

### Test Coverage Gap
Missing systematic end-to-end trace verification before implementation.

### Fix Applied
End-to-end trace approach:
1. UI → useFilterNuqs → URL → page.tsx → getProductsByVfsKeys → GROQ → Results
2. Verify each transfer point
3. Isolate broken transfer
4. Write targeted test
5. Fix specific issue

---

# Patterns: Bus Stop Debugging Methodology

**Date:** 2026-04-02
**Source:** Price Slider Debug Session
**Severity:** Critical
**Frequency:** Universal (applies to all debugging)

## The Problem
22-minute debug session could have been 5 minutes with proper end-to-end tracing methodology.

## Root Cause
Started implementation before systematic flow verification. Used testing to discover issues that tracing would have revealed immediately.

## The Fix
**Bus Stop Debugging Protocol:**
1. **Trace the full bus route first** - Map complete data flow
2. **Verify each bus stop** - Check every transfer point works
3. **Isolate the broken stop** - Find exact failure point
4. **Write targeted test** - Test that specific stop with expected behavior
5. **Fix the isolated issue** - Surgical fix, no assumptions

**Example Application:**
```
Bus Route: UI → useFilterNuqs → URL → page.tsx → getProductsByVfsKeys → GROQ → Results
Bus Stops:
- UI generates: priceRange:min:179 ✅
- URL contains: ?f=priceRange:min:179 ✅  
- page.tsx parses: ['priceRange:min:179'] ✅
- getProductsByVfsKeys groups: {priceRange: ['min:179']} ❌ BROKEN
- GROQ handles: NO priceRange handler ❌ BROKEN
Isolation: Missing priceRange field handler in GROQ construction
```

## Prevention
**MANDATORY:** For any debugging session:
1. **Trace First** - Map complete data flow before any implementation
2. **Bus Stop Verification** - Check each transfer point systematically  
3. **Isolation Before Fix** - Find exact broken stop before writing code
4. **Targeted Testing** - Test the isolated stop, not the whole route

**Universal Debugging Workflow:**
```
1. "Trace end-to-end" - Follow data bus route
2. "Verify each bus stop" - Check transfers
3. "Isolate broken stop" - Find failure point
4. "Write targeted test" - Test specific issue
5. "Fix isolated problem" - Surgical solution
```

## Applicability
**When to apply:**
- ALL debugging sessions (no exceptions)
- ALL new feature implementation
- ALL bug investigations
- ALL performance issues
- ALL data flow problems

**Keywords:** ["bus-stop-debugging", "end-to-end-trace", "systematic-debugging", "flow-verification", "isolate-before-fix"]
