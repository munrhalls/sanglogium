# AI Workspace Organization Analysis: Zach Davis Methodology

**Research Source:** Successfully coding with AI in large enterprises (Zach Davis, LaunchDarkly)  
**Research Date:** 2026-04-16  
**Applicability:** High - Enterprise AI adoption patterns for 100+ person engineering teams  
**Decay Risk:** Low - Foundational organizational principles

---

## Research Scope Contract

- **Topic:** Enterprise AI coding workspace organization and centralized rule systems
- **First Principles:** 
  1. What's good for humans is good for LLMs
  2. Centralized documentation beats scattered context
  3. Feedback loops improve agent performance over time
- **Fundamentals:** Rules systems, documentation patterns, feedback loops, deterministic guardrails
- **Scope Boundary:** Does not cover specific model prompting techniques or IDE features
- **Target Audience:** Teams scaling AI adoption beyond individual vibe-coding
- **Decay Risk:** Low - organizational patterns are tool-agnostic

---

## First Principles Analysis

### Core Problem Being Solved
Enterprise teams need to scale AI adoption across 100+ engineers without chaos. Individual "vibe coding" doesn't work when code must integrate with existing production systems, follow team conventions, and maintain quality standards.

### Underlying Constraints
1. **Code must integrate** - AI-generated code must work with existing production systems
2. **Multiple AI tools** - Teams use Cursor, Windsurf, Claude, Devin simultaneously
3. **Tacit knowledge exists** - Teams have unwritten conventions that humans know but AI doesn't
4. **Mistakes are inevitable** - First version of guidelines won't be perfect

### Inherent Tradeoffs
| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| Centralized rules | Consistency across tools | Tool-specific optimizations | Multi-tool teams |
| Tool-native rules | Deep IDE integration | Fragmented documentation | Single-tool teams |
| Examples-heavy | Clear patterns | Maintenance overhead | Complex conventions |
| Rules-heavy | Comprehensive | Overwhelming context | Simple conventions |

### Failure Modes
1. **Vibe coding at scale** - Individual prompts produce inconsistent, unintegratable code
2. **Documentation sprawl** - Rules scattered across files, no single source of truth
3. **Static guidelines** - Rules never updated despite agent mistakes repeating
4. **Giving up linters** - Relying solely on AI without deterministic guardrails

---

## Best Practices (Verified)

### Practice: Centralized Rules System
**Consensus:** High - appears in both LaunchDarkly and Stack Overflow research

**Supporting Evidence:**
- Zach Davis: "Create centralized documentation for both humans and AI agents"
- Stack Overflow: "Explicitly put all these rules in your agents.md and check them into a standard repo"

**Counter-Evidence:**
- Tool-native rules can leverage IDE-specific features (Windsurf memories, Cursor rules)

**Verdict:** ✅ Recommended for multi-tool teams

**When to Use:** Team uses 2+ AI tools (Cursor, Windsurf, Claude, Devin)
**When to Skip:** Single-tool team with deep IDE integration needs

---

### Practice: Gold Standard Example File
**Consensus:** Medium - emerging pattern, less established

**Supporting Evidence:**
- Stack Overflow: "Consider giving agents an overall example of what code looks like when it follows all guidelines—a 'gold standard' file"
- "Individual examples are like unit tests; your gold standard is the end-to-end test"

**Verdict:** ⚠️ Context-Dependent

**When to Use:** Complex codebase with many conventions that interact
**When to Skip:** Simple projects where individual examples suffice

---

### Practice: Feedback Loop from Agent Mistakes
**Consensus:** High - universally emphasized

**Supporting Evidence:**
- Quinn Slack (Sourcegraph): "If it makes a mistake, they'll go and update that and try to get it to be a flywheel"
- Stack Overflow: "Using failure as a feedback loop is how you'll have better agentic processes"
- Zach Davis: Systematic approach to using AI agents to analyze and reduce test noise

**Verdict:** ✅ Recommended

**When to Use:** All teams using AI agents
**When to Skip:** Never - feedback loops are essential

---

### Practice: Deterministic Guardrails + AI
**Consensus:** High - emphasized by multiple authorities

**Supporting Evidence:**
- Stack Overflow: "That said, this shouldn't be your call to give up all those other deterministic code standard enforcers"
- Logan Kilpatrick (Google): "Big companies have well-articulated style guides and best practices... All of that is perfect ripe context to give to the model"

**Verdict:** ✅ Recommended

**When to Use:** All production codebases
**When to Skip:** Rapid prototypes only (not production)

---

## Common Solutions Landscape

### Solution: .windsurfrules / .cursorrules / agents.md
**Prevalence:** Ubiquitous
**Type:** Idiomatic

**Pros:**
- Native IDE integration
- Automatic context inclusion
- Tool-specific optimizations

**Cons:**
- Fragmented across tools
- Duplication for multi-tool teams
- No single source of truth

**Real-World Pain Points:**
- Rules get out of sync between Cursor and Windsurf
- Team members using different tools get different guidance

**Recommendation:** Use tool-native files as thin wrappers around centralized source

---

### Solution: Feature Flagging for AI Configs
**Prevalence:** Niche (LaunchDarkly-specific)
**Type:** Emerging pattern

**Pros:**
- Runtime configuration changes
- A/B testing AI behaviors
- Gradual rollout of new rules

**Cons:**
- Adds complexity
- Vendor-specific (LaunchDarkly)

**Recommendation:** Advanced pattern for teams with existing feature flag infrastructure

---

### Solution: Agent Skills (MCP-based)
**Prevalence:** Emerging
**Type:** Workaround → becoming idiomatic

**Pros:**
- Standardized across editors
- Composable capabilities
- Vendor-agnostic

**Cons:**
- Newer, less mature
- Requires MCP support

**Recommendation:** Watch this space for standardization

---

## Verification & Falsification Log

### Claims Verified
| Claim | Evidence | Method |
|-------|----------|--------|
| Centralized rules needed for multi-tool teams | Zach Davis interview, Stack Overflow | Documentation analysis |
| Feedback loops improve agent output | Quinn Slack quote, Charity Majors blog post | Expert testimony |
| Deterministic tools still essential | Stack Overflow guidelines | Best practice synthesis |
| Examples better than rules alone | Stack Overflow research | Academic citation |

### Falsification Attempts
| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| Centralized always wins | Tool-native rules enable deeper integration | Survived - use hybrid approach |
| Examples are sufficient | Complex interactions need explicit rules | Modified - need both examples AND rules |
| AI replaces linters | Linters catch basics agents botch | Survived - use both |

### Knowledge Decay Assessment
| Section | Risk | Review Date |
|---------|------|-------------|
| MCP/Agent Skills | High | 2026-07-16 |
| Specific tools | Medium | 2026-06-16 |
| Organizational principles | Low | 2027-04-16 |

---

## Synthesis: Actionable Takeaways

### For Our Project (sang-logium)

| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| Create `AGENTS.md` at repo root | Centralized source of truth for all AI tools | Single file, tool-agnostic rules |
| Keep `.windsurfrules` as thin wrapper | Windsurf-specific optimizations | Import/reference AGENTS.md |
| Add `examples/gold-standard.ts` | Show all conventions in one place | One file demonstrating patterns |
| Create `_project/feedback-loop.md` | Track agent mistakes → rule updates | Running log of mistakes and fixes |
| Explicit linter integration | Deterministic guardrails essential | Document in AGENTS.md |

### Immediate Actions (Priority Ordered)

1. **[HIGH] Create `AGENTS.md`** - Centralized rules file at repo root
   - Consolidate .windsurfrules content
   - Add before/after examples for each rule
   - Include "gold standard" reference file pointer

2. **[HIGH] Establish feedback loop process** - Document how to update rules when agents make mistakes
   - Template for logging agent mistakes
   - Process for converting mistakes to rule updates
   - Monthly review cadence

3. **[MEDIUM] Create `examples/gold-standard.tsx`** - Single file showing all conventions
   - Server Component example
   - Client Component example
   - Data fetching pattern
   - Styling pattern
   - Test pattern

4. **[MEDIUM] Simplify _handbook structure** - Current structure is deep and complex
   - Flatten where possible
   - Merge overlapping sections
   - Add "start here" guide

5. **[LOW] Add deterministic guardrails checklist** - Explicit linter/formatter integration
   - ESLint rules that catch common agent mistakes
   - Pre-commit hooks documentation
   - CI pipeline requirements

### Open Questions

1. Should we maintain separate AGENTS.md and .windsurfrules, or auto-generate .windsurfrules from AGENTS.md?
2. How do we prevent AGENTS.md from becoming as large as current .windsurfrules (279 lines)?
3. What's the right granularity for gold-standard examples?

---

## Sources

| Source | URL | Type | Credibility | Date |
|--------|-----|------|-------------|------|
| Zach Davis Interview | youtube.com/watch?v=HtzkfjEH-GU | Primary | High | 2025-07 |
| Stack Overflow Blog | stackoverflow.blog/2026/03/26/coding-guidelines-for-ai-agents | Best Practice | High | 2026-03 |
| LaunchDarkly Agent Skills | launchdarkly.com/docs/tutorials/agent-skills-quickstart | Vendor Docs | Medium | 2026 |
| Sourcegraph CEO Quote | stackoverflow.blog/2025/06/25 | Expert | High | 2025-06 |
| Logan Kilpatrick (Google) | stackoverflow.blog/2025/06/10 | Expert | High | 2025-06 |
