# Web Scraping Feasibility Report: Product Inventory Expansion

**Date:** 2026-04-02  
**Context:** sang-logium e-commerce product inventory gap analysis  
**Research Focus:** Automated product data acquisition via web scraping  

---

## Executive Summary

| Question | Answer |
|----------|--------|
| **Feasible?** | ✅ Yes, technically feasible with caveats |
| **Automatable?** | ⚠️ Partially — requires human-in-the-loop for compliance |
| **How?** | Multi-source approach: APIs → Affiliate feeds → Ethical scraping |
| **Timeline** | 2-4 weeks for MVP pipeline |
| **Risk Level** | Medium-High (legal/ethical considerations) |

**Verdict:** Web scraping is technically straightforward but legally complex. A **hybrid approach** combining affiliate APIs, legitimate data feeds, and selective ethical scraping provides the best risk/reward ratio.

---

## Current State Analysis

### Inventory Gap (Verified from `all_products.csv`)

| Catalogue Leaf Slot | Current Products | Target | Gap |
|---------------------|------------------|--------|-----|
| Open-Back Headphones | ~6 visible | 30-40 | **~30 short** |
| Closed-Back Headphones | Unknown | 30-40 | Unknown |
| Planar Magnetic | Unknown | 30-40 | Unknown |
| IEMs | Unknown | 30-40 | Unknown |
| **Total Products in System** | **~780** | ~2000+ | **~1200 short** |

**Critical Finding:** Current products in `all_products.csv` are heavily skewed toward cables and accessories, not headphones/audio electronics.

### Existing Data Infrastructure

| Component | Status | Notes |
|-----------|--------|-------|
| Sanity CMS | ✅ Active | Product schema supports: name, brand, price, image, specs, catalogueLocationKeys |
| Image Pipeline | ✅ Python-based | `scripts/image-pipeline/` — fetches from Sanity, removes backgrounds |
| VFS (Catalogue) | ⚠️ Partial | 25 leaf slots defined, some with ID mapping issues |
| Product Import | ❌ None | No external scraping infrastructure exists |

---

## Research: Data Source Landscape

### Tier 1: Legitimate APIs (RECOMMENDED)

| Source | Data Available | Rate Limits | Auth Required | Cost |
|--------|---------------|-------------|---------------|------|
| **Rakuten/LinkShare APIs** | Products, prices, images | Varies by program | Yes (affiliate) | Free with commission |
| **CJ Affiliate API** | Product catalog feeds | Program-specific | Yes (approved) | Free |
| **Impact.com API** | Partner product data | Varies | Yes | Free |
| **Awin API** | European retailers | 1000 req/day | Yes | Free |

**Pros:** Legal, structured data, images included, price tracking  
**Cons:** Requires affiliate program approval, limited to partnered brands

### Tier 2: Retailer Data Feeds (CONDITIONAL)

| Retailer | Feed Type | Coverage | Access Method |
|----------|-----------|----------|---------------|
| **Headphones.com** | None public | N/A | Would require partnership |
| **Schiit Audio** | None public | N/A | Direct manufacturer contact |
| **Drop (Massdrop)** | Limited API | Group buys only | Developer API exists |
| **Amazon Product API** | PA-API 5.0 | Broad | Requires sales history |

**Pros:** Direct from retailers, accurate pricing  
**Cons:** Most high-end audio retailers don't offer public APIs

### Tier 3: Ethical Scraping (SELECTIVE USE)

| Target | Technical Difficulty | Legal Risk | Value |
|--------|---------------------|------------|-------|
| **Manufacturer sites** (Sennheiser, Audeze, etc.) | Low-Medium | Low* | High (specs, images) |
| **Review sites** (Head-Fi, What Hi-Fi) | Medium | Medium | Medium (reviews, rankings) |
| **Retailer catalog pages** | Low | **HIGH** ⚠️ | High (but legally risky) |
| **YouTube video descriptions** | Medium | Low | Low (supplemental data) |

*Low risk when: robots.txt allows, no ToS violation, rate-limited, non-competitive use

---

## Technical Feasibility Analysis

### Playwright-Based Scraping Architecture

```
┌─────────────────────────────────────────────────────────┐
│           sang-logium-data (new workspace)              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────┐  │
│  │   Source A   │    │   Source B   │    │ Source C │  │
│  │  (Rakuten)   │    │  (Scraper)   │    │  (Manual)│  │
│  └──────┬───────┘    └──────┬───────┘    └────┬─────┘  │
│         │                   │                   │       │
│         └───────────────────┼───────────────────┘       │
│                             │                         │
│                    ┌────────▼────────┐                │
│                    │  Data Normalizer │                │
│                    │  (brand mapping,  │                │
│                    │   spec standardize)│                │
│                    └────────┬────────┘                │
│                             │                         │
│                    ┌────────▼────────┐                │
│                    │  Sanity Import   │                │
│                    │  (batch upload)  │                │
│                    └────────┬────────┘                │
│                             │                         │
│                    ┌────────▼────────┐                │
│                    │  Image Pipeline  │                │
│                    │  (existing)      │                │
│                    └─────────────────┘                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Required Components (Greenfield)

| Component | Purpose | Effort | Priority |
|-----------|---------|--------|----------|
| **Source Adapters** | API clients + scrapers | 3-4 days | P0 |
| **Data Normalizer** | Schema mapping to Sanity format | 2 days | P0 |
| **Deduplication Engine** | Prevent duplicate products | 1 day | P1 |
| **Image Downloader** | Fetch + cache external images | 2 days | P1 |
| **Sanity Import API** | Batch upload with transactions | 2 days | P0 |
| **Rate Limiter** | Respectful scraping (1 req/sec) | 1 day | P0 |
| **Monitoring Dashboard** | Track import progress | 2 days | P2 |

### Technology Stack Recommendation

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Runtime** | Node.js + TypeScript | Consistent with main project |
| **Scraping** | Playwright | Browser automation, handles JS sites |
| **API Clients** | Native fetch + retry logic | Simple, no heavy dependencies |
| **Data Validation** | Zod | Schema validation for scraped data |
| **Queue System** | p-queue or bullmq | Rate limiting + concurrency control |
| **Storage** | SQLite (local) | Product staging before Sanity import |
| **Images** | Sharp | Resize, format conversion |
| **Sanity SDK** | `@sanity/client` | Official, well-supported |

---

## Legal & Ethical Framework

### Compliance Checklist

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| **robots.txt respect** | Required | Parse and obey crawl-delay, disallow |
| **ToS review** | Required | Document permission for each source |
| **Rate limiting** | Required | Max 1 req/sec per domain |
| **User-agent identification** | Required | Clear bot identification |
| **No competitive harm** | Required | Don't undercut source pricing |
| **Data minimization** | Required | Only scrape what's needed |
| **Attribution** | Recommended | Link back to source where possible |

### Risk Assessment by Source Type

| Source Type | Legal Risk | Mitigation |
|-------------|------------|------------|
| Affiliate APIs | ✅ Minimal | Terms of service compliant |
| Manufacturer specs | ✅ Low | Facts not copyrightable |
| Public reviews | ✅ Low | Fair use / factual data |
| Retailer scraping | ⚠️ Medium-High | Check ToS, implement slowly |
| Pricing data | ❌ High | May violate ToS, competitive harm |

**Red Lines (NEVER):**
- Scraping Amazon (aggressive IP blocking, legal action)
- Scraping competitor e-commerce sites with pricing
- Ignoring robots.txt
- Scraping at high frequency (>1 req/sec)
- Using scraped data for price undercutting

---

## Automation Potential

### What CAN Be Automated

| Task | Automation Level | Human Touchpoint |
|------|-----------------|------------------|
| Data fetching from APIs | 100% | Source approval only |
| Manufacturer spec scraping | 90% | Brand approval verification |
| Data normalization | 95% | Edge case review |
| Image downloading | 100% | Quality spot-checks |
| Sanity import | 100% | Pre-import preview |
| Deduplication | 90% | Manual merge decisions |

### What REQUIRES Human-in-the-Loop

| Task | Reason | Frequency |
|------|--------|-----------|
| **Brand mapping** | Scraped brand names ≠ Sanity brand refs | Every new brand |
| **Catalogue slot assignment** | VFS keys must be manually chosen | Per product category |
| **Price validation** | Sanity prices must match Stripe | Per batch |
| **Image quality review** | Ensure professional product shots | Spot-check 10% |
| **Spec standardization** | Normalize "Frequency Response" formats | Per product type |
| **Stripe product creation** | Requires manual price setup | Per product |

### Automation Architecture

```
Scheduled (Daily/Weekly)
    │
    ▼
┌─────────────────┐
│  Source Crawler │ ──► Staging DB (SQLite)
│  (Playwright)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  Normalization  │────►│  Human Review   │
│  Pipeline       │     │  Queue (UI TBD) │
└─────────────────┘     └────────┬────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ▼            ▼            ▼
              ┌─────────┐  ┌─────────┐  ┌─────────┐
              │ Approve │  │  Edit   │  │ Reject  │
              │  ► Import│  │  ► Queue│  │  ► Log  │
              └─────────┘  └─────────┘  └─────────┘
```

---

## Implementation Recommendations

### Phase 1: Foundation (Week 1)

1. **Set up sang-logium-data workspace**
   - Initialize Node.js + TypeScript project
   - Install Playwright, Zod, @sanity/client
   - Configure development environment

2. **Implement affiliate API integrations**
   - Start with Rakuten/LinkShare (if you have affiliate accounts)
   - Build generic adapter pattern for future sources

3. **Create data normalization layer**
   - Map external product schemas to Sanity format
   - Build brand name → Sanity brand reference mapper

### Phase 2: Scraping (Week 2)

1. **Select 2-3 manufacturer websites**
   - Verify robots.txt allows scraping
   - Document ToS compliance
   - Build Playwright scrapers with rate limiting

2. **Implement staging database**
   - SQLite for product staging
   - Deduplication logic (by SKU + brand)

3. **Image pipeline integration**
   - Download external images
   - Process through existing background removal pipeline

### Phase 3: Import (Week 3)

1. **Sanity import API**
   - Batch upload with transactions
   - Error handling + rollback
   - Image asset creation

2. **Human review UI (minimal)**
   - Simple table view of staged products
   - Approve/reject/edit actions
   - Bulk operations

### Phase 4: Automation (Week 4)

1. **Scheduling**
   - Daily sync for APIs
   - Weekly scrape for manufacturers
   - Monitoring/alerting

2. **Monitoring dashboard**
   - Products added/updated counts
   - Error rates by source
   - Queue status

---

## Cost Analysis

| Category | Estimated Cost | Notes |
|----------|----------------|-------|
| **Development time** | 80-120 hours | 2-3 weeks full-time |
| **Infrastructure** | $0-50/month | Local SQLite, minimal cloud |
| **Proxy/VPN (optional)** | $50-100/month | For high-volume scraping |
| **Affiliate program fees** | $0 | Free to join |
| **Playwright browsers** | $0 | Open source |
| **Sanity API usage** | Negligible | Within free tier |

**Total First-Year Cost:** ~$600-1200 (mostly development time valued)

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Source blocks scraper** | Medium | Medium | Proxy rotation, rate limiting, human mimicry |
| **Legal cease & desist** | Low | High | Strict ToS compliance, robots.txt respect |
| **Data quality issues** | High | Medium | Human review gate, validation rules |
| **Duplicate products** | Medium | Medium | Deduplication engine, SKU matching |
| **Stripe price mismatch** | Medium | High | Validation workflow before import |
| **Image copyright issues** | Medium | Medium | Use manufacturer-provided images only |

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Products imported/month** | 200+ | Via dashboard |
| **Data accuracy** | >95% | Manual spot-checks |
| **Source uptime** | >90% | Health checks |
| **Human review time** | <5 min/product | Time tracking |
| **Duplicate rate** | <2% | Automated detection |

---

## Final Verdict

### Feasibility: ✅ YES

Web scraping for product inventory expansion is **technically straightforward** with Playwright and Node.js. The sang-logium project already has Python infrastructure for image processing that can be reused.

### Automatable: ⚠️ PARTIALLY

- **80% automatable:** Data fetching, normalization, image processing
- **20% requires human touch:** Brand mapping, catalogue assignment, price validation, quality review

### Recommended Approach

**Hybrid Model:**
1. **Primary:** Affiliate APIs (Rakuten, CJ, Awin) — fully automated, legal
2. **Secondary:** Manufacturer website scraping (selective, ethical) — human approval gate
3. **Tertiary:** Manual curation for premium/flagship products

**NOT Recommended:**
- Aggressive scraping of retailer sites (legal risk)
- Automated price undercutting (business ethics)
- Unattended full automation (data quality risk)

---

## Next Steps

1. **Decision point:** Approve/deny web scraping approach
2. **If approved:** Prioritize affiliate API partnerships (apply to Rakuten, CJ)
3. **If approved:** Select 2-3 manufacturer sites for ethical scraping pilot
4. **Create sprint:** "Product Data Import Pipeline" with 2-week scope

---

## Sources Consulted

| Source | Type | Date | Key Finding |
|--------|------|------|-------------|
| `all_products.csv` | Ground truth | 2026-04-02 | ~780 products, skewed toward cables |
| `catalogue-index.json` | Ground truth | 2026-04-02 | 25 leaf slots need filling |
| `sanity/schemaTypes/productType.ts` | Ground truth | 2026-04-02 | Schema supports required fields |
| `scripts/image-pipeline/` | Ground truth | 2026-04-02 | Existing Python infrastructure |
| Playwright docs | Official | 2026-04-02 | Browser automation capabilities |
| Common affiliate program terms | Industry | 2026-04-02 | API access typically free |

---

**Report prepared for sprint planning consideration.**
