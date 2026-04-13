# Test Development SOP

**Date:** 2026-04-13
**Source:** Test organization best practices
**Severity:** High
**Frequency:** Universal (all test development)

## Standard Operating Procedure for Test Development

### Phase 1: Test Planning (Before Writing)

1. **Identify Test Type**
   - Unit test: Pure logic, no side effects
   - Integration test: Real flow, actual dependencies
   - E2E test: Full user journey

2. **Define Scope**
   - Unit: Single function/class
   - Integration: 1 action -> 2 subsequent steps maximum
   - E2E: Complete user workflow

3. **Choose Organization Strategy**
   - Single concern = single file
   - Multiple concerns = split thematically
   - > 15 tests or > 200 lines = split immediately

### Phase 2: File Organization

1. **Directory Structure**
   ```
   tests/
   feature/
     unit/
       {theme}.test.ts
     integration/
       {user-flow}/
         {theme}.test.ts
   ```

2. **File Naming Convention**
   - Unit: `{function-or-concept}.test.ts`
   - Integration: `{theme}.test.ts` inside flow directory
   - Examples: `fingerprint.test.ts`, `request-formation.test.ts`

3. **Thematic Boundaries**
   - Request formation (button click, API structure)
   - Queue operations (Redis addition, success scenarios)
   - Error handling (failure scenarios, edge cases)
   - Validation (input validation, type checking)

### Phase 3: Test Implementation

1. **Unit Test Rules**
   - Zero side effects
   - No mocking of function being tested
   - Deterministic input/output
   - Fast execution (< 10ms per test)

2. **Integration Test Rules**
   - Real dependencies only
   - No mocking core functionality
   - Small scope: 1 action -> 2 steps
   - Actual user flow verification

3. **Test Structure**
   ```typescript
   describe('{Theme}', () => {
     describe('{Specific Concern}', () => {
       it('should {expected behavior}', () => {
         // Test implementation
       })
     })
   })
   ```

### Phase 4: Review and Refactor

1. **File Size Check**
   - [ ] < 15 tests per file
   - [ ] < 200 lines per file
   - [ ] Single theme per file

2. **Scope Verification**
   - [ ] Unit tests have zero side effects
   - [ ] Integration tests use real dependencies
   - [ ] Test scope matches intended level

3. **Organization Validation**
   - [ ] Clear thematic boundaries
   - [ ] Logical execution flow
   - [ ] Descriptive file names

## Quality Gates

### Before Test Implementation
- [ ] Test type identified (unit/integration)
- [ ] Scope clearly defined
- [ ] Organization strategy chosen

### During Test Implementation  
- [ ] Following test structure conventions
- [ ] Using real dependencies (integration)
- [ ] Maintaining single concern per file

### After Test Implementation
- [ ] All tests passing
- [ ] File size within limits
- [ ] Thematic organization clear
- [ ] Documentation comments present

## Common Anti-Patterns to Avoid

1. **Monolithic Files**
   - Don't: Put everything in one test file
   - Do: Split at 15 tests or 200 lines

2. **Mixed Concerns**
   - Don't: Unit and integration tests in same file
   - Do: Separate by test type and theme

3. **Over-Scoped Integration Tests**
   - Don't: Test entire user journey in one test
   - Do: Scope to 1 action -> 2 steps

4. **Poor Organization**
   - Don't: Generic file names like `test.ts`
   - Do: Descriptive names like `request-formation.test.ts`

## Keywords for Retrieval
["test-development", "test-organization", "unit-testing", "integration-testing", "test-sop", "file-structure"]
