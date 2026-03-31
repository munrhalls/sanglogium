# 24/7 Research Loop — Setup Guide
## Sang Logium Autonomous Codebase Analysis

**Status:** Configuration complete — awaiting API key activation  
**Cost:** FREE (OpenRouter tier: 50 requests/day)  
**Frequency:** Nightly at 2:00 AM UTC (aligned with daily-rebuild)  
**Scope:** Read-only research → recommendations only (NO code changes)

---

## Quick Start (Your 10-Minute Setup)

### Step 1: Get Free API Key (5 minutes)

1. Visit [openrouter.ai](https://openrouter.ai)
2. Sign up with GitHub account (fastest)
3. Navigate to **Keys** → **Create Key**
4. Name it: `sang-logium-research`
5. Copy the key (starts with `sk-or-...`)

### Step 2: Add to GitHub Secrets (3 minutes)

1. Go to [github.com/munrhalls/sanglogium/settings/secrets/actions](https://github.com/munrhalls/sanglogium/settings/secrets/actions)
2. Click **New repository secret**
3. Name: `OPENROUTER_API_KEY`
4. Value: Paste your key from Step 1
5. Click **Add secret**

### Step 3: Enable & Verify (2 minutes)

1. Go to [Actions tab](https://github.com/munrhalls/sanglogium/actions)
2. If prompted: **Enable GitHub Actions** for this repo
3. Workflow `.github/workflows/nightly-research.yml` will appear
4. Manual trigger test (optional): Click workflow → **Run workflow**

---

## What the Research Loop Does (Read-Only Guarantee)

### Three Validation Checks (Nightly)

```
┌─────────────────────────────────────────────────────────┐
│  1. DATA INTEGRITY CHECK                                  │
│     • VFS: slotMetadataMap completeness                 │
│     • Sanity: schema vs product data alignment          │
│     • Build: catalogue-index.json validation              │
│     Output: DI-[date].md (Critical/Warning/Clean)       │
├─────────────────────────────────────────────────────────┤
│  2. SCHEMA-QUERY CONTRACT VALIDATION                      │
│     • GROQ queries vs schema types                       │
│     • Reference syntax (→) validation                     │
│     • Field existence verification                      │
│     Output: CV-[date].md (Prevents Lesson 6/7/8)         │
├─────────────────────────────────────────────────────────┤
│  3. DEPENDENCY RISK MAPPING                               │
│     • Cross-component impact analysis                    │
│     • Shared file risk assessment                        │
│     • Auto-generate "Files at Risk" tables               │
│     Output: DR-[date].md (Sprint pre-flight)             │
└─────────────────────────────────────────────────────────┘
```

### Strict Boundaries (Forbidden)

| Action | Status | Why |
|--------|--------|-----|
| Read codebase | ✅ Allowed | Analysis only |
| Write files in `_project/research/nightly/` | ✅ Allowed | Output only |
| Modify source code | ❌ **FORBIDDEN** | Read-only constraint |
| Create PRs | ❌ **FORBIDDEN** | Recommendations only |
| Auto-fix issues | ❌ **FORBIDDEN** | Human decision required |
| Comment on issues | ❌ **FORBIDDEN** | No noise generation |

---

## Output Structure

```
_project/research/nightly/
├── 2026-03-31/
│   ├── DI-2026-03-31.md        # Data Integrity Report
│   ├── CV-2026-03-31.md        # Contract Validation Report  
│   └── DR-2026-03-31.md        # Dependency Risk Report
├── 2026-04-01/
│   └── ...
└── README.md                   # How to interpret reports
```

### Report Format (Consistent)

```markdown
# Data Integrity Report — 2026-03-31

**Status:** ⚠️ Warning  
**Sprint Impact:** PLP_FIXES SC3 (filter logic)  
**Action Required:** Review before sprint execution

## Findings

### 1. VFS slotMetadataMap Incomplete
**Severity:** Critical  
**Location:** `data/catalogue-index.json`  
**Issue:** 12 tree IDs missing from slotMetadataMap  
**Lesson:** Lesson 6 (VFS data consistency)  
**Recommendation:** Fix build script before PLP sprints

### 2. Product Schema Mismatch
**Severity:** High  
**Location:** `sanity/schemaTypes/productType.ts`  
**Issue:** 3 products missing `catalogueLocationKeys`  
**Lesson:** Lesson 7 (schema-query contract)  
**Recommendation:** Data migration required
```

---

## Decision Gate (Daily 5-Minute Review)

### Morning Routine

```bash
# Check latest report (takes 30 seconds)
cat _project/research/nightly/$(date +%Y-%m-%d)/DI-$(date +%Y-%m-%d).md | head -20
```

### Status Actions

| Status | Meaning | Your Action |
|----------|---------|-------------|
| ✅ **Clean** | No issues detected | Proceed with planned sprints |
| ⚠️ **Warning** | Non-blocking issues | Check if warning affects active sprint |
| ❌ **Critical** | Blocking issue found | HALT affected sprint, diagnostic first |

### Integration with Sprint Workflow

```
Before ANY sprint execution:
├── 1. Query _project/lessons/INDEX.md (your existing workflow)
├── 2. Check latest nightly research report ⬅️ NEW
│   └── If Critical status → HALT, run diagnostic
│   └── If Warning → Update sprint spec with prevention
│   └── If Clean → Proceed
└── 3. Execute sprint
```

---

## Cost Control (Free Tier Limits)

| Provider | Free Tier | Our Usage | Safety |
|----------|-----------|-----------|--------|
| OpenRouter | 50 req/day | ~5 req/night | 10x buffer |
| Monthly | ~150 req | ~150 req/month | ✅ Within limits |

### Rate Limit Protection

Workflow has built-in safeguards:
- Retry with exponential backoff (3 max)
- Graceful degradation (report "API unavailable")
- No infinite loops on failure

---

## Troubleshooting

### Issue: "API Key not found"

**Cause:** Secret not set or name mismatch  
**Fix:** Verify `OPENROUTER_API_KEY` in GitHub Secrets (not environment variables)

### Issue: "Rate limit exceeded"

**Cause:** 50 req/day exceeded (rare with nightly)  
**Fix:** Wait 24h, or add $10 lifetime topup for 1000 req/day

### Issue: "Workflow not running"

**Cause:** GitHub Actions disabled or cron syntax  
**Fix:** Check Actions tab → Enable; verify cron: `"0 2 * * *"`

### Issue: "Reports empty or generic"

**Cause:** Model not following structured prompt  
**Fix:** Check model availability (OpenRouter rotates free models)  
**Fallback:** Workflow will use alternative model (Mistral Small 3.1)

---

## Advanced: Customization

### Add New Validation Checks

Edit `.github/workflows/nightly-research.yml`:

```yaml
- name: Custom Check
  run: node scripts/research/custom-validation.mjs
  env:
    CHECK_NAME: "Your Check"
```

### Change Schedule

Edit cron expression in workflow:
- `"0 2 * * *"` = 2:00 AM daily (current)
- `"0 */6 * * *"` = Every 6 hours
- `"0 2 * * 1"` = Mondays at 2 AM

### Switch Provider

Edit workflow to use alternative:
- Groq (faster, same free tier)
- GitHub Models (if you have Copilot)
- Cohere (1000 req/month)

---

## Maintenance

### Monthly (2 minutes)

- [ ] Review `_project/research/nightly/` directory size
- [ ] Archive reports older than 30 days (auto-cleanup optional)
- [ ] Verify API key still valid (OpenRouter rotates occasionally)

### Quarterly (5 minutes)

- [ ] Evaluate: Are reports useful? Are they being read?
- [ ] Tune validation rules (add/remove checks)
- [ ] Review cost (if upgraded to paid tier)

---

## Verification Checklist

After setup, confirm:

- [ ] `OPENROUTER_API_KEY` in GitHub Secrets
- [ ] GitHub Actions enabled
- [ ] Workflow file in `.github/workflows/nightly-research.yml`
- [ ] Output directory `_project/research/nightly/` created
- [ ] First manual run completed (optional)
- [ ] Scheduled run appears in Actions tab

---

## Summary

**What you get:**
- 🛡️ Pre-sprint issue detection (catches Lesson 6/7/8 failures)
- 📊 Daily data integrity reports
- 🔍 Automated schema-query validation
- 🎯 Risk-assessed sprint recommendations

**What you pay:**
- $0 (OpenRouter free tier)
- 10 minutes one-time setup
- 5 minutes daily review (optional)

**Risk:**
- Minimal: Read-only, no code changes
- Reversible: Delete workflow = stop immediately

**Next step:** Complete the 3-step setup above.
