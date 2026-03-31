# Optimize for Shipping Velocity with Verification

**Goal**: Shift from "planning clarity with AI" to "shipping velocity with verification"

---

## TO WATCH

### Primary: Dan Shipper's "AI & I" (formerly "How Do You Use ChatGPT?")
**YouTube Playlist**: https://www.youtube.com/playlist?list=PLuMcoKK9mKgHtW_o9h5sGO2vXrffKHwJL

| Episode | People | Why Watch | Addresses Your Pattern |
|---------|--------|-----------|------------------------|
| **"How Two Engineers Ship Like a Team of 15 With AI Agents"** | Kieran Klaassen, Nityesh Agarwal (Cora engineers) | New breed of software development with AI agents | **"specification-heavy, ship-light"** — move from planning to shipping |
| **"Who Actually Wins When Everyone Has AI"** | Dan Shipper | Analysis of AI-native companies | **31 sprint files problem** — how AI-native teams organize for throughput |
| **"Dispatch from the Future: building an AI-native Company"** | Dan Shipper | Every.to's internal workflow revealed | **Orchestrator pattern rigidity** — structure without bureaucracy |

### Secondary Resources

| Resource | Person/Channel | Type | Specific Lesson |
|----------|----------------|------|-----------------|
| **Fireship** | Jeff Delaney | YouTube | "AI Coding Agents in 100 Seconds" — quick landscape overview |
| **t3.gg** | Theo | YouTube | AI workflow episodes — practical integration into existing codebases |
| **simonwillison.net** | Simon Willison | Articles | "Agentic engineering" tag — specific patterns |
| **addyo.substack.com** | Addy Osmani | Articles | LLM coding workflow, spec writing, vibe coding quality |

### Key Articles to Read
- [Addy Osmani: My LLM coding workflow going into 2026](https://addyosmani.com/blog/ai-coding-workflow/)
- [Addy Osmani: How to write a good spec for AI agents](https://addyo.substack.com/p/how-to-write-a-good-spec-for-ai-agents)
- [Les Orchard: Semi-automatic coding](https://blog.lmorchard.com/2025/06/07/semi-automatic-coding/) — "waterfall in 15 minutes" concept

---

## TOP 5 HIGHEST ROI WORKFLOW IMPROVEMENTS

### 1. The "15-Minute Waterfall" Spec Pattern
**Problem**: 31 sprint files, 646-line scope contracts (planning overload)

**Solution**:
> "One common mistake is diving straight into code generation with a vague prompt. The first step is brainstorming a detailed specification with the AI, then outlining a step-by-step plan, before writing any actual code... This upfront investment might feel slow, but it pays off enormously."
> — Addy Osmani

**Les Orchard calls this**: "Waterfall in 15 minutes" — rapid structured planning that makes coding smoother, not endless planning phases

**Your Action**: Replace 10 scope contracts × 4 layers with **one spec.md + iterative 15-minute planning sessions**

---

### 2. The "Small Chunks, Not Monolithic" Anti-Pattern
**Problem**: Layer 1 all components → Layer 2 all components (waterfall within sprints)

**Solution**:
> "Implement one function, fix one bug, add one feature at a time... Developers report that when they tried to have an LLM generate huge swaths of an app, they ended up with inconsistency and duplication — 'like 10 devs worked on it without talking to each other'... The fix is to stop, back up, and split the problem into smaller pieces."
> — Addy Osmani

**Your Action**: Your "functional grouping pattern" was correct — but you're still doing layers within groups. Switch to **vertical slices**: one user flow, complete, shipped, then next.

---

### 3. The "Human in the Loop" Verification Discipline
**Problem**: Build-gate at sprint end, deferred verification

**Solution**:
> "Treat every AI-generated snippet as if it came from a junior developer"
> — Addy Osmani

**Simon Willison Quote**:
> "Think of an LLM pair programmer as 'over-confident and prone to mistakes'. It writes code with complete conviction — including bugs or nonsense — and won't tell you something is wrong unless you catch it."

**Your Action**: Your orchestrator pattern says "Build passing is the only lock mechanism. One visual check at end only"

**Correction**: Build passing should be the lock mechanism **per scope contract, not per sprint**

---

### 4. The "Test-as-Safety-Net" Multiplier
**Problem**: VFS functions "exist but aren't used by live product queries" (code not verified in production context)

**Solution**:
> "An agent like Claude can 'fly' through a project with a good test suite as safety net. Without tests, the agent might blithely assume everything is fine ('sure, all good!') when in reality it's broken several things."
> — Addy Osmani

**Your Action**: Every AI-assisted change must include test generation + immediate CI verification

---

### 5. The "Three-Tier Boundary" System
**Problem**: Scope lock rules exist but aren't enforced during execution

**Solution**: GitHub analysis of 2,500+ agent files found the most effective specs use:

```
✅ Always do: Actions the agent should take without asking
   - "Always run tests before commits"
   - "Always follow tailwind.config patterns"

⚠️ Ask first: Actions that require human approval
   - "Ask before modifying database schemas"
   - "Ask before adding new dependencies"

🚫 Never do: Hard stops
   - "Never edit globals.css"
   - "Never modify homepage components"
   - "Never skip build verification"
```

**Your Action**: Replace flat "Scope Lock Rules" with this three-tier system in your orchestrator pattern

---

## YOUR PERSONALIZED WATCH & LEARN SCHEDULE

### Week 1: Foundation Fixes
- [ ] **Watch**: "How Two Engineers Ship Like a Team of 15 With AI Agents" (Dan Shipper)
- [ ] **Read**: Addy Osmani's "My LLM coding workflow going into 2026"
- [ ] **Action**: Apply the "15-minute waterfall" to ONE scope contract

### Week 2: Verification Discipline
- [ ] **Watch**: "Who Actually Wins When Everyone Has AI" (Dan Shipper)
- [ ] **Read**: "Vibe coding is not an excuse for low-quality work" (Addy Osmani)
- [ ] **Action**: Implement per-commit build verification (not sprint-end)

### Week 3: Chunking Strategy
- [ ] **Watch**: "Dispatch from the Future: building an AI-native Company" (Dan Shipper)
- [ ] **Read**: "How to write a good spec for AI agents" (Addy Osmani)
- [ ] **Action**: Convert one 10-contract sprint to vertical slice approach

---

## THE META-LESSON

Your research on the "How I AI" / "AI & I" channel reveals a pattern across all top AI practitioners:

**They don't optimize for AI output volume. They optimize for human verification speed.**

Your 31 sprint files, detailed difficulty ratings, and 4-layer orchestrator pattern optimize for **planning clarity**. The lessons from Dan Shipper's interviews and Addy Osmani's workflow optimize for **shipping velocity with verification**.

**The shift to make**: From "How do I plan better with AI?" to "How do I ship faster with AI while maintaining quality?"

---

## KEY QUOTES TO INTERNALIZE

1. **On Planning**: "Having a clear spec and plan means when we unleash the codegen, both the human and the LLM know exactly what we're building and why."

2. **On Chunking**: "By iterating in small loops, we greatly reduce the chance of catastrophic errors and we can course-correct quickly. LLMs excel at quick, contained tasks — use that to your advantage."

3. **On Verification**: "I remain the accountable engineer. No matter how much AI I use, I only merge or ship code after I've understood it."

4. **On Testing**: "Those who get the most out of coding agents tend to be those with strong testing practices. An agent like Claude can 'fly' through a project with a good test suite as safety net."

5. **On Automation**: "By combining AI with automation, you start to get a virtuous cycle. The AI writes code, the automated tools catch issues, the AI fixes them, and so forth."
