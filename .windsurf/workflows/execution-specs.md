Goal: capture test specifications in pure English for specific slice
Criteria: 0 unnecessary verbiage, 0 unnecessary characters

# Execution Specs: [Slice Name]

## Selected Slice
- Slice: [Slice number and name]
- Reason: [Why this slice first, max few words]

## Unit Tests (Data Layer)

describe('[Component/Function]')
  it('when [condition], should [expected behavior]')
  it('when [condition], should [expected behavior]')

## Integration Tests (View Layer)

describe('[Page/Component]')
  it('when [state], should render [element]')
  it('when user [interaction], should dispatch [action]')
  it('when [interaction], should call [function] with [parameters]')

## E2E Tests

describe('[User Flow]')
  it('when [user actions], should complete [happy path]')
  it('when [condition], should handle [edge case]')
  it('when [condition], should respect [constraint]')

## ...
