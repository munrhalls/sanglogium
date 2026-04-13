# Anti-Pattern: Monolithic Testing

**Date:** 2026-04-13
**Source:** Test refactoring experience
**Severity:** Critical
**Frequency:** Systemic (common in growing codebases)

## The Problem
Single large test files containing mixed concerns become unmaintainable, hard to navigate, and create cognitive overhead for developers.

## Root Cause
- Initial test organization doesn't scale with feature growth
- No clear boundaries between different test concerns
- Convenience of adding tests to existing file outweighs organization
- Missing guidelines for when to split test files

## The Fix
```typescript
// ANTI-PATTERN: Monolithic file
describe('Checkout Button to Redis Queue', () => {
  describe('Button Click Handling', () => { /* 5 tests */ })
  describe('API Request Formation', () => { /* 4 tests */ })
  describe('Redis Queue Addition', () => { /* 6 tests */ })
  describe('Error Handling', () => { /* 8 tests */ })
  // 23 tests total, 400+ lines, mixed concerns
})

// PATTERN: Thematic organization
// request-formation.test.ts
describe('Request Formation', () => {
  describe('Button Click Handling', () => { /* 5 tests */ })
  describe('API Request Formation', () => { /* 4 tests */ })
})

// queue-operations.test.ts  
describe('Queue Operations', () => {
  describe('Redis Queue Addition', () => { /* 6 tests */ })
})

// error-handling.test.ts
describe('Error Handling', () => {
  describe('Error Scenarios', () => { /* 8 tests */ })
})
```

## Prevention
**ANTI-PATTERN RULES:**

1. **File Size Limits**
   - **RED FLAG:** > 15 tests in one file
   - **RED FLAG:** > 200 lines in one test file
   - **ACTION:** Split immediately when thresholds reached

2. **Mixed Concerns Detection**
   - **RED FLAG:** Multiple describe blocks with different themes
   - **RED FLAG:** Tests covering both happy path and error scenarios in same file
   - **ACTION:** Separate by thematic concern

3. **Navigation Difficulty**
   - **RED FLAG:** Can't quickly find specific test type
   - **RED FLAG:** File name doesn't clearly indicate content
   - **ACTION:** Use descriptive names and thematic organization

4. **Integration Test Scope Creep**
   - **RED FLAG:** Testing more than 2 steps in user flow
   - **RED FLAG:** Multiple user journeys in same test file
   - **ACTION:** Scope to single user action flow

## Applicability
**When to apply:**
- All test file creation and maintenance
- Code reviews for test organization
- Refactoring existing test suites
- Test planning for new features

**Keywords:** ["monolithic-tests", "test-splitting", "file-organization", "test-maintainability", "cognitive-overload"]
