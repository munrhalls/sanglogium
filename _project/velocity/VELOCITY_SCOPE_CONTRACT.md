

Velocity Scope Contract: [Component Name]
Sprint: [Sprint Name] | Pass: [1 | 2 | 3] | Estimated Difficulty: [Fibonacci]

1. The Fenced Territory (IN SCOPE)
Primary Objective: [Single sentence: e.g., "Render a functioning product grid with real data."]

DoD Checklist:

[ ] Item 1: [Binary state, e.g., Component renders without crashing]

[ ] Item 2: [Binary state, e.g., Image, Title, and Price are visible]

[ ] Item 3: [Binary state, e.g., Click navigates to /product/[slug]]

2. The Forbidden Territory (OUT OF SCOPE)
If it's here, do NOT code it. Add to backlog immediately.

No Refactoring: Do not touch [Shared Component] or [Global Config].

No Edge Cases: Ignore [Missing Images / Long Titles / Zero State].

No Interaction: (If Pass 1/2) No hovers, transitions, or animations.

No Mobile: (If Desktop Phase) Do not add responsive utility classes.

3. Integration & Mocks
Data Source: [Sanity / Mock / Prop Drilling]

External Dependencies: [None / Existing Hook Only]

4. Lockdown Trigger
Stop Coding When: All checkboxes in Section 1 are checked.

Lock Status: [UNLOCKED / LOCKED]

5. Commit Staging (Strict Non-Mixed)
Commit A (Logic/Config): Difficulty: <X> - A(scope): action — → closes DoD [N]

Commit D (.md/Docs): Difficulty: 1 - D(docs): update sprint documentation — → infrastructure