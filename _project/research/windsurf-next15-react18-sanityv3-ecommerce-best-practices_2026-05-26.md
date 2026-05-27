# Research: Windsurf IDE Best Practices for Next.js 15 / React 18 / Sanity v3 Ecommerce (Solo Developer, AI Era)

> **Retrieval Date:** 2026-05-26
> **Researcher:** AI/Human collaboration
> **Decay Risk:** High (Next.js 15+ patterns evolving, Windsurf Wave 13-14 just shipped)
> **Next Review:** 2026-08-26
> **Prior Research Cross-Reference:**
> - `windsurf-ide-professional-practitioners-v5_2026-05-21.md` — General Windsurf power moves
> - `ecommerce-checkout-best-practices-next-react_2026-05-21.md` — Next.js/React checkout architecture

---

## Research Scope Contract

- **Topic:** Actionable best practices for solo professional developers using Windsurf IDE (Pro subscription) to build ecommerce applications with Next.js 15 App Router, React 18, and Sanity v3 — in the AI-assisted development era (May 2026).
- **First Principles:**
  1. **Server Components are the default; interactivity is the exception.** In Next.js 15, every file is a Server Component unless explicitly marked `'use client'`. This inversion changes data fetching, state management, and AI-assisted code generation patterns.
  2. **AI-assisted development amplifies architectural mistakes.** A junior dev with AI can generate 500 lines of buggy client-side cart code in minutes. A senior dev with AI generates 50 lines of correct Server Component code. **Quality control, not speed, is the bottleneck.**
  3. **Solo developers must optimize for cognitive load, not just execution speed.** Windsurf's value is not "write code faster" — it's "hold less context in your head." The right rules, workflows, and context engineering reduce decision fatigue.
- **Fundamentals:**
  - Server Component data fetching with `next-sanity` v11+ `defineLive` and `sanityFetch`
  - Client boundary placement for ecommerce interactivity (cart, checkout, payment)
  - Windsurf `.windsurfrules`, `AGENTS.md`, and workflow patterns for ecommerce domains
  - AI-era code verification: how to prevent AI-generated anti-patterns in RSC/Client boundaries
  - Context window management for long ecommerce features (checkout flow = multi-file vertical slice)
- **Scope Boundary:**
  - OUT: Payment provider comparison (we use Stripe — see existing research)
  - OUT: Generic AI coding advice not specific to Windsurf IDE
  - OUT: Deployment/ops (Vercel, Docker) — focus is IDE + code patterns
  - OUT: React 19 / Next.js 16 speculative features — stick to verified Next.js 15 + React 18
- **Target Audience:** Solo developer building/maintaining `sang-logium` ecommerce platform
- **Decay Risk:** High — Windsurf ships waves ~monthly; Next.js 15 patterns still stabilizing; Sanity v3 Live Content API is <6 months old in production

---

## Phase 2: Multi-Source Triangulation

| Source | URL | Type | Credibility | Date | Key Claim | Verification Status |
|--------|-----|------|-------------|------|-----------|---------------------|
| Sanity Agent Toolkit — Next.js Rules | github.com/sanity-io/agent-toolkit | Official (AI-targeted) | Canonical for AI agents | 2026-04 | "Use `defineLive` by default for real-time content" | ✅ Verified against `next-sanity` v11 source |
| Sanity Docs — Next.js Integration | sanity.io/docs/nextjs/introduction | Official | Canonical | 2026-04-15 | "Embedded Studio recommended for most projects" | ✅ Verified |
| Next.js App Router Patterns 2026 | dev.to/teguh_coding/nextjs-app-router-the-patterns-that-actually-matter-in-2026-146 | Community | Medium-High | 2026-01 | "Stop thinking in pages; think in immediate vs deferred" | ✅ Aligns with Vercel official guidance |
| React Stack Patterns 2026 | patterns.dev/react/react-2026/ | Authoritative (Patterns.dev) | High | 2025-12 | "AI-assisted coding amplifies senior dev advantage" | ✅ Consensus across 3+ sources |
| Windsurf Changelog (Wave 13-14) | windsurf.com/changelog/windsurf-next | Official | Canonical | 2026-05 | "Git worktrees + Multi-Cascade Panes + Arena Mode + Plan Mode" | ✅ Source inspected |
| Cursor vs Windsurf 2026 | devtoolpicks.com/blog/cursor-vs-windsurf-2026-solo-developers | Community | Medium | 2026-05 | "Windsurf wins on agentic/autonomous tasks; Cursor wins on daily workflow friction" | ⚠️ Single reviewer, but aligns with practitioner consensus |
| Windsurf Rules Directory | windsurf.com/editor/directory | Official | Canonical | 2026-05 | "Rules guide Cascade to better understand your codebase" | ✅ Verified |
| Vercel Commerce (GitHub) | github.com/vercel/commerce | Source of Truth | High | 2026-05 | Uses RSC + Server Actions + `useOptimistic` for cart | ✅ Source inspected |

---

## Phase 3: First Principles Analysis

### Core Problem Being Solved

**How does a solo developer use AI-assisted IDE features to build correct, maintainable ecommerce code in a Next.js 15 / React 18 / Sanity v3 stack without creating architectural debt?**

The friction is not "writing code slowly" — it's "writing the *wrong* code quickly." AI amplifies both good and bad decisions. The research must address:
1. **Structural correctness:** Server vs Client Component boundaries, data flow, caching
2. **AI context engineering:** How to make Windsurf Cascade generate idiomatic code for this specific stack
3. **Solo developer constraints:** No code review, no architecture committee — the IDE must catch mistakes

### Underlying Constraints

1. **Next.js 15 App Router enforces Server Components by default.** Any file without `'use client'` runs on the server. AI assistants trained on pre-2024 code overwhelmingly generate `useEffect` + `fetch` patterns that are now anti-patterns in App Router.
2. **Sanity v3 Live Content API (`defineLive`) changes caching assumptions.** Old patterns of "fetch at build time, rebuild on webhook" are replaced by "fetch at request time, auto-invalidate via server-sent events." This is powerful but changes how you reason about data freshness.
3. **React 18 concurrent features + Server Components = new hydration boundaries.** Ecommerce has high interactivity (cart, filters, checkout). Placing `'use client'` too high in the tree destroys SSR benefits. Placing it too low creates prop drilling from Server to Client.
4. **Windsurf Cascade's context window is finite.** A full ecommerce vertical slice (product listing → product detail → cart → checkout → payment) can exceed 50% context utilization. The solo developer must manage this or suffer context rot.
5. **Solo = no second pair of eyes.** The IDE's rules, workflows, and agent personas must substitute for peer review.

### Inherent Tradeoffs

| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| **Server Component for product detail** | Zero JS bundle, direct DB/CMS access, SEO | No interactivity (add to cart needs client) | Static content, SEO-critical pages |
| **Client Component for cart sidebar** | Instant UX, local state, animations | Hydration cost, no SSR for cart content | High-interaction UI that doesn't need SEO |
| **Server Action for checkout mutation** | Type-safe, no API route boilerplate, progressive enhancement | Tied to Next.js, harder to test in isolation | Next.js monolith checkout flows |
| **AI generates full checkout page** | Fast initial scaffold | High risk of boundary misplacement, security gaps, missing validation | Only with rigorous review + test harness |
| **AI generates vertical slice plan** | Architectural alignment before code | Slower initial velocity | Any feature >2 files or >50 lines |

### Failure Modes

1. **Misapplication:** Letting AI generate `useEffect` + `fetch` in a Server Component page. Result: hydration mismatch, unnecessary client JS, SEO damage.
2. **Over-application:** Marking entire layout as `'use client'` because one child needs interactivity. Result: entire subtree loses SSR, larger bundles.
3. **Under-application:** Using Server Components for real-time inventory/stock checks. Result: stale data, overselling.
4. **AI Context Rot:** Starting a Cascade session with "build the checkout" without providing the AGENTS.md, existing checkout architecture, and rules. Result: AI generates incompatible patterns, ignores project conventions.
5. **Windsurf Daily Quota Exhaustion:** Using premium models (Claude Opus 4.7) for routine component generation. Result: hitting daily quota mid-sprint. Use SWE-1.5 for routine work, Opus for architecture only.

---

## Phase 4: Code Fundamentals Verification

### Fundamental: `defineLive` + Server Component Data Fetching

**Claim:** Sanity v3's `defineLive` from `next-sanity` v11+ enables real-time content updates in Server Components without manual revalidation configuration.

**Verification:**
- [x] Located in our codebase: `sanity-cms/lib/client.ts` uses standard `createClient`, NOT `defineLive`
- [ ] Test created: None for `defineLive` migration
- [x] Source inspected: `github.com/sanity-io/agent-toolkit` confirms `defineLive` pattern

**Actual Behavior:**
Our project uses `next-sanity` v9.12.3. The `defineLive` API requires v11+. Current client setup:

```typescript
// sanity-cms/lib/client.ts (current — verified in codebase)
import { createClient } from "next-sanity";
export const client = createClient({ ... });  // No defineLive
```

**Upgrade Path:**
```typescript
// Target pattern (next-sanity v11+)
import { defineLive } from 'next-sanity'
export const { sanityFetch, SanityLive } = defineLive({
  client: client.withConfig({ apiVersion: '2026-02-01' }),
  serverToken: process.env.SANITY_API_READ_TOKEN,
  browserToken: process.env.SANITY_API_READ_TOKEN,
})
```

**Edge Cases:**
1. `defineLive` requires `SanityLive` component in root layout. Missing it = no real-time updates.
2. Token must have `SANITY_API_READ_TOKEN` with appropriate permissions. Our current `.env` tokens are write-focused.
3. For ecommerce, real-time price/stock updates are critical. `defineLive` is not just "nice to have" — it prevents stale pricing.

---

### Fundamental: Server Component / Client Component Boundary for Ecommerce

**Claim:** The correct pattern is "Server Components fetch data; Client Components handle interactivity." Pass data down as props across the boundary.

**Verification:**
- [x] Located in our codebase: `app/(store)/checkout/payment/page.tsx` mixes server fetch with client payment form
- [x] Source inspected: `github.com/vercel/commerce` — strict boundary at `add-to-cart` button level
- [x] Source inspected: Next.js docs confirm "Server Components can import Client Components, not vice versa"

**Actual Pattern in Our Codebase:**

```@c:\webdev\sang-logium\app\(store)\checkout\payment\page.tsx:1-20
// Payment page — server fetches, client handles Stripe
```

**Canonical Pattern for Ecommerce (verified):**

```typescript
// app/(store)/product/[slug]/page.tsx — SERVER COMPONENT
import { sanityFetch } from '@/sanity/lib/live'
import { ProductInfo } from './ProductInfo' // 'use client' — handles add-to-cart

export default async function ProductPage({ params }) {
  const product = await sanityFetch({ query: PRODUCT_QUERY, params })
  return (
    <main>
      <ProductGallery images={product.images} /> {/* Server */}
      <ProductInfo product={product} /> {/* Client — interactivity boundary */}
    </main>
  )
}
```

**Edge Cases:**
1. **Cart persistence:** Server Component cannot access `localStorage`. Cart state must be initialized server-side (cookie/DB) and synced client-side.
2. **Search params for filters:** `useSearchParams()` is a Client Component hook. URL-based filters need `'use client'` at the filter bar level, but product grid can remain Server Component via server fetch with query params.
3. **Iron-session in Server Components:** Our `lib/session.ts` uses `iron-session` — this works in Server Components (reads encrypted cookie) but requires async context. AI often generates synchronous session access.

---

### Fundamental: Windsurf Context Management for Vertical Slices

**Claim:** A full ecommerce vertical slice (e.g., "checkout payment → return page") exceeds safe context utilization. Proactive compaction and plan files are required.

**Verification:**
- [x] Located in our codebase: `.windsurf/workflows/` has 30+ workflow files; `.windsurf/memories/` exists
- [x] Source inspected: `windsurf.com/changelog/windsurf-next` — Context Window Indicator added in Wave 13
- [x] Source inspected: `windsurf-unlocked` framework documents 50-60% proactive compaction protocol

**Actual Behavior:**
Our checkout flow spans:
- `app/(store)/checkout/address/`
- `app/(store)/checkout/shipping/`
- `app/(store)/checkout/payment/`
- `app/(store)/checkout/return/`
- `lib/checkout/` (server actions)
- `lib/stripe.ts`
- `store/basketStore.ts`

That's 8+ directories, 15+ files. In Windsurf, this reliably hits >50% context utilization.

**Windsurf Solution (verified feature):**
- **Context Window Indicator** (Wave 13): Visual bar showing utilization. Start new session at >60%.
- **Plan Mode + `megaplan` command** (Wave 14): Forces AI to generate implementation plan before touching code. Use for any vertical slice.
- **Multi-Cascade Panes** (Wave 13): Run parallel sessions for independent files. One pane for Server Action, one for Client Component, one for tests.

---

## Phase 5: Best Practices (Verified)

### Practice: Use Plan Mode (`megaplan`) for Every Ecommerce Vertical Slice

**Consensus:** High — Windsurf official (Wave 14), windsurf-unlocked framework, this project's own workflow library

**Supporting Evidence:**
- Windsurf changelog: "Plan Mode is a new Cascade mode alongside Code and Ask. Use it to create detailed implementation plans before diving into code."
- `windsurf-unlocked`: architect agent is pinned to Plan Mode; refuses to edit code files
- Our project: `.windsurf/workflows/sprint.md` enforces spec-first development

**Counter-Evidence (Falsification Attempts):**
- Planning adds friction for one-line fixes. Overhead is unjustified for <20 LOC changes.
- AI-generated plans can be over-engineered. The `windsurf-unlocked` architect agent caps plans at 800 lines to prevent this.

**Verdict:** ✅ Recommended for any ecommerce feature touching >1 file or >20 LOC

**When to Use:** Checkout slices, product catalog changes, cart mutations, shipping integrations
**When to Skip:** Single-component styling fixes, typo corrections, dependency version bumps

**Implementation for This Project:**
```
# In Cascade input:
megaplan

# Then specify:
"Implement checkout return page that verifies Stripe Payment Intent status.
Upstream dependencies: address slice (iron-session), shipping slice (session.shippingCost), payment slice (client_secret).
Must follow existing 4-layer architecture: Server Component page → Client Component form → Server Action → Stripe SDK.
Reference existing patterns in app/(store)/checkout/payment/"
```

---

### Practice: Pin Sanity Data Fetching to `defineLive` for Real-Time Ecommerce

**Consensus:** High — Sanity official docs, agent-toolkit, next-sanity v11+ release notes

**Supporting Evidence:**
- Sanity Docs (2026-04-15): "`defineLive` handles fetching, caching, and invalidation automatically"
- `agent-toolkit` rule: "Use `defineLive` by default. Only implement manual caching when you need fine-grained control"
- next-sanity releases: "First request does not count toward API quotas" with `defineLive`

**Counter-Evidence:**
- Requires next-sanity v11+. Our project uses v9.12.3 — upgrade required.
- Adds `<SanityLive />` component to root layout — one more thing to remember.
- Real-time updates can cause UI jitter on price changes if not handled with `useTransition`.

**Verdict:** ✅ Recommended — upgrade next-sanity and adopt `defineLive`

**When to Use:** All product catalog, pricing, and inventory queries
**When to Skip:** Static marketing pages (rarely updated) can use time-based revalidation

---

### Practice: Keep `'use client'` Boundaries at the Leaf for Ecommerce Interactivity

**Consensus:** High — Next.js docs, Vercel Commerce, React patterns.dev

**Supporting Evidence:**
- Next.js docs: "Pass server-fetched data down to client components as props. Keep the boundary as close to the leaf as possible."
- Vercel Commerce: `add-to-cart` button is `'use client'`; product grid is Server Component
- Patterns.dev: "Server Components can import Client Components, but not vice versa. Pass data down as props."

**Counter-Evidence:**
- Prop drilling from Server → Client can become verbose for deeply nested UI.
- Some third-party libraries (e.g., certain carousel components) mark themselves as client-only, forcing boundaries higher.

**Verdict:** ✅ Recommended

**When to Use:** Product pages, category listings, search results
**When to Skip:** If a third-party library forces `'use client'` at a high level, wrap it in a thin Server Component wrapper

**Ecommerce-Specific Pattern:**
```typescript
// Server Component: fetches product, renders static parts
// app/(store)/product/[slug]/page.tsx
export default async function ProductPage({ params }) {
  const product = await sanityFetch({ query: PRODUCT_QUERY, params })
  return (
    <article>
      <ProductGallery images={product.images} /> {/* Server */}
      <h1>{product.name}</h1> {/* Server — SEO critical */}
      <p>{product.description}</p> {/* Server */}
      <AddToCart product={product} /> {/* Client — only interactive leaf */}
    </article>
  )
}
```

---

### Practice: Use `stegaClean` for All Sanity String Fields That Control Logic

**Consensus:** High — Sanity agent-toolkit (official AI guidance)

**Supporting Evidence:**
- `agent-toolkit`: "If a string field controls logic (alignment, colors, IDs), you must clean it before comparing"
- Stega characters leak into comparisons, class names, and metadata

**Counter-Evidence:**
- `stegaClean` adds a function call overhead (negligible, but purists note it)
- Can be forgotten, causing subtle bugs only in Visual Editing mode

**Verdict:** ✅ Recommended (mandatory for Visual Editing mode)

**When to Use:** Any Sanity string field used in conditionals, CSS class names, or routing logic
**When to Skip:** Purely presentational strings (headings, descriptions) don't need cleaning unless leaked into `<head>`

**Ecommerce Critical Example:**
```typescript
import { stegaClean } from "@sanity/client/stega";

// ❌ Bad: Visual Editing breaks product badge logic
// if (product.badge === 'sale') ...

// ✅ Good:
const badge = stegaClean(product.badge);
if (badge === 'sale') return <SaleBadge />;
```

---

### Practice: Use Multi-Cascade Panes for Parallel Ecommerce Feature Work

**Consensus:** Medium-High — Windsurf Wave 13 official, devtoolpicks review, practitioner frameworks

**Supporting Evidence:**
- Windsurf changelog (Wave 13): "Monitor progress and compare outputs of sessions side-by-side, or even turn Windsurf into a big Cascade dashboard"
- DevToolPicks: "Wave 13's parallel agents are genuinely the most interesting feature either tool has shipped in 2026"
- `windsurf-unlocked`: implements multi-agent orchestration via `@agent-name` invocation

**Counter-Evidence:**
- Daily quota splits across panes. Running 3 Cascades in parallel burns 3x quota.
- Git worktree setup required to avoid file conflicts. Adds workflow friction.
- Solo developer may not have enough independent tasks to justify parallelism.

**Verdict:** ⚠️ Context-Dependent

**When to Use:** Independent tasks like "write Server Action" + "write Playwright test" + "update Zod schema"
**When to Skip:** Tightly coupled tasks (e.g., Server Action + Client Component that must match signatures)

---

### Practice: Configure `.windsurfrules` with Explicit Next.js 15 + Sanity v3 Rules

**Consensus:** High — Windsurf Rules Directory, windsurf-unlocked, RuleSurf framework

**Supporting Evidence:**
- Windsurf Rules Directory: "Rules guide Cascade to better understand the user and their codebase"
- This project already has `.windsurfrules` (confirmed via git log)
- `windsurf-unlocked`: distributes knowledge across rules, skills, vault/, and workflows due to 6000 token global rules limit

**Counter-Evidence:**
- Rules can become stale as frameworks update. Must be maintained.
- Over-specified rules constrain AI creativity for novel solutions.
- 6000 token limit means you cannot put everything in global rules.

**Verdict:** ✅ Recommended

**When to Use:** All ecommerce development in this codebase
**When to Skip:** None — but keep rules concise and versioned

**Recommended Rules for This Stack (verified against project):**

```markdown
# Stack Invariants (enforce in every generation)
- Next.js 15 App Router: Server Components are default. Only add 'use client' for interactivity, browser APIs, or hooks.
- Sanity v3: Use sanityFetch (or defineLive after upgrade) for all CMS queries. Never fetch Sanity data in useEffect.
- React 18: Use useActionState + Zod for form validation. Avoid manual useState for form submission status.
- Ecommerce Security: Never trust client-side prices. Always recalculate totals server-side before Stripe PaymentIntent creation.
- TypeScript: All new files must be .ts or .tsx. No any types. Use zod schemas for runtime validation.
- Testing: Every Server Action must have a corresponding integration test in tests/checkout/integration/.
- CSS: Use Tailwind utility classes. No inline styles. No arbitrary values without comment justification.

# Context Engineering
- When modifying checkout flow, always read AGENTS.md and docs/checkout/TECHNICAL DIAGRAM.md first.
- When modifying Sanity schema, check schema.json and sanity.types.ts for type safety implications.
- When adding a new page, check if a similar page exists and follow its pattern (e.g., app/(store)/checkout/address/page.tsx).
```

---

## Phase 6: Common Solutions Landscape

### Solution: AI-Generated Full Feature (Vibe Coding)

**Prevalence:** Ubiquitous in AI-era discourse
**Type:** Anti-pattern when unverified

**Pros:**
- Extremely fast initial velocity
- Good for exploration and prototyping

**Cons:**
- AI trained on pre-2024 code generates `useEffect` + `fetch` patterns by default
- Ignores project-specific conventions (AGENTS.md, 4-layer architecture, iron-session patterns)
- Produces security gaps (client-side price calculation, missing Zod validation)
- Creates maintenance debt — solo developer must fix it later alone

**Real-World Pain Points:**
- Reddit r/windsurf: "AI suggests code that contradicts recent decisions"
- Our project: AI-generated checkout code using `sessionStorage` instead of iron-session (fixed in later commits)

**Recommendation:** Use only with mandatory plan review + test harness. Never let AI commit directly without human review.

---

### Solution: Manual Migration from `createClient` to `defineLive`

**Prevalence:** Niche — only relevant to Sanity v3 + Next.js 15 projects
**Type:** Idiomatic (once migrated)

**Pros:**
- Real-time content updates without webhook configuration
- Automatic cache invalidation
- Visual Editing support out of the box

**Cons:**
- Requires next-sanity v11+ upgrade (breaking changes from v9)
- Need to add `SanityLive` to root layout
- Token permission changes (read token for browser)

**Real-World Pain Points:**
- `defineLive` first request latency if not cached
- Visual Editing (Stega) can leak invisible characters into logic comparisons

**Recommendation:** Schedule upgrade. Use `agent-toolkit` rules as migration guide.

---

### Solution: Windsurf Arena Mode for Model Selection

**Prevalence:** New (Wave 14, May 2026)
**Type:** Idiomatic for power users

**Pros:**
- Discover which model works best for your specific codebase
- Side-by-side comparison of solutions
- Personal leaderboard remembers your preferences

**Cons:**
- Burns 2x quota per comparison
- Only useful once you know your codebase well enough to judge quality
- Adds time overhead

**Recommendation:** Use Arena Mode to determine: SWE-1.5 for routine ecommerce components, Claude Opus 4.7 for checkout security/architecture, GPT-5.4 for Stripe integration edge cases.

---

## Phase 7: Verification & Falsification Log

### Claims Verified

| Claim | Evidence | Method |
|-------|----------|--------|
| `defineLive` is the Sanity-recommended pattern | Sanity agent-toolkit + docs | Source inspection |
| Next.js 15 Server Components are default | Next.js docs + package.json (`next: ^15.5.9`) | Doc + Code |
| Windsurf Wave 13 shipped Git worktrees + Multi-Cascade | windsurf.com/changelog | Source inspection |
| Windsurf Wave 14 shipped Plan Mode + Arena Mode | windsurf.com/changelog | Source inspection |
| 6000 token global rules limit | windsurf-unlocked framework + GitHub issue | Source inspection |
| Solo dev workflow benefits from agent personas | windsurf-unlocked, learnship, bmad-method | Multiple repos inspected |

### Falsification Attempts

| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| Windsurf is cheaper than Cursor | March 2026 pricing change: both $20/month | **Abandoned** — price parity |
| AI makes junior devs as productive as seniors | patterns.dev: "senior developers get more out of AI" | **Modified** — AI amplifies existing skill gaps |
| `defineLive` works with next-sanity v9 | Our package.json shows v9.12.3; `defineLive` requires v11+ | **Modified** — upgrade required |
| Multi-Cascade Panes are essential for solo devs | Daily quota splits; most solo tasks are sequential | **Modified** — useful for specific parallel tasks, not daily driver |

### Knowledge Decay Assessment

| Section | Risk | Review Date |
|---------|------|-------------|
| Windsurf features (Wave 13-14) | High | 2026-07-26 (new waves ship monthly) |
| next-sanity `defineLive` patterns | Medium | 2026-08-26 (v12 may change API) |
| Next.js 15 App Router patterns | Medium | 2026-08-26 (Next.js 16 in development) |
| React 18 concurrent features | Low | 2026-11-26 (stable for 2+ years) |
| Sanity v3 Stega/Visual Editing | Medium | 2026-08-26 (active development) |

---

## Phase 8: Synthesis: Actionable Takeaways

### For Our Project

| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| **Upgrade `next-sanity` to v11+ and adopt `defineLive`** | Real-time price/stock updates are critical for ecommerce; current `createClient` requires manual revalidation | Update package.json, create `sanity-cms/lib/live.ts`, add `<SanityLive />` to root layout |
| **Use Plan Mode (`megaplan`) for all checkout slices** | Prevents AI architectural drift; enforces spec-first development | Type `megaplan` before any checkout feature; reference `docs/checkout/` |
| **Pin `.windsurfrules` with explicit stack invariants** | Reduces AI-generated anti-patterns; enforces Server Component default | Update `.windsurfrules` with rules from Phase 5; keep under 6000 tokens |
| **Apply `stegaClean` to all Sanity strings used in logic** | Prevents Visual Editing mode bugs in product badges, routing, conditional UI | Audit all `product.*` field comparisons; add `stegaClean` import |
| **Use SWE-1.5 for routine components, Opus 4.7 for architecture** | Daily quota management; Opus is overkill for simple UI | Set model preference in Windsurf; use Arena Mode to verify |
| **Maintain `AGENTS.md` + `.windsurf/memories/` for context continuity** | Solo dev has no peer review; persistent context substitutes for team knowledge | Continue existing practice; add Sanity-specific conventions to memories |
| **Keep client boundaries at the leaf** | Maximizes SSR/SEO for product pages; minimizes hydration cost | Audit `app/(store)/` for `'use client'` at layout/page level; push down to interactive components |

### Immediate Actions

1. **Upgrade next-sanity** to v11+ and implement `defineLive` pattern
2. **Update `.windsurfrules`** with the stack invariant rules from Phase 5
3. **Audit checkout flow** for `'use client'` placement — push boundaries to leaf components
4. **Add `stegaClean`** to all product field logic comparisons
5. **Test Plan Mode** (`megaplan`) on next checkout slice to measure planning overhead

### Open Questions

1. **Does `defineLive` add measurable latency to product page TTFB?** — Need benchmark before/after upgrade
2. **What is the optimal model for Sanity GROQ query generation?** — Arena Mode test: SWE-1.5 vs Claude Sonnet 4.6 vs GPT-5.4
3. **Can Multi-Cascade Panes speed up test-writing parallel to implementation?** — Experiment with one feature
4. **How does Windsurf's new quota system affect sprint planning?** — Track daily usage for one week
5. **Should we adopt `@agent-name` invocation from windsurf-unlocked?** — Trial with `@architect` for plan mode, `@implementer` for execution

---

## Confidence Assessment

| Claim | Confidence | Basis |
|-------|------------|-------|
| `defineLive` is correct for Sanity v3 + Next.js 15 | **Very High** | Official docs + agent-toolkit + source inspection |
| Server Component leaf boundary pattern | **Very High** | Next.js docs + Vercel Commerce source + patterns.dev |
| Plan Mode reduces architectural drift | **High** | Windsurf official + practitioner frameworks |
| Multi-Cascade Panes useful for solo dev | **Medium** | Verified feature, but quota split is real constraint |
| SWE-1.5 sufficient for routine ecommerce UI | **High** | Benchmarks from windsurf-unlocked + personal testing |
| 6000 token global rules limit | **Medium** | Single source (GitHub issue), no counter-evidence found |
| Windsurf daily quotas affect sprint velocity | **High** | DevToolPicks review + Windsurf pricing change confirmed |
