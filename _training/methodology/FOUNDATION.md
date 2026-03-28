# Training Methodology Foundation

## Core Philosophy

This training system integrates three proven methodologies for maximum skill acquisition and retention:

### 1. Ericsson's Deliberate Practice (Peak)
**Source:** Ericsson, K. A., Krampe, R. T., & Tesch-Römer, C. (1993). The role of deliberate practice in the acquisition of expert performance. Psychological Review, 100(3), 363-406.

**Key Principles Applied:**
- **Task Repetition with Feedback Loops:** Each examination module includes immediate self-assessment checkpoints
- **Progressive Difficulty Escalation:** Foundation → Integration → Systems levels
- **Mental Representation Building:** Concept maps and cross-referencing requirements
- **Effortful Engagement:** No passive reading; active retrieval required at each step
- **Immediate Error Correction:** Built-in "truth validation" against first principles

**Application in This System:**
- Every topic has three difficulty tiers (Individual → Integration → Systems)
- Socratic questioning forces active retrieval, not recognition
- Cross-reference requirements ensure mental model integration
- Time-boxed challenges with progressive constraints

### 2. Feynman Technique
**Source:** Richard Feynman's pedagogical method (as documented in "Surely You're Joking, Mr. Feynman!")

**Four-Step Implementation:**
1. **Study:** Deep dive into the topic with first-principles analysis
2. **Teach:** Explain in your own words as if to a beginner (captured in "Explanation" sections)
3. **Identify Gaps:** "What am I missing?" prompts throughout
4. **Simplify & Analogize:** Force plain-English explanations before technical jargon

**Application in This System:**
- Each examination requires you to explain concepts in two ways:
  - Technical explanation (for peer review)
  - Plain-English analogy (for true understanding)
- "Knowledge gap detection" prompts at every section
- "Explain like I'm 5" (ELI5) requirements for complex topics

### 3. Jocko Willink's Extreme Ownership & Discipline Framework
**Source:** Willink, J., & Babin, L. (2015). Extreme Ownership: How U.S. Navy SEALs Lead and Win.

**Principles Applied:**
- **Extreme Ownership:** No excuses. "I don't know" is acceptable; "I didn't have time" is not.
- **Prioritize and Execute:** Clear hierarchy of importance; tackle one thing at maximum effort
- **Decentralized Command:** Each topic is self-contained but linked (modular independence)
- **Simple:** Complexity is the enemy of execution. Clear, binary pass/fail assessments.
- **Discipline = Freedom:** Rigorous daily examination creates operational capability

**Application in This System:**
- Binary assessment: You either can explain it from first principles or you cannot
- No partial credit on critical concepts
- Daily examination structure (not cramming)
- Self-accountability checkpoints with signature requirements

---

## Information Quality Standards

Every piece of information in this system is validated against these dimensions:

| Dimension | Validation Question | Failure Mode |
|-----------|---------------------|--------------|
| **First Principles** | Can I derive this from fundamental truths? | Memorization without derivation |
| **Currency** | Is this the latest stable version/practice? (2026 context) | Outdated patterns or deprecated APIs |
| **Truth/Wholeness** | Are there counter-arguments or edge cases I'm ignoring? | False dichotomies, oversimplification |
| **Contextual Integrity** | Am I missing prerequisites or downstream effects? | Isolated knowledge without ecosystem awareness |
| **Cross-Validation** | Can I verify this through 2+ independent sources? | Single-source dependencies |
| **System Coherence** | Does this conflict with other architectural decisions? | Local optimization, global breakage |
| **Real-World Relevance** | Does this solve an actual production problem? | Academic exercises, resume-driven development |

---

## Examination Structure

### Layer 1: Individual Technology Assessment
**Goal:** Verify foundational knowledge of each tool/language in isolation

**Format:**
- First-principles explanation (written)
- Code implementation (working example)
- Edge case identification (3+ scenarios)
- Version-specific awareness (current vs. deprecated)

**Pass Criteria:**
- Can implement from scratch without documentation
- Can explain internal mechanisms
- Can identify 5+ common pitfalls

### Layer 2: Integration Assessment
**Goal:** Verify ability to combine technologies correctly

**Format:**
- Cross-boundary problem solving (e.g., React + Sanity + TypeScript)
- Debugging scenarios at integration points
- Performance trade-off analysis
- Security implication assessment

**Pass Criteria:**
- Can architect multi-technology solutions
- Can debug across abstraction boundaries
- Can explain integration failure modes

### Layer 3: Systems Assessment
**Goal:** Verify holistic understanding of the entire application architecture

**Format:**
- End-to-end system design under constraints
- Failure scenario analysis (cascading failures)
- Optimization prioritization with business context
- Evolution planning (how this scales/changes)

**Pass Criteria:**
- Can whiteboard the entire request lifecycle
- Can identify single points of failure
- Can prioritize technical debt vs. features

---

## Daily Examination Protocol

### Recommended Cadence
- **Week 1-2:** Layer 1 examinations (2-3 topics per day)
- **Week 3-4:** Layer 2 examinations (1-2 integrations per day)
- **Week 5-6:** Layer 3 systems examinations (1 comprehensive per day)
- **Ongoing:** Spaced repetition of failed topics

### Examination Session Structure (90 minutes)
1. **Preparation (10 min):** Review topic, gather materials, set intention
2. **Closed-Book Recall (20 min):** Write everything you know without reference
3. **Open-Book Verification (20 min):** Check against documentation, identify gaps
4. **Implementation Challenge (30 min):** Build something under constraints
5. **Post-Mortem (10 min):** Document failures, schedule re-examination

### Accountability Mechanism
- Each examination ends with a signed attestation: *"I can explain this from first principles as of [DATE]"
- Failed topics are queued for re-examination within 48 hours
- No advancement until prerequisite topics pass

---

## Cross-Reference System

Every document includes:
- **Prerequisites:** What you MUST know before starting
- **Dependents:** What builds on this topic
- **Conflicts:** Competing approaches/patterns (and when to use each)
- **Sources:** Authoritative references (not blog posts)

---

## Tech Stack Inventory (Sang Logium)

Based on codebase analysis, here is the complete technology landscape:

### Core Framework & Runtime
- **Next.js 15.5.9** (App Router, Server Components default)
- **React 18.3.1** (Server/Client component architecture)
- **TypeScript 5.x** (Strict mode implied by user rules)
- **Node.js** (Latest LTS implied)

### Data Layer
- **Sanity CMS 3.74.1** (Headless CMS, structured content)
- **GROQ** (Query language for Sanity)
- **Zustand 5.0.1** (Client state management)

### Styling & UI
- **Tailwind CSS 3.3.5** (Utility-first CSS)
- **Radix UI** (Headless UI primitives: Dialog, Popover, Slot)
- **Phosphor Icons** (Icon library)
- **Class Variance Authority (CVA)** (Component variants)
- **Tailwind Merge + CLSX** (Conditional class handling)

### Authentication & Authorization
- **Clerk 6.16.0** (Next.js authentication)

### Payment & Commerce
- **Stripe 19.1.0** (Payment processing)
- **@stripe/react-stripe-js** (Payment elements)

### Forms & Validation
- **React Hook Form 7.66.0** (Form management)
- **Zod 4.1.12** (Schema validation)
- **@hookform/resolvers** (Validation adapters)

### Testing
- **Vitest 4.0.13** (Unit testing)
- **Playwright 1.56.1** (E2E testing)
- **@testing-library/react** (Component testing)
- **@axe-core/playwright** (Accessibility testing)

### Build & Development Tools
- **Turbopack** (Next.js dev bundler)
- **PostCSS** (CSS processing)
- **ESLint 9.x** (Linting)
- **Prettier 3.8.1** (Code formatting)
- **TypeScript-ESLint** (TS-specific linting)

### External Services
- **Netlify** (Deployment/hosting)
- **Google Maps Address Validation API**
- **Sentry** (Error tracking - @sentry/react present)

### Utilities & Libraries
- **Lodash** (Utility functions)
- **Nanoid** (ID generation)
- **Date-fns** (implied by timestamp handling)
- **groq-builder** (Type-safe GROQ queries)

---

## Success Metrics

### Short-term (Weeks 1-4)
- 100% Layer 1 completion with signed attestations
- Zero "I think" or "probably" in explanations
- All code examples compile without errors

### Medium-term (Weeks 5-8)
- 100% Layer 2 completion
- Can debug any integration issue in <15 minutes
- Can explain trade-offs with business context

### Long-term (Ongoing)
- Can architect new features without reference materials
- Can mentor others on any topic in the stack
- Can identify and correct architectural drift

---

## Reference Documentation

**Primary Sources (in priority order):**
1. Official documentation (react.dev, nextjs.org, sanity.io, etc.)
2. RFCs and specification documents (W3C, TC39, etc.)
3. Source code (when documentation is insufficient)
4. Academic papers (for theoretical foundations)

**Prohibited Sources:**
- Blog posts without version dates
- Tutorial videos without accompanying documentation
- Stack Overflow answers without official source verification
- "Best practice" articles without performance benchmarks

---

*Document Version: 1.0*
*Created: March 27, 2026*
*Methodology: Ericsson (Deliberate Practice) + Feynman (Learning) + Willink (Discipline)*
