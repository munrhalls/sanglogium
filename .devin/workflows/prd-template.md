Adhere with strict discipline: keep everything robust, coherent, simplest possible. If anything complicates or is vague, stop immediately.

Template: PRD Template

Goal: capture accurate minimalest requirements for coherent, intuitive, simple user see -> actions -> goal experience
Criteria: 0 unnecessary verbiage, 0 unnecessary characters

# Feature: [Feature Name]

# Perspective: [User perspective description]

## 1. Objective
[What users accomplish]

## 2. Scope Boundaries
In Scope:
- User perspective - what user sees, can do and experiences
- [User-facing feature 1]
- [User-facing feature 2]

Out of Scope:
- Anything outside user perspective - what happens under the hood, how it's implemented, etc.
- [Non-goal 1]
- [Non-goal 2]

## 3. Requirements & Definition of Done (DoD)

**DoD Pattern Rules:**

- **Write as invariant**: "When I [action], [result] must occur" - always true, no exceptions
  - This means the statement must hold true under all circumstances
  - No "unless", "except when", or conditional clauses
  - Binary guarantee: action → result, always
  - Example: "When I add a product, it appears in basket with quantity 1" (not "unless out of stock")

- **No implementation details**: never specify HOW (storage, state manager, sync mechanism, component architecture)
  - Focus on WHAT happens, not HOW it happens
  - No technical mechanisms: localStorage, Zustand, Redux, API calls, database queries, sync
  - No component names: ProductCard, BasketStore, HeaderIndicator
  - No UI element forms: button, option, action, control (these are implementation details that can change)
  - Focus on user capabilities: "I can do X" not "I see X button/option/action"
  - Example: "When I add product, it appears in basket" (not "When I click add, localStorage.setItem is called")
  - Example: "I see whether basket reflects current inventory" (not "I see sync status")
  - Example: "I can proceed" (not "I can retry verification" or "I see retry button")

- **Focus on user value**: describe observable behavior from user's perspective
  - What the user sees and experiences
  - Screen changes, UI updates, navigation
  - Not internal state changes or data transformations

- **Make testable**: clear acceptance criterion that can be verified
  - Observable and measurable
  - Can be verified via automated test or manual QA
  - No ambiguity in success condition

- **Respect scope**: stay within In Scope boundaries, never leak into Out of Scope
  - Cross-reference Scope Boundaries section
  - If it mentions implementation, it's Out of Scope
  - If it's about user experience, it's In Scope

### [ ] DoD [1]: [User goal description]
- [When I do X, I see Y]
- [When I do X, I see Z]

### [ ] DoD [2]: [User goal description]
- [When I do X, I see Y]
