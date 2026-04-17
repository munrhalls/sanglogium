# Agent Mistake Feedback Loop

> Process: Agent makes mistake → Log here → Weekly review → Update AGENTS.md  
> Goal: Continuous improvement of agent outputs through systematic feedback

---

## Active Process

1. **Log Mistake** - When an agent makes a mistake, add it to the Mistake Log below
2. **Weekly Review** - Every Friday, review new mistakes for patterns
3. **Update Rules** - Convert recurring mistakes to AGENTS.md rules
4. **Add Examples** - Update `examples/gold-standard.tsx` with before/after examples
5. **Mark Resolved** - Move resolved patterns to "Resolved Patterns" section

---

## Mistake Log

| Date | Tool | Mistake | Root Cause | Rule Update | Status |
|------|------|---------|------------|-------------|--------|
| 2026-04-08 | Cascade | Tests passed but system didn't work (missing idempotencyKey, stripePriceId) | Tests mocked everything, no human verification | Added "Human-First Sprint" rule to AGENTS.md | ✅ Resolved |
| 2026-04-13 | Cascade | Test files testing functions that DON'T EXIST in implementation | No import discipline - tests copied functions | Added "TEST IMPORT DISCIPLINE" rule to AGENTS.md | ✅ Resolved |
| 2026-04-13 | Cascade | generateFingerprint test had drifted (missing priority field) | No verification that test matches implementation | Added "ZERO TOLERANCE FOR PHANTOM COVERAGE" to AGENTS.md | ✅ Resolved |
| 2026-04-02 | Cascade | Brand filter returned 0 results despite brand existing | Incorrect GROQ syntax: `brand->{name}` instead of `brand->name` | Added to Universal Prevention Rules: "GROQ: Verify field type before using reference syntax" | ✅ Resolved |
| 2026-04-02 | Cascade | Search autocomplete and full search returned different results | Different field coverage in search functions | Added "Search Consistency Pattern" to lessons | ✅ Resolved |
| 2026-04-02 | Cascade | Playwright tests hanging on Windows for 30+ minutes | Zombie Node processes from previous runs | Added "WINDOWS PLAYWRIGHT PRE-FLIGHT" rule to AGENTS.md | ✅ Resolved |
| 2026-04-02 | Cascade | React error "Objects are not valid as React child" after brand migration | Incomplete migration - didn't update all interfaces/queries | Added "Sanity Migrations" prevention rule to AGENTS.md | ✅ Resolved |
| 2026-04-08 | Cascade | cloneElement used for prop injection | Anti-pattern not explicitly documented | Added "cloneElement" to Critical Anti-Patterns table in AGENTS.md | ✅ Resolved |
| 2026-04-08 | Cascade | useQueryState causing crashes during hydration | Missing null checks for undefined state | Added "useQueryState: ALWAYS add null checks" to Universal Prevention Rules | ✅ Resolved |

---

## Resolved Patterns

These patterns have been codified in AGENTS.md or examples/gold-standard.tsx:

### 1. Test Import Discipline
**Mistake:** Tests defined their own copies of functions instead of importing from source.  
**Resolution:** AGENTS.md "TEST IMPORT DISCIPLINE" rule + "ZERO TOLERANCE FOR PHANTOM COVERAGE" rule.  
**See:** `examples/gold-standard.tsx` section 5 (Testing Pattern)

### 2. Human-First Verification
**Mistake:** Tests passed 100% but system didn't work (mocked everything).  
**Resolution:** AGENTS.md "Human-First Sprint" rule.  
**See:** `_handbook/03-commands/sprint.md` for detailed workflow

### 3. GROQ Reference Syntax
**Mistake:** Using `brand->{name}` instead of `brand->name`  
**Resolution:** AGENTS.md "GROQ: Verify field type before using reference syntax" rule.  
**See:** `examples/gold-standard.tsx` section 3 (Data Fetching Pattern)

### 4. cloneElement Anti-Pattern
**Mistake:** Using `cloneElement` for prop injection instead of React Context.  
**Resolution:** AGENTS.md Critical Anti-Patterns table + example in gold-standard.tsx.  
**See:** `examples/gold-standard.tsx` section 6 (State Management)

### 5. useQueryState Null Checks
**Mistake:** Not handling undefined state during hydration.  
**Resolution:** AGENTS.md "useQueryState: ALWAYS add null checks" rule.  
**See:** `examples/gold-standard.tsx` section 7 (URL State)

---

## Weekly Review Checklist

**Every Friday:**

- [ ] Review all mistakes from the past week
- [ ] Identify recurring patterns (≥2 similar mistakes = pattern)
- [ ] Update AGENTS.md with new rules for patterns
- [ ] Update examples/gold-standard.tsx with before/after examples
- [ ] Mark resolved mistakes in Mistake Log
- [ ] Delete truly one-off mistakes (not worth documenting)

**Review Template:**
```markdown
## Week of [DATE] Review

### New Mistakes: [N]
- [List mistakes]

### Patterns Identified:
1. [Pattern] → Action: [Update AGENTS.md section X]

### AGENTS.md Updates:
- [ ] Section [X] updated
- [ ] examples/gold-standard.tsx updated

### Resolved This Week:
- [Mistake N] → [How resolved]
```

---

## Rule Quality Criteria

Before adding a rule to AGENTS.md, verify it meets these criteria:

1. **New insight not already documented** — Don't duplicate existing rules
2. **Prevents future time loss or errors** — Must save time or prevent bugs
3. **Actionable and retrievable** — Must be specific enough to follow
4. **Not obvious or routine** — Skip "write good code" type advice
5. **Has before/after example** — Must include concrete code examples

---

## Integration with AGENTS.md

When updating AGENTS.md from feedback loop:

1. Add to "Common Mistakes (from Feedback Loop)" section
2. Add example to `examples/gold-standard.tsx`
3. Update "Last Updated" date in AGENTS.md
4. Link from AGENTS.md to this feedback-loop.md file

---

**Last Updated:** 2026-04-16  
**Next Review:** 2026-04-23 (Friday)  
**Owner:** Human + AI Agent Team
