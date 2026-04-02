# AI-Leverage Engineering Curriculum: The Underground Path
## How to Architect Context, Feedback Loops, and Compression to Make Any Model Effective

**Date:** April 2, 2026
**Research Phase:** Deep dive into underground AI engineering communities
**Output:** Comprehensive skills curriculum for human AI-leverage engineers

---

## Research Scope Contract

- **Topic:** Architecting context, feedback loops, and compression for model-agnostic AI effectiveness
- **First Principles:**
  1. Model capability is secondary to context architecture — a well-architected 7B model outperforms a poorly-architected 70B model
  2. Feedback loops are the engine of self-improvement — without them, agents plateau
  3. Compression is not optimization — it's the foundation that makes everything else possible
- **Fundamentals:** Context pyramids, three-pass workflows, iterative refinement, KV-cache engineering, token economics
- **Scope Boundary:** Exclude tool-specific tutorials; focus on transferable architectural patterns
- **Target Audience:** Engineers seeking model-agnostic AI leverage skills
- **Decay Risk:** **HIGH** — techniques evolve monthly, fundamentals persist longer

---

## Executive Summary: The Underground Curriculum

This curriculum distills **underground AI engineering** — the practices that make any model effective regardless of its base capability. The underground knows that **architecture beats scale**.

| Pillar | Core Question | Underground Insight |
|--------|---------------|-------------------|
| **Context** | "What does the AI know?" | The pyramid matters more than the volume |
| **Feedback** | "How does the AI improve?" | Loops, not lines — iterative refinement |
| **Compression** | "How much can we afford to know?" | Signal density as first-class constraint |

**Curriculum Verdict:** 4-tier progression from fundamentals to mastery

---

## Tier 1: Foundations — The Context Pyramid

### Module 1.1: Understanding Context Engineering

**What it is:** The discipline of designing and optimizing instructions and relevant context for LLMs to perform tasks effectively. ([PromptingGuide.ai](https://www.promptingguide.ai/guides/context-engineering-guide))

**Why it matters:** "Context engineering is the next phase, where you architect the full context, which in many cases requires going beyond simple prompting and into more rigorous methods to obtain, enhance, and optimize knowledge for the system."

**The Underground Definition:**
Context engineering ≠ prompt engineering
Context engineering = architecting the complete information environment the model operates within

### Module 1.2: The Context Pyramid

**Core Architecture:**
```
                    ▲
                   / \
                  / 1 \  ← User Input (Dynamic)
                 /_____\
                /   2   \  ← Instructions/System Prompt
               /_________\
              /     3     \  ← Tool Definitions & RAG
             /_____________\
            /       4        \  ← State/Memory
           /_________________\
          /         5          \  ← Historical Context
         /_______________________\
```

**Key Insight from ProductManagement.ai:** "The final, distilled, structured, contradiction-free packet of meaning the model actually sees. This is the summit of the pyramid — the moment where the system acts not generically but contextually like a colleague who is watching the screen at the same moment you are working."

**The Five Layers:**

| Layer | Content | Dynamic? | Optimization Strategy |
|-------|---------|----------|----------------------|
| 5 | Historical Context | Yes | Summarization, relevance scoring |
| 4 | State/Memory | Yes | Structured retrieval, caching |
| 3 | Tool Definitions & RAG | Semi | Semantic search, pre-indexing |
| 2 | Instructions/System Prompt | No | Extensive iteration, A/B testing |
| 1 | User Input | Yes | Validation, augmentation |

### Module 1.3: The Three-Pass Workflow

**Origin:** AI-That-Works community, Anthropic engineering blogs

**The Pattern:**
```
┌─────────────────────────────────────────────────────────────┐
│  PASS 1: RESEARCH                                            │
│  ├─ Gather patterns, constraints, best practices            │
│  ├─ Identify failure modes                                   │
│  └─ Output: Architecture decisions, approach selection       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  PASS 2: SPEC                                                │
│  ├─ Write detailed specifications                            │
│  ├─ Define edge cases, test scenarios                        │
│  └─ Output: Machine-readable spec, acceptance criteria       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  PASS 3: BUILD                                               │
│  ├─ Generate implementation                                  │
│  ├─ Verify against spec                                      │
│  └─ Output: Working code, verified against criteria          │
└─────────────────────────────────────────────────────────────┘
```

**Critical Rule:** Never mix passes. Don't ask an agent to research AND build in the same session. Each pass has a different context architecture.

**Context Budget per Pass:**

| Pass | Context Window Priority | Typical Tokens |
|------|------------------------|----------------|
| Research | Patterns, docs, examples | 50-70% of window |
| Spec | Requirements, edge cases | 30-50% of window |
| Build | Implementation details | 70-90% of window |

---

## Tier 2: Intermediate — Feedback Loop Architecture

### Module 2.1: The Self-Improving Agent Pattern

**Core Insight from Yohei Nakajima:** "The most promising pattern is: Represent skills and strategies as executable artifacts (code), and give the agent the ability to debug, rewrite, and reorganize those artifacts over time. This gives you persistent, compositional self-improvement."

**The Voyager Pattern (Wang et al., 2023):**
1. GPT-4 acts as planner and coder
2. Generates skills as reusable code snippets
3. Successful skills stored in skill library
4. Skills reused in future tasks
5. **Result:** Persistent self-improvement of agent's code-level abilities

**Feedback Loop Architecture:**
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Generate  │────▶│   Execute   │────▶│   Evaluate  │
│   (Plan)    │     │   (Act)     │     │   (Verify)  │
└─────────────┘     └─────────────┘     └──────┬──────┘
       ↑                                         │
       └─────────────────────────────────────────┘
                    (Feedback Loop)
```

### Module 2.2: Iterative Refinement Protocols

**The Convergence Model:**

| Stage | Action | Criteria |
|-------|--------|----------|
| 1 | Initial Generation | Draft quality |
| 2 | Evaluation | Against criteria |
| 3 | Structured Feedback | Specific, actionable |
| 4 | Refined Generation | Incorporating feedback |
| 5 | Convergence Detection | Good enough? |
| 6 | Stop or Iterate | Based on threshold |

**Underground Insight:** "Most users fire off one prompt and accept mediocre results. With Iterative Refinement & Feedback Loops, you can mold AI's outputs into exactly what you need — like a sculptor chiseling a block of marble into a statue."

**Convergence Detection Signals:**
- Output matches spec within tolerance
- No new issues introduced in last iteration
- Improvement delta below threshold
- Time/iteration budget exhausted

### Module 2.3: Multi-Agent Swarm Orchestration

**The Role-Based Pattern:**

```
┌─────────────────────────────────────────────────────────────┐
│                      ORCHESTRATOR                             │
│                 (Route & Synthesize)                         │
└─────────────────────────────────────────────────────────────┘
         ↓              ↓              ↓              ↓
    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐
    │ARCHITECT│    │ EDITOR │    │ TESTER │    │REVIEWER│
    │  Agent  │    │  Agent │    │  Agent │    │  Agent │
    └────┬───┘    └────┬───┘    └────┬───┘    └────┬───┘
         │             │             │             │
         └─────────────┴─────────────┴─────────────┘
                           │
                    ┌──────┴──────┐
                    │  SYNTHESIS  │
                    └─────────────┘
```

**Clear Role Separation:**
- **Architect:** Designs, doesn't implement
- **Editor:** Implements, doesn't design
- **Tester:** Validates, doesn't build
- **Reviewer:** Critiques, final approval

**Key Insight:** "The bottleneck isn't the AI, it's you: reviewing output from one agent while two others are waiting" (r/ExperiencedDevs)

### Module 2.4: Verification & Safety Patterns

**Self-Challenging with Code Tests:**
```
1. Agent generates code
2. Agent generates tests for that code
3. Tests run automatically
4. Results feed back to agent
5. Agent fixes issues
6. Loop until tests pass
```

**Chain-of-Verification:**
- Fact-check intermediate reasoning
- Verify outputs against source material
- Cross-reference with external tools

**Conservative Acceptance (SICA):**
- Only keep self-edit if benchmark performance improves
- Predefined metrics, not subjective judgment
- Rollback capability essential

---

## Tier 3: Advanced — Compression & Optimization

### Module 3.1: Context Window Economics

**The Fundamental Constraint:**
```
Effective Work = (Signal Density) × (Context Window) × (Iteration Count)
```

**Underground Rule:** "If you can't afford the context, you can't afford the solution"

### Module 3.2: The Compression Hierarchy

| Technique | Savings | Use Case | Implementation |
|-----------|---------|----------|----------------|
| **Prompt Compression** | 30-50% | Remove redundancy | Structured summarization |
| **Context Caching** | 60-80% | Repeated context | Semantic versioning |
| **KV-Cache Optimization** | 2-4x length | Hardware constraints | Quantization-aware serving |
| **Smart Model Routing** | 50-70% cost | Simple vs complex | Capability detection |
| **Hierarchical Retrieval** | 40-60% | Large codebases | Tagged associations |

### Module 3.3: KV-Cache Engineering (Local/Edge Focus)

**The r/LocalLLaMA Insight:** "If your local coding agent feels 'dumb' at 30K context, it's not the model — it's your KV cache quantization destroying coherence"

**The KV-Cache Budget Model:**
```
Effective Context = (VRAM × Quantization Efficiency) / (Model Size × KV Overhead)
```

**Quantization Levels & Tradeoffs:**

| Level | VRAM Savings | Coherence Impact | Use Case |
|-------|--------------|------------------|----------|
| FP16 | Baseline | None | Development, critical tasks |
| Q8 | 50% | Minimal | Production, quality priority |
| Q4_K_M | 75% | Noticeable | Volume processing, speed priority |
| Q3 | 80% | Significant | Exploration only |

**VRAM-Frugal Model Stacking:**
- Run 7B for simple completions
- Run 14B for standard tasks
- Run 32B for complex reasoning
- Route by task complexity, not just user preference

### Module 3.4: Hierarchical Context Retrieval

**CORE Memory Pattern (InfoWorld):**
1. Automatically analyze functions, files, documentation
2. Create hierarchical tags and associations
3. Recursively search when specific functionality needed
4. Load only relevant subsets, not entire codebase

**Implementation:**
```
Need: Authentication function
    ↓
Search: "auth" tag → 12 files
    ↓
Refine: "jwt" + "middleware" → 3 files
    ↓
Load: Only those 3 files into context
```

**Result:** 90% reduction in context tokens with 95% relevance retention

### Module 3.5: Signal Density Optimization

**The AI-That-Works Principle:** "Maximum Opus input for sprint generation: 1000 tokens. Signal density = load-bearing facts ÷ time cost"

**Compression Rules:**
1. No prose, no explanation — only verified facts
2. Token names must be component classes, not utilities
3. File paths must exist (verified in codebase)
4. GROQ shapes from live queries only

**The 1000-Token Challenge:**
Can you describe a complete feature implementation in 1000 tokens of context? If yes, your signal density is high enough.

---

## Tier 4: Mastery — Model-Agnostic Architecture

### Module 4.1: The Capability Detection Pattern

**Problem:** Different models have different strengths. Sending all tasks to the strongest model is wasteful.

**Solution:** Capability-based routing
```
Task Analysis → Complexity Scoring → Model Selection → Execution
     │                │                    │              │
     └────────────────┴────────────────────┴──────────────┘
                        (Feedback Loop)
```

**Complexity Heuristics:**
- Token count of request
- Presence of specific keywords ("architecture", "refactor", "debug")
- Historical performance on similar tasks
- Required output format complexity

### Module 4.2: The Skill Library Pattern

**Voyager-Inspired Implementation:**
```typescript
interface Skill {
  id: string;
  name: string;
  code: string;
  verificationTests: string[];
  successRate: number;
  usageCount: number;
  lastUsed: Date;
}

class SkillLibrary {
  async findSkill(task: Task): Promise<Skill | null> {
    // Semantic search through skill embeddings
    // Return skill if successRate > threshold
  }

  async addSkill(skill: Skill): Promise<void> {
    // Verify with tests
    // Store if verification passes
    // Update embeddings
  }
}
```

**Result:** Agents that improve over time without retraining

### Module 4.3: Embodied Self-Improvement

**The Steps-to-Go Pattern (Ghasemipour et al., NeurIPS 2025):**
1. Supervised fine-tuning on demonstrations
2. Auxiliary prediction: "steps-to-go" until success
3. Use steps-to-go as intrinsic reward
4. Self-practice RL phase: minimize steps-to-go

**Design Takeaway:** "Self-improvement becomes more 'agentic' when it happens through interaction with an environment"

**Implementation for Code Agents:**
- Track lines of code to complete task
- Track iterations to pass tests
- Track time to production
- Optimize for minimum steps-to-production

### Module 4.4: Conservative Self-Modification (The Gödel Pattern)

**The Safety Constraint:** "Conceptually requires proving (or at least strongly arguing) that a self-modification won't harm the objective"

**SICA Protocol:**
1. Propose modification
2. Run benchmark suite
3. Compare results to baseline
4. Only accept if: (a) improves target metric, (b) no regression on other metrics
5. Maintain rollback capability

**Diversity & Anti-Echo-Chamber:**
- Self-Generated Examples with curation
- Replay strategies to avoid overfitting
- Multiple iteration filtering (SELF, STaR)

---

## The Other Side: Critique, Counter-Evidence & Failure Modes

> **"The underground knows what works. The critic knows what breaks. Both are necessary for truth."**

This section presents the counter-arguments, limitations, and failure modes of the underground approaches. No technique survives scrutiny without acknowledging its breaking points.

---

### Critical Finding 1: The Compression Cost Paradox

**Source:** wasnotwas.com analysis of 7 major AI coding agents (Codex, Gemini CLI, Claude Code, Roo Code, Pi, OpenHands) — March 2025

**The Claim:** Context compaction saves tokens and enables longer sessions.

**The Counter-Evidence:**

| Factor | Reality | Impact |
|--------|---------|--------|
| **Cache Destruction** | Every compaction busts the KV cache | Loses 92% cost savings from warm cache |
| **Hidden Cost** | 125K token compaction = $0.40 | Equivalent to 21 warm-cache turns |
| **Summary Loss** | Compaction loses verbatim error messages, correction sequences | Critical debugging info destroyed |
| **Early Compaction Penalty** | Gemini CLI's 50% threshold restarts warm-up cycle | Doubles per-turn cost immediately |

**Lab Results (wasnotwas):**
- Turn 1 (cache write, 60K tokens): $0.23
- Turn 2 (cache read, same 60K tokens): $0.019 — **92% cost reduction**
- One compaction call (125K → 1,643 tokens): $0.40 — **21x the cost of a warm turn**

**The Balance:**
- ✅ Compaction enables sessions beyond context window limits
- ❌ Compaction destroys cache economics and may lose critical history
- ⚠️ **Rule:** Only compact when the alternative is session termination, not as routine optimization

---

### Critical Finding 2: The Multi-Agent Reliability Paradox

**Source:** TechAheadCorp analysis, Galileo AI research, TowardsDataScience — 2025

**The Claim:** Multi-agent systems with clear roles outperform single agents.

**The Counter-Evidence:**

**The Multiplication Problem:**
```
Single agent (95% reliability):     95% success rate
Two agents (95% × 95%):            90.25% success rate
Three agents (95% × 95% × 95%):    85.7% success rate
Five agents:                       77% success rate
```

**Production Reality:**
- 40% of multi-agent pilots fail within 6 months of production deployment (Markets and Markets)
- At 10,000 daily users with 5 agents: 2,300 failures/day vs 500 with single agent
- Latency cascades: 3 agents × 4 seconds each = 12 second response (user abandonment threshold: 3 seconds)

**7 Failure Modes (TechAheadCorp):**

| Mode | Description | Impact |
|------|-------------|--------|
| 1. Coordination Breakdown | Agents disagree on shared state | Non-deterministic failures |
| 2. Context Pollution | Each agent adds noise to shared context | Quality degradation |
| 3. Latency Cascades | Sequential agents compound delays | User abandonment |
| 4. Reliability Paradox | Reliability multiplies down chain | Exponential failure rate |
| 5. Debug Hell | Which agent caused the failure? | Undiagnosable bugs |
| 6. Resource Contention | Agents compete for same resources | Deadlocks, timeouts |
| 7. Over-Engineering | Simple task, complex solution | Maintenance nightmare |

**The Balance:**
- ✅ Multi-agent enables specialization and parallelization
- ❌ Each added agent multiplies failure probability
- ⚠️ **Rule:** Default to single-agent. Add agents only when failure cost < coordination overhead

---

### Critical Finding 3: Feedback Loop Diminishing Returns

**Source:** SELF-REFINE paper (OpenReview), EmergentMind research — 2024-2025

**The Claim:** Iterative refinement continuously improves output quality.

**The Counter-Evidence:**

**SELF-REFINE Findings:**
- "The diminishing returns in the improvement as the number of iterations increases"
- Multiple FEEDBACK-REFINE iterations enhance quality, but improvement curve flattens
- Beyond 3-4 iterations: minimal gain, increased cost

**Rejection Loop Method Limitations (r/PromptEngineering):**
- Early rejections must focus on big issues (tone, direction)
- Later rejections on refinement
- **Without specific rejection criteria:** loops become circular arguments
- **Risk:** Echo chamber effect — AI reinforces its own patterns

**Feedback Loop Anti-Patterns:**

| Anti-Pattern | Symptom | Solution |
|--------------|---------|----------|
| Infinite Refinement | Chasing perfect output | Convergence detection, acceptance thresholds |
| Echo Chamber | AI reinforces its own errors | Diversity injection, external validation |
| Feedback Saturation | Too much feedback = confusion | Prioritized, structured feedback only |
| Overfitting to Critic | Output optimized for critic, not quality | Multi-critic validation |

**The Balance:**
- ✅ Iterative refinement catches errors single-pass misses
- ❌ Returns diminish; beyond 3-4 iterations, cost > benefit
- ⚠️ **Rule:** Set convergence thresholds. Accept "good enough" over "perfect."

---

### Critical Finding 4: Context Architecture Limitations

**Source:** Various academic and practitioner sources

**The Claim:** Proper context architecture makes any model effective.

**The Counter-Evidence:**

**The Context Ceiling:**
- 7B models struggle with complex reasoning regardless of context architecture
- Some tasks (deep architecture design, novel algorithms) genuinely need 70B+ capability
- Context architecture amplifies capability within a tier — doesn't transcend tiers

**When Context Engineering Fails:**

| Scenario | Why It Fails | Alternative |
|----------|--------------|-------------|
| Novel problem domain | No existing patterns to structure | Research-first, manual architecture |
| Contradictory requirements | Context becomes incoherent | Human mediation, scope negotiation |
| Real-time constraints | Context building takes too long | Pre-built templates, cached patterns |
| Extreme complexity | Context exceeds any window | Chunking, human-in-the-loop orchestration |

**The "Pretty Please Compress Now" Problem (wasnotwas lab):**
- Nudging for longer summaries: +49% token count
- Cost of nudge: negligible ($0.013)
- **But:** Quality improvement not proportional to length increase
- Verbose ≠ comprehensive

**The Balance:**
- ✅ Context architecture maximizes effectiveness within model's capability tier
- ❌ Cannot transcend fundamental capability limits
- ⚠️ **Rule:** Match context investment to task complexity. Don't over-engineer simple tasks.

---

### Critical Finding 5: The Vibe Coding Reality Check

**Source:** Addy Osmani, industry discussions — 2025

**The Claim:** Spec-driven development is always better than "vibe coding."

**The Counter-Evidence:**

**When Vibe Coding Actually Works:**

| Use Case | Why It Works | Risk Level |
|----------|--------------|------------|
| Rapid prototyping | Speed > quality for validation | Low |
| One-off scripts | No maintenance burden | Low |
| Learning/exploration | AI as teaching assistant | Low |
| Boilerplate/CRUD | Pattern is clear, repetition is goal | Low |
| Internal tools | Low stakes, quick utility | Low |

**The "Not-So-Great" Use Cases (Addy Osmani):**
- Enterprise-grade software
- Complex systems with business logic
- Heavy concurrency requirements
- Rigorous security/compliance
- Fintech, aerospace, medical devices

**The Hard Truth:**
> "Quality isn't automatic. AI doesn't know your business constraints or performance requirements unless you explicitly spell them out (and even then, it may not get it right)."

**The Balance:**
- ✅ Vibe coding excels at exploration, prototyping, and boilerplate
- ❌ Production systems need specification, verification, and QA
- ⚠️ **Rule:** Match methodology to stakes. Low stakes = vibe. High stakes = spec.

---

### Critical Finding 6: The Three-Pass Workflow Reality

**The Claim:** Always separate research, spec, and build passes.

**The Counter-Evidence:**

**When Pass-Mixing Is Actually Better:**

| Scenario | Why Mixing Works | Risk |
|----------|----------------|------|
| Well-understood task | Overhead exceeds benefit | Spec bloat |
| Tight feedback loops | Rapid iteration beats planning | Architecture drift |
| Exploration mode | Unknown unknowns can't be specced | Scope creep |
| Emergency fixes | Speed > process | Technical debt |

**The Pass Separation Cost:**
- Context switching between passes: ~15-30 minutes cognitive overhead
- Documentation overhead for specs that may change
- Premature specification of unknown requirements

**The Balance:**
- ✅ Three-pass prevents architecture drift and ensures verification
- ❌ Overhead may exceed benefit for well-understood tasks
- ⚠️ **Rule:** Three-pass for novel/complex. Single-pass for routine. Hybrid for exploration.

---

## Integrated Assessment: When Underground Approaches Work vs. Fail

### The Decision Matrix

| Approach | Works When | Fails When | Default? |
|----------|------------|------------|----------|
| **Context Pyramid** | Complex, multi-source tasks | Simple, single-source tasks | ⚠️ Context-Dependent |
| **Three-Pass Workflow** | Novel, high-stakes, team projects | Routine, well-understood tasks | ❌ No |
| **Iterative Refinement** | Quality-critical, error-prone tasks | Time-critical, good-enough tasks | ⚠️ Context-Dependent |
| **Multi-Agent** | Highly parallelizable, clear separation | Tightly coupled, latency-sensitive | ❌ No |
| **Compression** | Context-constrained, long sessions | Cache-warm, short sessions | ❌ No |
| **Spec-Driven** | Production, team, maintenance-bound | Prototyping, exploration, one-offs | ⚠️ Context-Dependent |

### The Hierarchy of Truth

**Most Reliable (Foundation):**
1. Signal density matters more than context volume
2. Verification beats blind trust
3. Match methodology to stakes

**Context-Dependent (Apply Judgment):**
4. Three-pass vs. mixed-pass
5. Single vs. multi-agent
6. Compression vs. full context

**Often Overrated (Use Sparingly):**
7. Complex multi-agent orchestration for simple tasks
8. Iterative refinement beyond 3-4 iterations
9. Premature optimization of context architecture

### The Falsification Summary

| Original Claim | Counter-Evidence | Revised Verdict |
|----------------|------------------|-----------------|
| "Any model can be effective" | 7B models have capability ceilings | Modified: Within capability tiers |
| "Context architecture beats all" | Some tasks need 70B+ regardless | Modified: Amplifies, doesn't transcend |
| "Feedback loops always help" | Diminishing returns, echo chambers | Modified: 3-4 iterations max |
| "Multi-agent > single agent" | Reliability multiplication problem | Modified: Default single-agent |
| "Compression is always good" | Cache destruction costs | Modified: Compress when necessary, not routine |
| "Three-pass always" | Overhead for routine tasks | Modified: Match to task novelty |
| "Never vibe code" | Exploration and prototyping value | Modified: Match to stakes |

---

## The Balanced Underground Manifesto

**Revised Principles (Truth-Tested):**

1. **Architecture amplifies capability within tiers** — Does not transcend fundamental limits
2. **Feedback improves quality with diminishing returns** — Set convergence thresholds
3. **Compression trades cache for space** — Only when necessary
4. **Verification is always necessary** — Trust is never free
5. **Roles enable composition but multiply failure** — Default to simplicity
6. **Methodology matches stakes** — Not all work needs production rigor
7. **Counter-evidence is as valuable as evidence** — Know what breaks

**The Meta-Rule:**
> The underground teaches us to architect context, feedback, and compression. The critic teaches us when not to. Both are necessary for effective AI leverage.

---

## Audit: Current Practices vs. Underground Standards

### The Underground Assessment

| Practice | Mainstream | Underground | Gap |
|----------|------------|-------------|-----|
| Context | "Throw everything in" | "Pyramid, filtered, structured" | **Massive** |
| Feedback | "One-shot generation" | "Iterative with convergence" | **Massive** |
| Compression | "Use bigger model" | "Optimize signal density" | **Significant** |
| Model Selection | "Always GPT-4/Claude" | "Capability routing" | **Moderate** |
| Self-Improvement | "Hope it works" | "Skill libraries, benchmarks" | **Massive** |
| Safety | "Trust the AI" | "Verification, acceptance criteria" | **Critical** |

### Anti-Patterns to Eliminate

| Anti-Pattern | Why It's Wrong | Underground Fix |
|--------------|----------------|-----------------|
| **Vibe Coding** | No specification, no verification | Spec-driven development |
| **Prompt Hoarding** | Saving prompts without context architecture | Three-pass workflow |
| **Model Worship** | Assuming bigger = better | Capability routing |
| **Context Gluttony** | Filling entire context window | Compression hierarchy |
| **One-Shot Acceptance** | Taking first output | Iterative refinement |
| **Silent Failures** | Not verifying AI output | Chain-of-verification |

---

## Synthesis: The Underground Curriculum Path

### Learning Progression

```
WEEK 1-2: Foundations
├── Context Pyramid mastery
├── Three-pass workflow implementation
└── Basic compression techniques

WEEK 3-4: Intermediate
├── Feedback loop architecture
├── Multi-agent orchestration
└── Iterative refinement protocols

WEEK 5-6: Advanced
├── KV-cache engineering
├── Hierarchical retrieval
└── Signal density optimization

WEEK 7-8: Mastery
├── Model-agnostic architecture
├── Skill library implementation
└── Conservative self-modification
```

### Verification Milestones

| Tier | Milestone | Verification |
|------|-----------|--------------|
| 1 | Reduce context tokens by 40% without quality loss | Before/after measurement |
| 2 | Implement 3-agent workflow with feedback loops | Working demo |
| 3 | Achieve 2x context length via KV optimization | Benchmark test |
| 4 | Build self-improving agent with skill library | 30-day improvement log |

### The Underground Manifesto

1. **Architecture beats scale** — A well-architected 7B outperforms a poorly-architected 70B
2. **Feedback beats intelligence** — Iteration amplifies capability more than base model quality
3. **Compression is foundational** — Signal density determines effective intelligence
4. **Verification is non-negotiable** — Trust but verify, always
5. **Roles beat generalists** — Clear separation enables composition
6. **Conservative beats aggressive** — Prove improvement before accepting change

---

## Verification & Falsification

### Claims Verified

| Claim | Evidence | Source |
|-------|----------|--------|
| Context engineering > prompt engineering | Multiple authoritative sources | PromptingGuide.ai, Anthropic |
| Three-pass workflow effectiveness | Community practice | AI-That-Works |
| KV-cache quantization affects coherence | r/LocalLLaMA consensus | Community |
| Iterative refinement improves output | Academic research | REALM workshop |
| Skill libraries enable self-improvement | Voyager paper | Wang et al. 2023 |

### Falsification Attempts (Updated with Full Research)

| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| "Any model can be effective" | 7B models have capability ceilings; some tasks need 70B+ regardless of context | Modified: "Within capability tiers" |
| "Context architecture beats all" | Cannot transcend fundamental capability limits; complex reasoning needs scale | Modified: "Amplifies within tiers" |
| "Feedback loops always help" | Diminishing returns after 3-4 iterations; echo chamber risk | Modified: "With convergence thresholds" |
| "Multi-agent > single agent" | 40% of multi-agent pilots fail in production; reliability multiplies (95%^n) | Modified: "Default single-agent" |
| "Compression is always good" | KV cache destruction loses 92% cost savings; $0.40 compaction = 21 warm turns | Modified: "When necessary, not routine" |
| "Three-pass always" | Overhead exceeds benefit for routine tasks; 15-30 min context switch cost | Modified: "Match to task novelty" |
| "Never vibe code" | Exploration, prototyping, boilerplate benefit from rapid iteration | Modified: "Match methodology to stakes" |
| "Iterative refinement → perfect output" | SELF-REFINE: diminishing returns; beyond 4 iterations = cost > benefit | Modified: "Accept 'good enough'" |
| "Context compaction saves money" | Cache destruction costs exceed compaction savings in short sessions | Modified: "Only when window-constrained" |

### New Sources Added (Counter-Evidence Phase)

| Source | Date | Type | Credibility | Contribution |
|--------|------|------|-------------|--------------|
| wasnotwas.com Context Compaction Analysis | Mar 2025 | Reverse Engineering | **High** | Cache destruction costs, compaction economics |
| TechAheadCorp Multi-Agent Reality Check | 2025 | Industry Analysis | **High** | 7 failure modes, 40% pilot failure rate |
| Galileo AI Multi-Agent Failures | 2025 | Research | **High** | Reliability paradox, latency cascades |
| TowardsDataScience Bag of Agents | 2025 | Technical | **High** | 17x error trap, orchestration anti-patterns |
| SELF-REFINE Paper (OpenReview) | 2024 | Academic | **High** | Diminishing returns in feedback loops |
| Addy Osmani Vibe Coding Critique | 2025 | Practitioner | **High** | When vibe coding fails, quality reality |
| r/PromptEngineering Rejection Loop | 2025 | Community | **Medium** | Feedback loop practical limitations |

### Knowledge Decay Assessment

| Section | Decay Risk | Review Date |
|---------|------------|-------------|
| Tool-specific implementations | **HIGH** | 30 days |
| Architectural patterns | **MEDIUM** | 60 days |
| First principles | **LOW** | 6 months |

---

## Actionable Takeaways

### Immediate Actions (Week 1)

1. **Audit your current context usage** — Measure tokens per task
2. **Implement three-pass workflow** — Separate research, spec, build
3. **Add compression step** — Remove 30% of context, verify quality maintained

### Short-Term Actions (Month 1)

1. **Build feedback loop prototype** — Generate → Evaluate → Refine
2. **Implement capability routing** — Use smaller models for simple tasks
3. **Create skill library skeleton** — Store and retrieve verified code patterns

### Long-Term Actions (Quarter 1)

1. **Deploy multi-agent system** — Architect, Editor, Tester roles
2. **Implement self-improvement tracking** — Measure steps-to-go over time
3. **Establish conservative modification protocol** — Benchmarks before acceptance

---

## Sources

| Source | Date | Type | Credibility |
|--------|------|------|-------------|
| PromptingGuide.ai Context Engineering | 2025 | Educational | High |
| Anthropic Engineering Blog | 2025 | Official | High |
| AI-That-Works Community | 2025 | Practitioner | High |
| Yohei Nakajima Blog | 2025 | Individual | Medium |
| r/LocalLLaMA Community | 2025-2026 | Community | High |
| REALM Workshop Papers | 2025 | Academic | High |
| Voyager Paper (Wang et al.) | 2023 | Academic | High |
| NeurIPS 2025 (Ghasemipour) | 2025 | Academic | High |
| InfoWorld CORE Memory | 2025 | Industry | Medium |

---

**Research Status:** Complete with Counter-Evidence Integration
**Curriculum Confidence:**
- **High** on architectural patterns and their limitations
- **High** on failure modes and when approaches break
- **Medium** on specific tool implementations

**Recommendation:**
- Review architectural patterns and counter-evidence every 60 days
- Review tool implementations every 30 days
- Re-assess when new model capabilities emerge (may shift capability tiers)

**Final Verdict (Balanced & Truth-Tested):**

The underground path teaches us to **architect context, feedback, and compression** — and the critic teaches us **when not to**. Both are necessary for effective AI leverage.

**Key Takeaway:**
- Master the techniques (Tier 1-4)
- Master the limitations (Critique section)
- Apply judgment (Decision Matrix)
- Verify always (Verification & Falsification)

**The curriculum is not a rulebook — it's a decision framework.**

> "The architect designs. The critic tears down. The master engineer knows when to build and when to stop."
