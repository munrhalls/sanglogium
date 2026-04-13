# /audit-tests - Test Implementation Verification

**Purpose:** Detect phantom tests and implementation drift by verifying test functions exist in source code.

## When to Use
- Before committing new unit tests
- During code review of test files
- When test coverage seems suspiciously high
- After refactoring implementation

## Protocol

### Step 1: Scan Test Files
```bash
# Find all function definitions in test files
find tests -name "*.test.ts" -exec grep -l "function\|static.*(" {} \;
```

### Step 2: Extract Function Names
```bash
# Extract function/class names from each test file
grep -E "(static|function|class)\s+\w+" tests/path/to/test.test.ts
```

### Step 3: Verify Source Existence
For each extracted function:
1. **If imported:** Check import path resolves
2. **If defined locally:** FLAG - This violates import discipline
3. **If test utility:** Verify it's NOT duplicating source logic

### Step 4: Check for Drift
Compare test implementation with source:
```bash
# Show both implementations side by side
grep -A 10 "functionName" lib/path/to/source.ts
grep -A 10 "functionName" tests/path/to/test.test.ts
```

## Red Flags (FAIL)

1. **Phantom Functions**
   - Test defines function that doesn't exist in source
   - Test imports from non-existent path

2. **Implementation Drift**
   - Same function name but different logic
   - Missing parameters or fields
   - Different return behavior

3. **Import Discipline Violation**
   - Test copies function instead of importing
   - Test has local "utils" class with source logic

## Green Flags (PASS)

1. **Direct Import**
   ```typescript
   import { functionName } from '@/lib/path/to/source'
   ```

2. **Test-Only Utilities**
   - Helper functions that don't exist in source
   - Clearly marked as test-specific (e.g., mock data builders)

3. **Integration Tests**
   - Testing behavior, not implementation
   - No function duplication

## Automation Script (Optional)

```bash
#!/bin/bash
# audit-tests.sh - Quick check for phantom tests

echo "Scanning for test-local function definitions..."
TEST_FUNCS=$(find tests -name "*.test.ts" -exec grep -l "function\|static.*(" {} \; | xargs grep -E "(static|function)\s+\w+")

echo "Checking against source files..."
for func in $TEST_FUNCS; do
  # Extract function name and check if it exists in lib/
  FUNC_NAME=$(echo $func | grep -oE "(static|function)\s+\w+" | cut -d' ' -f2)
  if ! grep -r "function $FUNC_NAME\|$FUNC_NAME.*=" lib/ > /dev/null; then
    echo "PHANTOM FUNCTION: $FUNC_NAME in $func"
  fi
done
```

## Integration with Workflows

Add to pre-commit hook:
```bash
#!/bin/sh
# .git/hooks/pre-commit
npm run audit-tests || exit 1
```

Add to package.json:
```json
{
  "scripts": {
    "audit-tests": "bash ./.scripts/audit-tests.sh"
  }
}
```

## Related Rules

- **TEST IMPORT DISCIPLINE** (in .windsurfrules)
- **Cargo Cult Testing** prevention
- **Human-First Verification** workflow
