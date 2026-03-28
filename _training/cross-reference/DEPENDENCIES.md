# Cross-Reference: Tech Stack Dependencies

## Prerequisite Map

### Critical Path
```
JavaScript Fundamentals
    ↓
TypeScript Basics
    ↓
React Fundamentals
    ↓
Next.js App Router ←→ React Server Components
    ↓
Next.js + Sanity Integration
    ↓
Systems Architecture
```

### Parallel Tracks
```
Track A: Frontend Architecture          Track B: Data & State
├── React 18                              ├── Sanity CMS
├── TypeScript 5.x                        ├── GROQ
├── Tailwind CSS 3.x                      └── Zustand
└── Next.js App Router
                                        Track C: Quality
Track D: Integration                    ├── Testing (Vitest/Playwright)
├── React + TypeScript                    └── Forms (RHF + Zod)
└── Next.js + Sanity
```

---

## Technology Dependency Matrix

| Technology | Hard Dependencies | Soft Dependencies | Used With |
|------------|-------------------|-------------------|-----------|
| **Next.js 15** | React 18, Node.js 18+ | TypeScript | React, Tailwind |
| **React 18** | JavaScript ES2022+ | TypeScript | All frontend |
| **TypeScript 5.x** | JavaScript knowledge | React patterns | All code |
| **Tailwind 3.x** | CSS fundamentals | PostCSS | React components |
| **Sanity 3.x** | TypeScript, HTTP | React | Next.js Server Components |
| **GROQ** | JSON understanding | GraphQL knowledge | Sanity only |
| **Zustand** | React hooks | TypeScript | Client components |
| **Vitest** | JavaScript/TypeScript | Jest knowledge | Unit testing |
| **Playwright** | Async/await, DOM | Testing concepts | E2E testing |
| **RHF + Zod** | React, TypeScript | Form UX patterns | All forms |
| **Clerk** | Next.js middleware | Auth concepts | Protected routes |
| **Stripe** | Payment concepts | PCI compliance | Checkout flow |

---

## Integration Points

### Next.js ↔ Sanity
- **Pattern:** Server Component fetches via Sanity client
- **Type Safety:** Sanity TypeGen generates types
- **Caching:** Next.js caches fetch, Sanity CDN caches content
- **Failure Mode:** Stale content, type mismatches
- **Files to Study:**
  - `lib/sanity/client.ts`
  - `lib/sanity/queries/`
  - `app/(store)/products/page.tsx`

### React ↔ TypeScript
- **Pattern:** Generic components with proper prop types
- **Type Safety:** Strict prop checking, event typing
- **Failure Mode:** `any` types, untyped refs
- **Files to Study:**
  - Any `.tsx` file in `app/components/`
  - `store/store.ts`

### Tailwind ↔ Design System
- **Pattern:** Custom tokens in config, component classes
- **Type Safety:** N/A (runtime CSS)
- **Failure Mode:** Arbitrary values, specificity wars
- **Files to Study:**
  - `tailwind.config.ts`
  - `app/globals.css`

### Forms ↔ Validation
- **Pattern:** React Hook Form + Zod resolver
- **Type Safety:** Inferred types from schema
- **Failure Mode:** Schema drift, validation mismatch
- **Files to Study:**
  - Any form in `app/(store)/`
  - Zod schemas

---

## Conflict Resolution

### When Patterns Compete

| Conflict | Resolution | Rationale |
|----------|------------|-----------|
| Server vs Client Component | Default to Server, mark Client explicitly | Performance |
| Zustand vs React Context | Zustand for global, Context for scoped | Bundle size |
| CSS Modules vs Tailwind | Tailwind only (per user rules) | Consistency |
| Any vs Unknown | Always use Unknown first | Type safety |

---

## Anti-Pattern Detection

### Common Violations in Your Codebase

| Anti-Pattern | Location | Fix Priority |
|--------------|----------|--------------|
| Brand as string (not reference) | `productType.ts` | HIGH |
| `any` types | Search codebase | HIGH |
| Missing tests | Identify gaps | MEDIUM |
| Sequential data fetching | Find waterfalls | MEDIUM |

---

## Version Compatibility

### Current Stack (March 2026)
```
Next.js: 15.5.9
React: 18.3.1
TypeScript: 5.x
Tailwind: 3.3.5
Sanity: 3.74.1
Zustand: 5.0.1
Vitest: 4.0.13
Playwright: 1.56.1
```

### Upgrade Paths to Monitor
- Next.js 16 (App Router improvements)
- React 19 (Server Actions stable)
- Tailwind 4.0 (Performance)
- Sanity 4.x (Breaking changes?)

---

## Cross-Validation Checklist

When learning any topic, verify with:

- [ ] Official documentation (first)
- [ ] Actual codebase usage (second)
- [ ] Generated types (if applicable)
- [ ] Test files for examples
- [ ] Configuration files for settings

---

*Document Version: 1.0*
