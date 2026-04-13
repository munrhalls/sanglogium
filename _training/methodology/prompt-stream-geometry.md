# Token Stream Geometry vs Human Prompts Stream Geometry

## Core Concept

Information has shape. AI token windows and human attention have structural constraints that can be mapped geometrically. Understanding these shapes allows optimization of AI-assisted development workflows.

---

## The Geometries

### AI Token Stream Geometry

| Shape | Description | Visual |
|-------|-------------|--------|
| **Flat Rectangle** | Context window - all tokens equal distance | `├────────────────────────┤` |
| **U-Curve** | Attention - high at edges, low in middle | `High ██  ██ Low / Middle` |
| **Parallel Fan** | Processing - simultaneous consideration | `↓ ↓ ↓ ↓ ↓` (all at once) |

### Human Prompts Stream Geometry

| Shape | Description | Visual |
|-------|-------------|--------|
| **Pyramid** | Foundation-up dependency | Base: PRD → Units → Integration → Tests: Peak |
| **DAG** | Verification must follow definition | `A → B → C` (acyclic) |
| **Linear Chain** | Flow-trace debugging | `Start → P1 → P2 → P3 → Fail → Fix` |

---

## The 4 Critical Conflicts

### 1. Window vs Pyramid
**Problem:** AI sees flat context; human needs hierarchical understanding  
**Evidence:** AI can "see" tests before understanding PRD  
**Fix:** Explicit sequential prompts with dependency markers

### 2. Attention Decay vs Foundation Importance
**Problem:** AI ignores middle of long context; human foundations are critical  
**Evidence:** Lost-in-the-middle research (Vaswani et al.)  
**Fix:** Keep critical foundations at start/end; chunk work

### 3. Parallel vs Sequential
**Problem:** AI processes all at once; human must understand A before B  
**Evidence:** AI generates "solutions" without understanding dependency chain  
**Fix:** Explicit chains: "After understanding X, analyze Y"

### 4. Recency Bias vs End-State Vision
**Problem:** AI follows last thing said; human guided by initial specification  
**Evidence:** Long conversations drift from original spec  
**Fix:** Use `/contain` - re-anchor end-state at prompt end

---

## Resolution: Aligned Geometry

### Layered Context Pattern

```
LAYER 1: SYSTEM ROOT (high attention)
  - PRD excerpt
  - Quality thresholds
  - Architecture constraints

LAYER 2: CURRENT CONTEXT (high attention)
  - What we're doing RIGHT NOW
  - Specific file/task
  - Immediate goal

LAYER 3: DEPENDENCY CHAIN
  - "This depends on X"
  - Verification checkpoints

LAYER 4: WORK PRODUCT
  - Current implementation
  - Test cases
```

---

## Actionable Takeaways

| Practice | Rationale | Implementation |
|----------|-----------|----------------|
| **Use `/contain`** | Re-anchors end-state (recency bias) | Explicit boundaries in every prompt |
| **Chunk work** | Fits attention window | `/quick-workflow` for 15-min units |
| **Verification gates** | Enforces dependency order | Checklist at end of each chunk |
| **PRD excerpt at start** | Leverages beginning attention peak | Copy relevant section |
| **Single task at end** | Leverages recency bias | Clear single-sentence goal |

---

## Anti-Patterns (Evidence-Based)

| Anti-Pattern | Why It Fails | Evidence |
|--------------|--------------|----------|
| Dump entire PRD in first prompt | Middle content ignored | Attention U-curve |
| Long conversation without re-anchoring | AI drift from spec | Recency bias studies |
| Mix verification and implementation | Violates dependency order | Human cognitive limits |
| Expect AI to remember 20 files back | Falls out of context window | Claude 200K limit |

---

## Sources

- **Vaswani et al.** "Attention Is All You Need" - Transformer attention patterns
- **Miller** "Magical Number Seven" - Human working memory (~7±2 chunks)
- **Anthropic Claude docs** - Context window mechanics
- **Dijkstra** structured programming - Dependency ordering

---

*Lesson created: 2026-04-13*  
*Applies to: All AI-assisted development workflows*
