# Layer 1 Examination: Tailwind CSS 3.x + Design System

## Pre-Examination Attestation
**Date:** ___________  **Time:** ___________  **Duration:** 90 minutes

**Prerequisites:**
- [ ] CSS fundamentals (box model, specificity, cascade)
- [ ] CSS custom properties (variables)
- [ ] Responsive design principles (media queries)

**I attest I can write vanilla CSS layouts:** _________________

---

## Section A: First Principles Foundation (20 minutes)

### A1: Why Utility-First CSS?

**Question 1: From first principles, what problem does Tailwind solve that traditional CSS approaches don't?**

Your explanation (reference naming problem, specificity wars, and growth complexity):
```
[Write 150+ words - why do CSS files grow uncontrollably?]















```

**Gap Detection:** What am I missing about the purging/tree-shaking mechanism?
```









```

### A2: The JIT Engine

**Question 2: Tailwind 3.x uses a Just-In-Time (JIT) compiler. What does this actually do?**

Explain the build-time process:
```
1. Scan files for class names: ___________________________________
2. Generate CSS rules: __________________________________________
3. Handle arbitrary values: ______________________________________
4. Tree-shake unused styles: _____________________________________
```

**Why is `content` config critical?** _________________________________

---

## Section B: Closed-Book Implementation (25 minutes)

**Write valid Tailwind classes WITHOUT the documentation.**

### B1: Complex Layout Pattern

Create a responsive grid layout:
- Mobile: 1 column
- Tablet (md): 2 columns
- Desktop (lg): 3 columns with first item spanning 2 columns
- Gap: 16px mobile, 24px desktop
- All items have aspect-ratio 16/9

```html
<!-- Your implementation: -->
<div class="__________">
  <div class="__________">1</div>
  <div class="__________">2</div>
  <div class="__________">3</div>
  <div class="__________">4</div>
</div>
```

### B2: Custom Plugin Component

Your codebase uses `btn-primary` from a custom plugin. Write the Tailwind plugin that generates this:

```javascript
// What the plugin creates (from your tailwind.config.ts):
const uiComponentsPlugin = plugin(function ({ addComponents, theme }) {
  // Your reconstruction:





















});
```

**When to use `addComponents` vs `addUtilities`?**
- Components: _________________________________
- Utilities: ___________________________________

### B3: Theme Extension

Your config extends the theme. Write the exact extension for:

1. Custom color palette entry:
```javascript
colors: {
  brand: {
    // Add 400: #F6E3D5




  }
}
```

2. Custom font size with line-height and letter-spacing:
```javascript
fontSize: {
  'display-1': [
    // Add: clamp(3rem, 4vw + 2rem, 5.625rem)
    // Line-height: 1.1
    // Letter-spacing: -0.02em





  ]
}
```

### B4: Responsive Typography

Write the classes for this design spec:
- Text: brand-400 color
- Size: 12px mobile → 16px tablet → 20px desktop
- Weight: bold
- Uppercase with 0.2em letter-spacing

```html
<h2 class="__________">Title</h2>
```

---

## Section C: Advanced Patterns & Pitfalls (20 minutes)

### C1: The `group` and `peer` Modifiers

**Scenario:** Card with image that changes opacity on card hover.

```html
<!-- Fix this broken implementation: -->
<div class="card">
  <img class="hover:opacity-75" src="..." />
  <div class="content">...</div>
</div>
```

**Correct implementation:**
```html





```

**When to use `peer` instead?** _________________________________

### C2: Arbitrary Values vs Config

**Question:** When should you use `w-[123px]` vs extending the config?

| Approach | Use When | Example |
|----------|----------|---------|
| Arbitrary | | |
| Config extension | | |
| `!important` | | |

### C3: Layer Directives

Your `globals.css` uses `@layer`. Explain each:

```css
@layer base {
  /* What goes here? Why? */
}

@layer components {
  /* What goes here? Why? */
}

@layer utilities {
  /* What goes here? Why? */
}
```

**Order of precedence (which wins in conflicts):**
1. ____________ (lowest)
2. ____________
3. ____________ (highest)

### C4: Dark Mode Strategy

Your config has `darkMode: ["class"]`.

**How this works:** _________________________________________________

**Manual vs System preference:**
- Manual: ___________________________________________
- System: ___________________________________________

---

## Section D: Your Codebase Design System (15 minutes)

### D1: Token Analysis

From `tailwind.config.ts`, extract the complete design token structure:

| Token Type | Example Values | Usage |
|------------|----------------|-------|
| Colors - Brand | 50: #FEFCFB ... | Primary brand |
| Colors - Secondary | | |
| Colors - Surface | | |
| Font Size - Display | | |
| Spacing | | |
| Border Radius | | |

### D2: Component Classes

Map your custom components to their classes:

| Component | Base Classes | Variants |
|-----------|------------|----------|
| btn-primary | | |
| btn-secondary | | |
| card-product | | |
| input-field | | |

### D3: Typography System

Your `type-hero-headline` class uses these tokens:
```
Font-size: _________________________
Line-height: _______________________
Letter-spacing: ____________________
Font-weight: ______________________
Color: ____________________________
```

**How to override a single property while keeping others:** _________________

---

## Section E: Open-Book Verification (10 minutes)

### E1: Tailwind 4.0 (if available)

What's changing that affects your codebase?
```
Change: ___________________________________________
Migration effort: _________________________________
```

### E2: Corrections from closed-book

| Pattern | My Answer | Correct | Gap |
|---------|-----------|---------|-----|
| Complex grid | | | |
| Plugin syntax | | | |
| Layer usage | | | |

---

## Final Attestation

**I can now:**
- [ ] Write complex layouts without documentation
- [ ] Create and use custom plugins
- [ ] Extend theme configuration properly
- [ ] Debug specificity/layer issues
- [ ] Navigate the design system in your codebase

**Commitment:** I will check `tailwind.config.ts` before adding arbitrary values. ___

**Signed:** _________________ **Date:** ___________

---

## Cross-Reference

**Prerequisites:** CSS fundamentals, custom properties, responsive design

**Dependents:**
- Component architecture (Layer 2)
- Dark mode implementation (Layer 2)
- Animation/transition systems (Layer 2)

**Conflicts/Alternatives:**
- CSS-in-JS (styled-components - used in Sanity Studio only)
- CSS Modules (component-scoped)
- Bootstrap (opinionated component library)

**Authoritative Sources:**
1. https://tailwindcss.com/docs (v3.x)
2. https://tailwindcss.com/blog (version announcements)
3. Your `tailwind.config.ts` (source of truth for project)

---

*Examination Version: 1.0*
*Methodology: Ericsson Deliberate Practice + Feynman Technique*
