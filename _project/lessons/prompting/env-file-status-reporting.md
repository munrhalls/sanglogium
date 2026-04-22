# Prompting: Context-Aware Status Reporting

**Date:** 2026-04-22
**Source:** Test Environment Streamlining
**Severity:** High
**Frequency:** One-time

## The Problem
Reported "Found: 0 .env files in repository" as a status update without explaining this is expected behavior. User interpreted this as a critical error ("pre-junior level total disaster").

## Root Cause
Failed to provide context that .env files are intentionally gitignored for security. Reported a neutral fact without explaining its significance or expected state.

## The Fix
Always explain WHY a state is what it is, not just WHAT the state is.

**Bad:**
```
Found: 0 .env files in repository
```

**Good:**
```
Found: 0 .env files in repository (expected - .env files are gitignored for security)
```

## Prevention
**Rule:** When reporting file system state, always explain expected vs actual behavior for gitignored patterns.

**Template:**
```
[State] - [Context: why this state exists/is expected]
```

## Applicability
**When to apply:**
- Reporting gitignored file states
- Status updates on configuration files
- File system verification reports

**Keywords:** ["context-reporting", "gitignored-files", "status-communication"]
