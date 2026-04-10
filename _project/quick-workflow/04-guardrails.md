# Guardrails - Preventing Over-Complication

## Mandatory Rules

### 1. No Test Unless Needed
- Don't write tests "just because"
- Only test if feature is complex enough to need verification
- Tests must add value, not just coverage numbers

### 2. Tests Must Be Human-Readable
- No complex mocks
- No abstract test helpers
- Tests should read like documentation
- If test is hard to understand, it's too complex

### 3. Manual Verification First
- Feature must work manually before any test
- Document manual steps
- Verify each step works
- Only then write tests to document that working code

### 4. No Mocking Core Functionality
- Never mock the thing you're testing
- Only mock external dependencies (Stripe API, time)
- Tests must fail if reality changes

### 5. Directness Principle
- Every verification must be directly observable
- No indirect inferences from test results
- Human must see what's happening

### 6. Simplicity Contract
- If it takes more than 5 minutes to explain, it's too complex
- If it needs more than one page to document, it's too complex
- If tests are longer than feature code, it's too complex

### 7. AS-SIMPLE-AS-POSSIBLE
- Start with simplest possible implementation
- Add complexity only if absolutely necessary
- Question every addition: "Is this really needed?"

## Anti-Pattern Checklist

- [ ] No state machine library unless absolutely necessary
- [ ] No abstraction layers unless they solve real problems
- [ ] No "enterprise patterns" for simple features
- [ ] No test doubles for core functionality
- [ ] No cargo cult testing
- [ ] No over-engineering

## Stop Signs

If you find yourself:
- Writing more test code than feature code
- Creating abstractions for "future needs"
- Building complex mock setups
- Writing documentation that no one will read

**STOP** and simplify.

## That's It

These rules prevent the mistakes that caused the 3-day waste.
