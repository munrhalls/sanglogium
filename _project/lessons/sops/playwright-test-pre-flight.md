# SOP: Playwright Test Pre-Flight Verification

**Date:** 2026-04-02
**Source:** Filter test implementation waste
**Severity:** High
**Frequency:** Systemic

## The Problem
Writing Playwright tests without clearly defining states and elements leads to wasted time debugging wrong assumptions

## Root Cause
Vague test planning without specific state definitions and element verification

## The Fix - MANDATORY 4-STEP VERIFICATION

### Step 1: Define BEFORE-STATE (Must be specific)
```markdown
BEFORE-STATE:
- URL: http://localhost:3000/products/headphones/open-back
- Product count: 6 products visible
- First product: "Sennheiser HD 560S"
- URL parameters: none
- Filter state: no filters active
```

### Step 2: Define TARGET ELEMENT (Must be specific)
```markdown
TARGET ELEMENT:
- Element: Brand checkbox for "Audeze"
- Selector: `input[name="brand"][value="Audeze"]` OR its label
- Location: Inside `[data-testid="filter-sidebar"]` fieldset
- Visibility: Visible and clickable
- Interaction: Click label (not checkbox directly)
```

### Step 3: Define USER ACTION (Must be specific)
```markdown
USER ACTION:
- Action: Click on "Audeze" brand label
- Method: `page.locator('label').first().click()`
- Expected immediate result: Checkbox becomes checked
- Expected URL change: `?f=brand:Audeze` appended
```

### Step 4: Define AFTER-STATE (Must be specific)
```markdown
AFTER-STATE:
- Product count: Should change from 6 to filtered count
- First product: Should be an Audeze product
- URL: Should contain `f=brand:Audeze`
- Filter indicator: Active filter should show "Audeze"
```

## Verification Commands (Execute BEFORE writing test)

### 1. Verify BEFORE-STATE
```bash
# In browser console:
location.href                    # Check URL
document.querySelectorAll('article').length  # Count products
document.querySelector('article').textContent  # Check first product
```

### 2. Verify TARGET ELEMENT
```bash
# In browser dev tools:
# 1. Find element
# 2. Right-click → Copy selector
# 3. Verify it's the right element
document.querySelector('input[name="brand"][value="Audeze"]')
# 4. Check if clickable
```

### 3. Verify USER ACTION
```bash
# Manually in browser:
# 1. Click the element
# 2. Observe checkbox state
# 3. Check URL update
# 4. Note what changes
```

### 4. Verify AFTER-STATE
```bash
# After manual action:
document.querySelectorAll('article').length  # New count
document.querySelector('article').textContent  # New first product
location.href                    # New URL
```

## Test Template (Only after verification)

```typescript
test('specific test name', async ({ page }) => {
  // 1. Establish BEFORE-STATE
  await page.goto('http://localhost:3000/products/headphones/open-back');
  const products = page.locator('article');
  const initialCount = await products.count();
  const initialProduct = await products.first().textContent();

  // 2. Execute USER ACTION on TARGET ELEMENT
  const brandLabel = page.locator('[data-testid="filter-sidebar"] label').first();
  await brandLabel.click();

  // 3. Verify AFTER-STATE
  const newCount = await products.count();
  const newProduct = await products.first().textContent();

  expect(page.url()).toContain('f=brand:');
  expect(newCount).not.toBe(initialCount);  // Should change
  expect(newProduct).not.toBe(initialProduct);  // Should change
});
```

## CRITICAL REQUIREMENTS

### NO VAGUE DEFINITIONS
❌ "Check products change"
✅ "Product count should change from 6 to filtered count"

### NO ASSUMED SELECTORS
❌ "Click the filter"
✅ "Click `page.locator('[data-testid="filter-sidebar"] label').first()`"

### NO UNCLEAR EXPECTATIONS
❌ "Filter should work"
✅ "URL should contain `f=brand:Audeze` and products should be Audeze brand"

## Prevention Checklist
Before writing ANY Playwright test:

- [ ] **BEFORE-STATE defined**: Exact URL, counts, content
- [ ] **TARGET ELEMENT defined**: Exact selector, location, interaction
- [ ] **USER ACTION defined**: Exact method, immediate result
- [ ] **AFTER-STATE defined**: Exact expected changes
- [ ] **All 4 verified manually**: Browser testing complete
- [ ] **Test uses exact definitions**: No vague language

## Applicability
**When to apply:**
- Writing any Playwright test
- Debugging failing tests
- Test planning phase

**Keywords:** ["playwright", "testing", "pre-flight", "verification", "state-definition", "specificity"]
