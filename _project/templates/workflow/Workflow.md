1. # Q's -> PRD
**User Story:** As a [User Type], I want to [Action] so that [Goal].

2. # Q's -> Visual contract - pseudo html
As a user, I see...and know to do...in order to...

3. # Q's -> Technical solution design 
Directed Acyclic Graph (DAG)

### who
Context & Architecture Map: Defines the physical actors (Client, DB, 3rd Party APIs).

### what 
Data Contracts (Shapes): Defines the exact nouns (TypeScript interfaces) that those actors will pass around. (Depends on 1)

### how 
System Behaviors (Mutations & Network): Defines the verbs. How the actors manipulate the nouns during the "happy path." (Depends on 2)

### how vs edge
Edge Cases & Fault Tolerance: Defines what happens when the verbs fail. (Depends on 3)

### how vs speed, security
Constraints (NFRs): Defines the absolute physical limits (speed, security) of the entire system. (Applies to 1-4)

4. # Execution specs
Pure describe, it blocks tests; data layer - unit tests; view layer - integration tests; e2e - happy path.

5. # Select vertical slice (tracer) to build, foundation up, most foundational first -> build slice using RGR (6.) -> repeat until feature done 

6. # 6. Writing failing test → verify test fails → write minimal code → verify test passes → refactor → next test
Turning execution specs to code reality

After: manual verification of the whole. Cross-browser tests. Cross-OS tests. Cross-device tests. Simple, robust, targeting > 80% users. 

