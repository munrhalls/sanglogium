The following fatal flaws were present in these specifications and sprint. The sprint was implemented in full and it's a failure because it is over-complicated, had huge windows of lack of human verification, end human verification was complex to implement and had fatal architecture windows of vagueness (e.g. no contracts, unpsecified - state machine - status update - run function calls and ui update -> events -> state machine)

* it seems to not start from delineating clear end-user interaction (ux) flows (what should happen based on what user action)

* it doesn't start from end-state simple overview that starts from the above (ux flows target state)

* it seems to not have clear code architecture and per flow architecture to ensure no overcomplications at either overall level or per flow level

* it has a fundamental vagueness in terms of architecture of code flows

   * lack of clear stating that the state machine should be modified by an event -> change status -> only then run function calls (i.e. server actions or other server-work or side-effect work) AND ui change that fit the status and must BOTH be in sync with the status -> those function calls should provide a result that resolves to a new event with proper payload -> which updates the state machine

   * state machine itself suffers from vagueness - where is event contract? where is event to status update processing contract? where is prevention of bad/unaligned/out of sync status update contract? where is human verification per each of those contract (simple)? where is tests contract?

   * where is AS-SIMPLE-AS-POSSIBLE contract that keeps it as a whole - and each part - from over-complicating?

* it seems to not have clear manual verification of overview and per flow

* it has no guardrails vs bloat, vs unnecessary, vs missing, vs lack of human verification, vs unnecessary tests

* it seems to split unit tests and integration tests into separate phases. that leads to huge gaps and iteration blindness.

* unit / integration / e2e should be on per scope basis and should precede code implementation - and should not be cargo cult based, but direct relevance and nothing-unnecessary based, there should be no test if test is not needed; tests should be such that they never exceed the human capacity to read and verify the tests efficiently and effectively

* it is vague in terms of workflow, which leaves gaps for human feedback and verification, causing huge windows of workflow blindness



Please process all of the above points carefully and output your plan to making the sprint in plain english only. Don't make the specifications file or the sprint yet. Don't do anything other than your plan.
