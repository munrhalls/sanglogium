# Layer 1 Examination: TypeScript 5.x

## Pre-Examination Attestation
**Date:** ___________  **Time:** ___________  **Duration:** 90 minutes

**Prerequisites:**
- [ ] JavaScript ES2022+ features (classes, async/await, modules)
- [ ] Basic type theory (what is a type system?)

**I attest I can implement JavaScript algorithms without reference:** _________________

---

## Section A: First Principles Foundation (20 minutes)

### A1: What Is A Type System?

**Question 1: From first principles, why do type systems exist?**

*Not "what does TypeScript do" - why did computer scientists invent type systems in the first place?*

Your explanation (connect to program correctness and proof theory):
```
[Write 150+ words - reference Curry-Howard correspondence if known]













```

**Gap Detection:** What am I missing about runtime vs compile-time guarantees?
```





```

### A2: Structural vs Nominal Typing

**Question 2: TypeScript uses structural typing. Java uses nominal typing. What is the fundamental difference?**

Explain with a concrete code example showing where they diverge:

```typescript
// Show the divergence:















```

**When would nominal typing be preferable?** _________________________________

---

## Section B: Closed-Book Type System Implementation (30 minutes)

**Implement these WITHOUT documentation or IDE autocomplete.**

### B1: Generic Constraints & Conditional Types

Create a type utility that:
1. Accepts a generic `T`
2. Checks if `T` has a `length` property
3. If yes, returns the type of `length`
4. If no, returns `never`

```typescript
// Your implementation:






```

**Test cases it must handle:**
```typescript
type T1 = YourType<string>; // should be number
type T2 = YourType<number>; // should be never
type T3 = YourType<unknown[]>; // should be number
```

### B2: Mapped Types with Key Remapping

Create a type that transforms an object's keys from snake_case to camelCase.

Input: `{ user_id: string; created_at: Date }`
Output: `{ userId: string; createdAt: Date }`

```typescript
// Your implementation (use `as` clause in mapped types):














```

**Self-assessment:** Can I explain why `as` enables this? ___________

### B3: Discriminated Unions & Exhaustiveness

Create a handler function for a discriminated union that TypeScript guarantees is exhaustive.

```typescript
// The union:
type Event = 
  | { type: 'user_login'; userId: string }
  | { type: 'user_logout'; userId: string }
  | { type: 'purchase'; amount: number };

// Your implementation (must use never-check for exhaustiveness):


















```

**The compile-time guarantee this provides:** _________________________________

### B4: The `infer` Keyword

Implement `ReturnType<T>` from scratch using `infer`.

```typescript
// Your implementation:





```

**What `infer` actually does (execution model):** _________________________________

---

## Section C: Error Analysis & Debugging (15 minutes)

### C1: The "excess property check" confusion

**Scenario:** This code errors, but the types seem compatible. Why?

```typescript
interface Config {
  host: string;
  port: number;
}

function setup(config: Config) {}

setup({ host: 'localhost', port: 3000, timeout: 5000 });
//     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//     Error: Object literal may only specify known properties
```

**Why this errors (structural typing analysis):**
```





```

**Two ways to fix (with trade-offs):**
1. _________________________________________ (trade-off: ___________)
2. _________________________________________ (trade-off: ___________)

### C2: The `any` vs `unknown` escape hatch

**Question:** When is `any` EVER justified over `unknown`?

Your answer (with specific scenario):
```





```

**My commitment:** I will use `unknown` by default and document every `any` usage. ___ (initial)

### C3: Type Widening Narrowing

**Scenario:** Why does this behave unexpectedly?

```typescript
const config = {
  mode: 'development', // type is string, not 'development'
  port: 3000,          // type is number, not 3000
};
```

**Fixes (provide all three):**
1. `as const` - explain the mechanism: _________________________________
2. Explicit type annotation - when to use: ____________________________
3. satisfies operator (TS 4.9+) - what it preserves: ______________________

---

## Section D: Your Codebase Specifics (15 minutes)

### D1: Sanity TypeGen Integration

In your codebase, examine `sanity.types.ts`:

**Pattern to identify:** How does TypeGen represent GROQ query results?

```typescript
// Find an example and explain the type pattern:










```

**Critical integration point with Next.js:** _________________________________

### D2: Zod Schema Integration

Examine your form validation. How do Zod schemas relate to TypeScript types?

**The pattern (infer the type from schema):**
```typescript
import { z } from 'zod';

// Show the pattern used in your codebase:













```

**Why this is architecturally significant:** _________________________________

---

## Section E: Open-Book Verification (10 minutes)

**Consult TypeScript 5.x documentation.**

### E1: Version 5.0+ features you MUST know

1. **Decorators (stage 3):** _____________________________________________
2. **const type parameters:** ___________________________________________
3. **satisfies operator importance:** ______________________________________

### E2: Your corrections from closed-book

| Topic | My Implementation | Correct Implementation | Conceptual Gap |
|-------|-------------------|------------------------|----------------|
| B1 conditional types | | | |
| B2 mapped types | | | |
| B3 exhaustiveness | | | |
| B4 infer | | | |

---

## Final Attestation

**I can now:**
- [ ] Explain structural typing from first principles
- [ ] Implement conditional/mapped types without reference
- [ ] Debug complex type errors systematically
- [ ] Use `infer` for type extraction
- [ ] Ensure exhaustiveness in union handling

**Critical gaps requiring re-examination:**
- [ ] ___________________________________________
- [ ] ___________________________________________

**Signed:** _________________ **Date:** ___________

---

## Cross-Reference

**Prerequisites:** JavaScript ES2022+, basic type theory

**Dependents:**
- Zod Schema Validation (Layer 2)
- Sanity TypeGen Integration (Layer 2)
- React Component Typing (Layer 2)

**Conflicts/Alternatives:**
- Flow (Facebook's type system - deprecated, do not use)
- JSDoc types (transitional, not for new code)
- Any (the anti-pattern, avoid)

**Authoritative Sources:**
1. https://www.typescriptlang.org/docs/handbook/intro.html
2. https://github.com/microsoft/TypeScript/wiki/Roadmap
3. https://www.totaltypescript.com/ (Matt Pocock - practical patterns)

---

*Examination Version: 1.0*
*Methodology: Ericsson Deliberate Practice + Feynman Technique*
