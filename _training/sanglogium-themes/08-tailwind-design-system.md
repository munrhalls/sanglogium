# Theme 08: Tailwind CSS Design Systems

## SangLogium Context
All styling uses scoped Tailwind utility classes. NO arbitrary global CSS. Design system aliases (type-section-hed, btn-primary) enforce consistency. The constraint is absolute: only Tailwind, only scoped, only config-defined utilities.

**Critical Files:**
- `tailwind.config.ts` — Design system definition
- `app/globals.css` — ONLY Tailwind directives (no custom CSS)
- `app/components/` — All scoped Tailwind usage
- Component variants use `class-variance-authority`

---

## Layer 1: Foundations Examination

### Diagnostic Assessment (20 minutes)

Answer these without looking at code. Binary pass/fail.

#### Tailwind Fundamentals
- [ ] What is the difference between `text-lg` and `text-[18px]`?
- [ ] What are `theme.extend` values used for?
- [ ] How do you create custom utility classes?
- [ ] What is the `@apply` directive and why avoid it?
- [ ] How does Tailwind's JIT mode work?

#### Design System Architecture
- [ ] What is a design token?
- [ ] Why use aliases like `type-section-hed` vs raw `text-2xl`?
- [ ] How do you enforce design system usage?
- [ ] What is `class-variance-authority` for?
- [ ] How do you handle component variants (primary, secondary, danger)?

#### SangLogium-Specific
- [ ] What typography aliases are defined?
- [ ] What button variants exist?
- [ ] What color palette is used?
- [ ] How are spacing values defined?
- [ ] What is the breakpoint strategy?

#### Constraints
- [ ] Why NO arbitrary values like `w-[37px]`?
- [ ] Why NO inline styles?
- [ ] Why NO global CSS modifications?
- [ ] Why NO raw color primitives?
- [ ] How do you add a new design token?

---

## Layer 1: Comprehensive Curriculum

### Module 1: Design Token Architecture

**What Are Design Tokens?**
```
Design tokens are the single source of truth for design decisions:
- Colors: brand-500, neutral-900, semantic-error
- Typography: font-sans, text-base, leading-tight
- Spacing: space-4, space-8 (multiples of 4px base)
- Breakpoints: sm, md, lg, xl
```

**SangLogium Token Structure:**
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#faf5f0',
          100: '#f0e6d8',
          // ... 50-950 scale
          900: '#5c3d2e',
        },
        neutral: {
          50: '#fafafa',
          900: '#0a0a0a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      fontSize: {
        // Use typography aliases, not raw sizes
      },
    },
  },
};
```

**Typography Aliases:**
```typescript
// tailwind.config.ts
plugin(function({ addComponents }) {
  addComponents({
    '.type-hero-headline': {
      '@apply font-serif text-5xl md:text-7xl font-bold leading-none': {},
    },
    '.type-section-hed': {
      '@apply font-sans text-2xl md:text-3xl font-semibold tracking-tight': {},
    },
    '.type-body': {
      '@apply font-sans text-base leading-relaxed': {},
    },
    '.type-caption': {
      '@apply font-sans text-sm text-neutral-600': {},
    },
  });
}),
```

**Usage:**
```tsx
// CORRECT: Use design system alias
<h1 className="type-hero-headline">SangLogium</h1>

// WRONG: Raw Tailwind (arbitrary, inconsistent)
<h1 className="font-serif text-5xl font-bold">SangLogium</h1>

// WRONG: Arbitrary value (never allowed)
<h1 className="text-[52px] font-bold">SangLogium</h1>
```

---

### Module 2: Component Variants with CVA

**Class Variance Authority:**
```typescript
// components/ui/button.tsx
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  // Base styles applied to all variants
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-brand-600 text-white hover:bg-brand-700',
        secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200',
        ghost: 'hover:bg-neutral-100',
        danger: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-10 px-4',
        lg: 'h-12 px-6',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button 
      className={cn(buttonVariants({ variant, size }), className)} 
      {...props} 
    />
  );
}
```

**Usage:**
```tsx
<Button variant="primary" size="lg">Add to Cart</Button>
<Button variant="ghost" size="sm">Cancel</Button>
```

**Benefits:**
- Type-safe variant props
- Consistent styling across app
- Easy to add new variants
- Tree-shaking friendly

---

### Module 3: Constraint-Based Styling

**The Rules:**

1. **NO Arbitrary Values**
   ```tsx
   // FORBIDDEN
   <div className="w-[37px] h-[200px] text-[14px]">
   
   // CORRECT: Use design system
   <div className="w-9 h-48 text-sm">
   ```

2. **NO Inline Styles**
   ```tsx
   // FORBIDDEN
   <div style={{ width: '37px', height: '200px' }}>
   
   // CORRECT: Tailwind classes only
   <div className="w-9 h-48">
   ```

3. **NO Global CSS**
   ```tsx
   // globals.css - ONLY Tailwind directives
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   
   // NO custom CSS here
   ```

4. **NO Raw Primitives**
   ```tsx
   // FORBIDDEN
   <div className="text-brand-900 bg-brand-100">
   
   // CORRECT: Use semantic aliases
   <div className="type-body bg-surface-secondary">
   ```

**Why Constraints Matter:**
- Prevents style drift
- Maintains design consistency
- Enables safe AI-generated changes
- Easier to audit and modify

---

### Module 4: Responsive Design

**Mobile-First Approach:**
```tsx
// Default = mobile
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px

// Example: Stack on mobile, row on desktop
<div className="flex flex-col md:flex-row gap-4">
  <div className="w-full md:w-1/3">Sidebar</div>
  <div className="w-full md:w-2/3">Content</div>
</div>
```

**Container Queries (Modern):**
```tsx
// Use when component needs to respond to its own size, not viewport
<div className="@container">
  <div className="@md:grid-cols-2 @lg:grid-cols-3">
    {/* Responsive to container, not viewport */}
  </div>
</div>
```

---

## Layer 2: Integration Examination

### Integration Challenge 1: Design System Component

**Scenario:** Build a Product Card component following SangLogium constraints

**Requirements:**
1. Use ONLY Tailwind classes from config
2. NO arbitrary values
3. Use CVA for variants (compact, default, featured)
4. Use typography aliases for all text
5. Handle responsive layout
6. Include hover/focus states

**Design Spec:**
- Image: aspect-square, object-cover
- Title: type-section-hed
- Price: type-body with font-semibold
- Button: btn-primary (or btn-cart for compact)
- Card: rounded-lg, shadow-sm, hover:shadow-md

**Verification:**
- [ ] No arbitrary values in final code
- [ ] All text uses typography aliases
- [ ] CVA variants work correctly
- [ ] Responsive at all breakpoints
- [ ] Hover/focus states implemented

---

### Integration Challenge 2: Theme Extension

**Scenario:** Add a new "sale" color to the design system

**Requirements:**
1. Define color scale (50-950) for sale theme
2. Add semantic alias `text-sale` and `bg-sale`
3. Update button variants to include sale style
4. Ensure contrast ratios meet WCAG AA
5. Document usage guidelines

**Test:**
- Create a Sale Banner component using new tokens
- Verify no arbitrary values used
- Check accessibility with contrast checker

**Success Criteria:**
- [ ] Color scale defined in config
- [ ] Semantic aliases working
- [ ] Button variant implemented
- [ ] Component uses only new tokens
- [ ] Contrast ratios pass WCAG AA

---

## Layer 3: Systems Examination

### Systems Challenge: Multi-Theme Architecture

**Scenario:** SangLogium needs dark mode + high contrast mode

**Options:**

**Option 1: CSS Custom Properties**
```css
:root {
  --color-bg: #ffffff;
  --color-text: #0a0a0a;
}

[data-theme="dark"] {
  --color-bg: #0a0a0a;
  --color-text: #ffffff;
}
```
- Pros: Native, performant
- Cons: Requires CSS variables (breaks pure Tailwind constraint)

**Option 2: Tailwind Dark Mode**
```typescript
// tailwind.config.ts
darkMode: 'class', // or 'media'

// Usage
<div className="bg-white dark:bg-neutral-900">
```
- Pros: Tailwind-native
- Cons: Double classes everywhere

**Option 3: Duplicate Config**
```typescript
// Separate configs for each theme
// Build generates separate CSS files
```
- Pros: Clean separation
- Cons: Build complexity

**Design Your Solution:**
1. Choose approach with justification
2. Define theme switching mechanism
3. Address constraint compatibility
4. Plan migration strategy
5. Document theme extension process

---

## Stress Test Scenarios

### Scenario 1: Constraint Violation Detection

**Given:**
```tsx
// Developer submits this code
function ProductCard({ product }) {
  return (
    <div className="w-[300px] h-[400px] p-[20px]">
      <h2 className="text-[24px] font-bold">{product.name}</h2>
    </div>
  );
}
```

**Task:**
1. Identify all constraint violations
2. Rewrite using design system
3. Add ESLint rule to prevent future violations

**Fix:**
```tsx
// CORRECT
function ProductCard({ product }) {
  return (
    <div className="w-72 h-96 p-5">
      <h2 className="type-section-hed">{product.name}</h2>
    </div>
  );
}
```

---

### Scenario 2: Design System Drift

**Problem:** Over 6 months, components have accumulated:
- 47 arbitrary values
- 12 inline styles
- 3 new color not in config
- 5 font sizes not in typography

**Task:**
1. Audit current codebase
2. Categorize violations by component
3. Create migration plan
4. Implement linting to prevent future drift
5. Document approved exceptions (if any)

---

## Quick Reference: Design System Cheat Sheet

| Element | Token/Alias | Never Use |
|---------|-------------|-----------|
| Hero text | `type-hero-headline` | `text-5xl font-bold` |
| Section heading | `type-section-hed` | `text-2xl font-semibold` |
| Body text | `type-body` | `text-base leading-relaxed` |
| Primary button | `btn-primary` | `bg-blue-600 text-white` |
| Brand color | `brand-500` | `#f0e6d8` |
| Spacing | `p-4`, `m-2` | `p-[16px]`, `margin: 8px` |

---

## Completion Checklist

- [ ] Can explain why arbitrary values are forbidden
- [ ] Can create new design tokens in config
- [ ] Can implement CVA variants
- [ ] Can identify and fix constraint violations
- [ ] Can use typography and color aliases
- [ ] Can handle responsive design with Tailwind
- [ ] Can extend design system safely

---

*Next: Theme 09 — Testing Architecture*
