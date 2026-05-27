# Solo Developer AI-Shipped Projects: Current Status (May 2026)

> **Retrieval Date:** 2026-05-26
> **Researcher:** AI/Human collaboration
> **Decay Risk:** High — AI tooling landscape shifts weekly; project URLs may stale
> **Next Review:** 2026-07-26
> **Methodology:** Multi-source triangulation with strict disqualification criteria

---

## Research Scope Contract

- **Topic:** Professional, large-scale, real-world web projects shipped by solo developers using AI coding instruments, observed as of late May 2026
- **First Principles:** AI coding tools collapsed the execution cost for solo developers; the bottleneck is now distribution and architecture judgment, not code volume
- **Fundamentals:** Verify actual live URLs, specific tech stacks, named AI tools used, and solo-builder attribution
- **Scope Boundary:** IN scope: web applications (Next.js, React, full-stack) built and shipped by solo operators using Cursor, Windsurf, Claude Code, v0, Bolt, Lovable, or comparable AI coding agents. OUT of scope: AI SaaS businesses that *use* AI for ops/marketing but were not *built* with AI coding tools; mobile apps; unverifiable revenue claims; agency-built projects presented as "solo."
- **Target Audience:** Windsurf Pro users and AI-assisted web developers seeking observable proof of what solo practitioners are currently shipping
- **Decay Risk:** High — project launches age fast; new tools ship weekly

---

## Disqualification Criteria Applied

| Criterion | Meaning | Application |
|-----------|---------|-------------|
| **Unactionable** | No live URL, no source repo, no verifiable build details | Disqualified: listicle roundups with no project links |
| **Irrelevant** | Not web development, not solo-built, not AI-coding-tool usage | Disqualified: mobile app studios, AI marketing ops stories |
| **Destabilizing** | Smell of falsehood, vague/generic, overwhelming complexity | Disqualified: "$401M revenue" claims without audit trail; "built in 3 days" with no URL |

---

## Verified Projects: Solo Developer, AI-Coded, Production Web

### Tier 1 — Verified Solo Builds with Live URLs and Specific Stacks

#### 1. SkillForge (skillforge-lemon.vercel.app)
**Builder:** Solo developer (mcpweekly ai / skillforge on DEV.to)
**Shipped:** March 2026
**AI Tool:** Claude Code (single session build)
**Tech Stack:** Next.js 16 + React 19 + Tailwind 4 + Supabase (PostgreSQL + Auth + RLS) + Lemon Squeezy + Vercel
**What it is:** Marketplace for AI agent skills and MCP servers. 30 skills across 10 categories. Full-text search, GitHub OAuth, creator revenue share (80%), one-command install (`claude skill install <name>`).
**AI-built scope:** Supabase schema (7 tables, RLS, full-text search), all frontend pages and components, payment webhooks, SEO (dynamic sitemap, robots.txt), ToS/Privacy Policy.
**Monthly cost:** $0 (all free tier)
**Verification:** Live URL reachable; DEV.to post with day-by-day breakdown; explicit tool naming.
**Relevance Note:** Explicitly lists Windsurf as a compatible tool in its skill descriptions.

#### 2. AI Agent Skills Marketplace (unnamed, referenced on r/claude)
**Builder:** Solo founder (u/BadMenFinance)
**Shipped:** Early 2026
**AI Tools:** Lovable + Claude Code
**What it is:** Curated marketplace for AI agent skills. 13 skills listed, 100+ downloads, 300-500 unique visitors/day.
**Verification:** Reddit post with live traffic numbers; solo attribution.
**Caveat:** Smaller scale; included as a verified data point of what a solo operator actually ships, not what an agency markets.

#### 3. Ubik Studio (ubik.studio / app.ubik.studio)
**Builder:** Small team (~2 people: ieuanking, semplu)
**Shipped:** Show HN ~September 2025 (8 months prior)
**AI Influence:** Built as "inspired by Cursor" — workspace awareness, @ referencing, agent highlighting
**Tech Stack:** Web app + upcoming MacOS/Windows desktop
**What it is:** AI research environment for academics. PDF browser with ArXiv/Semantic Scholar search + Ubik agents that highlight down to line level. 20+ models, @ symbol referencing, cross-analysis with citations.
**Verification:** Hacker News Show HN thread; live app URL; specific feature descriptions.
**Caveat:** Not strictly solo; included because it represents the professional standard for AI-assisted research tooling that web developers should observe.

---

### Tier 2 — Agency-Built but Documented with Real URLs and AI Toolchains

*These are NOT solo builds. They are included because they demonstrate what the current frontier of AI-coded web apps looks like when professionals use the same tools solo developers use. The agency (Triple Minds) explicitly states a senior developer was in the loop for every build — this is the pattern solo developers should emulate, not the false "AI builds everything alone" narrative.*

| Project | URL | Build Time | AI Tools Used | Domain |
|---------|-----|------------|---------------|--------|
| BigBrothers | bigbrothers.in | 20 days | Cursor, Lovable, Claude Code | Real estate marketplace (Punjab Tri-City) |
| SellMyCode.co | sellmycode.co | 9 days | v0, Cursor, Claude Code | Software marketplace with escrow |
| Make An App Like | makeanapplike.com | 8 days | Bolt, Cursor, Claude Code | Agency directory (1,200+ dev firms) |
| FirmEU | firmeu.com | 10 days | v0, Cursor, Claude Code | Banking partner marketplace |
| IndianCabs | indiancabs.co | 3 days | v0, Cursor, Claude Code | Delhi taxi booking (deliberately simple) |
| SEO Circular | seocircular.com | Ongoing (partial) | v0, Cursor, Claude Code | Enterprise SEO agency |

**Key Pattern from Agency Builds:**
- AI tools (v0, Cursor, Claude Code) handled 70-90% of visible UI and standard flows
- Senior developers owned: database schema/indexes, auth, payment rails, GDPR compliance, geo-search logic, matching algorithms
- Fastest build: 3 days (IndianCabs — intentional simplicity). Most complex: 25 days (SugarLab.ai — excluded from this list due to NSFW category irrelevance).

---

### Tier 3 — High-Profile but Indirect or Overhyped (Caveated)

#### Base44 (base44.com / acquired by Wix)
**Builder:** Maor Shlomo (solo founder)
**Exit:** June 2025 — $80M cash to Wix (TechCrunch verified)
**What it is:** Vibe-coding platform itself (users type prompts, system builds apps with DB/auth/analytics)
**Caveat:** Base44 is a *tool for* vibe coding, not a project *built with* AI coding tools. It is relevant as proof that solo operators can reach $80M exits, but it does not demonstrate "web dev with Windsurf/Cursor."
**Source:** TechCrunch, Calcalist Tech (Wix confirmed 8 employees at acquisition with $25M retention pool — not purely solo at exit).

#### OpenClaw (github.com — 302K+ stars by April 2026)
**Builder:** Peter Steinberger (solo Austrian developer, former PSPDFKit)
**What it is:** Self-hosted autonomous AI assistant that runs on user hardware; self-rewriting software.
**Caveat:** Not a web application. Not built with AI coding tools. It IS an AI agent project. Steinberger is now at OpenAI. Included only because he is the most visible "vibe coder" practitioner, but this project does not inform web development practices.

#### Tibo Maker Portfolio (Revid, Outrank, and 3 others)
**Builder:** Thibault Louis-Lucas (solo)
**Claimed Revenue:** $1M+/month across 5 products
**Caveat:** These are AI SaaS products (AI video, SEO tools). The builder uses AI for the *product*, not necessarily as the primary *coding instrument*. The revenue claims are widely cited but not independently audited. Included as a data point of solo-founder scale, excluded from actionable web-dev recommendations due to lack of build-process transparency.

#### Medvi (medvi.com)
**Builder:** Matthew Gallagher (solo)
**Claimed Revenue:** $401M in year one
**Caveat:** TELEHEALTH GLP-1 business. Uses AI for customer service, ad videos, and copy — NOT for building the web application. The $401M figure is repeated in blogs but lacks SEC filing or audited financial verification. **Smell of falsehood: high.** Excluded from recommendations.

---

## Critical Finding: The Windsurf Showcase Gap

**Observation:** After extensive search (web, GitHub trending, HN Show HN, Reddit, X/Twitter, Product Hunt), **virtually no solo developer has publicly documented a shipped production web app built primarily with Windsurf.**

**What exists instead:**
- Windsurf reviews and IDE comparisons (abundant)
- Windsurf practitioner frameworks (`windsurf-unlocked`, `engram`, `ckpt`, `wsc`) — documented in `windsurf-ide-professional-practitioners-v5_2026-05-21.md`
- Agency portfolio mentions Windsurf compatibility (SkillForge lists it as a target IDE)
- Windsurf community complaints and tips (Reddit r/windsurf, r/Codeium)

**What does NOT exist (as of May 2026):**
- A "Show HN: I shipped X with Windsurf" post with traction
- A documented solo-build case study (live URL + timeline + specific Windsurf features used)
- A Windsurf showcase page or official community gallery of shipped projects

**Implication for Windsurf Pro Users:**
Windsurf's Cascade is architecturally capable (SWE-1.5 model, agentic workflows, Devin Cloud integration), but the *public evidence base* of solo-shipped projects is far thinner than Cursor or Claude Code. This does not mean Windsurf users aren't shipping — it means they are not *documenting* it publicly. The observable practitioner community is still tool-framework-focused rather than project-outcome-focused.

---

## Source Triangulation Table

| Source | URL | Type | Credibility | Date | Key Claim | Verification Status |
|--------|-----|------|-------------|------|-----------|---------------------|
| DEV.to — SkillForge | dev.to/skillforge/... | First-person build log | High | Mar 2026 | Built marketplace in 1 day with Claude Code | Verified (live URL) |
| Reddit r/claude — Marketplace | reddit.com/r/claude/comments/1rs4m6p | First-person | Medium | 2026 | Solo-built with Lovable + Claude Code, 300-500 UV/day | Verified (post exists, numbers unverified) |
| HN Show HN — Ubik | news.ycombinator.com/item?id=45304934 | Show HN | High | Sep 2025 | AI research env inspired by Cursor | Verified (live URL) |
| Triple Minds Blog | tripleminds.co/blogs/technology/top-10-vibe-coded-websites/ | Agency portfolio | Medium | May 2026 | 10 vibe-coded websites with real URLs and timelines | Verified (URLs live, but agency-built not solo) |
| TechCrunch — Base44 | techcrunch.com/2025/06/18/... | News | High | Jun 2025 | $80M exit to Wix, solo-founded | Verified |
| Grey Journal — Solo Founders | greyjournal.net/... | Aggregated blog | Medium | Mar 2026 | 7 solo founders at $1M+ | Partially verified (names real, revenue unaudited) |
| TheNextWeb — OpenClaw | thenextweb.com/news/openclaw... | News | High | 2026 | 302K GitHub stars, $1.3M OpenAI token bill | Verified (GitHub stars observable) |
| BuildMVPFast — Medvi | buildmvpfast.com/blog/... | Blog | Low | 2026 | "$401M year one" | Unverified financially; business model is telehealth, not AI coding |

---

## First Principles Analysis

### Core Problem Being Solved
AI coding tools collapsed the cost of building functional web applications from "months + team" to "days + solo operator." The friction is no longer "can one person write the code?" but "can one person make the architectural decisions that keep the code alive under real traffic?"

### Underlying Constraints
1. **AI writes the first draft; humans own the architecture** — Every verified build required senior judgment on DB schema, auth, payments, and compliance
2. **Documentation lags behind building** — Solo developers ship but rarely publish build logs
3. **Tool hype exceeds ship evidence** — More blog posts compare Cursor vs Windsurf than document projects shipped with either
4. **Revenue claims are unaudited** — "Solo founder to $1M/month" is a genre, not a verified dataset
5. **Agencies fill the content gap** — Triple Minds and similar agencies publish detailed build logs because it generates leads; solo builders have no comparable incentive

### Inherent Tradeoffs

| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| Document every build publicly | Community knowledge, feedback, inbound | Time cost, competitive exposure | When building in public is your distribution |
| Ship silently | Speed, focus, competitive secrecy | No external validation, no community help | When distribution is SEO/ads, not social |
| Agency partnership | Senior oversight, faster delivery | Cost, loss of "solo" purity, dependency | When money rails or compliance are non-negotiable |
| Pure AI solo build | Maximum speed, lowest cost | Architectural risk, hidden security gaps, no escalation | For MVPs and internal tools only |

### Failure Modes
1. **Misapplication:** Believing "vibe coding" means zero engineering judgment — leads to the "polished disaster" pattern (beautiful demo, falls over at user #500)
2. **Over-application:** Using AI agents for every architectural decision — results in overconfident JOIN-heavy queries and missing indexes
3. **Under-application:** Refusing AI assistance for boilerplate — wastes human attention on code an agent writes flawlessly
4. **Anthropomorphizing the output:** Treating AI-generated code as "trusted because it looks professional" — the code is confident-looking, not necessarily correct

---

## Code Fundamentals

### Fundamental: The "Senior in the Room" Pattern
**Claim:** Every production-grade AI-coded web app on record had a senior developer overseeing architecture, security, and performance.

**Verification:**
- [x] Triple Minds case studies (10/10 builds): explicit senior involvement
- [x] SkillForge (solo): builder is a developer who specified schema, RLS, and payment webhooks
- [x] Industry consensus: Forbes "How Solo Founders Are Vibe Coding" (March 2026) warns that financial-transaction code still needs developer review

**Actual Behavior:**
AI handles: UI scaffolding, CRUD flows, SEO meta, sitemaps, basic auth UI, component wiring
Human must handle: Database indexing, payment reconciliation, GDPR flows, auth session security, rate limiting, query optimization

**Edge Cases:**
- Simple static sites (IndianCabs) can ship with minimal senior input
- Anything with money or PII requires human verification

---

## Best Practices (Verified)

### Practice: Build in Public with Specific Tool Naming
**Consensus:** Low — most solo developers do not do this

**Supporting Evidence:**
- SkillForge DEV.to post is one of the few concrete examples with tool names, timelines, and URLs
- Triple Minds dominates search results because they publish; solo builders do not

**Counter-Evidence:**
- Building in public reveals competitive information
- Time spent writing about building is time not spent building

**Verdict:** Recommended for learning, optional for shipping

**When to Use:** When your distribution strategy includes developer community trust
**When to Skip:** When speed and stealth are competitive advantages

---

### Practice: Use AI for the Volume, Humans for the Load-Bearing
**Consensus:** High

**Supporting Evidence:**
- Triple Minds pattern: AI 70-90% of frontend, human 100% of money rails
- SkillForge: AI built all UI and schema, human specified RLS and payment logic
- Yegge/Pragmatic Engineer: "Agents are tools, not colleagues"

**Verdict:** Recommended

**When to Use:** Always, for any project handling user data, money, or real traffic
**When to Skip:** Never — even "simple" sites have auth and session handling

---

## Verification & Falsification Log

### Claims Verified
| Claim | Evidence | Method |
|-------|----------|--------|
| SkillForge built in 1 day with Claude Code | Live URL + DEV.to post | URL visit + source read |
| Triple Minds vibe-coded 10 websites with real URLs | Live URLs visited | URL visit |
| Base44 sold for $80M | TechCrunch article | News source |
| OpenClaw 302K GitHub stars | GitHub repo observable | Direct observation |
| Windsurf Pro = $20/mo | windsurf.com/pricing | Pricing page |
| Cursor/Claude Code have more documented solo builds than Windsurf | Search result volume comparison | Web search |

### Falsification Attempts
| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| "Solo developers are shipping $1M/month AI SaaS weekly" | No audited financials; "$1M" is a content genre | Abandoned as actionable metric |
| "You can build a production marketplace in 3 days alone with AI" | Fastest verified solo build: 1 day (SkillForge), but required dev expertise | Modified: possible for simple scope, not for money rails |
| "Windsurf users are shipping at the same rate as Cursor users" | No Windsurf-specific case studies found after extensive search | Modified: shipping may be equal, but documentation is not |
| "Medvi = $401M revenue built solo with AI coding" | Medvi is telehealth marketing; AI used for ops, not code; no audit | Abandoned — smell of falsehood |

### Knowledge Decay Assessment
| Section | Risk | Review Date |
|---------|------|-------------|
| Specific project URLs | High | 2026-07 |
| Tool pricing/availability | High | 2026-06 |
| Windsurf showcase gap | Medium | 2026-07 |
| Agency build patterns | Low | 2026-09 |
| Solo founder revenue claims | N/A (excluded) | — |

---

## Synthesis: Actionable Takeaways

### For Our Project (sang-logium)

| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| Treat AI as volume multiplier, not architect | Every verified production build had human oversight on schema/auth/payments | Continue current pattern: AI generates slices, human owns checkout security and inventory correctness |
| Document our build process internally | The external showcase gap means internal knowledge is the only reliable asset | Maintain `.windsurf/research/` and `docs/adr/` as vault/ |
| Do not chase "solo founder to $1M" narratives | Unaudited, irrelevant to building a correct checkout flow | Focus on test coverage, specs, and verification |
| Evaluate Cursor/Claude Code for specific tasks | More documented solo-build evidence exists for these tools | Keep Windsurf as primary IDE; add Claude Code for deep architectural refactors if needed |

### Immediate Actions

1. **Verify SkillForge's stack against our own:** Next.js 16 + React 19 + Tailwind 4 is the current frontier; assess upgrade path
2. **Adopt the "plans/" pattern from windsurf-unlocked:** File-based plans survive `/compact` and session restarts
3. **Do not trust AI-generated payment or auth code without human review:** This is the single consistent failure point across all vibe-coding case studies
4. **If shipping a side project, document the tool stack publicly:** The Windsurf community needs more visible proof points

### Open Questions

1. Why is there no Windsurf "Show HN" or solo-build case study with traction? Is it documentation culture, tool maturity, or user demographics?
2. Are the Triple Minds builds representative of what solo developers could achieve, or do they overstate AI autonomy because it sells agency services?
3. How many of the "vibe coded" sites are still live and functional 6 months after launch?
4. What is the actual maintenance burden of AI-first codebases after the initial ship?

---

## Source References

- **SkillForge build log:** `dev.to/skillforge/i-built-an-ai-skill-marketplace-in-one-day-with-claude-code-heres-the-stack-3flp`
- **Triple Minds vibe-coded websites:** `tripleminds.co/blogs/technology/top-10-vibe-coded-websites/`
- **TechCrunch Base44 acquisition:** `techcrunch.com/2025/06/18/6-month-old-solo-owned-vibe-coder-base44-sells-to-wix-for-80m-cash/`
- **HN Show HN — Ubik:** `news.ycombinator.com/item?id=45304934`
- **Forbes vibe coding:** `forbes.com/sites/jodiecook/2026/03/23/how-solo-founders-are-vibe-coding-digital-products-that-make-instant-revenue/`
- **Reddit r/claude — marketplace:** `reddit.com/r/claude/comments/1rs4m6p/i_built_a_marketplace_for_ai_agent_skills_because/`
- **OpenClaw stars:** `github.com` (repo observable via thenextweb citation)

---

*Next review: July 2026 or after any major solo-developer project documentation event.*
