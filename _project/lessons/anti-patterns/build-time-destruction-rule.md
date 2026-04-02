# Build Time Destruction Rule

**Date:** 2026-04-02
**Source:** User directive on build time waste
**Severity:** Critical
**Frequency:** Systemic

## The Problem
Running builds during regular work destroys time, preventing code, tests, and quality work. Build runs are banned except after big sprints.

## Root Cause
Build operations consume significant time that should be used for development and testing. The opportunity cost is too high for routine verification.

## The Fix
**MANDATORY RULE:** Build runs are BANNED except:
1. After big sprints (completion verification)
2. Explicit user override with clear justification
3. Pre-deployment verification only

## Prevention
- Use development server for real-time verification
- Trust TypeScript compilation for type checking
- Use targeted testing instead of full builds
- Reserve builds for critical verification points only

## Applicability
**When to apply:**
- All development work except sprint completion
- Debugging sessions
- Feature development
- Regular maintenance

**Keywords:** ["build-time", "verification", "development-efficiency", "time-management"]
