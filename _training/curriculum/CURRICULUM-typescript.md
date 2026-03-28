# Curriculum: TypeScript 5.x Mastery

## Course Overview
**Duration:** 10 days daily study
**Examination:** L1-02-typescript.md
**Prerequisites:** JavaScript ES2022+, basic type theory

---

## Module 1: Type System Foundations (Days 1-3)

### Day 1: Why Type Systems Exist
**Core Concept:** Type theory, program correctness, structural vs nominal

**Study:**
- Read: TypeScript Handbook (typescriptlang.org/docs/handbook/intro.html)
- Read: Structural typing explanation
- Watch: TypeScript in 50 Lessons (Stefan Baumgartner)

**Practice:**
- Explain structural typing with examples
- Compare TypeScript vs Java types
- Write types for plain JS objects

**Validation:**
- Can explain why TypeScript uses structural typing
- Can predict type compatibility

### Day 2: Generics Deep Dive
**Topics:** Generic constraints, defaults, inference

**Study:**
- Read: typescriptlang.org/docs/handbook/2/generics.html
- Read: Conditional types introduction

**Practice:**
- Implement generic Stack<T>
- Create generic identity function with constraints
- Use generic with keyof

**Code Challenges:**
```typescript
// 1. Generic with multiple constraints
function merge<T, U>(obj1: T, obj2: U): _______

// 2. Generic with default
function createArray<T = string>(length: number): _______

// 3. Generic keyof pattern
function getProperty<T, K extends keyof T>(obj: T, key: K): _______
```

### Day 3: Advanced Types
**Topics:** Mapped types, conditional types, template literal types

**Study:**
- Read: Mapped types documentation
- Read: Conditional types (infer keyword)

**Practice:**
- Implement Partial<T> from scratch
- Create DeepReadonly<T>
- Use infer with ReturnType

**Code Challenges:**
```typescript
// Implement these utility types:
type DeepReadonly<T> = _______
type PickByValue<T, V> = _______
type CamelCase<S extends string> = _______
```

---

## Module 2: TypeScript in Practice (Days 4-7)

### Day 4: React Component Typing
**Topics:** Props, children, events, refs

**Practice:**
- Type Button with polymorphic 'as' prop
- Type Form with generic onSubmit
- Type List with render prop

**Code Challenge:**
```tsx
// Create fully typed Button:
// - Polymorphic (as="button" | "a" | Component)
// - Ref forwarding
// - Variant props with autocomplete
// - Disabled state handling
```

### Day 5: API & Async Patterns
**Topics:** Fetch typing, error handling, result types

**Practice:**
- Create Result<T, E> type
- Type API client with method generics
- Handle async/await errors properly

**Code Challenge:**
```typescript
// Type-safe fetch wrapper:
function apiFetch<T>(url: string): Promise<Result<T, ApiError>>

// Must handle:
// - JSON parsing errors
// - HTTP error status
// - Network failures
// - Timeout handling
```

### Day 6: Type Guards & Narrowing
**Topics:** typeof, instanceof, in, is, asserts

**Practice:**
- Write custom type guards
- Use asserts for preconditions
- Implement exhaustive switch checks

**Code Challenge:**
```typescript
// Discriminated union handling:
type Shape = 
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; side: number }
  | { kind: 'triangle'; base: number; height: number };

// Write area function with exhaustiveness checking
function area(shape: Shape): number {
  // Implementation with never check
}
```

### Day 7: Declaration Files & External Types
**Topics:** .d.ts files, module augmentation, @types

**Practice:**
- Create declaration for untyped library
- Augment existing types
- Publish type definitions

---

## Module 3: TypeScript Ecosystem (Days 8-10)

### Day 8: Zod Schema Validation
**Topics:** Schema definition, type inference, validation

**Practice:**
- Create product schema with Zod
- Infer TypeScript type from schema
- Implement custom validators

**Code Challenge:**
```typescript
// Complete product schema:
const productSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  // Add: category enum, optional description, tags array
  // Add: nested specifications object
});

type Product = z.infer<typeof productSchema>;
```

### Day 9: Sanity TypeGen Integration
**Topics:** GROQ types, query results, generated types

**Practice:**
- Run sanity typegen
- Use generated types in components
- Handle query-specific types

**Code Challenge:**
Examine your `sanity.types.ts`:
- Identify 5 key generated types
- Trace how they're used in components
- Explain the relationship between schema and types

### Day 10: Configuration & Tooling
**Topics:** tsconfig.json, strict mode, path aliases

**Practice:**
- Optimize tsconfig for project
- Configure path aliases
- Set up strict mode checks

**Review:**
- Your `tsconfig.json` settings
- Strict mode violations in codebase
- Path alias configuration

---

## Daily Schedule

**Morning (45 min):**
- 15 min: Read theory
- 25 min: Code exercises
- 5 min: Self-explanation

**Evening (30 min):**
- 15 min: Review errors
- 15 min: Type challenges (type-challenges.github.io)

---

## Assessment Checkpoints

| Checkpoint | Criteria |
|------------|----------|
| Day 3 | Can implement utility types |
| Day 7 | Can type any React component |
| Day 10 | Zero `any` types in new code |

---

## Resources

**Documentation:**
- typescriptlang.org/docs/handbook
- github.com/type-challenges/type-challenges
- zod.dev

**Practice:**
- type-challenges.github.io
- exercism.org/tracks/typescript
- codewars.com (TypeScript katas)

---

*Curriculum Version: 1.0*
*Outcome: Production-ready TypeScript expertise*
