# Live Server Manual Acceptance Tests

**Objective:** Verify the logging mechanism captures execution data without affecting application behavior.

**Pre-requirements:**
- Application running in dev or prod environment.
- Access to view the trace file in the filesystem.

**Test Execution:**

1. **The Reset Check:**
   - *Action:* Trigger the first function in the sequence.
   - *Pass Condition:* The trace file contains only data from this execution, with no previous data present.

2. **The Append Check:**
   - *Action:* Trigger subsequent functions in the sequence.
   - *Pass Condition:* The trace file contains data from all executions in chronological order.

3. **The Data Integrity Check:**
   - *Action:* Inspect the logged data.
   - *Pass Condition:* The logged data matches what was passed to and returned from the functions.

4. **The No-Side-Effect Check:**
   - *Action:* Complete the full sequence.
   - *Pass Condition:* The application behaves identically to before logging was added.
