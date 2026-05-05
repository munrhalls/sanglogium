---
description: Extract selective context from documentation chain for integration test development
---

# /context - Selective Context Injection

**Purpose:** Extract only relevant context from documentation chain (PRD → design → test plan) for test development, preventing context overflow.

**Input:** 
- `--type`: Test type (unit/integration/e2e)
- `--focus`: Component or feature name (e.g., BasketControls)
- `--path`: Feature documentation path (e.g., docs/basket/non-local-basket)

**Output:** Relevant context sections (<2000 tokens) for system-first test development.

---

## Execution Steps

### Step 1: Validate Input
Ask for missing parameters if not provided:
- If `--path` missing: "What is the feature documentation path? (e.g., docs/basket/non-local-basket)"
- If `--type` missing: "What is the test type? (unit/integration/e2e)"
- If `--focus` missing: "What is the component or feature name? (e.g., BasketControls)"

### Step 2: Map Test Type to Required Documents
Use this mapping:

**Unit tests:**
- Technical Solution Design.md (types, validation, implementation)

**Integration tests:**
- HTML Structure.md (rendering contexts)
- PRD.md (relevant DoDs based on focus)
- Technical Solution Design.md (component props interface)

**E2E tests:**
- PRD.md (happy path DoDs)
- Vertical Slice Plan.md (test order)

### Step 3: Extract Relevant Sections
For each mapped document, extract only relevant sections using read_file and grep:

**Error Handling:** If document not found, skip and note in output. If section not found, skip and note in output.

**From HTML Structure.md:**
- Use Grep with pattern matching `--focus` (case-insensitive, partial match allowed)
- Extract from matching line until next `#` header or separator div
- Include all "When [condition]" blocks under matching section
- If no match, extract entire file (it's concise)

**From PRD.md:**
- Use Grep to find all `### [ ] DoD [N]:` lines
- Read each DoD section (from DoD line to next DoD or end of file)
- Filter DoDs based on `--focus`:
  - If `--focus` contains "Basket" or "Control": Keep DoD [1], [2], [3], [4]
  - If `--focus` contains "Button": Keep DoD [7]
  - If `--focus` contains "Sync" or "Tab": Keep DoD [6]
  - If `--focus` contains "Refresh": Keep DoD [5]
  - Otherwise: Keep all DoDs
- If DoD numbering differs, match by keyword (add, increment, decrement, remove, sync, refresh, navigation)

**From Technical Solution Design.md:**
- Use Grep to find `## Types` section (partial match allowed: "type" in header)
- Extract from matching line to next `##` header
- If unit test: Also extract `## Implementation` section (partial match: "implementation")
- Use Grep to find `## Validation` section (partial match: "validation")
- If sections not found, extract interface definitions using Grep for "interface"

**From Vertical Slice Plan.md:**
- Extract entire file (it's already concise)
- If `--focus` specified, use Grep to find and highlight relevant slice

### Step 4: Assemble Context
Format output as:
```markdown
# Context for [type] test: [focus]

## From [Document Name]
[Extracted sections]

## From [Document Name]
[Extracted sections]
```

### Step 5: Output Context
Return assembled context. Ensure total size <2000 tokens. If larger, truncate less critical sections.

---

## Example Usage

**Command:** `/context --type=integration --focus=BasketControls --path=docs/basket/non-local-basket`

**Output:**
```markdown
# Context for integration test: BasketControls

## From HTML Structure.md
# Basket Controls on any products page
## When viewing any products page and given product is not in basket
<button element="add-to-basket">Add</button>

## When viewing any products page, a given product is in basket
<button element="decrement">-</button>
<span element="quantity">1</span>
<button element="increment">+</button>

## From PRD.md
### DoD [1]: When I add a product, I want it in my basket
- When I go to any product page, I see add to basket button
- I click add button
- Product appears in basket with quantity 1
- Header badge (basket button) count increments

### DoD [2]: When I increment quantity, I want count updated up to available stock
- When I go to any product page with item in basket, I see increment button
- I click increment button
- Item quantity increases by 1
- Header badge count updates by 1 increment

### DoD [3]: When I decrement quantity, I want count updated
- When I go to any product page with item in basket, I see decrement button
- I click decrement button
- Item quantity decreases by 1
- Header badge count updates by 1 decrement

### DoD [4]: When I decrement to zero, I want item removed
- When I go to any product page with item quantity 1, I see decrement button
- I click decrement button
- Item removes from basket
- Header badge count updates

## From Technical Solution Design.md
### Types
interface BasketControlsProps {
  productId: string
  displayPriceAtAdd: number
  availableStockAtAdd: number
  isBasketPage: boolean // Determines remove button presence and decrement behavior
}
```

---

## Constraints

- NO loading entire documents - extract only relevant sections
- NO caching in V1 - keep it minimal
- NO external dependencies - use only file reading
- NO complex parsing - use simple grep/line extraction
- Output MUST be <2000 tokens
- If output exceeds limit, truncate less critical sections

---

**Last Updated:** 2026-05-04
