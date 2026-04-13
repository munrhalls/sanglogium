# Scoped Lesson Detection Pattern

**Date:** 2026-04-13
**Source:** Analysis of lesson system failure to detect existing violations
**Severity:** High
**Frequency:** Systemic (applies to all lesson retrieval)

## The Problem
/retrieve-lessons workflow only prevents future violations but doesn't detect existing ones in the current scope of work.

## Root Cause
Lesson system designed as forward-looking only, with no retroactive audit capability for files currently being worked on.

## The Fix
```markdown
## /retrieve-lessons Enhancement
### Phase 2.5: Scoped Detection
1. Identify files in current conversation scope
2. Scan those files for lesson violations
3. Report violations with simple warnings
```

## Prevention
**MANDATORY:** When retrieving lessons, always scan current scope for existing violations.

**Detection Steps:**
1. **Scope Identification**: Files mentioned in current conversation
2. **Violation Scan**: Check if files follow retrieved lessons
3. **Simple Warning**: "File X violates lesson Y"
4. **No Auto-Fix**: Let human decide action

## Applicability
**When to apply:**
- All /retrieve-lessons executions
- When working with existing code
- Before making changes to files

**Keywords:** ["lesson-detection", "scoped-audit", "retroactive-check", "lesson-compliance"]
