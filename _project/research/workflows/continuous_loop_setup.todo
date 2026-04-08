# 24/7 Continuous Research Loop — Setup Guide
## Zero Cost • Local AI • Scientific Process

---

## Quick Start (5 Minutes)

### 1. Install Ollama (if not already)

**Windows:**
```powershell
winget install Ollama.Ollama
# Or download from https://ollama.com/download
```

**Verify:**
```powershell
ollama --version
```

### 2. Pull Research Model (3 minutes)

```powershell
# Option A: Fast, lightweight (1.7GB)
ollama pull llama3.2:3b

# Option B: Smaller, faster (1.1GB)
ollama pull phi3:mini

# Option C: Better quality, larger (4GB)
ollama pull llama3.1:8b
```

**Verify:**
```powershell
ollama list
# Should show: llama3.2:3b, phi3:mini, etc.
```

### 3. Install PM2 (Process Manager)

```powershell
npm install -g pm2
```

### 4. Start the Research Loop

```powershell
pm2 start pm2.research.config.json
```

**Verify it's running:**
```powershell
pm2 status
# Should show: sanglogium-research │ online
```

---

## What It Does

Every 10 minutes (configurable):

```
┌─────────────────────────────────────────────────────────┐
│  OBSERVE                                                │
│  ├── Read codebase state                                │
│  ├── Check 10 research dimensions                       │
│  └── Identify gaps to professional level                │
├─────────────────────────────────────────────────────────┤
│  HYPOTHESIZE                                            │
│  ├── Generate specific gap-closure hypothesis           │
│  └── Focus on highest-risk dimension                    │
├─────────────────────────────────────────────────────────┤
│  VALIDATE                                               │
│  ├── Check against existing lessons                     │
│  ├── Verify not duplicate of today                      │
│  └── Ensure testable & specific                         │
├─────────────────────────────────────────────────────────┤
│  DOCUMENT                                               │
│  └── Write to _project/research/continuous/             │
└─────────────────────────────────────────────────────────┘
```

---

## Research Dimensions

| Dimension | What It Checks | Output |
|-----------|---------------|--------|
| **design-system-compliance** | Hardcoded colors, missing tokens | Token audit |
| **component-completeness** | Shared UI library gaps | Component list |
| **data-integrity** | VFS, Sanity schema issues | Data validation |
| **groq-query-optimization** | Query patterns, schema mismatch | Query analysis |
| **test-coverage-gaps** | Missing tests, coverage holes | Test audit |
| **performance-bottlenecks** | Build time, bundle size | Performance profile |
| **accessibility-compliance** | A11y violations | A11y report |
| **seo-optimization** | Meta tags, structured data | SEO audit |
| **security-hardening** | Dependencies, secrets scan | Security report |
| **documentation-gaps** | Missing docs, stale comments | Doc audit |

---

## Output Structure

```
_project/research/continuous/
├── 2026-04-01T10-30-00-000Z-design-system-compliance.md
├── 2026-04-01T10-40-00-000Z-data-integrity.md
├── 2026-04-01T10-50-00-000Z-component-completeness.md
└── ...
```

Each file contains:
- **Hypothesis:** Specific, actionable gap closure
- **Rationale:** Why this will work
- **Implementation:** High-level steps
- **Validation:** How to verify
- **Current State:** Observed data
- **Estimated Effort:** 1-4 hours
- **Priority:** Critical/High/Medium/Low

---

## Daily Usage

### Morning Review (2 minutes)

```powershell
# Check overnight findings
Get-ChildItem _project\research\continuous\*.md | 
  Sort-Object LastWriteTime -Descending | 
  Select-Object -First 5 |
  ForEach-Object { 
    Write-Host "`n=== $($_.Name) ===" -ForegroundColor Green
    Get-Content $_.FullName -Head 15
  }
```

### Convert to Sprint

Find a validated hypothesis:
```powershell
# Find high-confidence, high-priority findings
Get-ChildItem _project\research\continuous\*.md |
  Select-String -Pattern "Confidence: High" -List |
  Select-Object -First 3
```

Copy the hypothesis into a sprint doc and execute.

---

## Management Commands

```powershell
# Start the daemon
pm2 start pm2.research.config.json

# Stop the daemon
pm2 stop sanglogium-research

# Restart
pm2 restart sanglogium-research

# View logs
pm2 logs sanglogium-research

# View status
pm2 status

# Auto-start on boot
pm2 startup
pm2 save
```

---

## Configuration

Edit `pm2.research.config.json`:

```json
{
  "env": {
    "RESEARCH_MODEL": "llama3.2:3b",  // Change model
    "RESEARCH_INTERVAL": "10"         // Minutes between runs
  }
}
```

### Model Options

| Model | Size | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| `phi3:mini` | 1.1GB | Fastest | Good | Rapid iteration |
| `llama3.2:3b` | 1.7GB | Fast | Better | Balanced |
| `llama3.1:8b` | 4GB | Medium | Excellent | Deep analysis |
| `codellama:7b` | 4GB | Medium | Code-focused | Technical gaps |

---

## Cost Analysis

| Resource | Cost |
|----------|------|
| Ollama | **$0** (local) |
| PM2 | **$0** (open source) |
| Electricity | ~$5/month (if running 24/7) |
| **Total** | **$5/month** vs $100+ for API calls |

---

## Troubleshooting

### "Ollama not available"

```powershell
# Check if Ollama is running
ollama serve

# In another terminal, test:
curl http://localhost:11434/api/tags
```

### "Model not found"

```powershell
# Pull the model
ollama pull llama3.2:3b
```

### "PM2 command not found"

```powershell
# Install PM2
npm install -g pm2

# Or use npx
npx pm2 start pm2.research.config.json
```

### Too many findings (overwhelming)

Increase interval:
```json
{
  "env": {
    "RESEARCH_INTERVAL": "60"  // Every hour instead of 10 min
  }
}
```

Then restart:
```powershell
pm2 restart sanglogium-research
```

---

## Stopping the Loop

```powershell
# Stop but keep files
pm2 stop sanglogium-research

# Stop and remove from PM2
pm2 delete sanglogium-research

# Stop and clear all findings
pm2 delete sanglogium-research
Remove-Item -Recurse _project\research\continuous\
```

---

## Integration with Sprint Workflow

### Pre-Sprint Check (1 minute)

```powershell
# Get latest high-confidence findings
grep -l "Confidence: High" _project/research/continuous/*.md |
  xargs ls -lt |
  head -3
```

### Sprint Prioritization

```markdown
## Sprint Input Sources

1. _project/lessons/INDEX.md (load first)
2. _project/research/continuous/*.md (review latest)
3. _project/acceleration/acceleration.md (critical path)
4. Your strategic priority

Priority weighting:
- Critical findings from research loop: 3x
- Active sprint blockers: 5x
- Strategic roadmap: 2x
```

---

## Next Steps

1. [ ] Install Ollama
2. [ ] Pull `llama3.2:3b` model
3. [ ] Install PM2
4. [ ] Run `pm2 start pm2.research.config.json`
5. [ ] Verify with `pm2 logs`
6. [ ] Wait 10 minutes
7. [ ] Check `_project/research/continuous/` for first finding
8. [ ] Convert best finding to sprint doc

---

**Status:** Ready to activate. Total setup time: 5 minutes. Total cost: $0.
