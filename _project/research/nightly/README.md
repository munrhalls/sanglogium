# Nightly Research Reports

This directory contains automated analysis reports generated nightly by the Research Loop.

## Purpose

Prevent Lesson 6/7/8 failures by catching data integrity, schema-query mismatches, and dependency risks **before** sprint execution.

## Report Types

| Report | File Pattern | Purpose | Check Frequency |
|--------|--------------|---------|-----------------|
| Data Integrity | `DI-YYYY-MM-DD.md` | VFS, Sanity schema, product data | Every night |
| Contract Validation | `CV-YYYY-MM-DD.md` | GROQ ↔ schema type mismatches | Every night |
| Dependency Risk | `DR-YYYY-MM-DD.md` | Cross-component impact analysis | Every night |

## Daily Review (5 Minutes)

### Quick Status Check

```bash
# Get today's summary
cat _project/research/nightly/$(date +%Y-%m-%d)/README.md
```

### Decision Matrix

| Status | Meaning | Your Action |
|--------|---------|-------------|
| ✅ **Clean** | No issues | Proceed with planned work |
| ⚠️ **Warning** | Non-blocking issues | Review if sprint affected |
| ❌ **Critical** | Blocking issues | HALT sprint, run diagnostic |

## Report Structure

Each report contains:

```
1. Status Summary (Critical/Warning/Clean)
2. Sprint Impact (which sprint affected)
3. Top Issues (3 most important)
4. All Issues (complete list)
5. Recommendations (specific actions)
6. Related Lessons (from _project/lessons/)
7. Prevention (checklist)
```

## Integration with Sprint Workflow

### Before Sprint Execution

```
1. Query _project/lessons/INDEX.md (load relevant lessons)
2. Check latest research report ⬅️ NEW STEP
   └── If Critical → HALT, fix issues first
   └── If Warning → Update sprint spec with prevention
   └── If Clean → Proceed
3. Execute sprint
```

### After Sprint Completion

- Run `/learn` to extract lessons
- Research Loop will catch similar issues next time

## Automation

### GitHub Actions Workflow

- **Trigger:** Nightly at 2:00 AM UTC (after daily-rebuild)
- **Manual Trigger:** Via Actions tab → Run workflow
- **Output:** Artifacts uploaded (reports viewable in GitHub Actions)

### Local Execution (Testing)

```bash
# Set API key
export OPENROUTER_API_KEY=sk-or-...

# Run individual checks
node scripts/research/data-integrity.mjs
node scripts/research/contract-validation.mjs
node scripts/research/dependency-risk.mjs

# View reports
cat _project/research/nightly/$(date +%Y-%m-%d)/DI-$(date +%Y-%m-%d).md
```

## Retention

- **Reports kept:** 30 days (GitHub Actions artifacts)
- **Auto-cleanup:** Reports older than 30 days deleted
- **Historical analysis:** Patterns tracked across time

## Customization

### Add New Validation

Edit `.github/workflows/nightly-research.yml`:

```yaml
- name: Custom Check
  run: node scripts/research/my-check.mjs
  env:
    OPENROUTER_API_KEY: ${{ secrets.OPENROUTER_API_KEY }}
```

### Adjust Schedule

```yaml
on:
  schedule:
    - cron: "0 2 * * *"  # Daily at 2 AM
    # - cron: "0 */6 * * *"  # Every 6 hours
    # - cron: "0 2 * * 1"   # Mondays at 2 AM
```

## Troubleshooting

### Reports Not Generated

1. Check GitHub Actions tab for workflow status
2. Verify `OPENROUTER_API_KEY` is set in repository secrets
3. Check rate limits (50 req/day on OpenRouter free tier)

### Reports Are Empty/Generic

- Model may have changed (OpenRouter rotates free models)
- Check `scripts/research/*.mjs` for errors
- Run locally to debug: `node scripts/research/data-integrity.mjs`

### False Positives

- Adjust validation rules in respective `.mjs` scripts
- Add ignore patterns for known-acceptable cases
- Document exceptions in report comments

## Cost

- **Current:** FREE (OpenRouter free tier: 50 requests/day)
- **Usage:** ~5 requests/night = 150/month (well under limit)
- **Buffer:** 10x safety margin
- **Upgrade:** $10 lifetime topup = 1000 req/day if needed

## Feedback

This system learns from:
- _project/lessons/ (extracted via /learn)
- Sprint outcomes (success/failure patterns)
- Your feedback on report usefulness

**Not useful?** Delete `.github/workflows/nightly-research.yml` to stop.
**Want more?** Add additional validation checks.

---

*Last updated: Setup complete*  
*Next report: Tonight at 2:00 AM UTC*
