# Workflow: Human-First Sprint Methodology

**Date:** 2026-04-08
**Source:** Sprint critique and comprehensive solution plan
**Severity:** Critical
**Frequency:** Universal (applies to all sprints)

## The Problem
Sprint had fatal flaws: over-complication, no human verification checkpoints, vague architecture with no event-state-server contract, and test phases causing blindness. Led to potential 3-day waste cycles.

## Root Cause
Started from code/migration details instead of user experience, no explicit architecture contracts, no guardrails against over-complication, and verification at the end instead of continuously.

## The Fix
**7-Step Human-First Sprint Methodology:**

1. **Start with UX Flows**
   - List every user action: "user does X -> system shows Y -> user can do Z"
   - No code, no architecture, just human experience
   - Short numbered list

2. **Simple End-State Overview**
   - One paragraph describing target experience
   - Explicitly state what stays identical
   - Note what becomes simpler/faster

3. **Explicit Architecture Contract**
   - Event -> State -> Side Effect -> Result Event -> State
   - State machine contracts (event shape, transitions, guards)
   - Human-readable, verifiable in <2 minutes

4. **Tiny Scope Contracts**
   - Each contract has: UX slice (2-3 bullets max)
   - Architecture slice (how it plugs in)
   - Human verification checklist (<5 minutes)
   - Minimal tests (only if needed for confidence)

5. **Continuous Human Verification**
   - Verify immediately after each scope contract
   - No big phases, no waiting until end
   - No blind spots in workflow

6. **Tests Serve Human Confidence**
   - Written before code, per scope contract
   - No unit/integration/e2e split
   - Tests live with their scope contract
   - If test isn't needed for human confidence, don't write it

7. **Guardrails Against Bloat**
   - Before any code: "Is this the simplest possible way?"
   - Apply to tests, files, concepts
   - Reject anything that fails simplicity test

## Prevention
**MANDATORY WORKFLOW:**
- UX flows -> End-state overview -> Architecture contract -> Per-scope contracts
- Each scope: Implement -> Verify -> Next scope
- Final end-to-end human check against original flows
- Only then is sprint complete

## Applicability
**When to apply:**
- All sprint planning
- All feature development
- Any complex system changes
- When preventing over-complication is critical

**Keywords:** ["human-first-sprint", "ux-flows", "architecture-contracts", "continuous-verification", "tiny-scopes", "simplicity-guardrails"]
