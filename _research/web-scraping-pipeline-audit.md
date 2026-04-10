# Web Scraping Pipeline Audit - Product Data Extraction

## Executive Summary

This audit outlines a simple, human-verifiable approach to extracting product data from e-commerce websites like worldwide stereo.com. The methodology prioritizes containment against drift and bloat while ensuring clean, CMS-ready JSON output.

## 1. Site Structure Analysis: worldwide stereo.com

### URL Patterns
- **Category pages**: `/collections/{category-name}` (e.g., `/collections/headphones`)
- **Product pages**: `/products/{product-name}` (e.g., `/products/sony-wh-1000xm5-wireless-over-ear-noise-canceling-headphones-black`)

### Key Findings
1. **Standard Shopify Structure**: Uses standard Shopify URL patterns
2. **Rich Product Data**: Detailed specifications, features, and descriptions
3. **Consistent HTML Structure**: Semantic HTML with predictable selectors
4. **No Public API**: No obvious product API endpoints discovered

### Data Fields Available
- Product title
- Price (multiple variants)
- Product description
- Technical specifications
- Feature lists
- Product images
- Brand information
- SKU/Model numbers
- Availability status

## 2. Simple, Human-Verifiable JSON Schema

```json
{
  "source": "worldwidestereo.com",
  "extracted_at": "2026-04-09T12:00:00Z",
  "product": {
    "name": "Sony WH-1000XM5 Wireless Over-Ear Noise Canceling Headphones (Black)",
    "slug": "sony-wh-1000xm5-wireless-over-ear-noise-canceling-headphones-black",
    "brand": "sony", // Reference to brand document
    "stripePriceId": "price_1O9K7z2eZvKYlo2C8s9qX2Y9",
    "displayPrice": 399.99,
    "stock": 10, // GENERATED - not scraped
    "reservedStock": 0, // GENERATED - not scraped
    "sku": "SONY-WH1000XM5-BLK",
    "image": {
      "url": "https://cdn.shopify.com/...",
      "alt": "Sony WH-1000XM5 Front View"
    },
    "gallery": [
      {
        "url": "https://cdn.shopify.com/...",
        "alt": "Sony WH-1000XM5 Side View"
      }
    ],
    "catalogueLocationKeys": ["headphones", "over-ear", "noise-cancelling"],
    "overviewFields": [
      {
        "title": "Driver Size",
        "value": "30mm",
        "information": "Precision-engineered driver unit"
      },
      {
        "title": "Microphones",
        "value": "8",
        "information": "Total microphones for noise cancellation"
      }
    ],
    "specifications": [
      {
        "title": "Battery Life",
        "value": "30 hours",
        "information": "With noise cancellation on"
      },
      {
        "title": "Weight",
        "value": "250g",
        "information": "Lightweight design"
      }
    ]
  }
}
```

## 3. Containment Strategies Against Drift & Bloat

### 3.1 Schema Enforcement (Primary Guardrail)
```javascript
// Zod schema for runtime validation (matches Sanity productType)
const ProductSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(96),
  brand: z.string().min(1), // Reference to existing brand
  stripePriceId: z.string().regex(/^price_/),
  displayPrice: z.number().positive(),
  stock: z.number().min(0), // GENERATED - not scraped
  reservedStock: z.number().min(0), // GENERATED - not scraped
  sku: z.string().min(3),
  image: z.object({
    url: z.string().url(),
    alt: z.string().max(200)
  }),
  gallery: z.array(z.object({
    url: z.string().url(),
    alt: z.string().max(200)
  })).max(10),
  catalogueLocationKeys: z.array(z.string()).min(1),
  overviewFields: z.array(z.object({
    title: z.string().max(100),
    value: z.string().max(200),
    information: z.string().max(300)
  })).max(10),
  specifications: z.array(z.object({
    title: z.string().max(100),
    value: z.string().max(200),
    information: z.string().max(300)
  })).max(20)
});
```

### 3.2 Field Weighting & Extraction Rules

#### High Priority Fields (Weight: 10)
- **name** - REQUIRED for product identification
- **sku** - REQUIRED for inventory management
- **displayPrice** - REQUIRED for pricing
- **image** - REQUIRED for product display

#### Medium Priority Fields (Weight: 5)
- **brand** - REQUIRED for filtering
- **overviewFields** - Important for quick product info
- **specifications** - Important for detailed product info

#### Low Priority Fields (Weight: 1)
- **gallery** - Nice to have, not critical
- **catalogueLocationKeys** - Can be inferred from category

#### Generated Fields (Not Scraped)
- **stock** - Set to default value (10) for new products
- **reservedStock** - Always 0 for new products
- **slug** - Generated from name if not found
- **stripePriceId** - Generated placeholder if not found

### 3.3 Field Extraction Contract
```javascript
const ExtractionContract = {
  // MUST be scraped from page
  scraped: ['name', 'sku', 'displayPrice', 'image', 'brand', 'overviewFields', 'specifications', 'gallery'],

  // MUST be generated
  generated: {
    stock: () => 10, // Default stock for new products
    reservedStock: () => 0, // No reservations initially
    slug: (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 96),
    stripePriceId: () => `price_placeholder_${Date.now()}`
  },

  // Can be inferred or set to defaults
  optional: {
    catalogueLocationKeys: ['uncategorized']
  }
};
```

### 3.3 Data Type Constraints
- **Strings**: Max length limits
- **Arrays**: Max item counts
- **Numbers**: Positive values only
- **URLs**: Valid URL format required

## 4. Anti-Drift Extraction Strategy

### 4.1 Resilient Selector Strategy
```javascript
const selectors = {
  name: [
    'h1.product__title',
    '.product-title h1',
    'h1:first-of-type',
    '[data-product-title]'
  ],
  displayPrice: [
    '.price__amount',
    '[data-price]',
    '.product-price span',
    '.current-price'
  ],
  sku: [
    '.sku',
    '[data-sku]',
    '.product-sku',
    '.model-number'
  ],
  image: [
    '.product-image img',
    '.main-image img',
    '.product-photo img',
    '[data-product-image]'
  ],
  brand: [
    '.brand',
    '.product-brand',
    '[data-brand]',
    '.vendor'
  ],
  overviewFields: [
    '.overview-features li',
    '.key-features li',
    '.product-highlights li'
  ],
  specifications: [
    '.specifications table tr',
    '.product-specs tr',
    '.tech-specs tr'
  ],
  gallery: [
    '.gallery img',
    '.product-gallery img',
    '.product-thumbs img'
  ]
};
```

### 4.2 Fallback Extraction
- Try selectors in order
- If all fail, mark as `null` (not empty string)
- Log missing fields for review

### 4.3 Human Verification Checkpoints
1. **Visual Preview**: Show extracted data side-by-side with source page
2. **Field Validation**: Highlight missing or suspicious data
3. **Schema Compliance**: Show validation errors immediately
4. **One-Click Approval**: Approve or reject individual products

## 5. Pipeline Architecture

### 5.1 Simple Three-Step Process
```
1. COLLECT: Fetch product page HTML
2. EXTRACT: Apply selectors + schema validation
3. VERIFY: Human review + one-click approval
```

### 5.2 Incremental Processing
- Process ONE product at a time
- Save immediately after successful extraction
- No batching until verification complete

### 5.3 Error Handling
- **Network errors**: Retry with exponential backoff (max 3 attempts)
- **Parsing errors**: Log URL + error, continue to next product
- **Validation errors**: Show to human for decision

## 6. Risk Assessment & Prevention

### 6.1 High-Risk Areas
1. **Price Extraction**: Prices change frequently, may have promotions
2. **Availability**: Stock status changes dynamically
3. **Image URLs**: CDN URLs may expire or change
4. **Specifications**: Format varies between products/brands

### 6.2 Prevention Checklist

#### Required Fields Validation
- [ ] **name** exists and length 1-200 chars
- [ ] **sku** exists and length >= 3 chars
- [ ] **displayPrice** is positive number
- [ ] **image** has valid URL and alt text
- [ ] **brand** matches existing brand in CMS

#### Generated Fields Verification
- [ ] **stock** set to 10 (default)
- [ ] **reservedStock** set to 0
- [ ] **slug** generated correctly from name
- [ ] **stripePriceId** has placeholder format

#### Data Quality Checks
- [ ] Price is reasonable (0.01 - 10000 USD)
- [ ] All image URLs are accessible
- [ ] Brand reference exists in CMS
- [ ] CatalogueLocationKeys not empty (set to ['uncategorized'] if needed)

#### Field Weight Score
- [ ] Total weight >= 25 (minimum viable product)
- [ ] High priority fields (weight 10) all present
- [ ] At least 2 medium priority fields (weight 5) present

### 6.3 Quality Gates
1. **Extraction Rate**: >95% of fields successfully extracted
2. **Validation Rate**: 100% schema compliance
3. **Human Approval**: >90% auto-approvable after training

## 7. Implementation Recommendations

### 7.1 Technology Stack
- **Puppeteer/Playwright**: For JavaScript-heavy sites
- **Cheerio**: For static HTML parsing
- **Zod**: For runtime schema validation
- **Node.js**: For pipeline orchestration

### 7.2 Development Approach
1. **Start Small**: Extract from 5 products first
2. **Manual Verification**: Review each extraction manually
3. **Iterate**: Refine selectors based on results
4. **Scale**: Gradually increase volume

### 7.3 Monitoring
- Log extraction success/failure rates
- Track schema validation errors
- Monitor selector performance
- Alert on sudden pattern changes

## 8. Legal & Ethical Considerations

### 8.1 Compliance Checklist
- [ ] Check robots.txt compliance
- [ ] Review Terms of Service for scraping restrictions
- [ ] Implement rate limiting (1 request per 2 seconds minimum)
- [ ] Respect crawl-delay directives
- [ ] Only scrape publicly available data
- [ ] Do not scrape personal data

### 8.2 Rate Limiting Strategy
```javascript
const rateLimit = {
  delay: 2000, // 2 seconds between requests
  jitter: 500,  // Random variation
  concurrent: 1 // Only one request at a time
};
```

## 9. Success Metrics

### 9.1 Primary Metrics
- **Extraction Accuracy**: >95% fields match manual extraction
- **Schema Compliance**: 100% of products pass validation
- **Processing Speed**: <30 seconds per product
- **Human Review Rate**: <10% require manual correction

### 9.2 Secondary Metrics
- **Error Rate**: <5% extraction failures
- **Uptime**: >99% pipeline availability
- **Data Freshness**: Prices updated within 24 hours

## 10. Next Steps

1. **Prototype**: Build extraction for 5 sample products
2. **Validate**: Test schema with diverse product types
3. **Review**: Human verification of initial batch
4. **Refine**: Adjust selectors based on results
5. **Scale**: Gradual increase in processing volume

## Conclusion

A simple, human-verifiable web scraping pipeline is achievable by:
- Strict schema enforcement
- Resilient selector strategies
- Incremental processing with human checkpoints
- Comprehensive error handling and monitoring

The key is containment: limit what can be extracted, validate everything, and require human verification before data enters the CMS.
