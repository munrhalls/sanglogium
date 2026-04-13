# Quality Threshold Matrix
## Permission to ship at 80% vs Requirement for 100%

---

## RELIABILITY PROOF

**Why this works:**
- Not all code is equally critical — perfectionism on low-risk items wastes time
- 80% threshold accelerates iteration on UI/content (where feedback matters more than polish)
- 100% threshold protects critical paths (where bugs are catastrophic)
- Explicit matrix removes decision fatigue — just look it up

**Failure modes (and how to prevent):**
| Failure | Prevention |
|---------|------------|
| Everything at 100% (perfectionism) | Weekly review: Are 80% items taking 100% time? |
| Everything at 80% (sloppiness) | Checklist: Does this touch money/auth/data integrity? |
| Creeping 80% → 100% | POST_LAUNCH_IMPROVEMENTS.md captures the 20% for later |
| Debating thresholds | Matrix is law. If unclear, default to 100%. |

---

## THE MATRIX

| Component | Threshold | Why | Post-Launch Capture? |
|-----------|-----------|-----|---------------------|
| **Checkout FSM** | 100% | Irreversible money flow | ❌ No — must be perfect |
| **Payment processing** | 100% | Money + legal liability | ❌ No — must be perfect |
| **Inventory reservation** | 100% | Data integrity critical | ❌ No — must be perfect |
| **Authentication** | 100% | Security requirement | ❌ No — must be perfect |
| **Address validation** | 100% | Shipping depends on it | ❌ No — must be perfect |
| **Redis queue operations** | 100% | Order lifecycle depends on it | ❌ No — must be perfect |
| **Sanity transactions** | 100% | Data consistency required | ❌ No — must be perfect |
| **API routes (checkout)** | 100% | Core business logic | ❌ No — must be perfect |
| **Hero component** | 80% | Can iterate live | ✅ Yes — animation polish |
| **Product spotlight** | 80% | Visual, reversible | ✅ Yes — layout variations |
| **Marketing pages** | 80% | Content, not code | ✅ Yes — copy improvements |
| **Search filters UI** | 80% | Can adjust based on usage | ✅ Yes — advanced filters |
| **Category navigation** | 80% | Can iterate post-launch | ✅ Yes — visual hierarchy |
| **Admin dashboard** | 80% | Internal users, fixable | ✅ Yes — feature additions |
| **Test coverage** | 80% | Critical paths 100%, rest 80% | ✅ Yes — edge case tests |
| **Documentation** | 80% | Living documents | ✅ Yes — deep dives |
| **Human verification guides** | 80% | Evolve with implementation | ✅ Yes — additional bus stops |

---

## DECISION FLOWCHART

```
Does this component touch money, auth, or inventory?
├── YES → 100% threshold
│         └── Must pass all quality gates:
│             - All bus stops verified
│             - Tests cover all paths
│             - Type safety 100%
│             - Manual verification passed
│             - No POST_LAUNCH capture (must be perfect now)
│
└── NO → Does a bug here break core functionality?
    ├── YES → 100% threshold
    │         └── Same as above
    │
    └── NO → 80% threshold
              └── Must pass:
                  - Core interaction works
                  - No crash on happy path
                  - "Good enough" visual polish
                  - POST_LAUNCH capture for the 20%
```

---

## POST_LAUNCH_IMPROVEMENTS.md TEMPLATE

Create this file in project root:

```markdown
# Post-Launch Improvements
## The 20% we can add after shipping

### Homepage
- [ ] Hero animation refinement
- [ ] Additional product spotlight variations
- [ ] Scroll-triggered animations

### Search
- [ ] Advanced filter combinations
- [ ] Search history
- [ ] Auto-suggest enhancements

### Admin
- [ ] Dashboard analytics charts
- [ ] Bulk operations UI
- [ ] Advanced filtering

### General
- [ ] Edge case test coverage expansion
- [ ] Performance optimization pass
- [ ] Accessibility audit remediation
```

**Rule:** If 80% threshold, MUST add improvement item to this file.

---

## QUALITY GATES BY THRESHOLD

### 100% Gates (All Must Pass)

| Gate | Verification |
|------|--------------|
| Type Safety | `npm run typecheck` 100% pass |
| Test Coverage | All paths tested, no mocks of core |
| Bus Stops | 8-10 stops, all pass |
| Manual Verification | Human verified in browser |
| Architecture | Matches `.windsurfrules` |
| Security | No secrets, proper validation |
| Edge Cases | Empty states, errors, limits handled |

### 80% Gates (Core Must Pass)

| Gate | Verification |
|------|--------------|
| Type Safety | `npm run typecheck` pass (can have `any` in non-critical paths) |
| Test Coverage | Happy path + 1-2 error cases |
| Bus Stops | 5-6 critical stops pass |
| Manual Verification | Core interaction works |
| Architecture | Generally follows patterns |
| Security | No obvious vulnerabilities |
| Edge Cases | Empty state handled |

---

## ANTI-PATTERNS

❌ **100% on marketing copy:** Perfectionism on reversible content  
❌ **80% on checkout flow:** Sloppiness on irreversible money flow  
❌ **No POST_LAUNCH capture:** 80% items lose their 20% improvement plan  
❌ **Threshold creep:** Starting at 80%, expanding to 100% mid-work  

---

## INTEGRATION WITH WORKFLOWS

| Workflow | Threshold |
|----------|-----------|
| `/sprint` | Set per scope contract |
| `/implement` | Follow matrix |
| `/prototype` | N/A (not production) |
| `/harden` | Must meet target threshold |
| `/test` | 100% tests for 100% components, 80% tests for 80% |
| `/trace` | All bus stops for 100%, critical stops for 80% |

---

## SUCCESS INDICATORS

- 100% components never ship with known issues
- 80% components ship on schedule with POST_LAUNCH plan
- No debate about thresholds — matrix is law
- POST_LAUNCH.md has 10-20 items (healthy backlog)

## FAILURE INDICATORS

- 100% component shipping at 80% quality
- 80% component taking 100% time (perfectionism)
- POST_LAUNCH.md empty (no permission to ship imperfect)
- POST_LAUNCH.md >50 items (shipping everything at 80%, too much debt)

---

## WEEKLY REVIEW

In `progress.txt`:
```
[2026-04-20] QUALITY REVIEW:
- 100% items completed: [list]
- 80% items completed: [list]
- POST_LAUNCH.md items added: [count]
- Threshold violations: [any 100% shipped at 80%?]
- Perfectionism detected: [any 80% taking 100% time?]
```
