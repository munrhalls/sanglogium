# Anti-Patterns: Implementation-First Debugging

**Date:** 2026-04-02
**Source:** Price Slider Debug Session
**Severity:** Critical
**Frequency:** Systemic (common developer habit)

## The Problem
22-minute debug session caused by implementing fixes before systematic flow tracing. Started with assumptions, discovered issues through testing instead of tracing.

## Root Cause
**Implementation-First Thinking:** Jumped to writing code instead of understanding the complete data flow first.

**Symptom Pattern:**
1. See problem
2. Start implementing solution
3. Write tests to verify
4. Discover issues through test failures
5. Debug implementation
6. Fix issues discovered by testing

## The Fix
**Trace-First Protocol:**
1. See problem
2. **Trace complete flow** (map all bus stops)
3. **Verify each transfer point** (find broken stop)
4. **Isolate exact failure**
5. **Write targeted test** for broken stop
6. **Fix isolated issue**
7. **Verify fix** with targeted test

## Prevention
**MANDATORY RULE:** Never implement before tracing complete end-to-end flow.

**Debugging Decision Tree:**
```
Is this a debugging session?
├─ YES → TRACE FIRST (no exceptions)
│   ├─ Map complete data flow
│   ├─ Verify each transfer point
│   ├─ Isolate broken stop
│   └─ Then implement fix
└─ NO → Proceed with implementation
```

**Red Flags for Implementation-First Debugging:**
- Starting to write code without flow diagram
- Writing tests to discover issues (should verify known issues)
- Multiple implementation attempts
- "Let me try this approach" without systematic verification

**Green Flags for Trace-First Debugging:**
- Flow diagram before any code
- "Let me verify this transfer point works"
- Isolated problem statement
- Single, targeted implementation

## Applicability
**When to apply:**
- ALL debugging sessions (universal)
- ALL bug investigations
- ALL performance issues
- ALL data flow problems
- ANY time you're tempted to "just try something"

**Keywords:** ["implementation-first", "debugging-anti-pattern", "trace-first", "code-before-understanding", "systematic-debugging"]
