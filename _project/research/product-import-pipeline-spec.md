# Product Import Pipeline — Simple & Robust Architecture

**Date:** 2026-04-02  
**Purpose:** Human-in-the-loop product scraping → validation → Sanity upload  
**Scope:** Minimal viable pipeline with 5 stages

---

## Pipeline Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    sang-logium-data (neighboring workspace)                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌─────────┐  │
│  │   PLAN   │ → │  SCRAPE  │ → │TRANSFORM │ → │ VALIDATE │ → │  UPLOAD │  │
│  │          │   │          │   │          │   │          │   │         │  │
│  │ Human    │   │ Automated│   │ Automated│   │ Human    │   │ Human   │  │
│  │ reviews  │   │ (batches)│   │ + checks │   │ reviews  │   │ approves│  │
│  │ scraper  │   │          │   │ schema   │   │ data     │   │ batch   │  │
│  │ configs  │   │          │   │ integrity│   │ integrity│   │ upload  │  │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘   └─────────┘  │
│       ↑                                                        ↓            │
│       └────────────────────────────────────────────────────────┘            │
│                         (feedback loop for rejects)                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Stage 1: PLAN — Scraper Configuration

### Purpose
Human defines WHAT to scrape, FROM WHERE, with WHAT rules.

### Data Structure: `ScrapePlan`

```typescript
// plans/sennheiser-headphones.plan.json
{
  "planId": "sennheiser-openback-2026-04",
  "source": {
    "name": "Sennheiser Official",
    "baseUrl": "https://www.sennheiser.com",
    "type": "manufacturer",
    "robotsTxtRespected": true,
    "tosCompliant": true
  },
  "target": {
    "catalogueSlug": "open-back",        // ← Human assigns
    "catalogueId": "o7c6baiuobsr7ni2y2vf22sh"  // ← Auto-resolved from catalogue-index.json
  },
  "selectors": {
    "productList": ".product-grid-item",
    "productName": ".product-title",
    "productPrice": ".product-price",
    "productImage": ".product-image img",
    "productUrl": ".product-link",
    "nextPage": ".pagination-next"
  },
  "constraints": {
    "maxProducts": 10,                    // ← Small batches for review
    "rateLimit": 1000,                    // ← ms between requests
    "maxPages": 2
  },
  "transformRules": {
    "priceCurrency": "USD",
    "imageQuality": "high",
    "requiredFields": ["name", "price", "image"]
  },
  "status": "pending",                    // pending | approved | rejected
  "createdAt": "2026-04-02T09:00:00Z",
  "reviewedBy": null
}
```

### Review Workflow

1. **Create plan** → Save to `plans/[plan-id].plan.json`
2. **Review plan** → Human checks selectors, constraints, target catalogue
3. **Approve/Reject** → Set `status` field
4. **Only approved plans proceed to Scrape stage**

### File Location
```
plans/
  ├── sennheiser-openback-2026-04.plan.json
  ├── audeze-planar-2026-04.plan.json
  └── templates/
      └── manufacturer-default.template.json
```

---

## Stage 2: SCRAPE — Batch Execution

### Purpose
Execute approved plans, fetch raw product data in small batches.

### Data Structure: `ScrapedBatch`

```typescript
// scraped/sennheiser-openback-2026-04/batch-001.json
{
  "batchId": "sennheiser-openback-2026-04-001",
  "planId": "sennheiser-openback-2026-04",
  "scrapedAt": "2026-04-02T10:30:00Z",
  "status": "pending_review",             // pending_review | approved | rejected | transformed
  
  "metadata": {
    "sourceUrl": "https://www.sennheiser.com/headphones",
    "productsFound": 10,
    "productsScraped": 8,
    "errors": 2,
    "durationMs": 15400
  },
  
  "products": [
    {
      "_scrapedId": "raw-001",            // Internal ID for tracking
      "sourceUrl": "https://www.sennheiser.com/product/abc123",
      "sourceId": "abc123",               // SKU or product ID from source
      
      // Raw scraped data (unchanged)
      "raw": {
        "name": "HD 800 S",
        "price": "$1,699.95",
        "image": "https://.../hd800s.jpg",
        "description": "The HD 800 S...",
        "specifications": {
          "frequencyResponse": "4 - 51,000 Hz",
          "impedance": "300 Ω"
        }
      },
      
      // Transformation will fill these
      "transformed": null,
      "validation": null
    }
  ],
  
  "errors": [
    {
      "productIndex": 3,
      "error": "Price selector returned empty",
      "url": "https://..."
    }
  ]
}
```

### Execution Model

```typescript
// src/scrape/executePlan.ts
async function executePlan(plan: ScrapePlan): Promise<ScrapedBatch> {
  // 1. Validate plan approved
  if (plan.status !== 'approved') {
    throw new Error('Plan not approved');
  }
  
  // 2. Rate-limited Playwright execution
  const browser = await chromium.launch();
  const products: RawProduct[] = [];
  
  for (const url of plan.urls) {
    await rateLimit(plan.constraints.rateLimit);
    const page = await browser.newPage();
    const raw = await scrapeProduct(page, plan.selectors);
    products.push(raw);
  }
  
  // 3. Save batch with pending_review status
  return saveBatch({
    batchId: generateBatchId(plan.planId),
    planId: plan.planId,
    status: 'pending_review',
    products: products.map(p => ({ raw: p, transformed: null }))
  });
}
```

### File Location
```
scraped/
  └── [plan-id]/
      ├── batch-001.json
      ├── batch-002.json
      └── batch-001/                    // Downloaded images
          ├── hd800s-source.jpg
          └── hd650-source.jpg
```

---

## Stage 3: TRANSFORM — Schema Normalization

### Purpose
Convert raw scraped data into Sanity-compatible format with data integrity checks.

### Data Structure: `TransformedProduct`

```typescript
// Transformed data attached to each product in batch
{
  "_scrapedId": "raw-001",
  
  "transformed": {
    // Core Sanity fields (REQUIRED)
    "name": "HD 800 S",                 // Cleaned, validated
    "slug": "hd-800-s",                  // Auto-generated from name
    "sku": "HD800S",                     // From source or generated
    "displayPrice": 1699.95,             // Parsed from "$1,699.95"
    
    // Brand handling (CRITICAL)
    "brand": {
      "sourceName": "Sennheiser",        // As scraped
      "sanityBrandId": null,             // Resolved in validation stage
      "sanityBrandName": null,           // After brand mapping
      "isNewBrand": false                // Flag for review
    },
    
    // Catalogue assignment (CRITICAL)
    "catalogueLocationKeys": [
      "o7c6baiuobsr7ni2y2vf22sh"        // Resolved from plan.target.catalogueId
    ],
    
    // Stripe (must be created manually later)
    "stripePriceId": "PENDING_MANUAL",     // Placeholder
    
    // Media
    "image": {
      "sourceUrl": "https://.../hd800s.jpg",
      "localPath": "scraped/.../hd800s-source.jpg",
      "sanityAssetId": null              // Filled during upload
    },
    
    // Optional fields
    "description": "The HD 800 S...",
    "specifications": [
      { "title": "Frequency Response", "value": "4 - 51,000 Hz" },
      { "title": "Impedance", "value": "300 Ω" }
    ],
    "overviewFields": [
      { "title": "Type", "value": "Open-Back", "information": "Design type" }
    ]
  },
  
  "transformLog": [
    { "field": "price", "from": "$1,699.95", "to": 1699.95, "rule": "parseCurrency" },
    { "field": "slug", "from": "HD 800 S", "to": "hd-800-s", "rule": "slugify" },
    { "field": "catalogueLocationKeys", "from": "open-back", "to": "o7c6baiuobsr7ni2y2vf22sh", "rule": "catalogueMap" }
  ],
  
  "integrityChecks": {
    "schemaCompliant": true,             // Required fields present?
    "brandResolvable": false,              // Brand exists in Sanity?
    "priceValid": true,                  // Numeric, > 0?
    "imageDownloaded": true,             // Local file exists?
    "skuUnique": null                    // Checked vs CMS in validation stage
  }
}
```

### Transformation Rules

| Raw Field | Transformation | Output | Validation |
|-----------|---------------|--------|------------|
| `price` | Parse currency | `displayPrice: number` | Must be > 0 |
| `name` | Trim, normalize | `name: string` | Required, length > 2 |
| `source brand` | Map to Sanity brand | `brand.sanityBrandId` | Must resolve |
| `catalogue slug` | Map to catalogueId | `catalogueLocationKeys[0]` | Must exist in index |
| `image url` | Download + validate | `image.localPath` | Must be < 10MB, valid format |
| `sku` | Use source or generate | `sku: string` | Must be unique |
| `description` | Clean HTML | `description: string` | Optional |
| `specs` | Normalize keys | `specifications: array` | Optional |

### Data Integrity Engine

```typescript
// src/transform/integrityChecks.ts
interface IntegrityReport {
  productId: string;
  checks: {
    // Schema compliance (Sanity requirements)
    hasRequiredFields: boolean;
    missingFields: string[];
    
    // Brand resolution
    brandExistsInSanity: boolean;
    brandMatchConfidence: number;  // 0-1, fuzzy matching score
    suggestedBrandId?: string;
    
    // Catalogue validation
    catalogueIdValid: boolean;
    cataloguePath: string;         // Human-readable for review
    
    // Uniqueness (checked against CMS)
    skuUnique: boolean;
    existingSkuProduct?: string;
    nameSimilarity: number;        // Fuzzy match vs existing products
    likelyDuplicate: boolean;
    
    // Image validation
    imageDownloaded: boolean;
    imageSizeValid: boolean;
    imageDimensions?: { width: number; height: number };
    
    // Price validation
    priceValid: boolean;
    priceReasonable: boolean;      // Within expected range for category?
  };
  overallStatus: 'pass' | 'needs_review' | 'fail';
}
```

---

## Stage 4: VALIDATE — Human Review Interface

### Purpose
Human reviews transformed batch, approves/rejects individual products.

### Review Interface (CLI/TUI)

```
┌─────────────────────────────────────────────────────────────────┐
│  BATCH: sennheiser-openback-2026-04-001                        │
│  Products: 8 | Ready: 6 | Needs Review: 2 | Failed: 0          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [1/8] HD 800 S                                          [PASS]│
│  ├── Brand: Sennheiser → Sennheiser (sanity:id:brand_123)  [OK]│
│  ├── Price: $1,699.95 → 1699.95                            [OK]│
│  ├── SKU: HD800S (unique)                                  [OK]│
│  ├── Catalogue: open-back → o7c6baiuobsr7ni2y2vf22sh       [OK]│
│  ├── Image: ✓ downloaded (1200x800)                        [OK]│
│  └── Status: READY TO UPLOAD                                   │
│                                                                 │
│  [2/8] HD 660S2                                     [NEEDS REVIEW]│
│  ├── Brand: Sennheiser → ? (NEW BRAND DETECTED)         [CHECK]│
│  ├── Price: $599.95 → 599.95                               [OK]│
│  ├── SKU: HD660S2 (unique)                                 [OK]│
│  ├── Catalogue: open-back → o7c6baiuobsr7ni2y2vf22sh    [OK]│
│  └── Actions: [b]rand [c]atalogue [p]rice [s]kip [a]pprove    │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  Commands: [n]ext [p]rev [a]pprove-all [r]eject-all [q]uit    │
│  Product: [b]rand [c]atalogue [e]dit [s]kip [A]pprove       │
└─────────────────────────────────────────────────────────────────┘
```

### Review Decisions

| Action | Result | Effect |
|--------|--------|--------|
| `approve` | Product marked `ready` | Proceeds to upload queue |
| `reject` | Product marked `rejected` | Excluded from upload |
| `skip` | Product marked `skipped` | Hold for later review |
| `edit` | Modify transformed data | Re-run integrity checks |
| `fix-brand` | Map to existing/new brand | Update brand resolution |
| `fix-catalogue` | Change catalogueId | Update catalogueLocationKeys |

### Validation Output

```typescript
// validation/sennheiser-openback-2026-04-001.json
{
  "batchId": "sennheiser-openback-2026-04-001",
  "validatedAt": "2026-04-02T11:00:00Z",
  "validator": "human@example.com",
  
  "summary": {
    "total": 8,
    "approved": 6,
    "rejected": 1,
    "skipped": 1
  },
  
  "decisions": [
    {
      "productId": "raw-001",
      "decision": "approve",
      "notes": null,
      "modifiedFields": []
    },
    {
      "productId": "raw-002",
      "decision": "reject",
      "notes": "Price seems inflated, verify with another source",
      "modifiedFields": []
    }
  ],
  
  "uploadReady": [
    "raw-001",
    "raw-003",
    "raw-004",
    "raw-005",
    "raw-006",
    "raw-007"
  ]
}
```

---

## Stage 5: UPLOAD — Batch Sanity Import

### Purpose
Upload approved products to Sanity in controlled batches.

### Pre-Upload Checklist (Automated)

```typescript
// src/upload/preUploadChecks.ts
interface PreUploadReport {
  batchId: string;
  
  // Data integrity (re-verify before upload)
  schemaValidation: {
    allProductsValid: boolean;
    errors: ValidationError[];
  };
  
  // Brand resolution (CRITICAL)
  brandStatus: {
    allBrandsResolved: boolean;
    existingBrands: string[];        // Sanity brand IDs
    newBrandsNeeded: string[];       // Brands to create first
  };
  
  // Stripe readiness (WARNING)
  stripeStatus: {
    productsMissingStripeId: string[];
    warning: "Products will be created without Stripe integration";
  };
  
  // Image assets
  imageStatus: {
    allImagesPresent: boolean;
    imagesToUpload: string[];
  };
  
  // Upload plan
  uploadPlan: {
    step1_createBrands: string[];     // If new brands needed
    step2_uploadImages: string[];    // To Sanity assets
    step3_createProducts: string[];  // Full product documents
  };
  
  readyToUpload: boolean;
}
```

### Upload Process

```typescript
// src/upload/executeUpload.ts
async function uploadBatch(batchId: string, dryRun: boolean = false) {
  const batch = await loadValidatedBatch(batchId);
  const approved = batch.products.filter(p => p.decision === 'approve');
  
  // Step 1: Create missing brands
  const newBrands = extractNewBrands(approved);
  for (const brand of newBrands) {
    const sanityBrand = await sanityClient.create({
      _type: 'brand',
      name: brand.name,
      slug: { current: slugify(brand.name) }
    });
    brand.sanityId = sanityBrand._id;
  }
  
  // Step 2: Upload images as assets
  for (const product of approved) {
    const imageAsset = await sanityClient.assets.upload(
      'image',
      fs.createReadStream(product.transformed.image.localPath)
    );
    product.transformed.image.sanityAssetId = imageAsset._id;
  }
  
  // Step 3: Create products (without Stripe IDs)
  for (const product of approved) {
    const sanityProduct = {
      _type: 'product',
      name: product.transformed.name,
      slug: { current: product.transformed.slug },
      sku: product.transformed.sku,
      displayPrice: product.transformed.displayPrice,
      stripePriceId: 'PENDING_MANUAL_SETUP',  // Placeholder
      brand: { _type: 'reference', _ref: product.transformed.brand.sanityBrandId },
      catalogueLocationKeys: product.transformed.catalogueLocationKeys,
      image: {
        _type: 'image',
        asset: { _type: 'reference', _ref: product.transformed.image.sanityAssetId }
      },
      description: product.transformed.description,
      specifications: product.transformed.specifications,
      overviewFields: product.transformed.overviewFields
    };
    
    if (!dryRun) {
      const created = await sanityClient.create(sanityProduct);
      product.sanityId = created._id;
      product.uploadedAt = new Date().toISOString();
    }
  }
  
  // Save upload report
  return generateUploadReport(batchId, approved, dryRun);
}
```

### Upload Report

```typescript
// uploads/sennheiser-openback-2026-04-001-upload.json
{
  "batchId": "sennheiser-openback-2026-04-001",
  "uploadedAt": "2026-04-02T11:30:00Z",
  "dryRun": false,
  
  "summary": {
    "productsAttempted": 6,
    "productsCreated": 6,
    "productsFailed": 0,
    "brandsCreated": 0,
    "imagesUploaded": 6
  },
  
  "createdProducts": [
    {
      "sourceId": "raw-001",
      "sanityId": "prod_abc123",
      "name": "HD 800 S",
      "sku": "HD800S",
      "sanityUrl": "https://manage.sanity.io/projects/xxx/datasets/production/documents/prod_abc123",
      "stripeSetupRequired": true
    }
  ],
  
  "nextSteps": [
    "1. Create Stripe products for 6 new products",
    "2. Update stripePriceId in Sanity",
    "3. Run image pipeline for background removal"
  ]
}
```

---

## Data Flow Summary

| Stage | Input | Output | Human Gate |
|-------|-------|--------|------------|
| **PLAN** | Source URL, selectors | `.plan.json` (pending) | Approve plan |
| **SCRAPE** | Approved plan | `batch-NNN.json` (pending_review) | Review batch |
| **TRANSFORM** | Raw batch | Transformed + integrity checks | — |
| **VALIDATE** | Transformed batch | Validation report + decisions | Approve each product |
| **UPLOAD** | Approved products | Sanity documents | Approve upload |

---

## File Structure

```
sang-logium-data/
├── plans/                              # Human-created scraper configs
│   ├── sennheiser-openback-2026-04.plan.json
│   ├── audeze-planar-2026-04.plan.json
│   └── templates/
│       └── manufacturer.template.json
│
├── scraped/                            # Raw scraped data
│   └── [plan-id]/
│       ├── batch-001.json
│       ├── batch-002.json
│       └── images/
│           ├── hd800s-source.jpg
│           └── hd660s-source.jpg
│
├── transformed/                        # Normalized data (auto-generated)
│   └── [batch-id].transformed.json
│
├── validation/                         # Human review decisions
│   └── [batch-id].validation.json
│
├── uploads/                            # Upload reports
│   └── [batch-id]-upload.json
│
├── src/
│   ├── plan/                           # Plan management
│   │   ├── createPlan.ts
│   │   ├── validatePlan.ts
│   │   └── approvePlan.ts
│   │
│   ├── scrape/                         # Playwright scraping
│   │   ├── executePlan.ts
│   │   ├── rateLimiter.ts
│   │   └── selectors/
│   │
│   ├── transform/                      # Data normalization
│   │   ├── transformBatch.ts
│   │   ├── rules/
│   │   │   ├── parsePrice.ts
│   │   │   ├── resolveBrand.ts
│   │   │   └── resolveCatalogue.ts
│   │   └── integrity/
│   │       ├── checkSchema.ts
│   │       ├── checkUniqueness.ts
│   │       └── checkBrand.ts
│   │
│   ├── validate/                       # Human review interface
│   │   ├── reviewBatch.ts              # TUI interface
│   │   ├── renderProduct.ts
│   │   └── saveDecision.ts
│   │
│   ├── upload/                         # Sanity import
│   │   ├── preUploadChecks.ts
│   │   ├── executeUpload.ts
│   │   └── createStripeProducts.ts     # Helper for manual step
│   │
│   └── lib/
│       ├── sanityClient.ts
│       ├── catalogueIndex.ts           # Load and query catalogue-index.json
│       ├── brandCache.ts               // Fetch and cache Sanity brands
│       └── types.ts
│
├── config/
│   ├── catalogue-index.json            // Copied from main project
│   └── sanity.config.ts
│
├── scripts/
│   ├── plan.ts                         // CLI: create/approve plans
│   ├── scrape.ts                       // CLI: execute plan
│   ├── transform.ts                    // CLI: transform batch
│   ├── review.ts                       // CLI: review batch
│   └── upload.ts                       // CLI: upload batch
│
└── tests/
    ├── integrity.test.ts
    └── transform.test.ts
```

---

## CLI Interface

### Commands

```bash
# Create a new scrape plan
npm run plan:create -- --source=sennheiser --catalogue=open-back

# Approve a pending plan
npm run plan:approve -- --planId=sennheiser-openback-2026-04

# Execute approved plan (creates batch)
npm run scrape -- --planId=sennheiser-openback-2026-04

# Transform batch (auto integrity checks)
npm run transform -- --batchId=sennheiser-openback-2026-04-001

# Review batch (interactive TUI)
npm run review -- --batchId=sennheiser-openback-2026-04-001

# Upload approved products (dry run first)
npm run upload -- --batchId=sennheiser-openback-2026-04-001 --dryRun

# Actual upload
npm run upload -- --batchId=sennheiser-openback-2026-04-001
```

### Workflow Example

```bash
# 1. Create plan
$ npm run plan:create
> Source URL: https://www.sennheiser.com/en-us/headphones
> Target catalogue: open-back
> Max products: 10
> Plan created: plans/sennheiser-openback-2026-04.plan.json

# 2. Review and approve plan (edit JSON or use TUI)
$ npm run plan:approve -- --planId=sennheiser-openback-2026-04
> Plan approved. Ready to scrape.

# 3. Scrape (takes ~30s with rate limiting)
$ npm run scrape -- --planId=sennheiser-openback-2026-04
> Scraped 8 products
> Batch saved: scraped/sennheiser-openback-2026-04/batch-001.json

# 4. Transform (automatic)
$ npm run transform -- --batchId=sennheiser-openback-2026-04-001
> Transformed 8 products
> 6 passed integrity checks
> 2 need review (new brands)

# 5. Review (interactive)
$ npm run review -- --batchId=sennheiser-openback-2026-04-001
> [TUI opens, human reviews each product]
> 6 approved, 1 rejected, 1 skipped

# 6. Upload (dry run)
$ npm run upload -- --batchId=sennheiser-openback-2026-04-001 --dryRun
> Would create: 6 products
> Would upload: 6 images
> All checks passed

# 7. Upload (actual)
$ npm run upload -- --batchId=sennheiser-openback-2026-04-001
> Created: 6 products
> Next: Set up Stripe products
```

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Small batches (10 max)** | Reviewable in 5-10 minutes, catch errors early |
| **Human gates at Plan + Validate + Upload** | Prevents garbage data, maintains quality |
| **No automatic Stripe creation** | Pricing is business-critical, must be manual |
| **Brand resolution as separate step** | Brand taxonomy is curated, needs human judgment |
| **CatalogueId from plan, not scraped** | Ensures consistent categorization |
| **JSON files for state** | Simple, inspectable, version-controllable |
| **CLI-first, not web UI** | Faster to build, easier to iterate |
| **Dry-run on upload** | Prevents costly mistakes |

---

## Integration with sang-logium

### Catalogue Index Sync

```typescript
// config/catalogue-index.json is copied from main project
// src/lib/catalogueIndex.ts loads and provides:

interface CatalogueIndex {
  resolveSlugToId(slug: string): string | null;     // "open-back" → "o7c6baiuobsr7ni2y2vf22sh"
  resolveIdToSlug(id: string): string | null;       // Reverse lookup
  getLeafSlots(): Array<{ id: string, slug: string, title: string }>;
  validateCatalogueId(id: string): boolean;
}
```

### Brand Resolution

```typescript
// src/lib/brandCache.ts fetches from Sanity:

interface BrandResolver {
  // Exact match
  exactMatch(scrapedName: string): SanityBrand | null;
  
  // Fuzzy match (e.g., "Sennheiser" vs "sennheiser audio")
  fuzzyMatch(scrapedName: string, threshold: number): Array<{brand: SanityBrand, score: number}>;
  
  // Create new brand
  createBrand(name: string): Promise<SanityBrand>;
}
```

### Post-Upload: Image Pipeline

After upload to Sanity, products enter the existing image pipeline:

```bash
# In sang-logium project
cd scripts/image-pipeline
python fetch_products.py  # Fetches newly imported products
python batch_runner.py      # Runs background removal
```

---

## Error Handling

| Stage | Failure Mode | Handling |
|-------|--------------|----------|
| Scrape | Network error | Retry 3x, then mark failed, continue |
| Scrape | Selector not found | Log error, skip product |
| Scrape | Rate limited | Exponential backoff, resume |
| Transform | Missing required field | Flag for review, don't fail |
| Transform | Invalid price format | Flag for review, suggest fix |
| Transform | Brand not found | Flag as "new brand", human decides |
| Validate | Human rejects | Mark rejected, save reason |
| Upload | Sanity API error | Rollback batch, log error |
| Upload | Image upload fails | Continue with products, flag images |

---

## Next Steps

1. **Create sang-logium-data workspace** (adjacent to sang-logium)
2. **Initialize project**: `npm init`, install Playwright, Sanity client, Zod
3. **Copy catalogue-index.json** from main project
4. **Build Phase 1**: Plan + Scrape (1-2 days)
5. **Build Phase 2**: Transform + Integrity checks (1-2 days)
6. **Build Phase 3**: Review TUI + Upload (2-3 days)
7. **Pilot test**: 1 manufacturer, 10 products end-to-end

---

## Open Questions

| Question | Default | Can Change |
|----------|---------|------------|
| Brand creation permission? | Ask human each time | Could batch at upload |
| Handle product updates? | Phase 2 (only create now) | Add update detection |
| Multiple catalogue slots per product? | No (one from plan) | Could add in review |
| Scraping schedule? | On-demand only | Could add cron later |
| Price monitoring? | Out of scope | Could add diff detection |
