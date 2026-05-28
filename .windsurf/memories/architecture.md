# Architectural Invariants - Sang Logium E-Commerce Platform

## Virtual File System (VFS) - Catalogue Architecture

**Absolute Constraint:** VFS is pre-computed at build time via daily automatic rebuild (cron job).

**Critical Rules:**
- NEVER query the database recursively for category trees
- Lookup complexity is O(1) via path-based prefix matching
- Moving catalogue slots automatically updates ALL associated product locations
- Any catalogue change requires ZERO subsequent update work
- The catalogue is a graph-like virtual file system where catalogue pathways, product positions, and catalogue slots are 100% decoupled

**Implementation Location:** `data/catalogue-index.json` (pre-built), `scripts/build-catalogue-index.mjs` (build script)

**Query Pattern:** String prefix matching on pre-computed paths, not recursive DB traversal

---

## Styling Architecture

**Absolute Constraint:** ALL styling MUST use scoped Tailwind utility classes ONLY.

**Critical Rules:**
- NEVER modify global CSS files unless explicitly requested
- NO arbitrary global CSS modifications permitted
- Styling changes MUST be applied directly on target elements to prevent global blast radius
- Global CSS file: `app/globals.css` (read-only by default)

**Rationale:** Prevents cascade conflicts and ensures component isolation

---

## Finite State Machine (FSM) - Order Lifecycle

**Absolute Constraint:** FSM states are the ABSOLUTE source of truth for order lifecycle.

**Critical Rules:**
- Order state transitions MUST follow strict, pre-determined enumerable variable transitions
- NEVER bypass FSM state validation
- Idempotent background queues (Inngest) guarantee exactly-once execution for:
  - Stripe refunds
  - Inventory re-stocking
- Physical order states map 1:1 to digital statuses

**Implementation Location:** Order management system schemas in `sanity/schemaTypes/`

**State Roles:**
- OWNER: Full visibility and control
- MANAGER: Fulfillment tracking and manual overrides
- PACKER: Simplified UI for physical tasks only (TO_PACK, PACKING_LOCKED, FLAG_ISSUE, PENDING_PRINT_LABEL, SHIPPED)

---

## Sanity Studio & Type Safety

**Absolute Constraint:** Sanity Typegen outputs are the ABSOLUTE source of truth for schema types.

**Critical Rules:**
- NEVER manually define types that conflict with generated Sanity types
- All GROQ queries MUST respect the generated type contracts
- Generated types location: `sanity.types.ts`
- Schema definitions location: `sanity/schemaTypes/`

**Data Flow:**
```
Sanity Schema → Localhost Studio → GROQ Library → React Server Component → Prebuilt Props → Client Components
```

**Type Generation Command:** Defined in Sanity configuration, auto-generates on schema changes

---

## Image Optimization Strategy

**Absolute Constraint:** ALL image transformations MUST be handled by Sanity CDN (NOT Next.js image optimization server).

**Critical Rules:**
- Use `next/image` with Custom Loader (`@sanity/image-url`)
- ALWAYS fetch `metadata.dimensions` from Sanity to provide base aspect ratio
- Apply Sanity's `.rect()` parameters within the loader for hotspot/crop
- Direct all transformation requests (width, quality, format) to Sanity's API
- Bypass Next.js image optimization server to reduce server load and improve TTFB

**Implementation Pattern:**
```typescript
// Custom loader using @sanity/image-url
// Fetch dimensions from Sanity metadata
// Apply transformations via Sanity CDN parameters
```

---

## Next.js 15 App Router Architecture

**Absolute Constraint:** Primary pages MUST be Server Components (no arbitrary "use client" directives).

**Critical Rules:**
- Data fetching MUST be parallelized on the server to reduce waterfall requests
- Server-first routing is the absolute default pattern
- Client components only when interactive state is required
- Colocated parallel fetching via React Server Components (RSC)

**Performance Pattern:**
- Parallel execution eliminates waterfalls
- Zero prop-drilling (each component manages its own data)
- LCP optimization via `priority` images in Hero
- Auto-deduplication via React's native cache

---

## Checkout & Payment Architecture

**Absolute Constraint:** Iron-session encrypted cookie checkout with synchronous order creation.

**Critical Rules:**
- State managed via encrypted iron-session cookies (basket, address, shipping, paymentIntentId)
- 4-layer vertical slicing: Routing (Server Components) → Presentation → Mutation (Server Actions) → Infrastructure (SDKs)
- Stripe Payment Element handles card/BLIK/Apple Pay on client, server creates Payment Intent
- Synchronous order creation in return handler (not webhook) to eliminate race conditions
- Order created directly in Sanity on successful payment, stock decremented immediately
- Session cascade validation: upstream changes clear downstream data (address change → shipping cleared)

**Prevents:** Race conditions, overselling, session tampering, funnel jumping

**Current implementation (verify against beads issues before trusting):**
- Payment page: `sang-logium-oss` (closed, happy path complete)
- Return page: `sang-logium-2di` (closed, happy path complete)
- Basket page: `sang-logium-mwk` (open, happy path in progress)
- Address collection: `sang-logium-mpx` (open, happy path in progress)
- Shipping selection: `sang-logium-3ez` (open, happy path in progress)

---

## Address Validation & Shipping

**Absolute Constraint:** Integrate Google Address Validation API before fetching shipping rates.

**Critical Rules:**
- Validate address structure and deliverability FIRST
- Fetch real-time shipping rates via provider APIs SECOND
- Ensures every label generated maps to a real, deliverable physical location

**Implementation:** Multi-layered response handling with unit, integration, and e2e tests

---

## Drawers System (Mobile UX)

**Absolute Constraint:** Decoupled UI state using URL parameters (`?drawer=cart`) for instant responsiveness.

**Critical Rules:**
- Instant responsiveness (no lag)
- Navigation by URL: Back/Forward buttons work perfectly
- Opening a drawer pushes history, switching tabs replaces it
- Drawer Shell manages visibility
- Content manages its own nested logic (100% independent from drawer)

**Prevents:** Client vs server boundary complexity, lag from Next.js parallel/intercepted routes

---

## Testing Strategy

**Philosophy:** Strategic minimum needed, maximum impact (Kent C. Dodds diamond shape).

**Test Distribution:**
- Most tests: Integration and E2E
- Unit tests: For complex parsing/logic (e.g., Google Address API response handling)
- Integration tests: For state transitions
- E2E tests: For full user flows

**Test Locations:**
- `tests/` - Unit and integration tests (Jest)
- `tests_e2e/` - End-to-end tests (Playwright)

---

## Development Workflow Invariants

**Specifications First:**
1. Write specifications
2. Turn each specification into test case code (one by one)
3. Run the failing test
4. Implement feature until test succeeds
5. Test manually
6. Work on a one-by-one basis for fixes

**Component Archaeology Principle (Debugging):**
1. Analyze what the problem is
2. Determine what components are relevant
3. Check each relevant component one by one, analyze individually
4. Understand relevant components as a connected chain, analyze interactions
5. Investigate the problem space and analyze reality BEFORE proposing solutions
6. Solve the problem as asked - do not jump ahead to un-asked optimizations
