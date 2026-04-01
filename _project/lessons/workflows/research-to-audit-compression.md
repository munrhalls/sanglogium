# Lesson: Research-to-Audit Compressed Workflow

**Date:** 2026-04-01
**Source:** `/research` + `/audit` command execution
**Severity:** Medium
**Frequency:** Per research cycle
**Theme:** workflows

## The Problem

Research without immediate audit creates stale knowledge. Traditional workflow:
1. Research (2+ hours) → Document → Wait → Audit later
2. Knowledge decays between phases
3. Re-discovery required during audit
4. Compressed context loses signal

## Root Cause

Time separation between research capture and audit application. Human context switching destroys continuity.

## The Fix

### Unified Research→Audit Workflow

**Phase 1: Research with Audit Intent (45 min)**
- Research current implementation
- Document "how it is" simultaneously
- Research professional standards in parallel
- Capture source URLs with timestamps

**Phase 2: Compression (15 min)**
- Synthesize to load-bearing facts only
- Format: Claim → Evidence → Code Location
- Eliminate prose, keep citations

**Phase 3: Gap Analysis (30 min)**
- Direct comparison: Current vs Standard
- Severity classification (Critical/High/Medium/Low)
- Effort estimation per gap
- Remediation roadmap

**Output:** Two documents
1. `/_project/research/[topic].md` — Verified best practices
2. `/audit-reports/[topic]_AUDIT.md` — Gaps and remediation

## Prevention

**Rule:** Never execute `/research` without planning immediate `/audit`. Batch both in single session.

**Signal density formula:**
```
Ground Factor = (Load-bearing facts) ÷ (Time cost)
Target: Research + Audit ≤ 90 minutes total
```

## Applicability

**When to apply:**
- Pre-sprint architecture assessment
- Technology evaluation
- Codebase health check
- Technical debt assessment

**Keywords:** ["research", "audit", "compression", "signal-density", "workflow"]

## Verification Checklist

- [ ] Research document has source citations with dates
- [ ] Audit has severity ratings per gap
- [ ] Remediation includes effort estimates
- [ ] Both docs linked in INDEX.md
- [ ] Lessons extracted via /learn
