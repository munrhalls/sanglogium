---
description: Output feature audit with end-state delineation, spatial architecture, and gap analysis for sprint consumption
---

# /audit [FEATURE_NAME]

**Input:** Human describes feature to audit and target state (e.g., "post-homepage products discovery UI")
**Output:** `_project/sprints/01_audit_[FEATURE_NAME].md` — structured audit with gap analysis

## Execution Steps

1. **Research:** Read `tailwind.config.ts`, current implementation, relevant components
2. **Delineate:** End-state at desktop + mobile (ASCII spatial maps)
3. **Map:** User flows and spatial parent-child relationships
4. **Gap:** Numbered gaps (G-01...) with current/target states
5. **RWD:** Behavior per breakpoint
6. **Risk:** Files at risk of regression + mitigation

## Output Format

```markdown
# Audit: [Feature Name]

## 1. End-State Delineation

### Desktop (1280px)
```
[ASCII spatial map]
[NAV HEADER — full width]
[PAGE CONTENT — max-w-content, mx-auto, px-8]
  [AREA A — width, behavior]
  [AREA B — width, behavior]
    [COMPONENT X]
    [COMPONENT Y]
```

### Mobile (375px)
```
[SAME AREAS — stacked/altered behavior]
```

### Design System Tokens Required
| Token | Current | Target | Gap ID |
|-------|---------|--------|--------|
| `shadow-cardDark` | missing | add to tailwind.config.ts | G-01 |
| `type-overline` | exists, unused | apply to header | G-02 |

---

## 2. Spatial Architecture

### User Flow Groups
| Group | Entry | Actions | Exit |
|-------|-------|---------|------|
| Browse | PLP | Filter, Sort, View | PDP |
| Admin | (future) | — | — |

### Component Hierarchy
```
PageLayout
├── ControlsBar (flex, justify-between)
│   ├── SortDropdown
│   └── ResultCount
├── BodyRow (flex, gap-8)
│   ├── Sidebar (w-60, shrink-0)
│   │   └── FilterSidebar
│   └── ProductGrid (flex-1)
│       └── ProductCard[]
```

---

## 3. Gap Analysis (G-XX)

| ID | Component | Current | Target | Severity |
|----|-----------|---------|--------|----------|
| G-01 | ProductCard | No image container | `aspect-[4/3]` + `bg-surface-productImage` | High |
| G-02 | ShopHeader | Generic title | `type-overline` + section-header-anchor | High |
| G-03 | FilterSidebar | No visual separation | `bg-surface-elevated` + border-right | Medium |

---

## 4. RWD Strategy

| Component | Desktop (1280px) | Mobile (375px) | Implementation |
|-----------|------------------|----------------|----------------|
| Sidebar | Fixed left, w-60 | Drawer overlay | `lg:block` / `hidden` |
| ProductGrid | 3 columns | 1 column | `grid-cols-1 lg:grid-cols-3` |
| ControlsBar | Row | Stacked | `flex-col lg:flex-row` |

---

## 5. Files at Risk of Regression

| File | Risk | Mitigation |
|------|------|------------|
| `ProductCard.tsx` | Homepage cards share component | Verify homepage unchanged |
| `tailwind.config.ts` | Token additions | Add only, never modify existing |

---

## 6. Verification Commands

```bash
# Lightweight pre-sprint regression (typecheck only)
npx tsc --noEmit

# Component verification (run when no concurrent agents)
npx playwright test --grep "[Feature]"
```
```

## Constraint Rules
- **NO** prose descriptions without spatial maps
- **NO** gaps without G-XX IDs
- **NO** RWD without specific breakpoint values (1280px, 375px)
- **ALL** design system references must map to `tailwind.config.ts` tokens
- **ASCII maps mandatory** — they show spatial relationships words obscure