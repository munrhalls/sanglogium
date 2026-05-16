# Codebase Portfolio Assessment - CV & Hiring Chances (2026)

## Source-Level Codebase Analysis

### Tech Stack (Source: package.json)
- **Next.js 15.5.9** - Latest version, App Router architecture
- **React 18.3.1** - Current stable
- **TypeScript 5** - Full type safety
- **Sanity CMS 3.74.1** - Headless CMS (explicitly mentioned in job postings)
- **Stripe 19.1.0** - Payment processing
- **Tailwind CSS 3.3.5** - Utility-first CSS (commonly required)
- **Zustand 5.0.1** - State management
- **Redis (Upstash)** - Queue backend (custom FIFO implementation, NOT BullMQ)
- **Clerk 6.16.0** - Authentication
- **Playwright 1.59.1** - E2E testing
- **Vitest 4.1.5** - Unit/integration testing

### Codebase Scale (Source: grep analysis)
- **240+ TSX component exports** - Extensive component library
- **100+ TS utility exports** - Comprehensive helper functions
- **50+ test files** - Substantial test coverage
- **248 app directory items** - Full application structure
- **134 sanity-cms items** - CMS configuration and schemas

### Architecture Sophistication (Source: .windsurf/memories/architecture.md)

**High-Value Architectural Patterns:**
- **Virtual File System (VFS)** - Pre-computed catalogue with O(1) lookup (sophisticated optimization)
- **Custom Redis FIFO Queue** - RPUSH + SET NX + LINDEX head check + LPOP with 45s deadline (solves BullMQ concurrency gap)
- **Server Components First** - Next.js 15 App Router with parallel data fetching (modern pattern)
- **Authorize-First Payment** - Server-side Stripe integration (security best practice)
- **Type-Safe Sanity Integration** - Auto-generated types from schema (professional approach)
- **Scoped Tailwind Architecture** - Component isolation (prevents cascade conflicts)

**Real-World Complexity:**
- E-commerce checkout queue with inventory reservation
- Custom Redis FIFO queue with distributed locks (RPUSH + SET NX + LINDEX head check)
- Multi-step checkout wizard (guest/user modes)
- Google Address Validation API integration
- Real-time shipping rates
- Basket reservation system with TTL
- Payment intent verification
- Background cleanup jobs

### Testing Infrastructure (Source: grep analysis)

**Test Distribution:**
- **Unit tests:** Complex parsing/logic (e.g., Google Address API response handling)
- **Integration tests:** State transitions, component integrations
- **E2E tests:** Full user flows (Playwright)
- **Test conventions:** Naming conventions, contract conventions defined

**Test Coverage Evidence:**
- `store/__tests__/` - 6 test files (unit, integration, e2e)
- `tests/checkout/` - Payment, address slice, shipping flows
- `tests/checkout-queue/` - Reservation TTL, sequential FIFO, happy path
- `app/components/features/` - Component-level tests

### Design System (Source: component structure)

**UI Component Library:**
- QuantitySelector, Price, Modal, Checkbox
- Filter components (RangeFilter, PriceRangeSlider, StockMinimumSlider)
- Sort components (SortTypes, SortClient, CustomIcons)
- Layout components (Carousel, Spotlight, Shelf, Hero)
- Skeleton components (loading states)
- Form components (CTA, DrawerToggleButton)

**Component Architecture:**
- Reusable, composable components
- Type-safe props (TypeScript)
- Accessibility considerations (ARIA labels)
- Responsive design patterns

## Portfolio Value Assessment

### Strengths (High Signal for Hiring Managers)

**1. Modern Stack Alignment**
- Next.js 15 with App Router (cutting-edge)
- TypeScript throughout (type safety)
- Sanity CMS (explicitly mentioned in job postings)
- Tailwind CSS (commonly required)
- Testing infrastructure (Playwright, Vitest)

**2. Real-World Complexity**
- E-commerce domain (high-value differentiator)
- Payment processing (Stripe integration)
- Inventory management (reservation system)
- Background job processing (BullMQ)
- API integrations (Google Address, shipping rates)

**3. Architectural Sophistication**
- Server Components pattern (modern Next.js)
- FSM for order lifecycle (enterprise pattern)
- VFS optimization (performance engineering)
- Type-safe CMS integration (professional approach)
- Idempotent transaction handling (production-grade)

**4. Testing Culture**
- Multiple test types (unit, integration, e2e)
- Test conventions and naming standards
- Component-level testing
- Happy path and edge case coverage

**5. Documentation**
- Architecture invariants documented
- Development workflow defined
- Test conventions specified
- Agent instructions for collaboration

### Weaknesses (Gaps to Address)

**1. README Quality Unknown**
- No project-level README visible
- Missing "interview before the interview" opportunity
- Can't showcase technical thinking upfront

**2. Commercial Experience Gap**
- Personal project, not commercial work
- Senior roles require 5+ years commercial experience
- No team collaboration evidence

**3. No Users/Engagement**
- No evidence of real users
- Live deployment exists but no user metrics

## Hiring Chances Assessment

### Target Role: Mid-Level Fullstack/Frontend Developer

**Probability: HIGH** for mid-level roles (13,000-21,000 PLN/month)

**Why:**
- Stack perfectly aligned with market requirements
- Real-world complexity exceeds typical portfolio projects
- Architectural sophistication shows senior-level thinking
- Testing infrastructure demonstrates professional approach
- E-commerce domain is high-value differentiator

**Barriers:**
- Lack of commercial experience (expected for mid-level)
- No team collaboration evidence (expected for personal project)

### Target Role: Senior Developer

**Probability: LOW** for senior roles (18,000-28,000 PLN/month)

**Why:**
- Senior postings require 5+ years commercial experience (explicitly stated)
- No leadership/mentoring experience
- **No production deployment at scale evidence**
- Personal project vs commercial work distinction
- Live deployment exists (sanglogium.com) but no user metrics

**Path to Senior:**
- Deploy publicly and get users
- Contribute to open source
- Freelance/contract work for commercial experience
- Emphasize architectural decisions over implementation

## Immediate Actions to Improve Hiring Chances

1. **Create Excellent README** (Highest Priority)
   - Problem solved: E-commerce with inventory reservation
   - Tech stack rationale: Why Sanity? Why custom Redis FIFO (not BullMQ)? Why VFS?
   - Technical decisions: What was hard? What would you change?
   - Live demo link prominently displayed (sanglogium.com)

2. **Add 1-2 Smaller Projects**
   - Domain-specific (not tutorial clones)
   - Deployed with good READMEs
   - Shows breadth beyond single large project

3. **Prepare Interview Narratives**
   - Practice explaining architectural decisions under pressure
   - Be ready for: "Why VFS instead of recursive queries?"
   - Be ready for: "Why custom Redis FIFO instead of BullMQ?"
   - Self-awareness: "I'd use X instead of Y because Z"

4. **Emphasize Right Things**
   - Headless CMS expertise (Sanity)
   - E-commerce domain knowledge
   - Custom queue implementation (solved BullMQ concurrency gap)
   - Testing approach (not just "I have tests")
   - Architectural thinking (not just "I built features")

## Verdict

**Current Codebase Quality:** Excellent for mid-level roles, sophisticated architecture exceeds typical portfolio projects.

**Hiring Chances:** HIGH for mid-level (13,000-21,000 PLN), LOW for senior (18,000-28,000 PLN) due to commercial experience requirement.

**Status:** Live deployment exists (sanglogium.com) - major strength. Critical gap: README quality and portfolio documentation.
