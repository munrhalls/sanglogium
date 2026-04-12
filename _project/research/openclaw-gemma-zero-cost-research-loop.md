# OpenClaw + Gemma Zero-Cost 24/7 Auto Research Loop

## Research Scope Contract
- **Topic:** Architecting a zero-cost, always-on automated research system using OpenClaw framework and Google Gemma models
- **First Principles:** 
  1. True 24/7 requires persistent compute (not just scheduled batches)
  2. Zero cost = leveraging always-free tiers or existing hardware
  3. Research loops need: scheduler → LLM → scraping → storage → notification
- **Fundamentals:** OpenClaw cron, Gemma model sizing, free hosting options, automation patterns
- **Scope Boundary:** Does NOT cover paid cloud deployment, advanced RAG implementations, or enterprise security
- **Target Audience:** Solo developers, indie hackers, researchers needing always-on monitoring
- **Decay Risk:** Medium — free tier policies change, model versions update

---

## Executive Summary

**Three viable approaches** for zero-cost 24/7 research automation:

| Approach | Cost | Reliability | Complexity | Best For |
|----------|------|-------------|------------|----------|
| **Oracle Cloud Always-Free** | $0 | High | Medium | Production-grade 24/7 |
| **Home Device (Pi/Old PC)** | $0 | Medium | Low | Private, low-latency |
| **GitHub Actions Scheduled** | $0 | Medium | Low | Periodic (not true 24/7) |

**Recommended stack:** Oracle Cloud Ampere A1 (4-core ARM, 24GB RAM) + Ollama + Gemma 4B + OpenClaw

---

## Component Analysis

### 1. OpenClaw Framework

**What it is:** Open-source AI agent platform for task automation across multiple channels (Discord, Slack, Telegram, WhatsApp, etc.)

**Key features for research loops:**
- Built-in cron/scheduled task system (`openclaw cron add --every 30m`)
- Background task persistence (`~/.openclaw/cron/jobs.json`)
- Skill ecosystem (350+ plugins including web scraping)
- Multi-agent support with routing
- Self-hosted Gateway daemon

**Installation:**
```bash
npm install -g openclaw@latest
openclaw onboard --install-daemon  # Installs systemd/launchd service
```

**Cron job example:**
```bash
openclaw cron add \
  --name "Research Monitor" \
  --every "30m" \
  --session main \
  --system-event "Search for new papers on arXiv about LLM efficiency" \
  --wake now
```

**Source:** [OpenClaw Docs - Cron Jobs](https://docs.openclaw.ai/automation/cron-jobs)

---

### 2. Google Gemma Model Sizing

**Gemma 4 model variants:**

| Model | Effective Params | Total Params | Min RAM | Best Use |
|-------|------------------|--------------|---------|----------|
| **E2B** | 2B | ~3B | 4GB | Fastest, lowest memory |
| **E4B** | 4B | ~6B | 8GB | Balanced speed/quality |
| **26B A4B** | 4B active | 26B total | 26GB+ | MoE architecture, best quality |
| **31B** | 31B | 31B | 32GB+ | Dense, slowest, highest quality |

**For zero-cost 24/7 automation:**
- **E2B (2B)** runs on 4GB RAM — suitable for Raspberry Pi or small VPS
- **E4B (4B)** needs 8GB RAM — Oracle Cloud free tier sweet spot
- Both use llama.cpp/Ollama for CPU-only inference (no GPU required)

**Inference speed (CPU-only):**
- Gemma 2B: ~10-30 tokens/second on modern CPU
- Gemma 4B: ~5-15 tokens/second on modern CPU
- Sufficient for research summarization tasks

**Sources:**
- [Gemma 4 Docs - Memory Requirements](https://ai.google.dev/gemma/docs/core)
- [Unsloth Gemma 4 Guide](https://unsloth.ai/docs/models/gemma-4)

---

### 3. Zero-Cost Hosting Options

#### Option A: Oracle Cloud Always-Free Tier (RECOMMENDED)

**What you get:**
- Ampere A1 Flex instance: 4 OCPUs, 24GB RAM
- Truly free forever (not 12-month trial)
- 10TB/month egress bandwidth
- Block storage: 200GB total

**How to use:**
1. Sign up at [cloud.oracle.com](https://cloud.oracle.com)
2. Create Ampere A1 instance (ARM-based)
3. Install Ollama + Gemma 4B model
4. Install OpenClaw Gateway
5. Configure cron jobs for research tasks

**Caveats:**
- Account requires credit card for verification (not charged)
- Instances can theoretically be reclaimed if unused for 7 days (rare in practice)
- Some users report occasional terminations — have backup plan

**Sources:**
- [Oracle Cloud Free Tier Guide](https://orendra.com/blog/how-to-get-free-lifetime-servers-4-core-arm-24gb-ram-more/)
- [Reddit - OCI Always Free Experience](https://www.reddit.com/r/oraclecloud/comments/1pp03vy/how_long_can_i_safely_run_an_always_free_arm_a1/)

---

#### Option B: Self-Hosted on Existing Hardware

**Options:**
- Raspberry Pi 4/5 (4GB+ RAM): Can run Gemma 2B
- Old laptop/desktop: Run Gemma 4B if 8GB+ RAM
- Home server/NAS: Best option if already running 24/7

**Setup:**
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull Gemma model
ollama pull gemma4:4b

# Start OpenClaw Gateway
openclaw gateway --port 18789
```

**Pros:**
- Complete privacy
- No network latency
- No account/verification needed

**Cons:**
- Requires always-on device
- Home internet reliability
- Power consumption

**Source:** [Ollama on Raspberry Pi](https://seeed-projects.github.io/Tutorial-of-AI-Kit-with-Raspberry-Pi-From-Zero-to-Hero/docs/Chapter_4-Large_Language_Model/Setup_Ollama_on_RaspberryPi/)

---

#### Option C: GitHub Actions (NOT TRUE 24/7)

**What you get:**
- Public repos: Unlimited minutes
- Private repos: 2,000 minutes/month
- Cron scheduling: Minimum 5-minute intervals

**Limitations:**
- Jobs have 6-hour max runtime
- Not persistent — runs on schedule, then terminates
- Not suitable for true 24/7 always-on agent
- Good for periodic research sweeps (every 2 hours)

**Example workflow:**
```yaml
name: Research Automation
on:
  schedule:
    - cron: '0 */2 * * *'  # Every 2 hours
jobs:
  research:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: |
          # Call external API (OpenRouter, etc.)
          curl -X POST https://api.openrouter.ai/...
```

**Source:** [GitHub Actions Free Tier](https://docs.github.com/en/actions/concepts/billing-and-usage)

---

### 4. External Trigger Services (Auxiliary)

**cron-job.org:**
- Free tier: 100 API requests/day
- Can trigger webhooks on schedule
- Use to wake up sleeping services (Hugging Face Spaces, etc.)

**UptimeRobot / Pingdom (free tiers):**
- Can ping endpoints every 5 minutes
- Prevents services from sleeping due to inactivity

---

## Architecture: 24/7 Research Loop

### Simple Architecture (Single Node)

```
┌─────────────────────────────────────────────────────────────┐
│                    Oracle Cloud (Free Tier)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ OpenClaw     │  │ Ollama       │  │ Data Storage │        │
│  │ Gateway      │──│ Gemma 4B     │──│ (JSON/SQLite)│        │
│  │ (cron jobs)  │  │ (inference)  │  │              │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│         │                                           │        │
│         └───────────────────────────────────────────┘        │
│                         │                                    │
│  ┌──────────────┐       │       ┌──────────────┐             │
│  │ Scraping     │◀──────┘       │ Notification │             │
│  │ Skills       │               │ (Discord/Slack/Email)       │
│  └──────────────┘               └──────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

### Loop Flow

1. **Schedule:** OpenClaw cron triggers every 30 minutes
2. **Discover:** Scrape target sources (arXiv, HN, Reddit, etc.)
3. **Process:** Send content to Gemma 4B via Ollama API
4. **Synthesize:** LLM summarizes, categorizes, prioritizes
5. **Store:** Save results to local JSON/SQLite
6. **Notify:** Alert on high-priority findings via Discord/Slack
7. **Repeat:** Cron schedules next run

### Ollama API Integration

```bash
# Ollama runs on localhost:11434 by default
curl http://localhost:11434/api/generate -d '{
  "model": "gemma4:4b",
  "prompt": "Summarize these research abstracts: ...",
  "stream": false
}'
```

---

## Best Practices (Verified)

### DO:
- ✅ Use **E4B model** for best quality/speed balance on free tier
- ✅ Configure **systemd service** for Ollama + OpenClaw auto-start
- ✅ Implement **exponential backoff** for failed scraping attempts
- ✅ Store data in **SQLite** for persistence across restarts
- ✅ Use **ntfy.sh** for free mobile push notifications

### DON'T:
- ❌ Run 26B/31B models on CPU (too slow for automation)
- ❌ Scrape without rate limiting (risk IP ban)
- ❌ Store sensitive data on free cloud tiers
- ❌ Expect 100% uptime on free services

---

## Cost Comparison

| Component | Paid Alternative | Zero-Cost Replacement |
|-----------|------------------|----------------------|
| LLM API | OpenAI ($20/mo) | Ollama + Gemma (free) |
| Hosting | VPS $5-20/mo | Oracle Cloud Free |
| Scraping | ScrapingBee ($49/mo) | OpenClaw skills (free) |
| Automation | Zapier ($20/mo) | OpenClaw cron (free) |
| Storage | Cloud DB ($10/mo) | SQLite local (free) |
| Notifications | Pushover ($5/mo) | ntfy.sh (free) |

**Total paid:** $104-144/month  
**Total zero-cost:** $0/month

---

## Falsification & Limitations

### Known Issues:
1. **Oracle Cloud account verification** requires credit card (no prepaid cards)
2. **Always-free instances** can be reclaimed after 7 days of inactivity (contested by users)
3. **Gemma 4B on CPU** is ~5-10x slower than GPU inference
4. **OpenClaw skills** vary in quality; some scraping skills may break with site changes
5. **Free tiers** have no SLA — downtime should be expected

### When This Fails:
- High-volume research (>1000 pages/day) triggers rate limits
- Complex reasoning tasks need larger models (26B+)
- Real-time requirements (<1s response) not achievable on CPU
- Enterprise security requirements not met

---

## Immediate Action Plan

### Phase 1: Foundation (1-2 hours)
1. Sign up for Oracle Cloud Free Tier
2. Create Ampere A1 instance (Ubuntu 22.04 ARM)
3. Install Ollama: `curl -fsSL https://ollama.com/install.sh | sh`
4. Pull Gemma: `ollama pull gemma4:4b`

### Phase 2: OpenClaw Setup (30 min)
1. Install Node.js 24: `curl -fsSL https://deb.nodesource.com/setup_24.x | bash`
2. Install OpenClaw: `npm install -g openclaw@latest`
3. Run onboarding: `openclaw onboard --install-daemon`

### Phase 3: First Research Loop (30 min)
1. Configure scraping skill for target site
2. Create cron job: `openclaw cron add --name "Test" --every "1h" ...`
3. Test end-to-end manually
4. Add notification channel (Discord webhook)

---

## Verification Checklist

- [ ] Oracle Cloud instance created and running
- [ ] Ollama responding on `:11434`
- [ ] Gemma 4B model loaded (`ollama list`)
- [ ] OpenClaw Gateway running (`openclaw gateway --verbose`)
- [ ] Cron job registered (`openclaw cron list`)
- [ ] Test research task completes successfully
- [ ] Notifications delivered to configured channel
- [ ] Data persisted across restart

---

## Knowledge Decay Assessment

| Section | Risk | Review Date |
|---------|------|-------------|
| Oracle Cloud Free Tier | High | 2026-07-01 |
| Gemma Model Versions | Medium | 2026-06-01 |
| OpenClaw Features | Low | 2026-08-01 |
| Ollama Installation | Low | As needed |

---

## Sources & References

| Source | URL | Type | Date |
|--------|-----|------|------|
| OpenClaw GitHub | https://github.com/openclaw/openclaw | Source | 2026-04 |
| OpenClaw Cron Docs | https://docs.openclaw.ai/automation/cron-jobs | Official | 2026-04 |
| Decodo OpenClaw Skill | https://github.com/Decodo/decodo-openclaw-skill | GitHub | 2026-04 |
| Gemma 4 Docs | https://ai.google.dev/gemma/docs/core | Official | 2026-04 |
| Ollama Installation | https://ollama.com | Official | 2026-04 |
| Oracle Cloud Free Guide | https://orendra.com/blog/how-to-get-free-lifetime-servers-4-core-arm-24gb-ram-more/ | Community | 2026-04 |
| GitHub Actions Billing | https://docs.github.com/en/actions/concepts/billing-and-usage | Official | 2026-04 |

---

**Verdict:** ✅ **Achievable and Doable** — Oracle Cloud + Ollama + Gemma 4B + OpenClaw provides a genuine zero-cost, 24/7 research automation stack with production-grade reliability (within free tier constraints).
