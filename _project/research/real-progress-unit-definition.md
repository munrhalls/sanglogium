# Real Progress Unit vs Fake/Derailed Progress

## Research Scope Contract
- **Topic:** Defining the atomic unit of real progress in AI-assisted software development, with falsifiable criteria to distinguish genuine progress from illusion, misdirection, or low-impact activity
- **First Principles:**
  1. Progress must be verifiable against an external ground truth (PRD, system requirements)
  2. Human understanding is the bottleneck, not code generation
  3. Small scope maintains coherence between human and AI context windows
- **Fundamentals:** Evidence from past sprints, velocity metrics, failure modes, anti-patterns
- **Scope Boundary:** Not covering team dynamics, external dependencies, or non-development work
- **Target Audience:** Solo developer optimizing for real vs illusory velocity
- **Decay Risk:** Low - based on project-specific evidence and fundamental constraints

---

## First Principles Analysis

### Core Problem Being Solved
How do we distinguish between activity that moves the system toward its defined goal versus activity that creates the *appearance* of progress while delivering minimal or negative value?

### The "Progress Illusion" Problem
```
ILLUSORY PROGRESS (Cargo Cult):
┌─────────────────────────────────────────────────────────┐
│ 100% test pass rate                                     │
│ + 50 files created                                      │
│ + 2000 lines of code                                    │
│ + AI generated architecture docs                          │
│ + "Sprint completed" marked                             │
│ = SYSTEM DOES NOT WORK                                  │
└─────────────────────────────────────────────────────────┘
                         ↓
         basket_to_checkout_handshake failure
         (3+ days, 0 functional outcome)

REAL PROGRESS (Verified):
┌─────────────────────────────────────────────────────────┐
│ 1 UX flow works end-to-end                              │
│ + Human verified in browser                             │
│ + Test documents verified behavior                      │
│ + 100% PRD requirement met                              │
│ + Fits system architecture                              │
│ = SHIPPABLE INCREMENT                                   │
└─────────────────────────────────────────────────────────┘
```

### Underlying Constraints

1. **Human Understanding is the Bottleneck**
   - AI can generate code faster than human can verify
   - Without human verification, code may not match intent
   - "Understanding a point in relation to the whole" requires human cognitive work

2. **PRD is Ground Truth**
   - Any deviation from PRD is waste (unless PRD is wrong)
   - 90% PRD fit = 0% value (incomplete feature)
   - 100% PRD fit = shippable

3. **Context Window Geometry**
   - Human working memory: ~7±2 chunks
   - AI attention: U-shaped decay in long contexts
   - Small scope maintains coherence in both geometries

### Inherent Tradeoffs

| Approach | Wins | Loses | Verdict |
|----------|------|-------|---------|
| **Parallel generation** (AI dumps code) | Speed | Understanding, correctness | ❌ Illusory |
| **Sequential verification** (human first) | Correctness, understanding | Slower initial appearance | ✅ Real |
| **Large scope** (big sprints) | Efficiency illusion | Coherence, completion | ❌ Derailed |
| **Small scope** (tiny contracts) | Completion, fit | Slower feature velocity | ✅ Real |

---

## Hypothesis: The Real Progress Unit (RPU)

### Definition
A **Real Progress Unit** is a complete, verified, shippable increment that:

```
RPU CRITERIA (ALL must be met):

┌─────────────────────────────────────────────────────────┐
│ 1. SYSTEM LEVEL FIT                                     │
│    └─→ Fits existing architecture without breaking changes│
│    └─→ Maintains system invariants                        │
│    └─→ No regression in other areas                       │
├─────────────────────────────────────────────────────────┤
│ 2. 100% PRD FIT (not 99%)                               │
│    └─→ Meets requirement completely                       │
│    └─→ No partial implementations                         │
│    └─→ Edge cases handled per spec                        │
├─────────────────────────────────────────────────────────┤
│ 3. HUMAN UNDERSTOOD                                     │
│    └─→ Developer can explain why it works                 │
│    └─→ Can trace data flow from input to output          │
│    └─→ Can modify without breaking                        │
├─────────────────────────────────────────────────────────┤
│ 4. HUMAN VERIFIED                                       │
│    └─→ Manually tested in browser/environment            │
│    └─→ Bus stops all pass                                 │
│    └─→ First-hand observation, not test inference        │
├─────────────────────────────────────────────────────────┤
│ 5. TESTED (reality-linked)                              │
│    └─→ Tests import from source (no copies)              │
│    └─→ Tests fail if behavior changes                     │
│    └─→ Documents verified behavior (not speculates)     │
├─────────────────────────────────────────────────────────┤
│ 6. THEMATICALLY ORGANIZED                               │
│    └─→ Belongs to clear domain boundary                 │
│    └─→ Co-located with related code                     │
│    └──→ No scattered partial implementations             │
├─────────────────────────────────────────────────────────┤
│ 7. PROPER SEQUENCE (foundation-up)                      │
│    └─→ Dependencies exist before dependents           │
│    └──→ PRD defined → Units verified → Integrated        │
│    └─→ No circular verification chains                   │
├─────────────────────────────────────────────────────────┤
│ 8. SMALL SCOPE (fits attention window)                  │
│    └─→ 15-minute to 2-hour work unit                     │
│    └─→ Single thematic concern                           │
│    └──→ Can hold entire context in working memory        │
└─────────────────────────────────────────────────────────┘

ALL 8 CRITERIA REQUIRED → 1 Real Progress Unit
MISSING ANY → 0 Real Progress Units (waste)
```

### Falsification Criteria

The RPU hypothesis is **wrong** if:
- [ ] A feature meeting all 8 criteria fails in production
- [ ] A feature missing criteria succeeds (illusory progress works)
- [ ] Velocity of 10 small RPUs < velocity of 1 large "sprint"

---

## Evidence: Past Failures (Anti-RPU Patterns)

### Failure 1: basket_to_checkout_handshake Sprint
**What was produced:**
- 100% test pass rate
- State machine architecture
- Comprehensive test suite
- "Sprint completed" status

**RPU Analysis:**
| Criterion | Met? | Evidence |
|-----------|------|----------|
| System fit | ❌ | Broke existing checkout flow |
| 100% PRD fit | ❌ | Missing idempotencyKey, stripePriceId |
| Human understood | ❌ | Tests passed but system didn't work |
| Human verified | ❌ | No manual verification checkpoints |
| Tested (reality) | ❌ | Mocked everything, tested fiction |
| Thematic org | ✅ | Coherent location |
| Proper sequence | ❌ | Started with code, not UX flow |
| Small scope | ❌ | 3+ days, too large |

**Verdict:** 1/8 criteria = **0 RPUs produced** (3+ days waste)

---

### Failure 2: Phantom Unit Tests
**What was produced:**
- 4 test files
- 100% test pass rate
- "Good coverage" metrics

**RPU Analysis:**
| Criterion | Met? | Evidence |
|-----------|------|----------|
| System fit | ❌ | Tests for non-existent functions |
| 100% PRD fit | ❌ | Tests don't verify any requirement |
| Human understood | ❌ | False confidence from pass rate |
| Human verified | ❌ | Never manually tested |
| Tested (reality) | ❌ | Testing copies, not source |
| Thematic org | ✅ | Good location |
| Proper sequence | ❌ | Tests before implementation verified |
| Small scope | ✅ | Small files |

**Verdict:** 2/8 criteria = **0 RPUs produced** (30 min discovery + systemic risk)

---

### Success: Brand Filter Fix
**What was produced:**
- Working brand filter
- 15-minute fix time
- Console verification

**RPU Analysis:**
| Criterion | Met? | Evidence |
|-----------|------|----------|
| System fit | ✅ | Fixed without breaking search |
| 100% PRD fit | ✅ | Filter works per requirements |
| Human understood | ✅ | Developer traced GROQ issue |
| Human verified | ✅ | Console + manual URL test |
| Tested (reality) | ✅ | Real data, real query |
| Thematic org | ✅ | In correct filter module |
| Proper sequence | ✅ | Debug → understand → fix |
| Small scope | ✅ | Single syntax fix |

**Verdict:** 8/8 criteria = **1 RPU produced** (15 minutes)

---

## Anti-Patterns: Fake Progress Units

### Fake Unit 1: "Sprint Completed" Without Verification
```
Appearance: Sprint marked done, tickets closed
Reality:   System doesn't work
Geometry:  Violates "human verified" criterion
Fix:       Require manual verification checkpoint
```

### Fake Unit 2: "Tests Pass" With Mocks
```
Appearance: 100% pass rate, coverage metrics good
Reality:   Testing fiction, not reality
Geometry:  Violates "tested (reality-linked)" criterion
Fix:       Import-only rule, no core mocking
```

### Fake Unit 3: "Architecture Defined" Without UX Flow
```
Appearance: Comprehensive architecture docs
Reality:   May not match user needs
Geometry:  Violates "100% PRD fit" criterion
Fix:       UX flows FIRST, architecture follows
```

### Fake Unit 4: "Code Generated" Without Understanding
```
Appearance: Files created, lines written
Reality:   Developer can't explain or modify
Geometry:  Violates "human understood" criterion
Fix:       Force explanation before acceptance
```

### Fake Unit 5: "Partial Implementation" (90% done)
```
Appearance: "Almost there", "just needs polish"
Reality:   90% PRD fit = 0% shippable value
Geometry:  Violates "100% PRD fit" criterion
Fix:       Small scopes that complete 100%
```

---

## Verification: RPU in Existing Workflows

### `/sprint` v3.0 (Human-First)
```
RPU Compliance:
✅ Proper sequence (UX flows first)
✅ Small scope (tiny contracts)
✅ Human verified (continuous checkpoints)
⚠️  100% PRD fit (needs explicit verification)
⚠️  System fit (needs regression containment)

Improvement: Add explicit RPU gate to DoD
```

### `/prototype`
```
RPU Compliance:
❌ Not an RPU (explicitly discardable)
✅ Small scope (30-min limit)
✅ Proper sequence (exploration → decision)

Note: Prototypes are INTENTIONALLY not RPUs
They feed into RPUs via `/harden`
```

### `/harden`
```
RPU Compliance:
✅ System fit (`.windsurfrules` applied)
✅ Human verified (bus stop debugging)
✅ Tested (reality-linked)
⚠️  100% PRD fit (need explicit check)
⚠️  Geometry check (just added - verify it works)

Status: Now produces RPUs (after geometry fix)
```

### `/contain`
```
RPU Compliance:
✅ System fit (prevents lateral drift)
✅ Small scope (enforced boundary)
✅ Proper sequence (re-anchors end-state)

Note: `/contain` is a RPU PROTECTION mechanism
```

---

## Synthesis: RPU Decision Matrix

### When You Have a "Progress Unit", Ask:

| Question | If YES | If NO |
|----------|--------|-------|
| Can I ship this now? | → RPU candidate | → 0 RPU, keep working |
| Does it break anything? | → Verify system fit | → Not shippable |
| Does it match PRD 100%? | → Verify PRD fit | → Partial, not RPU |
| Can I explain how it works? | → Human understood | → Cargo cult danger |
| Have I seen it work? | → Human verified | → Test-only risk |
| Do tests use real code? | → Reality-linked | → Phantom test risk |
| Is it in the right place? | → Thematic org | → Tech debt |
| Did dependencies come first? | → Proper sequence | → Verification gap |
| Can I hold it in memory? | → Small scope | → Break it down |

**Score:** 9 YES = 1 RPU | < 9 YES = 0 RPU

---

## Immediate Actions

### 1. Add RPU Gate to Sprint DoD
```markdown
## Definition of Done (RPU Gate)
- [ ] **System Fit**: No regressions, architecture maintained
- [ ] **100% PRD Fit**: All requirements met completely
- [ ] **Human Understood**: Can explain to another developer
- [ ] **Human Verified**: Manually tested, bus stops pass
- [ ] **Reality-Linked Tests**: Import from source, fail on change
- [ ] **Thematic Org**: Correct domain location
- [ ] **Proper Sequence**: Dependencies verified first
- [ ] **Small Scope**: Fits in attention window
```

### 2. Track Real vs Illusory Velocity
```
DAILY LOG FORMAT:
DATE: 2026-04-13
RPUs Produced: 2 (brand filter fix, token state tests)
Illusory Activity: 0
Notes: Clean day, all work verified
```

### 3. RPU Checkpoint in `/harden`
(Already added - verify it prevents prototype leakage)

---

## Verification & Falsification Log

### Claims Verified
| Claim | Evidence | Method |
|-------|----------|--------|
| basket_to_checkout = 0 RPU | 1/8 criteria met | Retrospective analysis |
| Phantom tests = 0 RPU | 2/8 criteria met | Code audit |
| Brand fix = 1 RPU | 8/8 criteria met | Time tracking + verification |
| 90% PRD fit = 0 value | Incomplete features | Sprint experience |

### Falsification Attempts
| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| All 8 criteria required | Maybe 6/8 is enough? | Rejected - partial = incomplete |
| Small scope always better | Large scopes more efficient? | Rejected - context window limits |
| Human verification optional | Automated tests sufficient? | Rejected - cargo cult failure |

---

## Open Questions

1. Can we quantify "attention window" for different task types?
2. What is the RPU velocity target? (1/day? 2/day?)
3. How do RPUs compose into larger features?
4. Can we measure "human understood" objectively?

---

*Research completed: 2026-04-13*
*Next review: After 10 RPUs tracked to validate hypothesis*
