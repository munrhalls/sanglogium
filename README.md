# Application Product Design, Architecture, Backend & Frontend Development

**By:** Munrhalls
**Project Status:** Final Construction Phase (Shipping in 1-2 weeks)
**Project Type:** Independent Full-Stack Product Development (12+ months)

[**LIVE STOREFRONT**](https://sang-logium.com) | [**LIVE MANAGEMENT PANEL**](https://sang-logium.com/studio)

Professional, large-scale e-commerce application featuring 500+ products and two key components seamlessly integrated:

- **Storefront App:** Optimized for customer engagement and speed.
- **Management App:** Comprehensive control for the owner.

The architecture is robust, secure, and fault-tolerant, designed to prioritize an error-free, lightning-fast, and intuitive user experience.

---

### KEY FEATURES


### PAYMENTS

- Secure utilization of embedded Stripe checkout sessions, hiding sensitive data from the client.
- Idempotency ensured via Inngest—the app automatically retries connections to guarantee transaction finality.

### CHECKOUT

- Multi-step wizard supporting guest and user modes with seamless transitions and saved-address autofill.
- Uses an "authorize-first" server-side pattern to lock inventory before capturing funds, preventing race conditions and overselling.
- Fully idempotent architecture ensures transactions resolve correctly even if connectivity drops mid-process.

### ADDRESS VALIDATION AND SHIPPING

- Integrates Google Address Validation API to validate address before fetching real-time rates via shipping provider APIs.
- Ensures every label generated maps to a real, deliverable physical location.

### ORDERS MANAGEMENT SYSTEM

- Centralized dashboard for tracking fulfillment stages, allowing manual status overrides when real-world logistics require it.
- Order Lifecycle tracked and managed with meticulously cautious, thorough steps using what's called Granular Finite State Machine
- Views are split for "OWNER", "MANAGER", "PACKER" - each containing User Experience maximally simplified and tailored for the role.
- For example - "PACKER" sees only and only UI elements relevant to their exact physical job parts of packing: "TO_PACK", "PACKING_LOCKED", "FLAG ISSUE", "PENDING_PRINT_LABEL", "SHIPPED"

### WAREHOUSE PACKING SYSTEM

- Order lifecycle - managed by strict, pre-determined enumerable variable transitions

### RETURNS AND REFUNDS SYSTEM

- Architected via a finite state machine to strictly map physical order states to digital statuses.
- Uses idempotent background queues (Inngest) to guarantee Stripe refunds and inventory re-stocking happen exactly once, without fail.

### PERFORMANCE - IMAGE STRATEGY
* **Hero Image Strategy**
Strategy uses Sanity's Image Pipeline *integrated* with Next.js next/image in a way that avoids double-optimization. I avoid hardcoded dimension. Instead I use custom loader to map Sanity's crop and hotspot.
That data goes  directly to the browser's viewport using dynamic srcset generation. This does the next optimization: 1) a device gets image size as small as fits (next optimization) and 2) via network delivery speed is optimized (sanity optimization). Sanity handles processing and delivery.
Sanity applies crops, hotspots, and compression on-the-fly via CDN. The next and sanity image optimizations are both preserved. But they don't conflict. This is extremely important because images are the largest assets. This has the biggest impact on performance.

### CATALOGUE INTERACTION EXPERIENCE - INSTANT RESPONSIVENESS
* **The Struggle:** Recursive database queries for nested category trees caused bottlenecks and 1-2s latency on navigation.
* **The Solution:** Implemented a "Virtual File System" that pre-computes paths at build time, replacing expensive tree traversal with instant string matching.
* **Core Specifications/Solution strengths:**
    * **Ease of change:** Moving a catalogue slot AUTOMATICALLY moves ALL associated products to new location - and query AUTOMATICALLY works with the new location. E.g. if we moved "Speakers" to some new location "X", user clicking "X" would now fetch all "Speakers" too, while clicking "Speakers" would fetch just "Speakers" as it did before. Any catalogue change whatsoever involves exactly 0 subsequent update needs to make it work. How? It's a graph-like virtual file system. Catalogue pathways, product positions and catalogue slots are 3 concerns desirably 100% de-coupled.
    * **Lookup Complexity:** O(1) (Constant Time)
    * **Mechanism:** Path-Based Prefix Matching
    * **Update Strategy:** Daily Automatic Rebuild (Cron)
* [View Architecture Deep Dive →](./app/components/layout/catalogue/README.md)


### HOME PAGE DATA ORCHESTRATOR

**The Problem:**
Fragmented fetching creates "network waterfalls" and complex prop-drilling, delaying LCP and increasing cognitive load.

**The Solution:**
**Colocated Parallel Fetching** via React Server Components (RSC) triggers independent GROQ queries simultaneously during server rendering.

* **Parallel Execution:** Eliminates waterfalls by fetching Hero, Main, and Bottom data concurrently.
* **Zero Prop-Drilling:** Each component manages its own data, keeping `page.tsx` clean.
* **LCP Optimization:** Uses Next.js `priority` images in the Hero for instant preloading.
* **Auto-Deduplication:** Uses React's native cache to prevent redundant Sanity API calls.

* [View Architecture Deep Dive →](./app/components/features/homepage/README.md)



### PRODUCT DISCOVERY EXPERIENCE

- Organized with extreme care to ensure performance and reliability while browsing 500+ products.
- Search, pagination, filtering, and sorting work seamlessly synchronized with the URL on any device, without lag.

### BASKET (CART) EXPERIENCE

- Intuitive and simple, allowing frictionless transition to checkout.
- Built on a solid architecture that ensures security and a lag-free experience.

### LANDING PAGE EXPERIENCE

- Hero carousel and immersive design elements immediately draw the user into the brand's unique mood.

### MOBILE EXPERIENCE - DRAWERS SYSTEM

- **The Struggle:** Managing 5+ drawer states (Cart, Menu, Search) can easily complicate and make client vs server boundary hard to manage. Next's (native parallel routes + intercepted routes), on the other hand, LAGS (unacceptable UX) and creates bloated code structure.
- **The Solution:** Decoupled UI state using URL parameters (`?drawer=cart`) to achieve instant responsiveness performance and perfect history navigation. Drawers responsiveness is INSTANT, the same as if they were state-based - but the url functionality and navigation is 100% preserved. Furthermore, It's EASY to created nested url navigation drawers, e.g. user account with orders, order's detail, payment methods etc. It's also easy to split the navigation UX within drawer from the easy exit from drawer UX concerns.
- **Core Specifications:**
- Instant Responsiveness UX.
- Navigation by URL UX: 100% Preserved. Back/Forward buttons work perfectly; opening a drawer pushes history, switching tabs replaces it.
- Architecture: Decoupled. The "Drawer Shell" manages visibility; the "Content" manages its own nested logic (e.g., Account → Orders) and is 100% independent from the drawer.
- **[View Architecture Deep Dive →](./app/components/layout/drawers/README.md)**

---

## TECH STACK

- **Framework:** Next.js 15+ (App Router)
- **Library:** React (19+)
- **Language:** TypeScript (Strict typing for both App and Sanity Content Lake)
- **CMS:** Sanity (Backend) + GROQ (Query Language)
- **Styling:** Tailwind CSS
- **Auth:** Clerk.dev
- **Services:** Google Address Validation API (Address Validation), Stripe (Payments), Inngest (Event orchestration/Idempotency)

---

## ARCHITECTURE & PATTERNS

### Server-First Routing

Primary pages are Server Components (no "use client" directive). Data fetching is parallelized on the server to reduce waterfall requests.

### Performance

Images - one of the single biggest influencing factors for the whole project's performance - are handled purely by Sanity, which is a design choice. It ensures CDN-based, edge-utilizing delivery. Mistakes of mixing up Next.js optimizations with Sanity CMS optimizations are thoroughly avoided.

Code-splitting and everything about render trees is organized for the real end-user's experience first, and google performance metrics second.

### Compatibility

Cross-browser and cross-OS compatible. Tested via playwright, and admittedly minimally but still - on iphones and android phones.

### Testing

Testing approach is strategic - minimum needed, maximum impact. It still involves /unit, /integration, /e2e tests but they are always for a concrete, end-purpose. It follows, to some degree, Kent C. Dodds diamond shape, where most tests are /integration and /e2e.

Example - google validation address API handler route required ensemble team of various different types of tests to ensure the confusing, multi-layered response object is handled in a way that contains all the possibilities and maps them onto proper result response for the consumer - the storefront's address collection form. Unit tests made sure the handler its parses the complex reponse with no fails. Integration tests ensured the state transitions operate as expected. E2E test ensures it all meshes smoothly with no errors.

### Type Safety Pattern

Using Sanity Typegen to auto-generate types for schemas and GROQ queries. Frontend components utilize these generated types for strict checks against the CMS data structure.

### Development Pattern

- **Fetch Strategy:** Sanity Schema -> Localhost Studio -> GROQ Library -> React Server Component -> Prebuilt Props -> Client Components.
- **Design:** Assets designed in Figma, calibrated, and built directly into code in layers (Structure -> Mock Content -> Real Data Integration).

### Web development strategy and core lesson

- Everything underwent rigorous, systems-first approach. That is to say - organizing everything thoroughly but as simply as possible first, paper sketches, diagrams, documentation - second, and code - third.
- In honesty, that's not how I started out - but over the initial months of struggle, I realized it was the _only_ way because of the compound effect.
- Lesson: It's either harder the further the project is, or easier. This whole work is my experience with the former, and learning to transition into the latter. It required a completely different approach. Hardest thing about the project are going to come up anyway - the only difference is WHEN. I wanted to see what happens if I tackle the "hardest" upfront and do nothing but that, first.
-
