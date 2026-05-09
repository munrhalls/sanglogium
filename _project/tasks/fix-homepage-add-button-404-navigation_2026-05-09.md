# Task: Fix Homepage Add Button 404 Navigation Bug

> **Generated:** 2026-05-09
> **Problem:** Clicking add button on home page causes 404 navigation instead of adding to basket
> **Priority:** High

## Test Requirement
- **Include Tests:** false

## Problem Statement
- **Observable Behavior:** Clicking the "Add" button on homepage product cards causes navigation to a 404 not found page instead of adding the product to the basket
- **Location:** Homepage product card components (AccessoryCard, DacCard, IemCard, FeaturedCard)
- **Impact:** Critical - core functionality broken, users cannot add items to basket from homepage, affects conversion
- **Reproduction:** 
  1. Navigate to home page
  2. Click "Add" button on any product card (Accessories, DACs, IEMs Gallery, or Featured sections)
  3. Observe navigation to 404 page instead of basket update

## System Context
- **Affected Components:**
  - `app/components/features/homepage/accessories/AccessoryCard.tsx`
  - `app/components/features/homepage/dacs/DacCard.tsx`
  - `app/components/features/homepage/iems-gallery/IemCard.tsx`
  - `app/components/features/homepage/featured/Featured.tsx` (FeaturedCard component)
  - `app/components/features/basket/BasketControls.tsx` (button component itself)
  - `store/basketStore.ts` (state management)

- **State Management:** Zustand store with persistence middleware
  - `useBasketStore` provides `addProduct`, `incrementQuantity`, `decrementQuantity`, `removeProduct` actions
  - BasketControls component uses these actions via `useShallow` selector

- **Related Patterns:**
  - `app/components/features/products/ProductCard.tsx` - CORRECT pattern: Link wraps image/details, BasketControls is OUTSIDE the Link
  - Affected components INCORRECTLY wrap entire card (including BasketControls) inside `<a>` tag

- **Dependencies:**
  - Next.js Link component for navigation
  - Zustand for state management
  - No external services involved (client-side only)

## Root Cause Analysis

### Hypothesis 1: BasketControls nested inside anchor tags (PRIMARY HYPOTHESIS)
**Description:** BasketControls buttons are nested inside `<a>` tags in homepage card components. When user clicks the "Add" button, the anchor tag's navigation triggers instead of the button's onClick handler.

**Evidence needed:**
- Check if BasketControls is inside `<a>` tag in affected components
- Compare with ProductCard which correctly separates Link from BasketControls
- Verify href pattern: `/products/${slug}` vs `/product/${slug}` (plural vs singular)

**Confirmation evidence found:**
- AccessoryCard.tsx line 12: `<a href={`/products/${item.slug}`} className="block group">` wraps entire article including BasketControls (lines 43-51)
- DacCard.tsx line 15: `<a href={`/products/${item.slug}`} className="block group">` wraps entire article including BasketControls (lines 39-47)
- IemCard.tsx line 12: `<a href={`/products/${product.slug}`} className="block group">` wraps entire article including BasketControls (lines 36-44)
- Featured.tsx line 38: `<a href={`/products/${product.slug}`} className="block group">` wraps entire article including BasketControls (lines 61-69)
- ProductCard.tsx CORRECT pattern: Link wraps only image/details (lines 36-55), BasketControls is OUTSIDE Link (lines 57-68)

### Hypothesis 2: Incorrect route pattern (SECONDARY ISSUE)
**Description:** The href uses `/products/${slug}` (plural) but the actual route might be `/product/${slug}` (singular), causing 404.

**Evidence needed:**
- Check actual Next.js route structure
- Verify correct route pattern from working components

**Evidence found:**
- ProductCard.tsx uses `<Link href={`/product/${product.slug.current}`}>` (singular)
- AutocompleteItem.tsx uses `href={`/product/${product.slug.current}`}` (singular)
- Affected components use `/products/${slug}` (plural) - this is likely wrong

### Hypothesis 3: Button type or event handler issue (UNLIKELY)
**Description:** BasketControls button might have wrong type attribute or missing event.preventDefault.

**Evidence needed:**
- Check BasketControls button type attribute
- Check onClick handler implementation

**Evidence found:**
- BasketControls.tsx line 70: `type="button"` is correctly set
- onClick handler is properly implemented (lines 41-43)

**Conclusion:** Hypothesis 1 is confirmed as root cause. Hypothesis 2 is a secondary issue that should also be fixed.

## Best Practices Research

- **Framework Conventions:**
  - React: Do not nest interactive elements (buttons inside anchors) - violates HTML spec
  - Next.js: Use Link component for internal navigation, not <a> tags
  - React: onClick handlers on buttons should not be intercepted by parent anchors

- **Accessibility (WCAG):**
  - Nested interactive elements create accessibility nightmares for screen readers
  - Users with assistive technology cannot distinguish between button and link actions
  - Violates WCAG 2.1 Success Criterion 2.4.3 (Focus Order) and 3.2.1 (On Focus)

- **Performance:**
  - No performance impact - this is a DOM structure issue
  - Using Next.js Link instead of <a> enables prefetching and client-side navigation

- **Security:**
  - No security implications - this is a UX bug, not a vulnerability

- **Common Patterns:**
  - Product cards should have separate clickable areas: product image/details for navigation, add button for basket action
  - Use CSS positioning or flex/grid layout to visually group elements without nesting them
  - Reference: ProductCard.tsx demonstrates the correct pattern

## Project Convention Alignment

- **Code Style:**
  - Follow Prettier configuration: double quotes, semicolons, 2-space indentation
  - Follow ESLint rules: no restricted imports, use Vitest matchers
  - Maintain existing component structure and styling patterns

- **Architecture Fit:**
  - Keep BasketControls as separate client component
  - Use Next.js Link component for navigation (not <a> tags)
  - Maintain Zustand store integration pattern

- **Documentation Updates:**
  - No documentation updates required for this fix
  - Consider adding component pattern documentation if this issue recurs

## Solution Design

- **Approach:** 
  1. Move BasketControls outside the anchor/Link wrapper in all affected card components
  2. Change `<a>` tags to Next.js `<Link>` components for internal navigation
  3. Fix route pattern from `/products/${slug}` to `/product/${slug}` (singular)
  4. Follow the ProductCard.tsx pattern as the reference implementation

- **Code Changes:**
  - `app/components/features/homepage/accessories/AccessoryCard.tsx`: Move BasketControls outside <a> tag, change to Link, fix route pattern
  - `app/components/features/homepage/dacs/DacCard.tsx`: Move BasketControls outside <a> tag, change to Link, fix route pattern
  - `app/components/features/homepage/iems-gallery/IemCard.tsx`: Move BasketControls outside <a> tag, change to Link, fix route pattern
  - `app/components/features/homepage/featured/Featured.tsx`: Move BasketControls outside <a> tag, change to Link, fix route pattern

- **Verification:**
  - Manual: Navigate to home page, click add buttons on various product cards, verify basket updates without navigation
  - Manual: Click product image/details, verify navigation to product detail page works
  - Type-check: `npx tsc --noEmit`
  - Lint: `npx eslint app/components/features/homepage/accessories/AccessoryCard.tsx` (and other affected files)

- **Rollback:**
  - Git revert if the fix introduces layout issues
  - The change is structural and should not affect data flow

## Deliverables
1. Root cause diagnosis with evidence (nested BasketControls inside anchor tags)
2. Solution implementation (move BasketControls outside Link, use Next.js Link component, fix route pattern)
3. Verification confirmation (manual testing of add buttons and navigation)
4. No test coverage required (user did not explicitly request tests)

## Constraints & Guidelines
- Maintain accessibility standards (no nested interactive elements)
- Ensure consistency with existing patterns (follow ProductCard.tsx pattern)
- Use Next.js Link component for internal navigation
- Fix route pattern to match actual route structure
- No test coverage required (user did not explicitly request tests)

## Success Criteria
- Clicking "Add" button on homepage product cards adds item to basket without navigation
- Clicking product image/details navigates to product detail page correctly
- No 404 errors when interacting with homepage product cards
- Layout and styling remain consistent with existing design
- Accessibility improves (no nested interactive elements)

## Execution Commands
```bash
# Type-check
npx tsc --noEmit

# Lint affected files
npx eslint app/components/features/homepage/accessories/AccessoryCard.tsx
npx eslint app/components/features/homepage/dacs/DacCard.tsx
npx eslint app/components/features/homepage/iems-gallery/IemCard.tsx
npx eslint app/components/features/homepage/featured/Featured.tsx

# Format code
npx prettier --write app/components/features/homepage/accessories/AccessoryCard.tsx
npx prettier --write app/components/features/homepage/dacs/DacCard.tsx
npx prettier --write app/components/features/homepage/iems-gallery/IemCard.tsx
npx prettier --write app/components/features/homepage/featured/Featured.tsx
```
