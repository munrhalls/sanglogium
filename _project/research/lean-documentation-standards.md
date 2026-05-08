# Research: Lean Documentation Standards

**Research Date:** 2026-05-08  
**Topic:** Lean documentation standards vs heavy documentation approaches - when to use each  
**Decay Risk:** Low (documentation principles evolve slowly)

---

## Research Scope Contract

- **Topic:** Lean vs heavy documentation standards - justification, tradeoffs, and when to use each
- **First Principles:**
  1. Documentation serves communication and organizational memory, not compliance
  2. The cost of documentation must be justified by its value
  3. Code + tests can serve as executable documentation
- **Fundamentals:**
  - README Driven Development (RDD)
  - Architecture Decision Records (ADRs)
  - Agile/Lean documentation principles
  - Tests as documentation
- **Scope Boundary:**
  - OUT: Tool-specific documentation (e.g., Swagger, Javadoc)
  - OUT: User-facing documentation (manuals, guides)
  - IN: Internal technical documentation for developers
- **Target Audience:** Development teams deciding on documentation approach
- **Decay Risk:** Low - these principles are stable

---

## First Principles Analysis

### Core Problem Being Solved
Documentation exists to solve two fundamental problems:
1. **Communication** - Helping team members understand the system during development
2. **Organizational Memory** - Preserving knowledge for future maintenance and onboarding

### Underlying Constraints
1. **Time is finite** - Every hour spent on documentation is an hour not spent on features
2. **Knowledge decays** - Documentation becomes outdated as code changes
3. **Trust is fragile** - Developers don't trust documentation that's out of sync with code
4. **Context varies** - Different projects need different levels of documentation

### Inherent Tradeoffs

| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| Heavy documentation (Atlassian style) | Comprehensive, complete, auditable | Expensive, quickly outdated, low trust | Regulated industries, large teams, long-lived systems |
| Lean documentation (RDD + ADRs) | Fast, accurate, trusted | Incomplete, requires discipline | Most software projects, agile teams |
| No documentation | Maximum speed for coding | High onboarding cost, knowledge loss | Tiny projects, throwaway prototypes |
| Tests as documentation | Always accurate, executable | Requires test literacy, high maintenance | TDD/BDD teams, well-tested codebases |

### Failure Modes
1. **Over-documentation:** Spending more time documenting than coding
2. **Under-documentation:** Critical decisions lost when people leave
3. **Documentation rot:** Docs exist but are wrong, so nobody trusts them
4. **Template-driven:** Following a template without understanding purpose

---

## Code Fundamentals

### Fundamental: README Driven Development (RDD)

**Claim:** Writing README first clarifies thinking and produces useful documentation

**Verification:**
- [x] Source inspected: Tom Preston-Werner's original RDD post
- [ ] Located in our codebase: (to be verified)
- [ ] Test created: N/A (process practice)

**Actual Behavior:**
RDD proposes writing the README before any code. The README should:
- Describe what the software does
- Explain how to use it
- Document the public API
- Provide installation instructions

Benefits:
- Forces thinking before coding
- Produces documentation when motivation is highest
- Enables parallel development (team can start depending on API)
- Provides concrete artifact for discussion

**Edge Cases:**
1. Not suitable for exploratory projects where requirements are unknown
2. May feel like waterfall if taken too far (over-specified)
3. Requires discipline to keep README updated

### Fundamental: Architecture Decision Records (ADRs)

**Claim:** ADRs provide lightweight, immutable records of architectural decisions

**Verification:**
- [x] Source inspected: ADR GitHub, Martin Fowler's bliki
- [ ] Located in our codebase: (to be verified)
- [ ] Test created: N/A (documentation artifact)

**Actual Behavior:**
ADRs are short documents (1-2 pages) that capture:
- The decision
- Context and rationale
- Trade-offs considered
- Consequences
- Confidence level

Structure:
- Stored in `doc/adr/` in source repository
- Numbered sequentially (e.g., `0001-use-redis-for-queue.md`)
- Written in markdown
- Never modified - superseded by new ADR if changed
- Status: proposed → accepted → superseded

Benefits:
- Preserves decision rationale over time
- Forces clarity of thinking
- Provides decision history
- Lightweight (no templates, minimal overhead)

**Edge Cases:**
1. May not work for non-developers (git access required)
2. Can become bureaucratic if overused
3. Requires culture of actually writing them

---

## Best Practices (Verified)

### Practice: Agile/Lean Documentation Principles

**Consensus:** High - widely accepted in agile community

**Supporting Evidence:**
- AgileModeling.com: 22 critical points for lean documentation
- Key principles: "Travel light", "Just barely good enough", "Update only when it hurts"
- Prefer executable specifications (tests) over static documents
- Document stable concepts, not speculative ideas

**Counter-Evidence (Falsification Attempts):**
- Critique: "No documentation" is taken too far by some teams
- Mitigation: Recognize that some documentation is necessary for organizational memory
- Critique: Stakeholders may require heavy documentation for compliance
- Mitigation: Documentation is a business decision, not technical - if stakeholders pay for it, create it

**Verdict:** ✅ Recommended for most software projects

**When to Use:** Agile teams, most commercial software, fast-moving projects
**When to Skip:** Regulated industries (compliance requires heavy docs), safety-critical systems

### Practice: README Driven Development

**Consensus:** High - popular in open source and startups

**Supporting Evidence:**
- Tom Preston-Werner (GitHub co-founder): Original RDD manifesto
- Widely adopted in open source projects
- Simple, practical, produces immediate value

**Counter-Evidence (Falsification Attempts):**
- Critique: Can feel like waterfall if over-specified
- Mitigation: Keep README high-level, avoid detailed specifications
- Critique: Not suitable for all project types
- Mitigation: Use for libraries, APIs, well-defined features; avoid for pure exploration

**Verdict:** ✅ Recommended for libraries, APIs, and well-scoped features

**When to Use:** New libraries, APIs, features with clear requirements
**When to Skip:** Exploratory projects, research spikes, pure experimentation

### Practice: Architecture Decision Records (ADRs)

**Consensus:** High - gaining traction in architecture community

**Supporting Evidence:**
- ADR GitHub organization: Standardized approach
- Martin Fowler: Endorses as lightweight decision capture
- Azure Well-Architected Framework: Recommends ADRs

**Counter-Evidence (Falsification Attempts):**
- Critique: Can become bureaucratic if overused
- Mitigation: Only use for architecturally significant decisions
- Critique: Non-developers can't access git
- Mitigation: Publish ADRs to internal wiki or website

**Verdict:** ✅ Recommended for architectural decisions

**When to Use:** Significant architectural choices, technical trade-offs, cross-team decisions
**When to Skip:** Trivial implementation details, temporary hacks

### Practice: Tests as Documentation

**Consensus:** High - core tenet of TDD/BDD

**Supporting Evidence:**
- AgileModeling.com: "Prefer executable specifications over static documents"
- TDD community: Tests are the best documentation because they never lie
- BDD practices: Gherkin scenarios serve as readable specifications

**Counter-Evidence (Falsification Attempts):**
- Critique: Tests are code, not readable by non-developers
- Mitigation: Use BDD/Gherkin for business-readable tests
- Critique: Tests can become complex and hard to understand
- Mitigation: Keep tests simple, well-named, focused

**Verdict:** ✅ Recommended as primary documentation for behavior

**When to Use:** Business logic, API contracts, complex algorithms
**When to Skip:** High-level architecture, installation guides, user-facing docs

---

## Common Solutions Landscape

### Solution: Atlassian-Style Heavy Documentation

**Prevalence:** Common in enterprise, regulated industries
**Type:** Traditional/Heavy

**Pros:**
- Comprehensive and complete
- Auditable for compliance
- Satisfies stakeholders who demand documentation
- Good for large distributed teams

**Cons:**
- Expensive to create and maintain
- Quickly becomes outdated
- Developers don't trust it (often wrong)
- Slows down development
- Template-driven without purpose

**Real-World Pain Points:**
- Documentation rot: Docs exist but are ignored because they're wrong
- Waterfall in disguise: Heavy specs written before any code
- Maintenance burden: Every code change requires doc updates
- Low utilization: Nobody reads 50-page documents

**Recommendation:** Use only when justified by specific needs (compliance, large teams, safety-critical). Avoid for most software projects.

### Solution: README Driven Development

**Prevalence:** Common in open source, startups
**Type:** Lean/Lightweight

**Pros:**
- Simple and practical
- Produces immediate value
- Forces thinking before coding
- Single source of truth for project overview

**Cons:**
- Limited scope (can't capture everything)
- Requires discipline to keep updated
- Not suitable for complex multi-component systems

**Real-World Pain Points:**
- READMEs become outdated if not maintained
- May not scale for very large projects
- Can feel like "waterfall lite" if over-specified

**Recommendation:** Use as primary documentation for libraries, APIs, and most features. Keep it high-level and focused on user-facing information.

### Solution: Architecture Decision Records (ADRs)

**Prevalence:** Growing in architecture community
**Type:** Lean/Lightweight

**Pros:**
- Lightweight (1-2 pages per decision)
- Immutable history of decisions
- Forces clarity of thinking
- Easy to maintain in git
- No templates or bureaucracy

**Cons:**
- Only captures decisions, not complete system overview
- Requires culture of actually writing them
- Git access required (may exclude non-developers)

**Real-World Pain Points:**
- Decisions not recorded if team doesn't have discipline
- Can accumulate if not pruned (superseded decisions)
- May not satisfy stakeholders who want comprehensive docs

**Recommendation:** Use for all architecturally significant decisions. Keep them short and focused.

### Solution: Tests as Documentation

**Prevalence:** Ubiquitous in TDD/BDD teams
**Type:** Executable

**Pros:**
- Always accurate (tests fail if wrong)
- Executable (can verify behavior)
- Serves as regression tests
- No maintenance overhead beyond test updates

**Cons:**
- Requires test literacy to read
- Can become complex and hard to understand
- Doesn't capture high-level architecture
- Not suitable for non-technical stakeholders

**Real-World Pain Points:**
- Tests become unreadable if not well-written
- Doesn't replace need for high-level docs
- May not capture "why" decisions were made

**Recommendation:** Use as primary documentation for behavior. Combine with ADRs for decision rationale.

---

## Verification & Falsification Log

### Claims Verified

| Claim | Evidence | Method |
|-------|----------|--------|
| Heavy documentation is expensive and often wrong | AgileModeling.com 22 critical points | Documentation |
| RDD clarifies thinking before coding | Tom Preston-Werner RDD post | Documentation |
| ADRs provide lightweight decision capture | ADR GitHub, Martin Fowler | Documentation |
| Tests are better than static docs for behavior | AgileModeling.com executable specs | Documentation |

### Falsification Attempts

| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| No documentation is best | Organizational memory requires some docs | Modified: Lean docs, not zero |
| RDD is waterfall | RDD is high-level, not detailed specs | Survived: Properly applied RDD is not waterfall |
| ADRs are bureaucratic | ADRs are 1-2 pages, no templates | Survived: Only bureaucratic if overused |

### Knowledge Decay Assessment

| Section | Risk | Review Date |
|---------|------|-------------|
| Lean documentation principles | Low | 2027-05-08 |
| RDD | Low | 2027-05-08 |
| ADRs | Low | 2027-05-08 |
| Tests as docs | Low | 2027-05-08 |

---

## Synthesis: Actionable Takeaways

### For Our Project

| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| Use README Driven Development | Simple, produces immediate value, clarifies thinking | Write README before coding features/libraries |
| Use ADRs for architectural decisions | Lightweight, preserves rationale, no bureaucracy | Create `doc/adr/` directory, write ADRs for significant decisions |
| Use tests as primary behavior documentation | Always accurate, executable, no rot | Focus on well-written, descriptive tests |
| Avoid Atlassian-style heavy docs | Expensive, outdated, low trust | Only use if specifically justified (compliance, etc.) |
| Update docs only when it hurts | Prevents wasted effort on low-value updates | Follow AgileModeling principle |

### When Heavy Documentation Is Justified

Heavy documentation (Atlassian-style) is justified ONLY when:

1. **Regulatory Compliance Required**
   - Healthcare (HIPAA)
   - Finance (SOX, PCI-DSS)
   - Safety-critical systems (automotive, aerospace)
   - Government contracts with documentation requirements

2. **Large Distributed Teams**
   - 50+ developers across multiple time zones
   - High turnover requiring extensive onboarding
   - Multiple teams working on same system
   - Need for handoffs between teams

3. **Long-Lived Enterprise Systems**
   - Systems expected to last 10+ years
- Multiple generations of developers will maintain it
   - Critical business infrastructure with high cost of failure

4. **External Stakeholder Requirements**
   - Customers explicitly require documentation in contracts
   - Partners need integration specifications
   - Auditors require process documentation

5. **Safety-Critical or High-Risk Systems**
   - Systems where failure could cause injury or death
   - High-value financial systems
   - Systems with legal liability implications

**For all other cases, lean documentation is superior.**

### The Leanest Documentation Standard

**The leanest effective standard combines:**

1. **README (1-5 pages)**
   - What the system does
   - How to install/run it
   - Quick start guide
   - API overview (if applicable)
   - Link to ADRs

2. **Architecture Decision Records (1-2 pages each)**
   - Only for architecturally significant decisions
   - Stored in `doc/adr/`
   - Numbered sequentially
   - Never modified, only superseded

3. **Tests as Documentation**
   - Well-written, descriptive tests
   - BDD/Gherkin for business logic if needed
   - Test names describe behavior

4. **Inline Code Documentation**
   - Comments only for "why", not "what"
   - Complex algorithms explained
   - Public APIs documented with JSDoc/TSDoc

**Total overhead:** ~1-2 hours per feature (README) + 15-30 minutes per significant decision (ADR)

**This is 10-20x lighter than Atlassian-style documentation.**

### Immediate Actions

1. **Adopt README Driven Development**
   - Write README before coding new features/libraries
   - Keep it high-level (1-5 pages)
   - Focus on user-facing information

2. **Set up ADR structure**
   - Create `doc/adr/` directory
   - Write ADR template (status, context, decision, consequences)
   - Write first ADR for existing architectural decisions

3. **Audit existing documentation**
   - Identify heavy docs that can be replaced with README + ADRs
   - Remove outdated documentation
   - Consolidate overlapping docs

4. **Improve test documentation**
   - Ensure test names are descriptive
   - Add comments for complex test scenarios
   - Consider BDD/Gherkin for business-critical logic

### Open Questions

1. What is the current documentation state in our codebase? (Requires audit)
2. Which existing documents can be replaced with lean alternatives?
3. Do we have any regulatory compliance requirements that justify heavy docs?
4. What is our team size and turnover rate?

---

## References

| Source | URL | Type | Credibility | Date | Key Claim | Verification Status |
|--------|-----|------|-------------|------|-----------|---------------------|
| AgileModeling Lean Docs | https://agilemodeling.com/essays/agiledocumentation.htm | Authoritative Blog | High | 2026-05-08 | 22 critical points for lean documentation | ✅ Verified |
| AgileModeling Best Practices | https://agilemodeling.com/essays/agiledocumentationbestpractices.htm | Authoritative Blog | High | 2026-05-08 | Prefer executable specs, document stable concepts | ✅ Verified |
| RDD Manifesto | https://tom.preston-werner.com/2010/08/23/readme-driven-development | Blog Post | High | 2026-05-08 | Write README first to clarify thinking | ✅ Verified |
| ADR GitHub | https://adr.github.io/ | Official Site | High | 2026-05-08 | ADRs capture architectural decisions lightly | ✅ Verified |
| Martin Fowler ADR | https://martinfowler.com/bliki/ArchitectureDecisionRecord.html | Expert Blog | High | 2026-05-08 | ADRs are short, immutable decision records | ✅ Verified |

