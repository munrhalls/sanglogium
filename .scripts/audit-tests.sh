#!/bin/bash
# audit-tests.sh - Quick check for phantom tests and implementation drift

echo "Scanning for test-local function definitions..."
echo "=========================================="

# Find all test files
TEST_FILES=$(find tests -name "*.test.ts" 2>/dev/null)

if [ -z "$TEST_FILES" ]; then
    echo "No test files found in tests/ directory"
    exit 0
fi

PHANTOM_COUNT=0
DRIFT_COUNT=0
IMPORT_VIOLATIONS=0

for test_file in $TEST_FILES; do
    echo ""
    echo "Checking: $test_file"
    echo "------------------------"
    
    # Extract function/class definitions that aren't imports
    LOCAL_DEFS=$(grep -n -E "^(static|function|class)\s+\w+" "$test_file" | grep -v "import")
    
    if [ -n "$LOCAL_DEFS" ]; then
        echo "LOCAL DEFINITIONS (Potential Violations):"
        echo "$LOCAL_DEFS"
        
        # For each local definition, check if it's duplicating source logic
        while IFS= read -r line; do
            FUNC_NAME=$(echo "$line" | sed -E 's/.*\b(static|function|class)\s+(\w+).*/\2/')
            LINE_NUM=$(echo "$line" | cut -d: -f1)
            
            # Check if this function exists in source
            if grep -r "function $FUNC_NAME\|class $FUNC_NAME\|export.*$FUNC_NAME" lib/ > /dev/null 2>&1; then
                echo "  LINE $LINE_NUM: $FUNC_NAME - EXISTS IN SOURCE (Import violation!)"
                ((IMPORT_VIOLATIONS++))
            else
                # Check if it's a test utility (acceptable)
                if echo "$FUNC_NAME" | grep -qi "test\|mock\|helper\|util"; then
                    echo "  LINE $LINE_NUM: $FUNC_NAME - Test utility (acceptable)"
                else
                    echo "  LINE $LINE_NUM: $FUNC_NAME - PHANTOM FUNCTION (not in source)"
                    ((PHANTOM_COUNT++))
                fi
            fi
        done <<< "$LOCAL_DEFS"
    else
        echo "No local function definitions (good)"
    fi
    
    # Check for drifted implementations by comparing imports
    IMPORTS=$(grep -n "import.*from" "$test_file" | grep -v "vitest\|@test\|\.test")
    
    if [ -n "$IMPORTS" ]; then
        echo ""
        echo "IMPORTS TO VERIFY:"
        echo "$IMPORTS"
        
        # For each import, try to find the source
        while IFS= read -r line; do
            IMPORT_PATH=$(echo "$line" | sed -E "s/.*from '([^']+)'.*/\1/")
            FUNC_NAME=$(echo "$line" | sed -E "s/.*import.*\{([^}]+)\}.*/\1/" | tr -d ' ')
            
            if echo "$IMPORT_PATH" | grep -q "^@/lib"; then
                # Convert @/lib path to actual file system path
                FS_PATH=$(echo "$IMPORT_PATH" | sed "s/@\/lib/lib/")
                FS_PATH="${FS_PATH//\//\\}"  # Convert to Windows path
                
                if [ -f "$FS_PATH.ts" ] || [ -f "$FS_PATH.js" ]; then
                    # Check if function exists in the file
                    if grep -q "$FUNC_NAME" "$FS_PATH.ts" 2>/dev/null || grep -q "$FUNC_NAME" "$FS_PATH.js" 2>/dev/null; then
                        echo "  Import OK: $FUNC_NAME from $IMPORT_PATH"
                    else
                        echo "  Import FAIL: $FUNC_NAME not found in $IMPORT_PATH"
                        ((DRIFT_COUNT++))
                    fi
                else
                    echo "  Import FAIL: File $IMPORT_PATH not found"
                    ((DRIFT_COUNT++))
                fi
            fi
        done <<< "$IMPORTS"
    fi
done

echo ""
echo "=========================================="
echo "AUDIT SUMMARY"
echo "=========================================="
echo "Phantom Functions: $PHANTOM_COUNT"
echo "Import Violations: $IMPORT_VIOLATIONS"
echo "Drifted Imports: $DRIFT_COUNT"

TOTAL_ISSUES=$((PHANTOM_COUNT + IMPORT_VIOLATIONS + DRIFT_COUNT))

if [ $TOTAL_ISSUES -gt 0 ]; then
    echo ""
    echo "FAIL: $TOTAL_ISSUES test implementation issues found"
    echo "Run tests/checkout/guest-checkout-inventory-reservation/unit/fingerprint.test.ts to see example of proper import"
    exit 1
else
    echo ""
    echo "PASS: No test implementation issues found"
    exit 0
fi
