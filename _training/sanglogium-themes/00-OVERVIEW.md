# SangLogium Professional Completion: Training Themes Overview

## Project Context
**SangLogium** is a large-scale e-commerce application for luxury audio equipment featuring 500+ products. It represents professional-grade full-stack development with complex architectural patterns including Virtual File Systems, Finite State Machines, and AI-assisted workflows.

**Project Status:** Final Construction Phase (Shipping in 1-2 weeks)
**Your Role:** Lead developer driving this project to professional completion

---

## The Three-Layer Skill Architecture

This training curriculum is organized into three progressive layers, following the deliberate practice methodology from PEAK (Anders Ericsson) and Extreme Ownership principles (Jocko Willink):

### **Layer 1: FOUNDATIONS** — Individual Technology Mastery
*"You cannot integrate what you do not understand deeply."*

Each major technology in isolation. Deep, penetrating examination of first principles, latest patterns, and edge cases.

**Technologies to Master:**
1. **Next.js 15 App Router** — Server Components, parallel data fetching, caching
2. **React 19 Server Components** — RSC patterns, client boundary decisions
3. **TypeScript with Sanity Typegen** — Generated types, strict contracts, CMS alignment
4. **Sanity CMS & GROQ** — Schema design, query optimization, content modeling
5. **Virtual File System Architecture** — Pre-computed paths, O(1) lookups, graph structures
6. **Finite State Machines** — Order lifecycle, state transitions, audit trails
7. **Stripe Integration** — Embedded checkout, idempotency, webhooks, refund flows
8. **Clerk Authentication** — User management, auth flows, role-based access
9. **Tailwind CSS Design Systems** — Scoped utilities, token architecture, constraint-based styling
10. **Testing Architecture** — Playwright E2E, Vitest unit/integration, strategic coverage
11. **Drawer State Management** — URL-based state, instant responsiveness, nested navigation
12. **AI-Assisted Development** — Role separation, constraint templates, phase assessment

### **Layer 2: INTEGRATIONS** — Technology Combinations
*"The whole is not the sum of its parts—it is the product of their interactions."*

How technologies combine to solve specific SangLogium problems:

1. **Next.js + Sanity + TypeScript** — Type-safe data flow from CMS to UI
2. **VFS + GROQ + Products** — Category-based product queries with pre-computed paths
3. **FSM + Inngest + Stripe** — Idempotent order processing with exactly-once execution
4. **Clerk + Sanity + RSC** — Auth-guarded server components with user data
5. **Tailwind + Next.js Image + Sanity CDN** — Performance-optimized image strategy
6. **Drawers + URL State + History API** — Navigation-preserving UI state
7. **Testing + CI/CD + GitHub Actions** — Automated quality gates

### **Layer 3: SYSTEMS** — Big Picture & Architecture
*"See the forest, understand the ecosystem, command the terrain."*

1. **Server-First Architecture** — Why RSC is default, when to use client components
2. **Performance Strategy** — Image CDN offloading, code splitting, build-time optimization
3. **Fault Tolerance** — Error boundaries, fallbacks, graceful degradation
4. **Data Flow Architecture** — Parallel fetching, zero prop-drilling, colocated queries
5. **Order Management System** — Physical-to-digital state mapping, role-based views
6. **Catalogue & Product Discovery** — Search, filter, sort, pagination with URL sync
7. **Checkout Experience** — Multi-step wizard, address validation, inventory locking
8. **Development Workflow** — AI role separation, constraint templates, verification loops

---

## Training Methodology: PEAK + Extreme Ownership

### **Deliberate Practice Principles** (from Anders Ericsson's PEAK)

1. **Well-Defined, Specific Goals**
   - Each training module has binary pass/fail criteria
   - No vague "understand better"—specific "can implement X given constraints Y"

2. **Intense, Focused Attention**
   - One technology at a time, no context switching
   - 60-90 minute focused sessions per foundation topic

3. **Immediate Feedback**
   - Self-testing after every module
   - Code implementation required, not just reading
   - Browser verification, test suite validation

4. **Frequent Repetition with Variation**
   - Same concepts applied to different SangLogium contexts
   - Edge cases, failure modes, recovery patterns

5. **Rigorous Monitoring of Progress**
   - Track completion of each layer
   - Identify weak points for additional practice

### **Extreme Ownership Principles** (from Jocko Willink)

1. **Extreme Ownership** — You are 100% responsible for this project's completion
2. **No Bad Teams, Only Bad Leaders** — If something fails, you failed to prepare/build correctly
3. **Believe** — You must fully believe in the mission (professional completion)
4. **Check the Ego** — Be willing to admit what you don't know and learn it deeply
5. **Cover and Move** — Use AI tools as teammates with clear roles (strategic vs execution)
6. **Simple** — Keep solutions simple, complexity is the enemy
7. **Prioritize and Execute** — When overwhelmed, prioritize, then execute ruthlessly
8. **Decentralized Command** — Give AI tools clear constraints so they can operate independently
9. **Plan** — Plan thoroughly but be ready to adapt
10. **Leading Up and Down the Chain** — Understand both high-level architecture and low-level implementation

---

## The Examination Structure

For each theme, you will face three types of examinations:

### **Type A: Diagnostic Assessment** (20 minutes)
- Quick stress test of current knowledge
- Identifies gaps before deep study
- Binary pass/fail for each sub-topic

### **Type B: Applied Implementation** (60-90 minutes)
- Build a specific SangLogium feature using this technology
- Constraint-based (real project constraints)
- Verified by working code + tests

### **Type C: Integration Challenge** (90-120 minutes)
- Combine 2-3 technologies to solve a real problem
- Systems-level thinking required
- End-to-end verification

---

## Cross-Cutting Concerns (All Layers)

These must be verified at every layer:

- **First Principles** — Why does this work? What's the fundamental truth?
- **Up-to-Date** — Latest patterns for 2026 (Next.js 15, React 19, latest Sanity)
- **Truth/Wholeness** — No falsehoods, no partial truths, full context provided
- **No Omissions** — What could go wrong? What's missing from typical tutorials?
- **Cross-Checked** — Verified against multiple authoritative sources
- **System-Coherent** — How does this fit with everything else?
- **Real-World Relevant** — Actually used in SangLogium, not theoretical
- **Professional Standard** — Would pass code review at top-tier company

---

## Recommended Training Sequence

### **Phase 1: Foundation Reset** (Week 1-2)
Complete all Layer 1 examinations for technologies you rate below "confident"

**Priority Order:**
1. Next.js 15 App Router (critical for everything)
2. TypeScript + Sanity Typegen (type safety foundation)
3. Sanity CMS + GROQ (data layer)
4. Virtual File System (SangLogium-specific, high complexity)
5. Tailwind Design Systems (daily use)

### **Phase 2: Integration Mastery** (Week 3-4)
Complete all Layer 2 integration challenges

### **Phase 3: Systems Command** (Week 5-6)
Complete all Layer 3 systems examinations

### **Phase 4: Continuous Application** (Ongoing)
Apply learnings to actual SangLogium completion work

---

## How to Use This Training Material

1. **Start with the diagnostic** for each theme
2. **If you fail any diagnostic item**, complete the full curriculum for that topic
3. **After curriculum**, complete the applied implementation examination
4. **After multiple foundations**, complete integration challenges
5. **Track progress** in your personal progress log
6. **Re-test weak areas** every 2 weeks (spaced repetition)

---

## Success Criteria

You are ready to lead SangLogium to completion when you can:

- Implement any Layer 1 technology under constraint without reference
- Debug integration issues between any two technologies
- Explain the system architecture to a senior engineer in 5 minutes
- Identify root causes of bugs in unfamiliar code
- Use AI tools with perfect role separation (strategic vs execution)
- Make architectural decisions with confidence

---

*Generated for SangLogium Project Completion Training*
*Methodology: PEAK (Ericsson) + Extreme Ownership (Willink) + AI-Assisted Workflows*
