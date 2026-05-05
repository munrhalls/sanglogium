# CV-Ready Open Source Contributions

## 1. Publish ESLint Plugin
Package `eslint-plugin-sang-logium.cjs` as an npm module with 5 architecture-enforcement rules:
- "use client" auto-detection (only when interactivity is present)
- No direct Sanity queries in Client Components
- GROQ reference syntax validation
- useQueryState null-safety check
- Test import discipline (prevent copy-paste implementations)

No existing open-source plugin combines all five. High visibility, fast to ship.

---

## 2. Contribute Zustand Persist Improvements
Extract patterns from `basketStore.ts` into a PR or standalone middleware:
- SSR hydration mismatch fix for Next.js
- Cross-tab sync via storage events
- localStorage → sessionStorage fallback for private browsing / Safari ITP
- Zod schema validation on rehydration with automatic reset on corruption

Targets open issues #510 and discussion #2788 that maintainers haven't resolved.

---

## 3. Write "Integration Tests Against Real Infrastructure" Pattern
Publish the testing approach from `tests/checkout-queue/` as a blog post + example repo:
- Zero mocks: tests hit live Redis and Sanity CMS
- Automated test data seeding and stock reset between tests
- Correlation ID tracing across async boundaries
- Proper cleanup on failure to prevent test data pollution

99% of developers mock everything. This pattern is genuinely rare and highly shareable.
