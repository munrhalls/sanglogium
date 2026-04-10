# Workflow: Quick-Workflow Pattern

**Date:** 2026-04-08
**Source:** Sprint critique and quick-workflow development
**Severity:** Critical
**Frequency:** Universal (applies to all at-risk features)

## The Problem
Sprint had critical over-complication, no clear UX flows, vague state machine, and missing human verification checkpoints, leading to potential 3-day waste cycles.

## Root Cause
Started with complexity instead of simplicity, no guardrails against over-engineering, and no AS-SIMPLE-AS-POSSIBLE contract.

## The Fix
Created 5-step pattern with time boxes:
1. Define UX Flows First (15 min)
2. Create Manual Verification Plan (15 min)
3. Draw Simple Architecture (15 min)
4. Define Guardrails (10 min)
5. Create Sprint Template (10 min)

## Prevention
**MANDATORY WORKFLOW:**
1. **Use /quick-workflow for any feature at risk of over-complication**
2. **Complete each step fully before next**
3. **Get human approval after each step**
4. **Never skip steps, even if tempted**
5. **Keep to time limits**

## Applicability
**When to apply:**
- Any feature development that risks over-complication
- When you need to prevent cargo cult patterns
- When human verification checkpoints are critical
- Time-sensitive development (4-hour windows)

**Keywords:** ["quick-workflow", "simplicity", "human-verification", "over-complication", "guardrails"]
