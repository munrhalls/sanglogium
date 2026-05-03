# Contract-Based Test Naming Convention

### Macro description (one per test file)

Use this format for the top-level describe block that encompasses the entire test file:

```
describe('Contract Name', () => {
  // all test groups for this file
})
```

**Example:**
```
describe('Basket Store', () => {
  // test groups
})
```

### Description (one per group of it blocks)

Use this format for describe blocks that group related test cases by operation:

```
describe('operationName', () => {
  // related test cases
})
```

**Example:**
```
describe('addItem', () => {
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

**Examples:**
```
it('creates new item when productId is not in basket', () => {
  // test implementation
})

it('requires quantity > 0', () => {
  // test implementation
})

it('returns total sum count of all item quantities', () => {
  // test implementation
})
```

### Key Principles

- Top-level describe: Contract or system name (e.g., "Basket Store", "Basket Persistence", "Basket Page Contracts")
- Nested describe: Operation name from contract (e.g., "addItem", "incrementItem", "hydrateStore")
- it blocks: Present tense action describing behavior, includes preconditions in description
- Test contract guarantees and requires explicitly
- Test invariants explicitly
- Focus on contract compliance and behavior outcomes
