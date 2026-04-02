# Live Console Debugging vs Playwright Testing

**Date:** 2026-04-02
**Source:** Brand filter debug resolution
**Severity:** High
**Frequency:** Recurring

## The Problem
Brand filter bug was resolved in ~15 minutes using live console debugging and URL testing, compared to estimated 45+ minutes with Playwright test setup and execution.

## Root Cause
Over-reliance on automated testing infrastructure for simple data flow debugging when live console debugging provides faster feedback loops.

## The Fix
Used console.log statements at key points:
1. URL parameter parsing
2. Filter clause construction  
3. GROQ query generation
4. Result analysis

## Prevention
**DEBUGGING WORKFLOW PRIORITY:**
1. **Live console debugging** - for data flow, query construction, API responses
2. **Manual URL testing** - for parameter parsing and routing issues
3. **Playwright testing** - for UI interaction validation, complex user flows, regression prevention

**When to use each:**
- **Console logs:** Data transformation, API calls, query building
- **Manual testing:** Simple user flows, parameter passing, routing
- **Playwright:** Multi-step workflows, cross-browser validation, CI/CD

## Applicability
**When to apply:**
- Data flow debugging (API → query → result)
- Filter/search parameter issues
- GROQ/SQL query construction problems
- Any server-side data processing

**Keywords:** ["debugging-workflow", "console-logging", "live-testing", "playwright-alternative", "data-flow-debugging"]
