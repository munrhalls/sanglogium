Adhere with strict discipline: keep everything robust, coherent, simplest possible. If anything complicates or is vague, please stop immediately and ask for clarification.

Template: Vertical Slice Plan
Goal: make conscious choice on what the vertical slices should be for the feature
Criteria: 0 unnecessary verbiage, 0 unnecessary characters

**IMPORTANT: Structure slices foundation-up (data layer → component layer → page integration) to enable proper layer separation for execution specs. Unit tests test data layer, integration tests test components (trust unit tests), E2E tests test user flows. Each slice should be end-to-end testable with clear layer boundaries.**

# Vertical Slice Plan: [Feature Name]

## Slice 1: [Name]
- User value: [what user can do, what problems are solved]
- Scope: [components included]
- Done when: [end-to-end testable]

## Slice 2: [Name]
- User value: [what user can do, what problems are solved]
- Scope: [components included]
- Done when: [end-to-end testable]

## Slice 3: [Name]
- User value: [what user can do, what problems are solved]
- Scope: [components included]
- Done when: [end-to-end testable]

## ...

