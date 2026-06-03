Adhere with strict discipline: keep everything robust, coherent, simplest possible, professional. If anything complicates or is vague, please stop immediately and ask for clarification.

Goal: capture test specifications in pure English for specific slice
Criteria: 0 unnecessary verbiage, 0 unnecessary characters

Execution specs: pure english describe, it blocks. No code, no actual tests. Pure english.

Gather intelligence and make simple professional plan to write execution specs:
- Gather relevant intelligence in professional manner to know what professional, robust, simple, well-checked tests should look like.
- Plan writing tests. Make simplest possible, professional, robust plan.
- Scan the plan for gaps, red flags, omissions, incompleteness, bloat, false assumptions, false positives, end to end. 
- Keep scanning, finding, and fixing  gaps, red flags, omissions, false assumptions, false positives, end to end, until the solution is professionally robust, simplest possible, reliable.   
- Begin executing the plan to write minimal, simple, robust, professional tests, using the phases and naming convention delineated below 

# Execution Specs: [Slice Name]

## Selected Slice
- Slice: [Slice number and name]
- Reason: [Why this slice first, max few words]

## Unit Tests (Data Layer)

describe('[Component/Function]')
  // ARRANGE - setup test state, initialize objects, configure dependencies
  // ACT - execute the function/method being tested
  // ASSERT - verify expected outcome
  it('when [condition], should [expected behavior]')
  
  // ARRANGE - setup test state, initialize objects, configure dependencies
  // ACT - execute the function/method being tested
  // ASSERT - verify expected outcome
  it('when [condition], should [expected behavior]')

## Integration Tests (View Layer)

describe('[Page/Component]')
  // ARRANGE - setup test state, render component, configure dependencies
  // ACT - trigger user interaction or event
  // ASSERT - verify expected state or dispatch
  it('when [state], should render [element]')
  
  // ARRANGE - setup test state, render component, configure dependencies
  // ACT - trigger user interaction
  // ASSERT - verify action dispatched
  it('when user [interaction], should dispatch [action]')
  
  // ARRANGE - setup test state, render component, configure dependencies
  // ACT - trigger interaction
  // ASSERT - verify function called with parameters
  it('when [interaction], should call [function] with [parameters]')

## E2E Tests

describe('[User Flow]')
  // ARRANGE - setup test environment, navigate to starting state
  // ACT - perform user actions
  // ASSERT - verify expected outcome
  it('when [user actions], should complete [happy path]')
  
  // ARRANGE - setup test environment, navigate to starting state
  // ACT - perform user actions
  // ASSERT - verify error handling
  it('when [condition], should handle [edge case]')
  
  // ARRANGE - setup test environment, navigate to starting state
  // ACT - perform user actions
  // ASSERT - verify constraint respected
  it('when [condition], should respect [constraint]')

## ...
