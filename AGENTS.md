# Agent Coding Guidelines - Sang-Logium

> **Single source of truth for all AI coding agents.**
> Tool-specific wrappers: [`.windsurfrules`](.windsurfrules) (Windsurf), [`.cursorrules`](.cursorrules) (Cursor)
> Quick reference: [`examples/gold-standard.tsx`](examples/gold-standard.tsx) | Feedback: [`.windsurf/feedback-loop.md`](.windsurf/feedback-loop.md)

---

## Core Philosophy

**Signal Density Optimization:** Maximize load-bearing facts before expensive operations. Ground factor = (verified facts) ÷ (time cost).

**Cover & Move:** Establish defensive positions (testing, validation) before advancing. Never leave critical paths uncovered.

---

## Architecture Constraints

### Next.js 15 App Router
- **Server Components are default** — no arbitrary `"use client"` directives
- **Parallel data fetching** — use `Promise.all()` to reduce waterfalls
- Server-first routing is absolute default

**Server vs Client Component Example:**
```typescript
// ✅ CORRECT: Server Component for data (default)
// app/products/page.tsx
import { sanityClient } from '@/sanity/lib/client'

export default async function ProductsPage() {
  const products = await sanityClient.fetch(productsQuery)
  return <ProductGrid products={products} />
}

// ✅ CORRECT: Client Component for interactivity
// components/AddToCartButton.tsx
'use client'
import { useState } from 'react'

export function AddToCartButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false)
  return <button onClick={handleClick} disabled={loading}>Add</button>
}

// ❌ WRONG: Unnecessary 'use client'
'use client'  // <- No state, effects, or handlers!
export function ProductCard({ product }) {
  return <div>{product.name}</div>
}
```

### Sanity CMS & Type Safety
- **Sanity Typegen outputs are source of truth** — never manually define conflicting types
- Use `Pick<SanityProduct, 'field'>` pattern for type extraction
- GROQ reference syntax: `brand->name` (not `brand->{name}`)
- Run `npm run typegen` before type-related changes

**GROQ Syntax Example:**
```typescript
// ✅ CORRECT: Single field access
const query = `*[_type == "product"] {
  name,
  brand->name,     // <- Single field: use ->name
  pricePln
}`

// ✅ CORRECT: Multi-field projection
const query = `*[_type == "product"] {
  brand->{         // <- Multi-field: use ->{}
    _id,
    name,
    slug
  }
}`

// ❌ WRONG: Single field with braces
const query = `*[_type == "product"] {
  brand->{name}    // <- WRONG! Use brand->name
}`
```

### Styling
- **Tailwind utility classes ONLY** — scoped, no global CSS modifications
- Use design tokens from `tailwind.config.ts`

### Testing (Vitest ONLY — Jest Prohibited)
- **Import-only discipline:** Unit tests MUST import from source files — no copying, no "test utils" that duplicate logic
- **Zero phantom coverage:** Tests must fail to compile if source function doesn't exist
- **Test behavior, not implementation:** Focus on user outcomes, not DOM structure
- **Minimal tests:** Least, smallest tests for full-impact coverage

**Example — Correct Vitest Pattern:**
```typescript
// ✅ CORRECT: Import from Vitest and source
import { describe, it, expect } from 'vitest'
import { calculateTotal } from '@/lib/cart'

describe('cart', () => {
  it('calculates total', () => {
    expect(calculateTotal([{ price: 10 }])).toBe(10)
  })
})

// ❌ WRONG: Using Jest
describe('test', () => {  // Error: 'describe' is not defined
  it('fails', () => {})
})
```

### Critical Anti-Patterns (NEVER)
| Anti-Pattern | Correct Approach |
|--------------|------------------|
| `cloneElement` for prop injection | React Context |
| Jest (any usage) | Vitest exclusively |
| Direct Sanity queries in components | Server Components with prebuilt props |
| `useQueryState` without null checks | `(filters \|\| []).map()` or `const [filters = []] = useQueryState(...)` |
| Playwright without 4-state checklist | Define BEFORE/TARGET/ACTION/AFTER states explicitly |

**cloneElement vs Context Example:**
```typescript
// ❌ WRONG: cloneElement
import { cloneElement, Children } from 'react'
function ThemeProvider({ children, theme }) {
  return Children.map(children, child =>
    cloneElement(child, { theme })  // DON'T DO THIS
  )
}

// ✅ CORRECT: React Context
import { createContext, useContext } from 'react'
const ThemeContext = createContext('light')
function ThemeProvider({ children, theme }) {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  )
}
function ThemedButton() {
  const theme = useContext(ThemeContext)  // Clean, no prop drilling
  return <button className={theme}>Click</button>
}
```

**useQueryState Null Check Example:**
```typescript
// ❌ WRONG: Direct usage without null check
const [filters] = useQueryState('filters')
return <div>{filters.map(f => <span>{f}</span>)}</div>
// ^ CRASH: filters undefined during hydration!

// ✅ CORRECT: Pattern 1 — Default value in destructuring
const [filters = []] = useQueryState('filters', { defaultValue: [] })

// ✅ CORRECT: Pattern 2 — Fallback expression
const [filters] = useQueryState('filters')
return <div>{(filters || []).map(f => <span>{f}</span>)}</div>
```

---

## Universal Prevention Rules

- **Pre-Flight:** Branch check → baseline build verification → scope lock confirmation
- **Build Time Destruction:** Build runs BANNED except after big sprints or pre-deployment
- **AS-SIMPLE-AS-POSSIBLE:** If it takes >5 min to explain or >1 page to document, it's too complex
- **Human-First Sprint:** UX flows → End-state overview → Architecture contract → Tiny scope contracts → Verify immediately
- **Test Import Discipline:** Tests must import from source — never recreate logic locally

**Test Import Discipline Example:**
```typescript
// tests/utils.test.ts

// ✅ CORRECT: Import from source
import { generateFingerprint } from '@/lib/checkout/reservation/fifo-queue'

describe('generateFingerprint', () => {
  it('creates unique fingerprint', () => {
    const result = generateFingerprint({ type: 'test', payload: {} })
    expect(result).toBeDefined()
  })
})

// ❌ WRONG: Copying implementation into test
class TestUtils {  // <- Function copy - will drift from source!
  static generateFingerprint(request) {
    return JSON.stringify({
      type: request.type,
      payload: request.payload
      // Missing priority field - drift from source!
    })
  }
}
```

---

## Opus Specification Standards

### Sprint Specs Must Include:
1. **Gap Coverage Mapping** — Every scope contract references audit gaps (G1, G2...)
2. **Line-Number Precision** — Exact file paths and line ranges
3. **Constraint-First Architecture** — Scope Lock Rules section FIRST
4. **Layer-Based Sequencing** — Pass 1: Skeleton → Pass 2: Data → Pass 3: Build
5. **Verifiable DoDs** — Objective pass/fail criteria only

### Audit Specs Must Follow 8-Part Structure:
Design System Summary → Research-Verified Best Practices → Component-by-Component Audit → Design Ratings → Gap Analysis → Sequenced Change Specifications → Verification Checklist → Expected Results

---

## Common Mistakes (from Feedback Loop)

See [`.windsurf/feedback-loop.md`](.windsurf/feedback-loop.md) for:
- Recently discovered agent mistakes
- Pattern updates to AGENTS.md
- Weekly review notes

**Current High-Priority Patterns:**
- Test import discipline violations
- GROQ reference syntax errors (`->{` vs `->`)
- `useQueryState` null check omissions
- Playwright worker/timeouts misconfiguration (Windows)

---

## Quick Command Reference

| Need to... | Command | Workflow Location |
|------------|---------|-------------------|
| Implement feature | `/implement` | `.windsurf/workflows/implement.md` |
| Debug issue | `/debug` | `.windsurf/workflows/debug.md` |
| Sprint planning | `/sprint` | `.windsurf/workflows/sprint.md` |
| Audit codebase | `/audit` | `.windsurf/workflows/audit.md` |
| Learn from work | `/learn` | `.windsurf/workflows/learn.md` |

---

## Deterministic Guardrails

These are enforced by CI/CD. Generated code MUST pass:

```bash
npm run lint      # ESLint with custom rules
npm run typecheck # TypeScript strict mode
npm run test:unit # Vitest (zero mocks policy)
```

**Custom Lint Rules (enforced by CI):**

| Rule | Violation | AGENTS.md Reference |
|------|-----------|---------------------|
| `no-restricted-imports` (jest) | Importing from `jest` or `@testing-library/jest-dom` | Testing Rules |
| `sang-logium/no-clone-element` | Using `cloneElement` for prop injection | Critical Anti-Patterns |
| `sang-logium/groq-reference-syntax` | Using `brand->{name}` instead of `brand->name` | GROQ rules |
| `sang-logium/no-direct-sanity-in-client` | `sanityClient.fetch()` in Client Components | Architecture Constraints |
| `sang-logium/useQueryState-null-check` | Missing null check for useQueryState result | Critical Anti-Patterns |
| `sang-logium/test-import-discipline` | Test defines function existing in source | Testing Rules |
| `no-undef` | `describe()` without importing from Vitest | Testing Rules |
| `sang-logium/server-component-default` | Unnecessary `'use client'` directive | Architecture Constraints |

**When CI Fails:**
1. Read the error message (references AGENTS.md section)
2. Check `examples/gold-standard.tsx` for correct pattern
3. Fix the violation
4. Re-run `npm run lint` before committing

---

## Detailed Documentation

- **Handbook:** `_handbook/` — orchestration principles, command deep-dives
- **Lessons:** `_project/lessons/` — searchable pattern library
- **Research:** `_project/research/` — verified technical decisions

---

**Last Updated:** 2026-04-16
**Version:** 1.1
**Owner:** Human + AI Agent Team
