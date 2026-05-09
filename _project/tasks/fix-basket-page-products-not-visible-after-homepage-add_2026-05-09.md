# Task: Fix Basket Page Products Not Visible After Homepage Add

> **Generated:** 2026-05-09
> **Problem:** Products not visible on basket page after adding from home page and navigating to basket
> **Priority:** High

## Test Requirement
- **Include Tests:** false

## Problem Statement
- **Observable Behavior:** After adding a product to the basket from the home page and navigating to the basket page, the products are not visible on the basket page. This happens intermittently, particularly when adding from home page and then navigating to basket page.
- **Location:** Home page product cards (IemCard, DacCard, AccessoryCard, Featured) → basket page
- **Impact:** Production bug - functional failure, users cannot see items they added to basket, affects conversion and user trust
- **Reproduction:**
  1. Navigate to home page
  2. Click "Add" button on any product card (IEMs Gallery, DACs, Accessories, or Featured sections)
  3. Navigate to basket page (via basket button in navbar)
  4. Observe that products may not be visible on basket page (empty basket shown instead)

## System Context
- **Affected Components:**
  - `app/components/features/homepage/iems-gallery/IemCard.tsx` (uses BasketControls)
  - `app/components/features/homepage/dacs/DacCard.tsx` (uses BasketControls)
  - `app/components/features/homepage/accessories/AccessoryCard.tsx` (uses BasketControls)
  - `app/components/features/homepage/featured/Featured.tsx` (uses BasketControls)
  - `app/components/features/basket/BasketControls.tsx` (button component that calls addProduct)
  - `app/components/features/basket/BasketManager.tsx` (basket page component)
  - `store/basketStore.ts` (Zustand store with persist middleware)

- **State Management:**
  - Zustand store with persist middleware (localStorage/sessionStorage fallback)
  - BasketControls uses `addProduct` action from basketStore
  - BasketManager reads items from basketStore
  - BasketManager has `_hasHydrated` flag to prevent hydration errors
  - Cross-tab synchronization via storage event listener

- **Related Patterns:**
  - BasketManager uses SWR to fetch product details from CMS API (`/api/basket/products`)
  - SWR key is static: `['basket-products']` when hydrated (comment: "doesn't include productIds to prevent re-fetch on basket mutations")
  - BasketManager has useEffect that calls `mutate()` when productIds change
  - BasketManager filters cached CMS items to match current basket
  - Basket page uses Suspense with Loader fallback

- **Dependencies:**
  - Next.js for routing and SSR
  - Zustand for state management
  - SWR for data fetching
  - localStorage/sessionStorage for persistence

## Root Cause Analysis

### Hypothesis 1: SWR cache staleness with static key (PRIMARY HYPOTHESIS)
**Description:** The SWR key is static (`['basket-products']`) and doesn't include the actual productIds. When you add a product on the home page and navigate to the basket page, the SWR cache might return stale data from a previous basket state. The useEffect tries to mutate when productIds change, but this might not work correctly if the SWR key is static.

**Evidence needed:**
- Check if SWR cache is properly invalidated when productIds change
- Verify if the useEffect mutation actually triggers a re-fetch
- Check if the static SWR key causes cache collisions between different basket states

**Diagnostic steps:**
1. Add console logging to BasketManager to track SWR cache hits/misses
2. Add console logging to track when mutate() is called
3. Add console logging to track filteredCmsItems vs basket items
4. Test scenario: Add product on home page, navigate to basket, check if productIds are correct and if SWR re-fetches

### Hypothesis 2: Hydration timing issue with Suspense
**Description:** The basket page uses Suspense with a Loader fallback. When navigating from home page to basket page, the BasketManager might render before the basket store has hydrated from localStorage. The `_hasHydrated` flag might be false initially, causing the basket to appear empty even though items are in localStorage.

**Evidence needed:**
- Check if `_hasHydrated` flag is false when basket appears empty
- Verify if hydration completes after initial render
- Check if Suspense boundary is causing premature render

**Diagnostic steps:**
1. Add console logging to track `_hasHydrated` state in BasketManager
2. Add console logging to track when onRehydrateStorage callback fires
3. Test scenario: Add product on home page, navigate to basket, check hydration timing

### Hypothesis 3: Navigation timing before persist write
**Description:** When clicking the basket button to navigate to /basket, the navigation might happen before the persist middleware has finished writing the updated basket state to localStorage. This could cause the basket page to hydrate with stale data.

**Evidence needed:**
- Check if persist middleware write is synchronous or asynchronous
- Verify if navigation happens before localStorage write completes
- Check if there's a delay between addProduct call and localStorage update

**Diagnostic steps:**
1. Add console logging to basketStore addProduct to track when state updates
2. Add console logging to persist middleware to track when localStorage write completes
3. Test scenario: Add product, immediately navigate to basket, check if localStorage has the updated state

### Hypothesis 4: FilteredCmsItems mismatch
**Description:** BasketManager filters `cmsBasketItems` to match current basket. If the SWR fetch returns stale data (e.g., products from a previous basket state), the filter might remove all items, resulting in an empty basket display even though the basket store has items.

**Evidence needed:**
- Check if cmsBasketItems contains the correct productIds
- Verify if the filter logic is working correctly
- Check if SWR is returning stale data

**Diagnostic steps:**
1. Add console logging to track cmsBasketItems contents
2. Add console logging to track filteredCmsItems after filtering
3. Test scenario: Add product on home page, navigate to basket, check if cmsBasketItems contains the added product

## Best Practices Research

- **Framework Conventions:**
  - Zustand persist middleware: Should handle hydration synchronously on client side
  - SWR cache keys: Should include relevant data to prevent cache collisions
  - Next.js Suspense: Should not interfere with client-side state hydration
  - React state updates: Should be batched and predictable

- **Accessibility (WCAG):**
  - No accessibility implications for this bug
  - Basket functionality should work for all users

- **Performance:**
  - SWR caching improves performance by reducing API calls
  - Static SWR key is intentional to prevent re-fetch on basket mutations
  - However, cache staleness can cause incorrect data display

- **Security:**
  - No security implications - this is a client-side state management issue
  - localStorage is not used for sensitive data

- **Common Patterns:**
  - Zustand persist with hydration flag is standard pattern for Next.js SSR
  - SWR with static key and manual mutation is valid pattern for preventing unnecessary re-fetches
  - However, the mutation logic must be robust to handle all state changes
  - Alternative: Include productIds in SWR key to ensure cache is keyed to actual basket state

## Project Convention Alignment

- **Code Style:**
  - Follow Prettier configuration: double quotes, semicolons, 2-space indentation
  - Follow ESLint rules: no restricted imports, use Vitest matchers
  - Maintain existing component structure and styling patterns

- **Architecture Fit:**
  - Keep Zustand store with persist middleware
  - Keep SWR for data fetching
  - Maintain hydration flag pattern
  - Ensure basket state is consistent across navigation

- **Documentation Updates:**
  - Update basket state management documentation if root cause is identified
  - Consider adding debugging guidelines for basket state issues

## Solution Design

**Approach:** First diagnose the root cause through logging and testing, then implement the appropriate fix based on findings.

**Diagnostic Phase:**
1. Add comprehensive logging to BasketManager.tsx:
   - Log `_hasHydrated` state changes
   - Log `basket` items changes
   - Log `productIds` changes
   - Log `swrKey` value
   - Log when `mutate()` is called
   - Log `cmsBasketItems` contents
   - Log `filteredCmsItems` contents

2. Add logging to basketStore.ts:
   - Log when `addProduct` is called
   - Log when persist middleware writes to localStorage
   - Log when onRehydrateStorage callback fires

3. Reproduce the bug with logging enabled:
   - Add product on home page
   - Navigate to basket page
   - Check console logs to identify which hypothesis is correct

**Potential Solutions (based on hypothesis):**

**If Hypothesis 1 (SWR cache staleness):**
- Option A: Include productIds in SWR key to ensure cache is keyed to actual basket state
- Option B: Improve the useEffect mutation logic to force re-fetch when productIds change
- Option C: Clear SWR cache when basket page mounts

**If Hypothesis 2 (Hydration timing):**
- Ensure BasketManager waits for hydration before rendering
- Add loading state that waits for `_hasHydrated` to be true
- Consider removing Suspense wrapper if it interferes with hydration

**If Hypothesis 3 (Navigation timing):**
- Add a small delay or await the persist write before allowing navigation
- Ensure addProduct triggers a synchronous localStorage write
- Consider using a navigation guard to prevent navigation during state updates

**If Hypothesis 4 (FilteredCmsItems mismatch):**
- Improve the filter logic to handle edge cases
- Add fallback to show basket items even if CMS data is missing
- Ensure SWR always fetches fresh data when basket changes

**Code Changes:**
- Diagnostic logging in `app/components/features/basket/BasketManager.tsx`
- Diagnostic logging in `store/basketStore.ts`
- Fix implementation based on diagnostic findings (TBD)

**Verification:**
- Manual: Add product on home page, navigate to basket, verify product is visible
- Manual: Repeat test multiple times to ensure intermittent issue is resolved
- Manual: Check console logs to confirm correct behavior
- Type-check: `npx tsc --noEmit`
- Lint: `npx eslint app/components/features/basket/BasketManager.tsx` (and other modified files)

**Rollback:**
- Remove diagnostic logging after fix is implemented
- Git revert if the fix introduces new issues
- The diagnostic logging is temporary and should not affect production

## Deliverables
1. Root cause diagnosis with evidence (from logging and testing)
2. Solution implementation (based on identified root cause)
3. Verification confirmation (manual testing of add from homepage → navigate to basket)
4. No test coverage required (user did not explicitly request tests)

## Constraints & Guidelines
- Maintain existing architecture (Zustand, SWR, persist middleware)
- Ensure basket state consistency across navigation
- Add diagnostic logging first, implement fix based on findings
- Remove diagnostic logging after fix is complete
- No test coverage required (user did not explicitly request tests)

## Success Criteria
- Adding product on home page and navigating to basket page always shows the product in basket
- Basket page correctly displays all items added from any page
- Intermittent empty basket issue is resolved
- Console logs show correct state transitions during diagnostic phase
- No regression in basket functionality

## Execution Commands
```bash
# Type-check
npx tsc --noEmit

# Lint modified files
npx eslint app/components/features/basket/BasketManager.tsx
npx eslint store/basketStore.ts

# Format code
npx prettier --write app/components/features/basket/BasketManager.tsx
npx prettier --write store/basketStore.ts
```
