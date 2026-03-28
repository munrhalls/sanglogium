# Theme 12: Systems Integration Challenges

## SangLogium Context
This is where all layers converge. Real problems require combining Next.js, Sanity, TypeScript, VFS, FSM, Stripe, Clerk, and AI workflows. Systems-level thinking is the difference between a developer and a software architect.

---

## Challenge 1: Complete Order Lifecycle Implementation

**Scenario:** Build the full order flow from cart to delivery

### Requirements:

**Phase 1: Cart & Checkout**
1. Cart stored in Zustand (client-side) with persistence
2. Checkout wizard: Shipping → Payment → Confirmation
3. Address validation via Google API
4. Stripe embedded checkout
5. Order creation in Sanity on payment success

**Phase 2: Order Management**
1. FSM states: CREATED_UNPAID → PAID_CONFIRMED → TO_PACK → ... → DELIVERED
2. Role-based views:
   - OWNER: All orders, revenue dashboard
   - MANAGER: Active orders, exceptions, returns
   - PACKER: TO_PACK queue, locked orders, holds
3. Timeline tracking for every state change

**Phase 3: Post-Purchase**
1. Order confirmation email
2. Shipping notifications
3. Return/refund workflow
4. Inventory restoration on cancellation

### Constraints:
- Server-first architecture (RSC for data)
- Type-safe throughout (Sanity Typegen)
- Idempotent operations (Inngest for side effects)
- Real-time updates (webhooks, not polling)

### Success Criteria:
- [ ] Complete checkout flow works end-to-end
- [ ] Order states transition correctly with validation
- [ ] Role-based dashboards show correct data
- [ ] Timeline captures all changes
- [ ] Webhooks handle async events reliably
- [ ] Failed payments allow retry
- [ ] Cancellations restore inventory

---

## Challenge 2: VFS + Product Discovery Optimization

**Scenario:** Optimize product discovery with VFS

### Current State:
- 500+ products across 50+ categories
- VFS exists but has data consistency issues
- Category pages load slowly
- Filters don't sync with URL

### Requirements:

**1. Fix VFS Data Integrity**
- Fix build script to populate `slotMetadataMap` completely
- Add validation that all referenced IDs exist
- Add runtime consistency checks
- Create VFS health check endpoint

**2. Category Page Performance**
- Implement parallel data fetching
- Use VFS for O(1) category lookups
- Optimize GROQ queries with proper projections
- Add caching headers

**3. Filter System**
- URL-synced filters (nuqs)
- Server-side filtering (not client-side)
- Multi-select support (brands, price ranges)
- Dynamic filter options based on category

**4. Search Integration**
- Full-text search across products
- Search result ranking
- Search + filter combination
- Empty state handling

### Success Criteria:
- [ ] VFS data is 100% consistent
- [ ] Category pages load < 1 second
- [ ] Filters apply without page reload
- [ ] Filter state survives refresh
- [ ] Search returns relevant results
- [ ] URL can be shared with filters applied

---

## Challenge 3: Authentication & Authorization Overhaul

**Scenario:** Implement complete auth system for SangLogium

### Requirements:

**1. Customer Auth**
- Sign up / Sign in with Clerk
- Social providers (Google, GitHub)
- Password reset flow
- Guest checkout (no account required)
- Account linking (guest → registered)

**2. Admin Roles**
- OWNER: Full access, can manage other admins
- MANAGER: Orders, inventory, customer service
- PACKER: Packing queue only, no sensitive data
- Role assignment in Clerk dashboard

**3. Route Protection**
- Middleware-based protection
- Role checks for admin routes
- Customer-only routes (order history)
- Public routes (storefront)

**4. User Profiles**
- Clerk for auth data
- Sanity for app data (addresses, preferences)
- Sync webhook on user events
- Profile editing

### Success Criteria:
- [ ] All auth flows work (sign up, sign in, reset)
- [ ] Role-based access enforced
- [ ] Guest checkout completes successfully
- [ ] Account linking imports order history
- [ ] Profile data syncs between Clerk and Sanity
- [ ] Unauthorized access properly blocked

---

## Challenge 4: Real-Time Inventory System

**Scenario:** Prevent overselling with real-time inventory

### The Problem:
- Customer A: Adds last widget to cart
- Customer B: Adds same widget to cart
- Both check out simultaneously
- Payment succeeds for both
- Only 1 widget in stock = oversell

### Requirements:

**1. Reservation System**
- Reserve inventory when added to cart
- Reservation expires after 30 minutes
- Release on cart abandonment
- Hold during checkout

**2. Stock Checking**
- Real-time availability check at checkout
- Warning when low stock
- "Only 2 left" messaging
- Pre-order for out-of-stock items

**3. Admin Tools**
- Inventory dashboard
- Manual stock adjustments
- Low stock alerts
- Inventory history log

**4. Conflict Resolution**
- Handle race conditions
- Retry with backoff
- Customer notification if stock unavailable
- Alternative suggestions

### Success Criteria:
- [ ] No overselling in concurrent checkout tests
- [ ] Reservations expire correctly
- [ ] Low stock warnings display
- [ ] Admin can adjust inventory
- [ ] Race conditions handled gracefully

---

## Challenge 5: Checkout Experience Polish

**Scenario:** Make checkout feel premium and reliable

### Requirements:

**1. Multi-Step Wizard**
- Step 1: Shipping (address validation)
- Step 2: Review (order summary)
- Step 3: Payment (Stripe embedded)
- Step 4: Confirmation (order details)

**2. Progress Persistence**
- Save progress to localStorage
- Resume on return
- Clear on completion
- Handle session expiry

**3. Error Handling**
- Address validation errors (clear messaging)
- Payment failures (retry guidance)
- Network errors (auto-retry)
- Stock unavailability (alternative offers)

**4. UX Enhancements**
- Smooth transitions between steps
- Loading states for async operations
- Inline validation (not just on submit)
- Mobile-optimized (drawer on mobile)

### Success Criteria:
- [ ] All 4 steps complete smoothly
- [ ] Progress persists across sessions
- [ ] All error cases handled gracefully
- [ ] Mobile experience is polished
- [ ] Checkout completes in under 2 minutes

---

## Challenge 6: Analytics & Reporting Dashboard

**Scenario:** Build admin analytics dashboard

### Requirements:

**1. Key Metrics**
- Revenue (today, this week, this month)
- Orders (count, status breakdown)
- Average order value
- Conversion rate (cart → purchase)
- Top products

**2. Visualizations**
- Revenue chart (time series)
- Order status pie chart
- Top products bar chart
- Real-time order feed

**3. Data Aggregation**
- Sanity GROQ for efficient queries
- Date range filtering
- Export to CSV
- Scheduled reports

**4. Performance**
- Caching for expensive aggregations
- Incremental updates
- Lazy loading for detailed data

### Success Criteria:
- [ ] All metrics calculate correctly
- [ ] Charts render smoothly
- [ ] Date filtering works
- [ ] Data exports successfully
- [ ] Dashboard loads quickly

---

## Challenge 7: Testing Strategy Implementation

**Scenario:** Implement comprehensive test coverage

### Requirements:

**1. E2E Critical Paths**
- Product discovery → Cart → Checkout → Confirmation
- User registration → Login → Order history
- Admin: Order management workflow
- FSM state transitions

**2. Integration Tests**
- API routes (checkout, webhooks)
- Data fetching patterns
- VFS operations
- Stripe integration (test mode)

**3. Unit Tests**
- VFS algorithms
- Price calculations
- State machine logic
- Utility functions

**4. Test Infrastructure**
- CI/CD integration (GitHub Actions)
- Parallel test execution
- Test data fixtures
- Mock external services

### Success Criteria:
- [ ] Critical paths have E2E coverage
- [ ] API routes have integration tests
- [ ] Complex logic has unit tests
- [ ] Tests run in CI/CD
- [ ] < 5 minute test suite execution

---

## Challenge 8: Performance Optimization

**Scenario:** Achieve sub-1-second page loads

### Current Baseline:
- Homepage: 2.5s
- Category page: 3.2s
- Product page: 2.8s
- Checkout: 4.1s

### Target:
- All pages < 1s Time to First Byte
- Largest Contentful Paint < 2.5s
- Cumulative Layout Shift < 0.1

### Requirements:

**1. Image Optimization**
- Sanity CDN for all transformations
- WebP format with fallbacks
- Responsive srcset
- Lazy loading for below-fold

**2. Data Fetching**
- Parallel queries (no waterfalls)
- Selective hydration
- Edge caching
- Incremental Static Regeneration

**3. Code Splitting**
- Route-based splitting
- Component lazy loading
- Vendor chunk optimization
- Tree shaking verification

**4. Bundle Analysis**
- Identify largest dependencies
- Replace with lighter alternatives
- Dynamic imports for heavy features
- Remove unused code

### Success Criteria:
- [ ] Lighthouse score > 90 for all pages
- [ ] TTFB < 1 second
- [ ] LCP < 2.5 seconds
- [ ] CLS < 0.1
- [ ] Bundle size reduced by 30%

---

## Challenge 9: Deployment & DevOps

**Scenario:** Production-ready deployment pipeline

### Requirements:

**1. Build Process**
- Pre-build: VFS generation
- Type checking
- Lint checking
- Test execution

**2. Deployment**
- Netlify hosting
- Environment variables
- Build caching
- Rollback capability

**3. Monitoring**
- Error tracking (Sentry)
- Performance monitoring
- Uptime alerts
- Log aggregation

**4. Automation**
- GitHub Actions for CI/CD
- Automated testing on PR
- Automated deployment on merge
- Database backups

### Success Criteria:
- [ ] Zero-downtime deployments
- [ ] Automatic rollback on failure
- [ ] Monitoring alerts functional
- [ ] Build completes in < 5 minutes
- [ ] All tests pass before deploy

---

## Challenge 10: AI Workflow Integration

**Scenario:** Use AI to accelerate remaining development

### Requirements:

**1. Phase Assessment**
- Inventory all incomplete components
- Categorize by phase (1, 2, 3)
- Estimate effort for each
- Prioritize by critical path

**2. Strategic Planning**
- Use Claude for architecture decisions
- Identify risky integrations
- Plan component dependencies
- Define success criteria

**3. Execution**
- Use Windsurf for Phase 3 fixes
- Use full workflow for Phase 1 components
- Maintain constraint template
- Log all regressions

**4. Quality Assurance**
- Verify every AI output
- Maintain DoD checklist
- Document patterns that work
- Refine constraints based on learnings

### Success Criteria:
- [ ] All components have phase assigned
- [ ] AI workflows applied correctly
- [ ] Zero regressions from AI changes
- [ ] Development velocity increased 2x
- [ ] Code quality maintained

---

## Systems Thinking Principles

### 1. First Principles
Ask: "What is the fundamental truth here?"
- Why does this feature exist?
- What are we actually trying to accomplish?
- What constraints are real vs assumed?

### 2. Trade-off Analysis
Every decision has trade-offs:
- Speed vs complexity
- Features vs reliability
- Custom vs off-the-shelf
- Now vs later

### 3. Emergent Properties
The system behaves differently than its parts:
- Performance is emergent (not just one slow query)
- Bugs are emergent (interactions, not single components)
- User experience is emergent (end-to-end, not screens)

### 4. Feedback Loops
Identify reinforcing and balancing loops:
- More users → More revenue → More features → More complexity → Slower development
- Better tests → Fewer bugs → Faster releases → More confidence → Better tests

### 5. Leverage Points
Where can small changes have big impact?
- API design (affects all consumers)
- Database schema (affects all queries)
- Build process (affects all deployments)
- AI workflow (affects all development)

---

## Final Assessment

You are ready to lead SangLogium to completion when you can:

### Technical Mastery
- [ ] Implement any feature end-to-end
- [ ] Debug any bug to root cause
- [ ] Optimize any performance bottleneck
- [ ] Design any new system component

### Architectural Thinking
- [ ] Make technology decisions with clear trade-offs
- [ ] Identify and resolve systemic issues
- [ ] Plan migrations and rollouts
- [ ] Review code for architectural alignment

### AI Collaboration
- [ ] Use Strategic AI for planning
- [ ] Use Execution AI for implementation
- [ ] Never confuse the roles
- [ ] Always verify output

### Project Leadership
- [ ] Scope work appropriately
- [ ] Estimate effort accurately
- [ ] Prioritize ruthlessly
- [ ] Deliver consistently

---

## Training Path Completion

**Phase 1: Foundation Reset** (Week 1-2)
- Complete all Layer 1 examinations you failed
- Study comprehensive curriculum for weak areas
- Build mini-projects to reinforce learning

**Phase 2: Integration Mastery** (Week 3-4)
- Complete all Layer 2 integration challenges
- Build features combining 2-3 technologies
- Document patterns and gotchas

**Phase 3: Systems Command** (Week 5-6)
- Complete all Layer 3 systems challenges
- Build end-to-end features
- Make architectural decisions

**Phase 4: Project Completion** (Ongoing)
- Apply learnings to SangLogium
- Use AI workflow systematically
- Track progress and adjust

---

## Resources

### Documentation
- Next.js 15 App Router docs
- Sanity GROQ reference
- Stripe API reference
- Clerk documentation
- Tailwind design system guide

### Tools
- Claude.ai (Strategic AI)
- Windsurf/Cascade (Execution AI)
- Gemini (Generation AI)
- Playwright Test Generator
- WebPageTest (Performance)

### SangLogium-Specific
- `README.md` — Project overview
- `sanity/ORDER_MANAGEMENT_SYSTEM.md` — FSM docs
- `app/components/layout/catalogue/README.md` — VFS docs
- `_project/COMMANDS/` — AI protocols

---

*Training Curriculum Complete*
*Methodology: PEAK (Ericsson) + Extreme Ownership (Willink) + AI-Assisted Workflows*

**Now: Apply what you've learned. Lead SangLogium to professional completion.**
