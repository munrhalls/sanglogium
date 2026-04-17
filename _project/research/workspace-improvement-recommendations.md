# Workspace Organization Improvement Recommendations

**Based on:** Zach Davis (LaunchDarkly) enterprise AI methodology  
**Target:** sang-logium codebase  
**Impact Order:** High → Medium → Low (implementation priority)  
**Viability:** All recommendations are immediately applicable

---

## Executive Summary

Current state analysis:
- ✅ **Strong foundation** - `.windsurfrules` has 279 lines of comprehensive rules
- ✅ **Workflow system** - 35 workflow files in `.windsurf/workflows/`
- ✅ **Learning circuit** - Pre/post work lesson retrieval system
- ⚠️ **Fragmentation** - Rules scattered across `.windsurfrules`, `_handbook/`, `_agent/workflows/`
- ⚠️ **No gold standard** - No single file demonstrating all conventions
- ⚠️ **No feedback loop** - Mistakes not systematically converted to rule updates

---

## HIGH IMPACT (Implement First)

### 1. Create Centralized `AGENTS.md` at Repo Root

**Current Problem:**
- Rules in `.windsurfrules` (279 lines)
- Documentation in `_handbook/` (7 subdirectories)
- Agent workflows in `_agent/workflows/` and `.windsurf/workflows/`
- No single source of truth

**Proposed Solution:**
```
sang-logium/
├── AGENTS.md          ← NEW: Centralized rules (all AI tools)
├── .windsurfrules     ← Keep: Windsurf-specific only (thin wrapper)
├── _handbook/         ← Keep: Human-focused documentation
└── .cursorrules       ← NEW: Cursor-specific (thin wrapper referencing AGENTS.md)
```

**AGENTS.md Structure:**
```markdown
# Agent Coding Guidelines

## Quick Reference (Gold Standard)
See: `examples/gold-standard.tsx` for complete working example

## Architecture Constraints
- [Rule with before/after example]

## Testing Requirements
- [Rule with before/after example]

## Common Mistakes (Feedback Loop)
Last updated: [date]
- Mistake: [description] → Fix: [rule update]
```

**Effort:** 2-3 hours  
**Impact:** Eliminates rule duplication across tools  
**Validation:** All AI tools (Cursor, Windsurf, Claude) reference same source

---

### 2. Establish Feedback Loop Process

**Current Problem:**
- Lessons stored in `_project/lessons/`
- No systematic process to convert agent mistakes → rule updates
- Rules become stale

**Proposed Solution:**

Create `.windsurf/feedback-loop.md`:
```markdown
# Agent Mistake Feedback Loop

## Process
1. Agent makes mistake → Log in Mistake Log
2. Weekly review → Convert to rule update
3. Update AGENTS.md → Mark as resolved

## Mistake Log Template
| Date | Tool | Mistake | Root Cause | Rule Update |
|------|------|---------|------------|-------------|

## Resolved Patterns (teach agents)
- [Pattern with correct example]
```

**Effort:** 30 minutes setup + ongoing process  
**Impact:** Continuous improvement of agent outputs  
**Validation:** Mistakes decrease over time, rules stay current

---

### 3. Create `examples/gold-standard.tsx`

**Current Problem:**
- 279 lines of rules in text form
- No single file showing "what good looks like"
- Agents must infer patterns from scattered examples

**Proposed Solution:**

Create `examples/gold-standard.tsx`:
```typescript
// GOLD STANDARD EXAMPLE
// This file demonstrates all coding conventions in one place.
// Agents should reference this when implementing new features.

// ==========================================
// 1. SERVER COMPONENT (default pattern)
// ==========================================
import { sanityClient } from '@/sanity/lib/client'
import { productQuery } from '@/sanity/lib/queries'

// ✅ DO: Server Component for data fetching
export async function ProductPage({ params }: { params: { slug: string } }) {
  // ✅ DO: Parallel data fetching
  const [product, related] = await Promise.all([
    sanityClient.fetch(productQuery, { slug: params.slug }),
    sanityClient.fetch(relatedQuery, { slug: params.slug }),
  ])
  
  return <ProductDetail product={product} related={related} />
}

// ==========================================
// 2. CLIENT COMPONENT (when needed)
// ==========================================
'use client'

import { useState } from 'react'

// ✅ DO: Minimal 'use client' - only when interactivity required
export function AddToCartButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false)
  
  // ✅ DO: Handle errors explicitly
  async function handleAdd() {
    try {
      setLoading(true)
      await addToCart(productId)
    } catch (error) {
      console.error('Failed to add to cart:', error)
      showToast.error('Could not add item')
    } finally {
      setLoading(false)
    }
  }
  
  return <button onClick={handleAdd} disabled={loading}>Add to Cart</button>
}

// ==========================================
// 3. DATA FETCHING PATTERN
// ==========================================

// ✅ DO: GROQ queries in separate file (sanity/lib/queries.ts)
// ✅ DO: Typegen types from Sanity
// ✅ DO: Error handling with fallback

// ==========================================
// 4. STYLING PATTERN
// ==========================================

// ✅ DO: Tailwind utility classes ONLY
// ✅ DO: Scoped classes, no global CSS
// ✅ DO: Use design tokens from tailwind.config.ts

// ==========================================
// 5. TESTING PATTERN
// ==========================================

// ✅ DO: Vitest (NOT Jest)
// ✅ DO: Import from source, not copy logic
// ✅ DO: Test behavior, not implementation
```

**Effort:** 1 hour  
**Impact:** Agents have concrete reference for "correct" code  
**Validation:** Reduced back-and-forth on PR reviews for style issues

---

## MEDIUM IMPACT (Implement Next)

### 4. Simplify `_handbook/` Structure

**Current Problem:**
```
_handbook/
├── 01-fundamentals/      (1 item)
├── 02-orchestration/     (2 items)
├── 03-commands/          (18 items!) ← too granular
├── 04-sprints/           (1 item)
├── 05-audits/            (1 item)
├── 06-coherence/         (1 item)
├── 07-appendices/        (6 items)
└── INDEX.md
```

**Proposed Solution:**
```
_handbook/
├── fundamentals.md       (was 01-fundamentals/)
├── orchestration.md      (was 02-orchestration/)
├── commands.md           (consolidate 03-commands/)
├── workflows/
│   ├── sprints.md        (was 04-sprints/)
│   ├── audits.md         (was 05-audits/)
│   └── coherence.md      (was 06-coherence/)
├── reference/            (was 07-appendices/)
└── INDEX.md
```

**Effort:** 2 hours  
**Impact:** Reduced cognitive load, easier navigation  
**Validation:** New team member can find information in < 30 seconds

---

### 5. Add Deterministic Guardrails Checklist

**Current Problem:**
- Rules mention "NEVER use Jest" but no automated enforcement
- Agents can still generate Jest code that fails in review
- Reactive rather than preventive

**Proposed Solution:**

Add to `AGENTS.md`:
```markdown
## Deterministic Guardrails (Non-Negotiable)

These are enforced by CI/CD. Agents MUST generate code that passes:

- [ ] `npm run lint` - ESLint with custom rules
- [ ] `npm run typecheck` - TypeScript strict mode
- [ ] `npm run test:unit` - Vitest (Jest detection)
- [ ] `npm run test:e2e` - Playwright

### Common Agent Mistakes Caught by Guardrails
| Mistake | Linter Rule | Prevention |
|---------|-------------|------------|
| Using Jest | `no-restricted-imports` | Auto-fail CI |
| Missing 'use client' | Custom React rule | TypeScript error |
| Direct Sanity queries | Custom GROQ rule | Architecture check |
```

Create `.eslintrc-ai.js` (AI-specific rules):
```javascript
module.exports = {
  rules: {
    'no-restricted-imports': ['error', {
      paths: [
        { name: 'jest', message: 'Use Vitest instead' },
        { name: '@testing-library/jest-dom', message: 'Use Vitest matchers' },
      ]
    }],
    // Custom rule: Detect direct Sanity client usage in components
    // Custom rule: Detect cloneElement usage
  }
}
```

**Effort:** 2-3 hours  
**Impact:** Mistakes caught before human review  
**Validation:** Zero Jest imports in new PRs

---

### 6. Consolidate Workflow Locations

**Current Problem:**
```
.windsurf/workflows/     (35 files)
_agent/workflows/          (15 files)
_handbook/03-commands/     (18 files - some overlap)
```

**Proposed Solution:**
```
.windsurf/workflows/       (tool-specific workflows)
├── audit.md
├── sprint.md
├── contain.md
└── ... (other AI execution workflows)

_agent/workflows/          ← DEPRECATE, migrate to .windsurf/

_handbook/commands.md      (human-readable command reference)
├── /audit
├── /sprint
├── /contain
└── ... (command descriptions, not executable logic)
```

**Effort:** 1-2 hours  
**Impact:** Single location for executable workflows  
**Validation:** No confusion about where to add new workflows

---

## LOW IMPACT (Nice to Have)

### 7. Create Before/After Rule Examples

**Current Problem:**
- Rules say "NEVER use cloneElement"
- No example showing what TO do instead
- Agents may not know the alternative

**Proposed Solution:**

Update AGENTS.md with pattern:
```markdown
### ❌ NEVER: cloneElement for prop injection
```typescript
// WRONG
{React.Children.map(children, child =>
  React.cloneElement(child, { theme: 'dark' })
)}
```

### ✅ ALWAYS: React Context for prop injection
```typescript
// CORRECT
const ThemeContext = createContext('light')

function Parent({ children }) {
  return (
    <ThemeContext.Provider value="dark">
      {children}
    </ThemeContext.Provider>
  )
}

function Child() {
  const theme = useContext(ThemeContext) // 'dark'
}
```
```

**Effort:** 3-4 hours (all rules)  
**Impact:** Reduced agent confusion, better first-attempt code  
**Validation:** Less "fix this" back-and-forth

---

### 8. Add Tool-Specific Wrapper Files

**Current Problem:**
- `.windsurfrules` exists
- No `.cursorrules` for Cursor users
- No Claude Code skills defined

**Proposed Solution:**

`.cursorrules`:
```markdown
# Cursor Rules for sang-logium

> This file references AGENTS.md for all rules.
> Tool-specific optimizations only below.

## Cursor-Specific Settings
- Prefer tab-based autocomplete
- Use @ references for file lookup

## Reference
Full guidelines: @AGENTS.md
Gold standard: @examples/gold-standard.tsx
```

`claude-skills.md` (for Claude Code):
```markdown
# Claude Code Skills for sang-logium

## Skill: Implement Feature
Reference AGENTS.md section [X] before implementing.
Always check examples/gold-standard.tsx for patterns.

## Skill: Debug Issue
Follow Component Archaeology Principle from AGENTS.md.
```

**Effort:** 30 minutes  
**Impact:** Consistent experience across tools  
**Validation:** Cursor users get same guidance as Windsurf users

---

## Implementation Roadmap

### Week 1: Foundation
- [ ] Create `AGENTS.md` (consolidate .windsurfrules)
- [ ] Create `examples/gold-standard.tsx`
- [ ] Create `.windsurf/feedback-loop.md`

### Week 2: Automation
- [ ] Create `.eslintrc-ai.js` with AI-specific rules
- [ ] Update CI to run AI-specific linting
- [ ] Document guardrails in AGENTS.md

### Week 3: Consolidation
- [ ] Simplify `_handbook/` structure
- [ ] Migrate `_agent/workflows/` to `.windsurf/workflows/`
- [ ] Create `.cursorrules`

### Week 4: Polish
- [ ] Add before/after examples to top 10 rules
- [ ] Test with all AI tools (Cursor, Windsurf, Claude)
- [ ] Document process for future updates

---

## Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Time to find rule | 2+ minutes | < 30 seconds | New dev test |
| Agent first-attempt success | ~60% | > 80% | PR review data |
| Style-related review comments | ~30% | < 10% | PR review analysis |
| Rule violations caught by CI | ~20% | > 80% | CI failure analysis |
| Documentation maintenance time | Unknown | < 1 hour/week | Time tracking |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| AGENTS.md becomes too large | Keep < 100 lines; reference detailed docs |
| Rules get out of sync | Weekly feedback loop review |
| Team resistance to new structure | Keep old paths working during transition |
| Tool-specific optimizations lost | Wrapper files preserve tool features |
