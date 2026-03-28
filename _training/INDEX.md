# Master Training Index

## System Overview

This directory contains a comprehensive skill assessment and training system for the Sang Logium tech stack. It integrates three proven methodologies:

1. **Ericsson's Deliberate Practice** - Progressive difficulty, immediate feedback
2. **Feynman Technique** - Teaching/explanation to expose gaps
3. **Jocko Willink's Discipline** - Binary pass/fail, extreme ownership

---

## Quick Start

### For First-Time Users

1. **Read:** `methodology/FOUNDATION.md` - Understand the philosophy
2. **Assess:** Start with `examination/L1-01-nextjs-app-router.md`
3. **Study:** Use corresponding `curriculum/CURRICULUM-nextjs.md`
4. **Reassess:** Return to examination until passed
5. **Progress:** Move to Layer 2 integrations

### Recommended Order

**Layer 1 (Individual Technologies)** - 6 weeks at 90 min/day:
1. Next.js 15 App Router
2. TypeScript 5.x
3. React 18 Server/Client
4. Tailwind CSS 3.x
5. Sanity CMS + GROQ
6. Testing (Vitest + Playwright)

**Layer 2 (Integrations)** - 3 weeks at 90 min/day:
1. Next.js + Sanity Integration
2. React + TypeScript Patterns
3. Forms + Validation (RHF + Zod)

**Layer 3 (Systems)** - 1 week at 120 min/day:
1. Systems Architecture

---

## Directory Structure

```
_training/
├── methodology/
│   └── FOUNDATION.md              # Core philosophy & standards
│
├── examination/
│   ├── L1-01-nextjs-app-router.md # Individual: Next.js
│   ├── L1-02-typescript.md         # Individual: TypeScript
│   ├── L1-03-react-18.md          # Individual: React
│   ├── L1-04-tailwind-css.md     # Individual: Tailwind
│   ├── L1-05-sanity-cms.md       # Individual: Sanity
│   ├── L1-06-testing.md          # Individual: Testing
│   ├── L2-01-nextjs-sanity.md    # Integration: Next.js + Sanity
│   ├── L2-02-react-typescript.md # Integration: React + TypeScript
│   ├── L2-03-forms-validation.md # Integration: Forms
│   └── L3-01-systems-architecture.md # Systems: Full architecture
│
├── curriculum/
│   ├── CURRICULUM-nextjs.md      # Next.js study plan
│   ├── CURRICULUM-typescript.md  # TypeScript study plan
│   ├── CURRICULUM-react.md       # React study plan
│   ├── CURRICULUM-tailwind.md    # Tailwind study plan
│   ├── CURRICULUM-sanity.md      # Sanity study plan
│   └── CURRICULUM-testing.md     # Testing study plan
│
└── cross-reference/
    └── (to be created)           # Prerequisite maps
```

---

## Tech Stack Coverage

### Core Framework
- ✅ Next.js 15 App Router (Server Components default)
- ✅ React 18 (Server/Client architecture)
- ✅ TypeScript 5.x (Strict mode)

### Data Layer
- ✅ Sanity CMS 3.x (Headless CMS)
- ✅ GROQ (Query language)
- ✅ Zustand (Client state)

### Styling
- ✅ Tailwind CSS 3.x (Utility-first)
- ✅ Custom design system
- ✅ Radix UI primitives

### Testing
- ✅ Vitest (Unit testing)
- ✅ Playwright (E2E testing)
- ✅ React Testing Library

### Integration
- ✅ Next.js + Sanity patterns
- ✅ TypeScript + React patterns
- ✅ Forms (React Hook Form + Zod)

### Systems
- ✅ End-to-end architecture
- ✅ Caching strategy
- ✅ Performance optimization

### Additional Technologies (to be added)
- Clerk authentication
- Stripe payments
- Server Actions
- Middleware patterns
- VFS (Virtual File System)

---

## Examination Protocol

### Before Starting
1. Verify prerequisites completed (checked in attestation)
2. Set timer for specified duration
3. Close all documentation
4. Sign attestation

### During Examination
1. Complete closed-book sections first
2. Mark uncertain answers clearly
3. Do not peek at documentation
4. Time-box each section

### After Examination
1. Open-book verification phase
2. Document all gaps in understanding
3. Schedule re-examination within 48 hours for failures
4. Update progress tracker

---

## Pass Criteria

### Layer 1 (Individual)
- Can implement without documentation
- Can explain from first principles
- Can identify 5+ common pitfalls
- All code compiles without errors

### Layer 2 (Integration)
- Can architect multi-technology solutions
- Can debug across boundaries
- Can explain integration failure modes
- Can optimize for performance

### Layer 3 (Systems)
- Can whiteboard entire request lifecycle
- Can identify single points of failure
- Can prioritize technical decisions
- Can plan evolution roadmap

---

## Information Quality Standards

Every document validates against:

| Dimension | Validation |
|-----------|------------|
| First Principles | Can derive from fundamentals |
| Currency | 2026-latest practices |
| Truth/Wholeness | No omissions or false dichotomies |
| Contextual Integrity | Prerequisites and dependents mapped |
| Cross-Validation | 2+ independent sources |
| System Coherence | No architectural conflicts |
| Real-World Relevance | Production-tested patterns |

---

## Daily Study Template

```
Date: ___________
Topic: ___________
Duration: _______

Morning Session:
- Theory study: _______ min
- Code practice: _______ min
- Self-explanation: ___ min

Evening Session:
- Review: ___________ min
- Spaced repetition: _ min

Challenges encountered:
1. ___________________________
2. ___________________________

Gaps identified:
1. ___________________________
2. ___________________________

Tomorrow's focus: _______________

Signed: _________________
```

---

## Progress Tracking

### Layer 1 Status
| Topic | Started | Closed-Book | Open-Book | Passed | Re-exam |
|-------|---------|-------------|-----------|--------|---------|
| Next.js | | | | | |
| TypeScript | | | | | |
| React | | | | | |
| Tailwind | | | | | |
| Sanity | | | | | |
| Testing | | | | | |

### Layer 2 Status
| Topic | Prerequisites | Started | Passed |
|-------|---------------|---------|--------|
| Next.js + Sanity | | | |
| React + TypeScript | | | |
| Forms | | | |

### Layer 3 Status
| Topic | All L1/L2 | Started | Passed |
|-------|-----------|---------|--------|
| Systems Architecture | | | |

---

## Success Metrics

### Short-term (4 weeks)
- [ ] 100% Layer 1 completion
- [ ] Zero "I think" in explanations
- [ ] All code examples compile

### Medium-term (8 weeks)
- [ ] 100% Layer 2 completion
- [ ] Debug any integration in <15 min
- [ ] Explain trade-offs with business context

### Long-term (12 weeks+)
- [ ] Architect new features without reference
- [ ] Mentor others on any topic
- [ ] Identify and correct architectural drift

---

## Authoritative Sources

**Official Documentation (always preferred):**
- nextjs.org/docs
- react.dev/reference/react
- typescriptlang.org/docs/handbook
- tailwindcss.com/docs
- sanity.io/docs
- vitest.dev/guide
- playwright.dev/docs

**Prohibited Sources:**
- Blog posts without version dates
- Tutorial videos without docs
- Stack Overflow without verification
- "Best practice" without benchmarks

---

## Maintenance

This training system requires updates when:
- Major version releases (Next.js 16, React 19, etc.)
- New patterns emerge in codebase
- Gaps identified during examinations

Update process:
1. Modify relevant examination
2. Update curriculum
3. Version bump
4. Re-examine on changed topics

---

## Support

For gaps in understanding:
1. Re-study curriculum section
2. Examine actual codebase implementation
3. Consult official documentation
4. Create minimal reproduction
5. Return to examination

---

*System Version: 1.0*
*Created: March 27, 2026*
*Methodology: Ericsson + Feynman + Willink*
