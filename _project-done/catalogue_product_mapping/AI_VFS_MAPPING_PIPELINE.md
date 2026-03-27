# AI-Powered Product-to-Catalogue VFS Mapping Pipeline

## Problem Statement

The current keyword-based semantic mapper fails to correctly categorize ~590 products because:
1. **Sparse overview data**: Many products only have generic `Type: Audio Cable` fields
2. **Semantic ambiguity**: Product names like "AudioQuest Pearl USB A to USB B Digital Interconnect" don't match keywords like "rca cable" or "xlr cable"
3. **No reasoning layer**: Simple string matching cannot understand product function/purpose

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AI VFS MAPPING PIPELINE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌───────────┐  │
│  │   Stage 1    │───▶│   Stage 2    │───▶│   Stage 3    │───▶│  Stage 4  │  │
│  │   ENRICH     │    │   ANALYZE    │    │   DECIDE     │    │  VERIFY   │  │
│  └──────────────┘    └──────────────┘    └──────────────┘    └───────────┘  │
│        │                  │                  │                  │          │
│   Extract all         LLM semantic      Confidence        Cross-check    │
│   product data        classification    scoring +           + dedupe      │
│   + normalize         with reasoning  routing logic                        │
│                                                                              │
│                              │                                               │
│                              ▼                                               │
│                    ┌───────────────────┐                                     │
│                    │    Stage 5        │                                     │
│                    │    APPLY          │                                     │
│                    │  (or queue review)│                                     │
│                    └───────────────────┘                                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Stage 1: Product Data Enrichment

**Purpose**: Normalize and structure all available product information into an AI-friendly format.

### Input
- Product ID from Sanity CMS
- Raw product document with name, brand, overviewFields, specifications

### Output: Normalized Product Profile

```typescript
interface ProductProfile {
  id: string;
  name: string;
  brand: string;
  category: string | null; // product.type
  extractedTraits: {
    // Parsed from overviewFields
    type: string[];
    features: string[];
    connectors: string[];
    useCases: string[];
    formFactor: string[];
    // Parsed from specifications
    technicalSpecs: Record<string, string>;
  };
  knowledgeText: string; // Concatenated normalized text for embedding/matching
}
```

### Enrichment Rules

1. **Connector Extraction** (from name)
   - Pattern: `/(\d+\.?\d*)?\s?(mm|pin|XLR|RCA|USB|optical|balanced)/gi`
   - Extract: "2.5mm", "4.4mm", "USB A", "XLR", "3.5mm"

2. **Product Type Inference** (from name + brand)
   - "Replacement Cable" → type: ["cable", "accessory"]
   - "Interconnect" → type: ["cable", "connectivity"]
   - "Amplifier" → type: ["amplification", "electronics"]

3. **Function Classification**
   - "Headphone" + "Cable" → useCase: ["headphone connectivity"]
   - "Speaker" + "Stand" → useCase: ["speaker support", "storage"]

## Stage 2: Semantic Analysis (LLM Layer)

**Purpose**: Use AI to understand product semantics and recommend catalogue slots with explicit reasoning.

### LLM Prompt Structure

```
You are a product categorization expert for an audiophile e-commerce site.

CATALOGUE STRUCTURE (valid leaf nodes only):
- Headphones > By Design > Open-Back | Closed-Back
- Headphones > By Driver > Planar Magnetic | Dynamic | Electrostatic
- Headphones > In-Ear & Wireless > Monitors (IEMs) | True Wireless (TWS)
- Audio Electronics > Amplification > Desktop Amps | Portable Amps
- Audio Electronics > Digital Sources > Standalone DACs | DAC/Amp Combos | Network Streamers | Digital Players (DAPs)
- Accessories > Connectivity > Headphone Cables | Interconnects | Adapters
- Accessories > Maintenance > Earpads | Care & Cleaning
- Accessories > Storage > Headphone Stands | Carrying Cases

PRODUCT TO CATEGORIZE:
Name: {{productName}}
Brand: {{brand}}
Type: {{productType}}
Connectors: {{extractedConnectors}}
Features: {{extractedFeatures}}

TASK:
1. Analyze which catalogue leaf node(s) this product belongs to
2. Consider: product function, connectors, form factor, typical use case
3. Return ONLY valid leaf node slugs from the list above
4. Provide confidence score (0.0-1.0) and reasoning

RESPONSE FORMAT (JSON):
{
  "matches": [
    {
      "leafSlug": "string",
      "confidence": 0.0-1.0,
      "reasoning": "string explaining why this slot matches"
    }
  ],
  "primaryMatch": "string | null", // Highest confidence match
  "edgeCases": ["string"], // Any ambiguity or special considerations
  "suggestedKeywords": ["string"] // Keywords to add for future similar products
}
```

### Example Analysis

**Product**: "AudioQuest Pearl USB A to USB B Digital Interconnect"

**Expected LLM Response**:
```json
{
  "matches": [
    {
      "leafSlug": "interconnects",
      "confidence": 0.95,
      "reasoning": "Product is a digital interconnect cable connecting USB A to USB B. 'Interconnect' is explicitly in the name. Even though connector differs from RCA/XLR, the function (connecting audio equipment) matches the interconnects category purpose."
    }
  ],
  "primaryMatch": "interconnects",
  "edgeCases": ["USB cables are a subset of interconnects - may need category expansion"],
  "suggestedKeywords": ["usb interconnect", "digital interconnect"]
}
```

## Stage 3: Decision Router

**Purpose**: Route products based on confidence score to appropriate handling path.

### Routing Logic

```typescript
interface RoutingDecision {
  productId: string;
  action: 'auto-apply' | 'batch-review' | 'manual-analysis' | 'flag-exclude';
  matches: CatalogMatch[];
  reasoning: string;
}

function routeProduct(matches: CatalogMatch[]): RoutingDecision {
  const maxConfidence = Math.max(...matches.map(m => m.confidence));
  const highConfidenceMatches = matches.filter(m => m.confidence >= 0.9);
  
  if (highConfidenceMatches.length === 1 && maxConfidence >= 0.95) {
    return { action: 'auto-apply', matches: highConfidenceMatches };
  }
  
  if (maxConfidence >= 0.7) {
    return { action: 'batch-review', matches };
  }
  
  if (matches.length === 0) {
    return { action: 'manual-analysis', matches: [], 
             reasoning: 'No catalogue slots matched - may need new category' };
  }
  
  return { action: 'flag-exclude', matches };
}
```

### Decision Matrix

| Confidence | Match Count | Action | Description |
|------------|-------------|--------|---------------|
| ≥0.95 | 1 | `auto-apply` | Apply immediately to database |
| ≥0.95 | 2+ | `batch-review` | Multiple high-confidence matches need human check |
| 0.80-0.94 | 1+ | `batch-review` | Review batch for accuracy |
| 0.70-0.79 | any | `batch-review` | Low confidence - review required |
| <0.70 | 0 | `manual-analysis` | Unmatched - requires category analysis |
| <0.70 | 1+ | `flag-exclude` | Contradictory - flag for data quality review |

## Stage 4: Verification Layer

**Purpose**: Prevent errors through cross-checks before application.

### Verification Rules

1. **Exclusion Conflicts**
   - Check: `open-back` and `closed-back` cannot coexist
   - Check: `dynamic` and `planar-magnetic` and `electrostatic` are mutually exclusive

2. **Hierarchy Validation**
   - A product in `headphone-cables` should NOT be in `desktop-amps`
   - Cross-category placement requires explicit justification

3. **Duplicate Prevention**
   - Same product ID cannot have duplicate catalogueLocationKeys
   - Database transaction uses `set` (overwrite), never `append`

4. **Sanity Check**
   - Products with "cable" in name should map to connectivity categories
   - Products with "amplifier" in name should map to amplification categories
   - Mismatches trigger warning: `"Name suggests X but mapped to Y"`

## Stage 5: Application with Audit Trail

**Purpose**: Apply verified mappings with complete traceability.

### Database Update Pattern

```typescript
async function applyMapping(productId: string, match: CatalogMatch) {
  const transaction = client.transaction();
  
  // 1. Update product catalogueLocationKeys
  transaction.patch(productId, (patch) => {
    return patch.set({
      catalogueLocationKeys: [match.leafId],
      // Audit fields
      _vfsMappedAt: new Date().toISOString(),
      _vfsMappedBy: 'ai-pipeline-v1',
      _vfsMappingConfidence: match.confidence,
      _vfsMappingReasoning: match.reasoning
    });
  });
  
  // 2. Log to audit collection
  transaction.create({
    _type: 'vfsMappingAudit',
    productId,
    leafId: match.leafId,
    confidence: match.confidence,
    reasoning: match.reasoning,
    appliedAt: new Date().toISOString()
  });
  
  await transaction.commit();
}
```

### Audit Trail Schema

```typescript
// sanity/schemaTypes/vfsMappingAudit.ts
export const vfsMappingAudit = {
  name: 'vfsMappingAudit',
  type: 'document',
  fields: [
    { name: 'productId', type: 'string', validation: Rule => Rule.required() },
    { name: 'leafId', type: 'string', validation: Rule => Rule.required() },
    { name: 'confidence', type: 'number' },
    { name: 'reasoning', type: 'text' },
    { name: 'appliedAt', type: 'datetime' },
    { name: 'pipelineVersion', type: 'string' }
  ]
};
```

## Human-in-the-Loop Workflow

### Batch Review Queue

**File**: `catalog_temporary/review-queue.md`

```markdown
# Review Queue - 2026-03-27

## High Confidence Multiple Matches (Auto-apply pending review)

### Product: Marantz PM6007 (Y7l1IhzX2fnyiano4ius6H)
**Proposed**: `desktop-amps` + `dac-amp-combos`
**Confidence**: 0.97 / 0.95
**Reasoning**: Product is an integrated amplifier with D/A conversion capability
**Action**: [ ] Approve both  [ ] Approve primary only  [ ] Reject

## Low Confidence Matches (Require decision)

### Product: Meze 99 Series Cable (3O1ZNp54LWQGln4uEAU7Vs)
**Proposed**: `headphone-cables` (confidence: 0.82)
**Reasoning**: Name contains "Replacement Cable" and brand Meze is known for headphones
**Ambiguity**: OverviewFields only say "Type: Audio Cable" - not explicitly headphone
**Action**: [ ] Confirm  [ ] Reject - needs better data  [ ] Flag for category review
```

### Review Commands

```bash
# Process auto-apply queue (high confidence singles)
node scripts/ai-vfs-mapper/process-queue.mjs --queue=auto-apply

# Generate review batch for human decision
node scripts/ai-vfs-mapper/process-queue.mjs --queue=batch-review --output=review-queue.md

# Reject and flag for category expansion
node scripts/ai-vfs-mapper/process-queue.mjs --reject --productId=XXX --reason="needs-new-category"
```

## Implementation: Core Script

**File**: `scripts/ai-vfs-mapper/index.mjs`

```javascript
#!/usr/bin/env node

import { createClient } from '@sanity/client';
import { OpenAI } from 'openai';
import { writeFileSync } from 'fs';
import { join } from 'path';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const LEAF_NODE_STRUCTURE = {
  'headphones': {
    'by-design': ['open-back', 'closed-back'],
    'by-driver': ['planar-magnetic', 'dynamic', 'electrostatic'],
    'in-ear-wireless': ['monitors-iems', 'true-wireless-tws']
  },
  'audio-electronics': {
    'amplification': ['desktop-amps', 'portable-amps'],
    'digital-sources': ['standalone-dacs', 'dac-amp-combos', 'network-streamers', 'digital-players-daps']
  },
  'accessories': {
    'connectivity': ['headphone-cables', 'interconnects', 'adapters'],
    'maintenance': ['earpads', 'care-cleaning'],
    'storage': ['headphone-stands', 'carrying-cases']
  }
};

class AIVFSMapper {
  constructor(sanityClient) {
    this.client = sanityClient;
    this.leafNodes = null;
    this.autoApplyQueue = [];
    this.reviewQueue = [];
    this.manualQueue = [];
  }

  async loadCatalogueStructure() {
    const query = '*[_type == "catalogueItem" && type == "link"]{_id, title, slug}';
    this.leafNodes = await this.client.fetch(query);
    
    // Build slug-to-ID map
    this.slugToId = {};
    for (const node of this.leafNodes) {
      this.slugToId[node.slug.current] = node._id;
    }
  }

  enrichProduct(product) {
    const knowledgeParts = [product.name, product.brand];
    
    // Extract from overviewFields
    if (product.overviewFields) {
      for (const field of product.overviewFields) {
        if (field.value) knowledgeParts.push(field.value);
      }
    }
    
    // Parse connectors from name
    const connectorPattern = /(\d+\.?\d*)?\s?(mm|pin|XLR|RCA|USB|optical|balanced)/gi;
    const connectors = product.name.match(connectorPattern) || [];
    
    return {
      id: product._id,
      name: product.name,
      brand: product.brand,
      category: product.type || null,
      connectors: [...new Set(connectors)],
      knowledgeText: knowledgeParts.join(' ').toLowerCase()
    };
  }

  async analyzeWithLLM(enrichedProduct) {
    const prompt = this.buildPrompt(enrichedProduct);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Fast, cost-effective, good at categorization
      messages: [
        { 
          role: 'system', 
          content: 'You are a precise product categorization system for audiophile e-commerce. Always return valid JSON.' 
        },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2 // Low temperature for consistency
    });
    
    return JSON.parse(response.choices[0].message.content);
  }

  buildPrompt(product) {
    const validSlugs = Object.values(this.leafNodes).map(n => n.slug.current).join(', ');
    
    return `
CATALOGUE LEAF NODES: ${validSlugs}

PRODUCT:
- Name: ${product.name}
- Brand: ${product.brand}
- Type: ${product.category || 'Unknown'}
- Connectors: ${product.connectors.join(', ') || 'None detected'}

Analyze and return JSON with:
1. matches: array of {leafSlug, confidence (0-1), reasoning}
2. primaryMatch: highest confidence slug or null
3. edgeCases: array of any ambiguities
4. suggestedKeywords: array of terms for future matching

Only use leaf slugs from the CATALOGUE LEAF NODES list above.`;
  }

  routeDecision(productId, llmResult) {
    const matches = llmResult.matches || [];
    const maxConfidence = matches.length > 0 
      ? Math.max(...matches.map(m => m.confidence)) 
      : 0;
    
    // Resolve slugs to IDs
    const resolvedMatches = matches
      .filter(m => this.slugToId[m.leafSlug])
      .map(m => ({
        ...m,
        leafId: this.slugToId[m.leafSlug]
      }));
    
    if (maxConfidence >= 0.95 && resolvedMatches.length === 1) {
      this.autoApplyQueue.push({ productId, match: resolvedMatches[0] });
      return { action: 'auto-apply', match: resolvedMatches[0] };
    }
    
    if (maxConfidence >= 0.7) {
      this.reviewQueue.push({ productId, matches: resolvedMatches, llmResult });
      return { action: 'batch-review', matches: resolvedMatches };
    }
    
    this.manualQueue.push({ productId, llmResult, reason: 'low-confidence' });
    return { action: 'manual-analysis' };
  }

  async verifyAndApply(productId, match) {
    // Verification: Check if match is sane
    const sanityCheck = this.runSanityCheck(productId, match);
    if (!sanityCheck.passed) {
      console.warn(`Sanity check failed: ${sanityCheck.reason}`);
      this.reviewQueue.push({ productId, match, sanityFailure: sanityCheck.reason });
      return false;
    }
    
    // Apply with audit
    const transaction = this.client.transaction();
    
    transaction.patch(productId, (patch) => {
      return patch.set({
        catalogueLocationKeys: [match.leafId],
        _vfsMappedAt: new Date().toISOString(),
        _vfsMappedBy: 'ai-pipeline-v1',
        _vfsConfidence: match.confidence,
        _vfsReasoning: match.reasoning
      });
    });
    
    await transaction.commit();
    return true;
  }

  runSanityCheck(productId, match) {
    // TODO: Implement exclusion checks
    return { passed: true };
  }

  async processProduct(productId) {
    // 1. Fetch
    const product = await this.client.fetch(
      `*[_type == "product" && _id == $id][0]{_id, name, brand, type, overviewFields}`,
      { id: productId }
    );
    
    if (!product) throw new Error(`Product not found: ${productId}`);
    
    // 2. Enrich
    const enriched = this.enrichProduct(product);
    
    // 3. Analyze
    const llmResult = await this.analyzeWithLLM(enriched);
    
    // 4. Route
    const decision = this.routeDecision(productId, llmResult);
    
    // 5. Execute if auto-apply
    if (decision.action === 'auto-apply') {
      const success = await this.verifyAndApply(productId, decision.match);
      return { productId, action: 'applied', success };
    }
    
    return { productId, action: decision.action };
  }

  exportQueues() {
    const timestamp = new Date().toISOString().split('T')[0];
    
    // Export review queue
    const reviewMd = this.formatReviewQueueMarkdown();
    writeFileSync(
      join(process.cwd(), 'catalog_temporary', `review-queue-${timestamp}.md`),
      reviewMd
    );
    
    // Export manual analysis queue
    const manualMd = this.formatManualQueueMarkdown();
    writeFileSync(
      join(process.cwd(), 'catalog_temporary', `manual-queue-${timestamp}.md`),
      manualMd
    );
    
    console.log(`\n📊 Queue Summary:`);
    console.log(`   Auto-apply: ${this.autoApplyQueue.length}`);
    console.log(`   Review: ${this.reviewQueue.length}`);
    console.log(`   Manual: ${this.manualQueue.length}`);
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  const batchMode = args.includes('--batch');
  const productId = args.find(a => a.startsWith('--productId='))?.split('=')[1];
  
  const mapper = new AIVFSMapper(client);
  await mapper.loadCatalogueStructure();
  
  if (productId) {
    await mapper.processProduct(productId);
  } else if (batchMode) {
    // Fetch all unmapped products
    const unmapped = await client.fetch(`*[_type == "product" && !defined(catalogueLocationKeys)][]._id`);
    console.log(`Processing ${unmapped.length} unmapped products...`);
    
    for (const id of unmapped) {
      await mapper.processProduct(id);
    }
    
    mapper.exportQueues();
  }
}

main().catch(console.error);
```

## Cost & Performance Estimates

### LLM Costs (GPT-4o-mini)
- Per product analysis: ~500 tokens input, ~200 tokens output
- Cost: ~$0.0005 per product
- 592 products: ~$0.30 total

### Processing Time
- Sequential: ~592 seconds (1s per product with API latency)
- Batched (10 concurrent): ~60 seconds

### Accuracy Target
- Auto-apply queue (confidence ≥0.95): 99%+ accuracy
- Review queue (confidence 0.7-0.94): 95%+ accuracy with human verification
- Manual queue: Requires category expansion analysis

## Success Criteria

The pipeline achieves "100% correct processing" when:

1. **All products are routed** to one of: applied, reviewed, or flagged
2. **No silent failures** - every decision has reasoning
3. **Audit trail exists** for every database modification
4. **Human review catches** any AI errors before application
5. **Edge cases are surfaced** for category structure improvement

## Next Steps

1. Implement Stage 1 (Enrichment) - Extract and normalize product data
2. Create LLM prompt with catalogue context injection
3. Build decision router with confidence thresholds
4. Implement verification layer with exclusion rules
5. Create audit schema in Sanity
6. Run batch on 10 products to validate pipeline
7. Adjust thresholds based on validation results
8. Process full catalogue
