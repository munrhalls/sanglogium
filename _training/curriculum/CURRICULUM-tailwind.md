# Curriculum: Tailwind CSS 3.x Mastery

## Overview
**Duration:** 7 days
**Examination:** L1-04-tailwind-css.md
**Prerequisites:** CSS fundamentals

---

## Module 1: Utility-First Philosophy (Days 1-2)

### Day 1: Why Utility-First?
**Core:** Naming problem, growth complexity, maintainability

**Study:**
- Read: tailwindcss.com/docs/utility-first
- Read: tailwindcss.com/docs/optimizing-for-production

**Practice:**
- Convert component from BEM to utilities
- Understand purge/JIT mechanism
- Configure content paths

### Day 2: Core Concepts
**Topics:** Responsive, states, custom values

**Practice:**
- Build responsive card layout
- Implement hover/focus/disabled states
- Use arbitrary values sparingly

**Challenge:**
```html
<!-- Build this with utilities only: -->
<!-- Responsive nav with: -->
<!-- - Logo left, links right on desktop -->
<!-- - Hamburger menu on mobile -->
<!-- - Hover states on links -->
<!-- - Active state indication -->
```

---

## Module 2: Configuration & Customization (Days 3-4)

### Day 3: Theme Extension
**Topics:** Colors, fonts, spacing, breakpoints

**Practice:**
- Extend theme with brand colors
- Add custom font families
- Configure custom breakpoints

**Challenge:**
```javascript
// tailwind.config.ts additions:
// 1. Brand color palette (50-900)
// 2. Custom fluid typography scale
// 3. Custom spacing increments
// 4. Custom breakpoints for touch devices
```

### Day 4: Plugin Development
**Topics:** addComponents, addUtilities, theme function

**Practice:**
- Create button component plugin
- Add custom utility for text-truncate
- Use theme() function

**Challenge:**
```javascript
// Create plugin that adds:
// - .btn-primary with brand colors
// - .card-elevated with shadow
// - .text-balance utility
// All using theme values
```

---

## Module 3: Advanced Patterns (Days 5-6)

### Day 5: Complex Layouts
**Topics:** Grid, flexbox, aspect-ratio, container queries

**Practice:**
- Build masonry layout
- Implement sidebar + main content
- Use container queries for components

**Challenge:**
```html
<!-- Product grid: -->
<!-- - Masonry on desktop -->
<!-- - 2-column on tablet -->
<!-- - 1-column on mobile -->
<!-- - Sticky sidebar filters -->
```

### Day 6: Your Codebase Design System
**Topics:** Tokens, components, patterns

**Practice:**
- Map all design tokens from tailwind.config.ts
- Identify component patterns
- Document typography system

**Analysis:**
```
Tokens found:
- Colors: _______
- Spacing: _______
- Typography: _______
- Shadows: _______

Components using these:
- btn-primary: _______
- card-product: _______
- input-field: _______
```

---

## Module 4: Optimization (Day 7)

### Day 7: Production Optimization
**Topics:** Purge, minification, critical CSS

**Practice:**
- Configure production build
- Analyze bundle size
- Set up critical CSS extraction

**Final Challenge:**
Refactor a complex page using only Tailwind:
- Zero custom CSS
- All responsive
- Proper dark mode
- Optimized bundle

---

## Assessment

| Day | Checkpoint |
|-----|------------|
| 2 | Build responsive layout without docs |
| 4 | Create working plugin |
| 7 | Zero custom CSS in page |

---

## Resources
- tailwindcss.com/docs
- tailwindui.com/components
- your tailwind.config.ts

*Version: 1.0*
