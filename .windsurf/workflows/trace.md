---
description: Execute bus stop debugging flow with expected results at each stop
---

# /trace - Bus Stop Debugging Workflow

## Purpose
Execute end-to-end trace with clearly defined expectations at each bus stop. Only bus stop tracing is worth time in web development.

## When to Use
- Debugging data flow issues (API -> query -> result)
- Investigating user flow problems
- Verifying system behavior
- Any "why isn't this working" scenarios

## Workflow Steps

### 1. Define the Flow (5 min)
List the complete flow from start to finish:
```
User Action -> Component -> API -> Database -> Response -> Component -> UI Update
```

### 2. Identify Bus Stops (5 min)
Break the flow into discrete checkpoints:
- **Stop 1:** User interaction (click, form submit)
- **Stop 2:** Component state change
- **Stop 3:** API request formation
- **Stop 4:** Server receives request
- **Stop 5:** Database query execution
- **Stop 6:** Database response
- **Stop 7:** Server processes response
- **Stop 8:** API response sent
- **Stop 9:** Component receives response
- **Stop 10:** UI updates

### 3. Define Expected Results (10 min)
For each bus stop, document what SHOULD happen:

#### Template
```
## Bus Stop [N]: [Name]
**Expected:** [What should happen]
**Actual:** [What actually happens]
**Status:** PASS/FAIL
**Next:** [Which stop to check next if this fails]
```

### 4. Execute Trace (15-30 min)
Add console.log statements at each bus stop:

```typescript
// Stop 1: User interaction
console.log('TRACE: User clicked', { button: e.target.name, timestamp: Date.now() });

// Stop 2: Component state
console.log('TRACE: Component state', { loading, error, data });

// Stop 3: API request
console.log('TRACE: API request', { url, method, body });

// Stop 4: Server receives
console.log('TRACE: Server received', { endpoint, params, headers });

// Stop 5: DB query
console.log('TRACE: DB query', { query, params });

// Stop 6: DB response
console.log('TRACE: DB response', { rows, count, time });

// Stop 7: Server process
console.log('TRACE: Server process', { input, processing });

// Stop 8: API response
console.log('TRACE: API response', { status, data, headers });

// Stop 9: Component receives
console.log('TRACE: Component receives', { response, error });

// Stop 10: UI update
console.log('TRACE: UI update', { state, rendered });
```

### 5. Analyze Results (10 min)
- Compare actual vs expected at each stop
- Identify first failure point
- Trace backward from failure
- Document root cause

### 6. Fix and Verify (15 min)
- Apply minimal fix
- Re-run trace
- Confirm all stops pass
- Remove console logs

## Quick Trace Templates

### API Call Trace
```typescript
// Client side
console.log('TRACE: Starting API call', { endpoint, payload });
fetch(endpoint, options)
  .then(res => {
    console.log('TRACE: API response received', { status, headers });
    return res.json();
  })
  .then(data => {
    console.log('TRACE: Data parsed', { data });
    setData(data);
    console.log('TRACE: State updated', { state: data });
  })
  .catch(error => {
    console.log('TRACE: Error occurred', { error });
  });
```

### Server Action Trace
```typescript
// Server action
export async function serverAction(params) {
  console.log('TRACE: Server action called', { params });
  
  try {
    const result = await database.query(params);
    console.log('TRACE: DB query result', { result });
    
    const processed = processResult(result);
    console.log('TRACE: Processed result', { processed });
    
    return processed;
  } catch (error) {
    console.log('TRACE: Server action error', { error });
    throw error;
  }
}
```

## Common Bus Stops by Feature Type

### Search/Filter Flow
1. User types in search box
2. Input component updates
3. URL params update
4. Filter parses params
5. GROQ query builds
6. Sanity executes query
7. Sanity returns results
8. Component receives data
9. Results render

### Checkout Flow
1. User clicks checkout
2. Basket validates
3. API request to checkout
4. Server validates basket
5. Stripe payment intent created
6. Payment intent returned
7. Component receives payment data
8. Payment form renders

### Form Submission
1. User submits form
2. Form validation runs
3. Form data serializes
4. API request sends
5. Server validates data
6. Database saves record
7. Success response sent
8. Component updates UI

## Anti-Patterns to Avoid
- **Don't skip stops** - Every stop must be verified
- **Don't assume** - Verify each stop's actual output
- **Don't over-log** - Only relevant data for each stop
- **Don't forget cleanup** - Remove trace logs after fixing

## Success Criteria
- All bus stops documented with expectations
- Each stop traced with actual output
- Root cause identified at first failure point
- Fix applied and verified
- Console logs removed

## Output Format
```markdown
# Trace Results: [Feature Name]

## Flow Overview
[Complete flow description]

## Bus Stop Analysis
[All stops with expected/actual/status]

## Root Cause
[First failure point and why]

## Fix Applied
[Minimal change made]

## Verification
[All stops now pass]
```
