# Sanity v3 Dataset Creation Research

**Date:** 2026-04-19  
**Topic:** Sanity v3 dataset creation command and free tier cost

---

## Research Scope Contract
- **Topic:** Proper command for Sanity v3 to create test dataset and cost implications for free users
- **First Principles:** Sanity projects use datasets as isolated data stores; free tier has dataset limits
- **Fundamentals:** CLI command syntax, dataset naming rules, free tier dataset limits
- **Scope Boundary:** Only dataset creation, not migration or advanced features
- **Target Audience:** Developer setting up test environment
- **Decay Risk:** Low - Sanity v3 CLI is stable

---

## Multi-Source Triangulation

| Source | URL | Type | Credibility | Date | Key Claim | Verification Status |
|--------|-----|------|-------------|------|-----------|---------------------|
| Sanity Docs | https://www.sanity.io/docs/content-lake/datasets | Official | Canonical | 2026-04-19 | `sanity dataset create <name>` creates dataset | ✅ Verified |
| Sanity Pricing | https://www.sanity.io/pricing | Official | Canonical | 2026-04-19 | Free tier includes 2 datasets (public only) | ✅ Verified |

---

## First Principles Analysis

### Core Problem Being Solved
Need isolated test dataset to avoid polluting production data during integration testing.

### Underlying Constraints
1. Free tier limited to 2 datasets per project
2. Dataset names must follow naming rules (lowercase, numbers, hyphens, underscores)
3. Datasets are isolated data stores within same project

### Inherent Tradeoffs
| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| CLI command | Fast, scriptable | Requires CLI installed | Automation workflows |
| Management console | GUI, no CLI needed | Manual, not scriptable | One-time setup |

### Failure Modes
1. **Dataset limit exceeded:** Free tier max 2 datasets
2. **Invalid naming:** Dataset name must follow rules (1-64 chars, lowercase, numbers, hyphens, underscores)

---

## Code Fundamentals

### Fundamental: Dataset Creation Command
**Claim:** `sanity dataset create <name>` creates new dataset

**Verification:**
- [ ] Located in codebase: N/A (CLI command)
- [ ] Test created: N/A (CLI command)
- [ ] Source inspected: Sanity official docs

**Actual Behavior:**
Command creates dataset in specified project. Dataset must follow naming rules.

**Edge Cases:**
1. Dataset already exists → Error
2. Invalid name format → Error
3. Dataset limit exceeded → Error (paid upgrade required)

---

## Best Practices (Verified)

### Practice: Use CLI for Test Datasets
**Consensus:** High

**Supporting Evidence:**
- Sanity Docs: "Datasets can be created and managed using the sanity command-line tool"

**Counter-Evidence (Falsification Attempts):**
- None found

**Verdict:** ✅ Recommended

**When to Use:** When scripting test environment setup
**When to Skip:** When doing one-time manual setup (use management console)

---

## Common Solutions Landscape

### Solution: Sanity CLI Dataset Creation
**Prevalence:** Common
**Type:** Idiomatic

**Pros:**
- Fast and scriptable
- Standard approach across Sanity projects
- Integrates with CI/CD pipelines

**Cons:**
- Requires CLI installation
- Requires authentication

**Real-World Pain Points:**
- Dataset naming rules can be confusing
- Free tier limit (2 datasets) can be hit unexpectedly

**Recommendation:** Use CLI for automated setup, management console for one-time manual setup

---

## Verification & Falsification Log

### Claims Verified
| Claim | Evidence | Method |
|-------|----------|--------|
| `sanity dataset create <name>` creates dataset | Sanity Docs | Official documentation |
| Free tier includes 2 datasets | Sanity Pricing | Official pricing page |

### Falsification Attempts
| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| Unlimited datasets on free tier | Pricing page shows 2 dataset limit | Survived (corrected) |

### Knowledge Decay Assessment
| Section | Risk | Review Date |
|---------|------|-------------|
| CLI command syntax | Low | 2027-04-19 |
| Free tier limits | Med | 2026-10-19 (pricing can change) |

---

## Synthesis: Actionable Takeaways

### For Our Project
| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| Use `sanity dataset create test` | Free tier has 2 datasets, we have production + can add test | Run CLI command |
| No cost concern | Within free tier 2 dataset limit | Verify after creation |

### Immediate Actions
1. Run `sanity dataset create test` to create test dataset
2. Verify dataset creation succeeded
3. Proceed with copying products to test dataset

### Open Questions
None

---

## Command Reference

### Create Dataset
```bash
sanity dataset create <name>
```

### List Datasets
```bash
sanity dataset list
```

### Dataset Naming Rules
- 1-64 characters long
- Lowercase letters (a-z), numbers (0-9), hyphens (-), underscores (_)
- Must begin and end with lowercase letter or number

### Free Tier Limits
- 2 datasets per project (public only)
- Up to 20 user seats
- 2 permission roles
