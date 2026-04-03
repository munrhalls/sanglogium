---
description: Output feature audit with end-state delineation, spatial architecture, and gap analysis for sprint consumption
---

# /audit [FEATURE_NAME]



**Input:** Human describes feature to audit and target state.
**Output:** `_project/sprints/01_audit_[FEATURE_NAME].md` — 8-part structured audit for sprint consumption.

---

## Execution Protocol (8-Part Opus Audit Pattern)

### Part 1: Design System Summary
- **Ground truth tokens:** Extract from `tailwind.config.ts`.
- **Component tokens:** Extract from `addComponents` in tailwind config or existing components.
- **Reference standard:** Identify homepage or canonical implementation to align with.

### Part 2: Research-Verified Best Practices
- **Sources:** Query Baymard, Nielsen Norman Group, or authoritative UX research.
- **Consensus rating:** Identify consensus (High/Medium/Low) for each practice.
- **Rule:** No subjective recommendations without source.

### Part 3: Component-by-Component Audit
- **Current implementation:** Analyze existing code structure and files.
- **Classification:** Issues classified as ✅ Correct / ⚠️ Warning / ❌ Critical.
- **Precision:** Include exact file paths and line ranges.

### Part 4: Design Ratings (Quantified)
- **Dimensions:** Rate 10-15 dimensions (e.g., accessibility, performance, visual hierarchy) from 1-10.
- **Evidence:** Cite specific code/UI evidence per rating.
- **Aggregate:** Calculate overall score.

### Part 5: Gap Analysis (G-XX)
- **Numbered Gaps:** Use unique IDs (G1, G2, G3...).
- **Mapping:** Gap | Current State | Target State | Components Affected.
- **Severity Tiers:** Critical / Major / Minor.

### Part 6: Sequenced Change Specifications (SC-XX)
- **SC Mapping:** SC1, SC2... with explicit Gap Coverage (e.g., "SC1 addresses G1, G2").
- **Code Blocks:** Include exact before/after code blocks.
- **Steps:** Numbered implementation steps.

### Part 7: Verification Checklist
- **Binary criteria:** Pass/Fail only.
- **Searchable commands:** Include exact terminal commands for verification.
- **Rule:** No subjective criteria.

### Part 8: Expected Results
- **Target Ratings:** Target post-implementation scores for the dimensions in Part 4.
- **Success Criteria:** Measurable success metrics.

---

## Constraint Rules
- **NO** subjective recommendations without research-verified sources.
- **NO** gaps without G-XX IDs.
- **NO** change specifications without Gap Coverage mapping.
- **MANDATORY** 8-part structure for all audits.
- **MANDATORY** Gap Coverage mapping: Audit finding → Spec → Implementation.