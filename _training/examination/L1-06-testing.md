# Layer 1 Examination: Testing Strategy (Vitest + Playwright)

## Pre-Examination Attestation
**Date:** ___________  **Time:** ___________  **Duration:** 90 minutes

**Prerequisites:**
- [ ] JavaScript/TypeScript fundamentals
- [ ] Async/await and Promise handling
- [ ] React component lifecycle

**I attest I understand testing pyramid concepts:** _________________

---

## Section A: First Principles Foundation (20 minutes)

### A1: Why Test?

**Question 1: From first principles, why do automated tests exist?**

Your explanation (reference verification vs validation, regression prevention, confidence):
```
[Write 150+ words - what is the economic argument for testing?]















```

**Gap Detection:** What am I missing about the confidence/cost curve?
```









```

### A2: The Testing Pyramid in Your Codebase

**Question 2: Your codebase uses Vitest + Playwright. Where does each fit in the pyramid?**

```
        /\
       /  \  E2E (Playwright)
      /____\  Cost: ____  Value: ____  Speed: ____
     /      \
    /________\  Integration
   /          \
  /____________\  Unit (Vitest)
                  Cost: ____  Value: ____  Speed: ____
```

**Your codebase's specific test distribution:**
- Unit tests: _________________________________
- Integration tests: __________________________
- E2E tests: __________________________________

---

## Section B: Closed-Book Vitest Implementation (25 minutes)

**Write tests WITHOUT documentation.**

### B1: Unit Test - Pure Function

Test this utility function:

```typescript
// lib/utils/formatting.ts (example)
export function formatPrice(price: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
}

// Your test implementation:



























```

**Test cases you must cover:**
1. Happy path
2. Zero price
3. Different currency
4. Decimal handling

### B2: Async Test with Mocks

Test a data fetching function:

```typescript
// Your test for fetchProducts with mocked fetch:



























```

**Why mock the fetch and not the entire module?** ______________________

### B3: React Component Test

Test this component:

```tsx
function Counter({ initial = 0 }: { initial?: number }) {
  const [count, setCount] = useState(initial);
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}

// Your test using React Testing Library:



























```

**Critical RTL principle:** ___________________________________________

---

## Section C: Closed-Book Playwright E2E (20 minutes)

### C1: Critical User Journey Test

Write a Playwright test for: "User adds product to basket and proceeds to checkout"

```typescript
// Your E2E test:






































```

**Why must E2E tests avoid implementation details?** _____________________

### C2: Accessibility Testing

Add axe-core accessibility check to the test:

```typescript
// Your accessibility assertion:











```

**Critical WCAG level to maintain:** ___________________________________

---

## Section D: Testing Strategy & Trade-offs (15 minutes)

### D1: What NOT to Test

List 3 things in your codebase that don't need tests:

1. ________________________________ (why: _______________)
2. ________________________________ (why: _______________)
3. ________________________________ (why: _______________)

### D2: Test Coverage Philosophy

**Question:** What coverage percentage should you target? Why?

```
Target: ____%

Justification:
- ___________________________________________
- ___________________________________________
```

### D3: Your Codebase Test Commands

Map your npm scripts to their purposes:

| Script | Purpose | When to Run |
|--------|---------|-------------|
| `test` | | |
| `test:watch` | | |
| `test:coverage` | | |
| `test:homepage:unit` | | |
| `test:homepage:component` | | |
| `test:homepage:e2e` | | |

---

## Section E: Open-Book Verification (10 minutes)

### E1: Vitest vs Jest Differences

| Feature | Vitest | Jest |
|---------|--------|------|
| ESM support | | |
| TypeScript | | |
| Speed | | |
| Migration effort from Jest | | |

### E2: Playwright vs Cypress

Why did your codebase choose Playwright?
```
Reason 1: ___________________________________________
Reason 2: ___________________________________________
```

### E3: Corrections from closed-book

| Test Type | My Implementation | Correct Pattern | Gap |
|-----------|-------------------|-----------------|-----|
| Unit | | | |
| Async | | | |
| Component | | | |
| E2E | | | |

---

## Final Attestation

**I can now:**
- [ ] Write unit tests without reference
- [ ] Mock dependencies appropriately
- [ ] Write E2E tests for critical paths
- [ ] Include accessibility testing
- [ ] Decide what to test and what to skip

**Commitment:** I will not commit code without corresponding tests for critical paths. ___

**Signed:** _________________ **Date:** ___________

---

## Cross-Reference

**Prerequisites:** JS/TS fundamentals, async/await, React lifecycle

**Dependents:**
- CI/CD integration (Layer 2)
- TDD workflow (Layer 2)
- Performance testing (Layer 2)

**Authoritative Sources:**
1. https://vitest.dev/guide/
2. https://playwright.dev/docs/intro
3. https://testing-library.com/docs/react-testing-library/intro/
4. Your `vitest.config.mts` and `playwright.config.ts`

---

*Examination Version: 1.0*
*Methodology: Ericsson Deliberate Practice + Feynman Technique*
