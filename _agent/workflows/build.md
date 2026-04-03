---
description: Execute component build following Three Passes & Four Layers pattern
---

# /build [COMPONENT_NAME] [PASS] [LAYER] [BREAKPOINT]

**Reference:** `@/_project/core-building-pattern.md` — read before execution
**Purpose:** Build one component following the canonical Pass/Layer sequence

## Syntax

```
/build ProductCard 3 2 1280px
/build Hero 1
/build ProductGrid 2
```

## Parameters

| Param | Values | Required |
|-------|--------|----------|
| `COMPONENT_NAME` | Name of component file (e.g., `ProductCard`) | Yes |
| `PASS` | `1` (Skeleton), `2` (Data), `3` (Build) | Yes |
| `LAYER` | `1` (Structure), `2` (Layout), `3` (Surface), `4` (Interaction) | Only if Pass 3 |
| `BREAKPOINT` | `1280px` or `375px` | Only if Pass 3 |

## Execution Rules (Read-Only Reference)

**Before executing, read:**
1. `@/_project/core-building-pattern.md` — full pattern reference
2. `tailwind.config.ts` — design system tokens
3. Current component file state

**Then execute based on Pass/Layer:**

### Pass 1 — Skeleton
**Target:** Text-only component with debug border
**Output:** `export function [Name]() { return <div className="border-2 border-red-500">[Name]</div> }`
**Constraints:**
- No classes except border
- No props
- No data
- No logic

### Pass 2 — Data
**Target:** Real data rendering, no styling
**Output:** Component receives Sanity data, displays content
**Constraints:**
- No colors
- No typography styling
- No layout polish
- Real data flows only

### Pass 3 + Layer 1 — Structure
**Target:** Semantic HTML skeleton
**Already exists** from Pass 1 — skip if present

### Pass 3 + Layer 2 — Layout
**Target:** Tailwind positioning/sizing classes
**Allowed:** flex, grid, gap, padding, margin, width, height, overflow
**Forbidden:** colors, typography, decoration, animations

### Pass 3 + Layer 3 — Surface
**Target:** Colors, typography, imagery, borders, shadows
**Allowed:** All bg-*, text-*, border-*, font-*, rounded-*, shadow-*
**Forbidden:** transitions, hover states, animations

### Pass 3 + Layer 4 — Interaction
**Target:** Hover states, transitions, animations
**Allowed:** hover:*, focus:*, transition-*, animate-*, transforms

## RWD Sequencing (Pass 3 Only)

When Pass 3 is specified, the default is desktop-first (1280px).
If `375px` is specified, build mobile version of the same Layer.

**Correct sequence per component:**
```
/build ProductCard 3 2 1280px   # Desktop layout
/build ProductCard 3 3 1280px   # Desktop surface
/build ProductCard 3 4 1280px   # Desktop interaction
/build ProductCard 3 2 375px    # Mobile layout
/build ProductCard 3 3 375px    # Mobile surface
/build ProductCard 3 4 375px    # Mobile interaction
```

## Output Format

After execution, output:

```markdown
## /build Result: [COMPONENT] — Pass [N], Layer [N], [BREAKPOINT]

### Lock Conditions Met
- [ ] Structure renders correctly
- [ ] Layout positions correctly
- [ ] Surface matches design spec
- [ ] Interaction works as specified

### Next Step
[Next /build command or "Component locked — proceed to next component"]

### Constraints Respected
- [ ] No layer mixing
- [ ] No premature optimization
- [ ] No scope creep
```

## Constraint Rules (Enforced)

- **NO** mixing layers in single prompt
- **NO** Pass 3 work before Pass 1/2 complete
- **NO** mobile before desktop (per component)
- **NO** animations before surface complete
- **YES** debug borders in Pass 1
- **YES** real data only in Pass 2
- **YES** per-component RWD completion

## Example Usage

**Full component build sequence:**
```
User: /build ShopHeader 1
AI: [Outputs skeleton ShopHeader with border]

User: /build ShopHeader 2
AI: [Integrates real data, no styling]

User: /build ShopHeader 3 2 1280px
AI: [Adds layout classes for desktop]

User: /build ShopHeader 3 3 1280px
AI: [Adds colors, typography]

User: /build ShopHeader 3 4 1280px
AI: [Adds hover states]

User: /build ShopHeader 3 2 375px
AI: [Adapts layout for mobile]

[etc until complete]
```

## Integration with /sprint

When `/sprint` generates scope contracts, it maps DoDs to Pass/Layer:

```markdown
## Scope Contract 1: ProductCard — Gap G-01

### DoD
- [ ] Pass 1: Skeleton
- [ ] Pass 2: Data
- [ ] Pass 3 — Layer 2: Desktop layout (1280px)
- [ ] Pass 3 — Layer 3: Desktop surface (1280px)
- [ ] Pass 3 — Layer 4: Desktop interaction (1280px)
- [ ] Pass 3 — Layer 2: Mobile layout (375px)
- [ ] Pass 3 — Layer 3: Mobile surface (375px)
- [ ] Pass 3 — Layer 4: Mobile interaction (375px)
```

Each DoD item maps to one `/build` invocation.

## Error Conditions

**Invalid:** `/build ProductCard 3 1 1280px`
**Reason:** Layer 1 (Structure) already exists from Pass 1

**Invalid:** `/build ProductCard 3 3 375px` before Layer 2 mobile
**Reason:** Layer 3 requires Layer 2 to be complete first

**Invalid:** `/build ProductCard 2` when Pass 1 incomplete
**Reason:** Pass 2 requires all components have skeleton

## Reference Chain

1. `/build` → reads `@/_project/core-building-pattern.md`
2. `/sprint` → generates DoDs referencing Pass/Layer
3. `/audit` → outputs RWD strategy mapping to Pass 3 sequencing
4. All workflows → enforce `@/tailwind.config.ts` token usage
