# Debug Output Truncation Anti-Pattern

**Date:** 2026-04-13
**Source**: AtomicReservationManager debugging failures
**Severity**: High
**Frequency**: Systemic (occurs with any async operation)

## The Problem
Console.log output was truncated at 500 characters, hiding the actual error messages and making debugging impossible. The AtomicReservationManager was failing but the error details were cut off.

## Root Cause
Default console.log in Node.js/Next.js truncates long output, especially:
- JSON.stringify of large objects
- Error stack traces
- API response bodies
- Database query results

## The Fix
```typescript
// BAD - Gets truncated
console.log('AtomicReservationManager result:', JSON.stringify(result, null, 2))

// GOOD - Full output visible
console.log('AtomicReservationManager result:', result)
// Or if JSON needed:
const json = JSON.stringify(result, null, 2)
console.log('AtomicReservationManager result:', json)
console.log('Full JSON length:', json.length)
```

## Prevention
**MANDATORY DEBUG OUTPUT PROTOCOL:**

1. **Direct Object Logging**
   ```typescript
   // CORRECT - Let Node.js format it
   console.log('Object:', object)
   
   // AVOID - JSON.stringify truncates
   console.log('Object:', JSON.stringify(object, null, 2))
   ```

2. **Structured Logging for Large Data**
   ```typescript
   // For very large objects
   if (typeof object === 'object' && object !== null) {
     console.log('Object keys:', Object.keys(object))
     console.log('Object type:', object.constructor.name)
     console.log('First 100 chars:', JSON.stringify(object).substring(0, 100))
   }
   ```

3. **Error Handling Pattern**
   ```typescript
   try {
     const result = await operation()
     console.log('Success:', result)
   } catch (error) {
     console.error('Error name:', error.name)
     console.error('Error message:', error.message)
     console.error('Error stack:', error.stack)
     // Don't JSON.stringify the error object
   }
   ```

4. **Async Operation Debugging**
   ```typescript
   // Add sequence numbers for async operations
   let operationId = 0
   console.log(`[${++operationId}] Starting operation`)
   
   const result = await someAsyncOperation()
   
   console.log(`[${++operationId}] Operation complete`)
   console.log(`[${operationId}] Result:`, result)
   ```

5. **Conditional Detail Logging**
   ```typescript
   // Log summary always, details on demand
   console.log('Operation result:', {
     success: result.success,
     id: result.id,
     hasData: !!result.data,
     dataLength: result.data ? JSON.stringify(result.data).length : 0
   })
   
   // Only log full data in development
   if (process.env.NODE_ENV === 'development') {
     console.log('Full data:', result.data)
   }
   ```

## Detection Patterns

1. **Look for truncation indicators**
   ```
   ... (truncated X lines)
   Output truncated
   ```

2. **Check output length**
   ```typescript
   const output = JSON.stringify(object)
   if (output.length > 500) {
     console.log('Large object, length:', output.length)
   }
   ```

3. **Use Node's full output**
   ```bash
   # Run with increased buffer size
   node --max-old-space-size=4096 script.js
   ```

## Applicability
**When to apply:**
- Debugging async operations
- Logging API responses
- Error investigation
- Any operation with complex data structures

**Keywords:** ["debug-truncation", "console-log", "async-debugging", "error-handling", "output-buffer"]
