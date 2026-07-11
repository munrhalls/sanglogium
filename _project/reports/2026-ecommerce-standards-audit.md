# Sang Logium vs. 2026 E-Commerce Standards — Audit

Date: 2026-07-11

## Scope

This audits Sang Logium against two things: (1) what 2026 e-commerce best
practice actually requires — performance, checkout UX, SEO — and (2) what
makes an e-commerce build read as a *serious* portfolio piece to a hiring
manager rather than a tutorial clone. Findings below come from a live
read-only survey of the codebase (`app/`, `next.config.ts`,
`lighthouserc.cjs`, `package.json`, git status) plus current research.

## What "good" looks like in 2026

**Checkout.** Roughly 7 in 10 shoppers who reach checkout abandon it; 22%
cite complexity, 47% cite surprise shipping costs, 63% will leave if guest
checkout isn't available or easy to find. The target is 2–3 steps, shipping
cost shown before the final page, and account creation deferred until
*after* order confirmation rather than gating the purchase.
([Salesforce](https://www.salesforce.com/commerce/online-payment-solution/checkout-guide/),
[SIA Design](https://siadesign.ee/en/blog/ecommerce-checkout-ux-2026/))

**Performance.** 3-second load is the hard line — each extra second costs
~7% conversion — and mobile is 60%+ of traffic despite converting at half
the desktop rate, so mobile performance carries more weight than the
traffic split alone suggests.
([DigitalApplied](https://www.digitalapplied.com/blog/ecommerce-checkout-optimization-2026-ux-guide))

**Next.js architecture.** Server Components as the default with Client
Components only where interactivity requires it, ISR/ on-demand revalidation
for product data instead of pure per-request SSR, `generateStaticParams`
for high-traffic product pages, and Product + Breadcrumb JSON-LD structured
data are all treated as baseline in 2026, not nice-to-haves.
([Naturaily](https://naturaily.com/blog/nextjs-ecommerce))

**Portfolio signal.** Hiring managers are explicit that "don't fake the
checkout" is the bar: real Stripe integration with webhooks, inventory that
can't oversell, a working admin panel, live deployment — all of which
Sang Logium already has. The differentiator at the margin is documentation
depth and evidence of engineering judgment, and — increasingly — a
non-trivial AI feature that does real work rather than a ChatGPT wrapper.
([Hakia](https://hakia.com/skills/building-portfolio/),
[dev.to](https://dev.to/devraj_singh7/the-portfolio-projects-that-actually-get-you-hired-in-2026-1l0e))

## Where Sang Logium stands

**Strong, already at or above bar:**

Real Stripe Payment Intents with Embedded Elements, a 4-step checkout
(address → shipping → payment → success) backed by server actions,
Redis-backed inventory reservations with an expiry cleanup job, and Google
Maps address validation. Faceted catalogue browsing (price/stock sliders,
sort, URL-synced filter state via `nuqs`) and real GROQ-backed search with
autocomplete — this is well past template-project territory. `next.config.ts`
has tuned AVIF/WebP image config, `optimizeCss`, bundle analysis wired up,
and `lighthouserc.cjs` enforces real CI budgets (LCP<3s, CLS<0.1,
TTFB<600ms, 150KB unused-JS budget) across homepage/product/category —
that's a more disciplined performance gate than most production stores run,
let alone portfolio projects. Server Components are the default (66% of
`app/` files have no `"use client"`), and Suspense streaming is used on
search.

**Gaps against the 2026 bar:**

No JSON-LD structured data anywhere in the codebase — for a 500+ SKU
catalogue this is the single highest-leverage SEO gap, since Product/
Breadcrumb schema is what makes rich results and shopping-graph inclusion
possible at all. Only one route (`homepage`, `revalidate = 3600`) uses
explicit ISR; product and catalogue pages don't appear to use
`generateStaticParams` or deliberate revalidation, so it's unclear the
500-product catalogue benefits from static generation the way 2026
architecture assumes. `generateMetadata` is used on only 4 routes.
Sentry, Pino, and Google Analytics are named as core infrastructure in the
README but the actual config files (`sentry.server.config.ts`,
`instrumentation.ts`, `GoogleAnalytics.tsx`) are sitting **uncommitted** —
so as of right now the live deployment has none of the observability the
README claims. There's no customer-facing AI feature — search and catalogue
are conventional GROQ queries; an unused `chromadb` dependency suggests this
was planned but not shipped, which matters for 2026 portfolio
differentiation specifically.

**Repo hygiene (blocks everything else):** `git status` shows 314 changed
files on `main` — the working tree is not in a state that could be handed
to a reviewer or hiring manager as-is. This should be triaged before any of
the items below.

## Priority punch list

1. **Commit or discard the 314 pending changes**, starting with the
   observability files (Sentry/Pino/GA) — either finish wiring them and
   commit, or remove the README claims until they're real. A recruiter
   clicking into the repo today would see an inconsistent story between
   README and code.
2. **Add Product + BreadcrumbList JSON-LD** to `product/[slug]` and the
   catalogue routes. This is the highest ROI SEO fix available and is
   currently completely absent.
3. **Fix or delete the dead Playwright scripts** in `package.json` that
   reference non-existent `tests/e2e/*` paths — a broken `npm run
   test:e2e` is a bad first impression for anyone who clones the repo.
4. **Resolve the duplicate Stripe webhook routes** (`api/webhook` vs
   `api/webhooks/stripe`) — ambiguous payment-handling code is a red flag
   in review.
5. **Extend `generateMetadata`/ISR coverage** beyond the 4 current routes
   to the rest of the catalogue and account pages; decide deliberately
   between static generation and dynamic rendering per route rather than
   defaulting.
6. **Finish or cut the Sentry/Pino/GA integration** — half-wired
   observability is worse for a portfolio narrative than not claiming it
   yet.
7. **Replace the README "Screenshots — placeholder" section** — for an
   e-commerce project this is often the first thing a reviewer looks at.
8. **Decide on the AI feature** — either ship something using the unused
   `chromadb` dependency (e.g., semantic product search or
   recommendations) as a genuine differentiator, or remove the dependency
   so it doesn't read as abandoned scope.
9. **Add missing `loading.tsx` states** for basket, account, and
   checkout/address & payment routes for perceived-performance
   consistency with the rest of the app.
10. **Wire an a11y test into CI** — `@axe-core/playwright` is installed and
    a `test:homepage:a11y` script exists, but no test file backs it; only
    Lighthouse's ≥0.9 score currently gates accessibility.

## Filing these as bd issues

`bd` isn't installed in this sandboxed environment, so these weren't filed
directly. Ready-to-run commands (adjust priority/type as you see fit):

```bash
bd create "Triage and commit/discard 314 pending changes on main" -p 0 -t chore
bd create "Add Product + BreadcrumbList JSON-LD to product and catalogue pages" -p 1 -t feature
bd create "Fix or remove dead Playwright scripts referencing nonexistent tests/e2e paths" -p 1 -t bug
bd create "Resolve duplicate Stripe webhook routes (api/webhook vs api/webhooks/stripe)" -p 1 -t bug
bd create "Extend generateMetadata and deliberate ISR/SSG coverage across catalogue and account routes" -p 2 -t feature
bd create "Finish or remove Sentry/Pino/GA integration to match README claims" -p 1 -t chore
bd create "Replace README screenshots placeholder with real screenshots" -p 2 -t chore
bd create "Ship or remove the unused chromadb dependency (semantic search/recommendations)" -p 2 -t feature
bd create "Add loading.tsx for basket, account, checkout/address, checkout/payment routes" -p 3 -t chore
bd create "Wire up @axe-core/playwright a11y test backing the test:homepage:a11y script" -p 2 -t chore
```

## Sources

- [eCommerce Checkout Optimization: UX Guide 2026 — DigitalApplied](https://www.digitalapplied.com/blog/ecommerce-checkout-optimization-2026-ux-guide)
- [Ecommerce Checkout: 10 Best Practices for 2026 — Salesforce](https://www.salesforce.com/commerce/online-payment-solution/checkout-guide/)
- [Ecommerce Checkout UX 2026: The 2–3 Step Rule — SIA Design](https://siadesign.ee/en/blog/ecommerce-checkout-ux-2026/)
- [Next.js for Ecommerce: Architecture, SEO, and Real Builds — Naturaily](https://naturaily.com/blog/nextjs-ecommerce)
- [Developer Portfolio Guide 2026 — Hakia](https://hakia.com/skills/building-portfolio/)
- ["The Portfolio Projects That Actually Get You Hired in 2026" — dev.to](https://dev.to/devraj_singh7/the-portfolio-projects-that-actually-get-you-hired-in-2026-1l0e)
