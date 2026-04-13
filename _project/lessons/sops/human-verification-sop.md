# Human Verification SOP

**Date:** 2026-04-13
**Source:** Test organization best practices
**Severity:** High
**Frequency:** Universal (all integration testing)

## Standard Operating Procedure for Human Verification

### Phase 1: Structure Setup (Before Writing)

1. **Create Directory Structure**
   ```
   tests/{feature}/integration/{user-flow}/
     {theme}.test.ts              // Automated test
     human-verification/          // Manual verification folder
       {theme}.md                 // Manual verification guide
   ```

2. **Identify Test Themes**
   - Review existing integration test files
   - Extract thematic boundaries
   - Ensure 1:1 mapping between test files and verification files

3. **Define Verification Scope**
   - Match test scope exactly
   - Add IN SCOPE/OUT OF SCOPE sections
   - Limit to single user flow segment

### Phase 2: Content Creation

1. **Bus Stop Identification**
   - List all checkpoints in the flow
   - Limit to scope boundaries
   - Ensure logical progression

2. **Expected Results Documentation**
   - What SHOULD happen at each stop
   - How to verify manually
   - Console logs to add

3. **Verification Script**
   - Complete code snippets for tracing
   - Client-side and server-side logs
   - Error scenario handling

### Phase 3: Organization Guidelines

1. **File Naming Convention**
   - Must match test file name exactly
   - Use .md extension for verification files
   - Keep in human-verification subfolder

2. **Content Structure**
   ```markdown
   # Human Verification: [Theme]
   
   ## Scope
   IN SCOPE: [What this covers]
   OUT OF SCOPE: [What this doesn't cover]
   
   ## Bus Stops
   ### Bus Stop N: [Name]
   **Expected:** [What should happen]
   **Manual Verification:** [How to check]
   **Console Log to Add:** [Code snippet]
   
   ## Verification Script
   [Complete code for tracing]
   
   ## Manual Verification Checklist
   [Step-by-step verification]
   ```

3. **Scope Alignment Rules**
   - Each verification file covers same scope as corresponding test
   - No overlap between verification files
   - Clear boundaries prevent confusion

### Phase 4: Quality Assurance

1. **Verification Completeness**
   - [ ] All bus stops documented
   - [ ] Expected results clear
   - [ ] Console logs provided
   - [ ] Error scenarios covered

2. **Scope Consistency**
   - [ ] Verification scope matches test scope
   - [ ] No cross-theme contamination
   - [ ] IN/OUT OF SCOPE sections present

3. **Usability**
   - [ ] Easy to follow steps
   - [ ] Clear verification instructions
   - [ ] Practical console log examples

## Quality Gates

### Before Writing Verification Guide
- [ ] Integration test exists and is organized thematically
- [ ] Test scope clearly defined
- [ ] Directory structure created

### During Verification Guide Creation
- [ ] Bus stops limited to test scope
- [ ] Each stop has expected results
- [ ] Console logs provided for each stop
- [ ] Error scenarios included where relevant

### After Verification Guide Creation
- [ ] File name matches corresponding test
- [ ] Located in human-verification folder
- [ ] Scope alignment verified
- [ ] Complete checklist provided

## Common Anti-Patterns to Avoid

1. **Separate Storage**
   - Don't: Store verification guides elsewhere
   - Do: Co-locate with integration tests

2. **Scope Mismatch**
   - Don't: Cover more/less than tests
   - Do: Match test boundaries exactly

3. **Generic Names**
   - Don't: Use names like "verification.md"
   - Do: Match test file names thematically

4. **Missing Bus Stops**
   - Don't: Skip verification steps
   - Do: Document every checkpoint

5. **No Error Scenarios**
   - Don't: Only document happy path
   - Do: Include error handling verification

## Keywords for Retrieval
["human-verification", "verification-guides", "bus-stops", "manual-testing", "integration-verification", "test-alignment", "verification-sop"]
