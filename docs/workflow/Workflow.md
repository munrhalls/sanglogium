1. # Q's -> PRD
**User Story:** As a [User Type], I want to [Action] so that [Goal].

2. # Q's -> HTML structure
Captures HTML structure and conditional states for implementation.

3. # Q's -> Technical solution design
Directed Acyclic Graph (DAG)

### who
Context & Architecture Map: Defines the physical actors (Client, DB, 3rd Party APIs).

### what
Data Contracts (Shapes): Defines the exact nouns (TypeScript interfaces) that those actors will pass around. (Depends on 1)

### how
System Behaviors (Mutations & Network): Defines the verbs. How the actors manipulate the nouns during the "happy path." (Depends on 2)

### how vs edge cases
Edge Cases & Fault Tolerance: Defines what happens when the verbs fail. (Depends on 3)

### how vs speed, security
Constraints (NFRs): Defines the absolute physical limits (speed, security) of the entire system. (Applies to 1-4)

4. # Q's -> Vertical slice plan
Conscious decision on how to slice the feature vertically for end-to-end implementation.
Each slice must be independently valuable and testable.

5. # Execution specs
Pure describe, it blocks tests.

**Data layer** (e.g. store, etc.) - UNIT TESTS
- Unit only tests data contracts

**View layer** (e.g. a page, a non-local component, etc.) - INTEGRATION TESTS
- Integration tests must trust unit tests and expect data contracts are handled
- Integration tests layer never mixes with unit tests layer
- Integration tests only:
  - State: expected elements rendered
  - User action -> action dispatched or function called with expected input: e.g. click button → action or store function called with expected parameters

**E2E tests:**
- Happy path
- Edge cases path
- Constraint/NFRs cases path


6. # Build slice using RGR
Writing failing test → verify test fails → write minimal code → verify test passes → refactor → next test
Repeat until slice is complete.

7. # Repeat for next slice
Select next vertical slice → repeat step 6 until feature done.

After: manual verification of the whole. Cross-browser tests. Cross-OS tests. Cross-device tests. Simple, robust, targeting > 80% users. 

