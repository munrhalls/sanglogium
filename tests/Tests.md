# Test Naming Convention

### Macro description (one per test file)
Use this format for the top-level describe block that encompasses the entire test file:

```
describe('System Name', () => {
  // all test groups for this file
})
```

**Example:**
```
describe('Basket Sync System', () => {
  // test groups
})
```

### Description (one per group of it blocks)
Use this format for describe blocks that group related test cases:

```
describe('when Condition Or Scenario', () => {
  // related test cases
})
```

**Example:**
```
describe('when receiving Sanity CMS payload', () => {
  // test cases
})
```

### Test case (one per it block)
Use this format for individual test cases:

```
it('action description in present tense', () => {
  // test implementation
})
```

**Example:**
```
it('converts cents to display price and calculates available stock', () => {
  // test implementation
})
```

### Key Principles
- Write all entities in common case (no brackets, no placeholders)
- Top-level describe: Simple system or feature name
- Nested describe: Start with "when" to describe context or precondition
- it blocks: Present tense action describing what happens, no "should" prefix
- Focus on behavior and outcomes, not implementation details
