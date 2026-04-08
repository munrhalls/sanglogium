# Audit: Product Import Pipeline — Robustness & Architecture Review

## Audit Scope
- **Feature:** Human-in-the-loop product scraping pipeline
- **Target State:** Robust CLI tool for automated product data import
- **Focus Area:** Architecture robustness, error handling, data integrity
- **Date:** 2026-04-02

---

## 1. End-State Delineation

### CLI Tool Architecture
```
sang-logium-data/ workspace
├── plans/                    # Scrape plans (JSON)
├── scraped/                  # Raw scraped data
│   └── [plan-id]/           # Per-plan directories
│       ├── batch-001.json   # Product batches
│       └── images/          # Downloaded images
├── validation/              # Human review decisions
├── uploads/                 # Upload reports
└── src/                     # TypeScript source
    ├── plan/               # Plan management
    ├── scrape/             # Web scraping
    ├── transform/          # Data transformation
    ├── validate/           # Validation & review
    └── upload/             # Sanity upload
```

### Data Flow Pipeline
```
PLAN → SCRAPE → TRANSFORM → VALIDATE → UPLOAD
  ↓        ↓         ↓          ↓        ↓
JSON    Playwright   Sanity    Human     Sanity
File    Browser      Schema    Review   CMS
```

---

## 2. Spatial Architecture

### User Flow Groups
| Group | Entry | Actions | Exit |
|-------|-------|---------|------|
| Plan Creation | CLI command | Define source, selectors | Saved plan |
| Scraping | Approved plan | Extract product data | Raw batch |
| Transformation | Raw batch | Clean/normalize data | Transformed batch |
| Review | Transformed batch | Approve/reject items | Validated batch |
| Upload | Validated batch | Create Sanity assets | Upload report |

### Component Hierarchy
```
CLI Tool
├── Plan Manager
│   ├── Create Plan
│   ├── Approve Plan
│   └── List Plans
├── Scrape Engine
│   ├── Playwright Browser
│   ├── Rate Limiter
│   └── Error Handler
├── Transform Engine
│   ├── Brand Resolver
│   ├── Price Parser
│   └── SKU Generator
├── Validation Engine
│   ├── Field Validator
│   ├── Duplicate Checker
│   └── Review Interface
└── Upload Engine
    ├── Image Uploader
    ├── Brand Creator
    └── Product Creator
```

---

## 3. Gap Analysis (G-XX)

| ID | Component | Current | Target | Severity |
|----|-----------|---------|--------|----------|
| G-01 | **Error Handling** | Basic try-catch | Comprehensive error recovery | CRITICAL |
| G-02 | **Rate Limiting** | Fixed delay | Adaptive rate limiting | HIGH |
| G-03 | **Data Validation** | Basic checks | Schema validation + integrity | HIGH |
| G-04 | **Brand Resolution** | Simple exact match | Fuzzy matching + cache | MEDIUM |
| G-05 | **Image Handling** | Basic download | Validation + resize | MEDIUM |
| G-06 | **Progress Tracking** | Console logs | Progress bars + state files | LOW |
| G-07 | **Rollback Capability** | None | Upload rollback mechanism | HIGH |
| G-08 | **Configuration** | Hardcoded values | Environment variables | MEDIUM |

---

## 4. RWD Strategy

| Component | Desktop (CLI) | Mobile (N/A) | Implementation |
|-----------|----------------|--------------|----------------|
| CLI Tool | Terminal interface | Not applicable | Commander.js/Inquirer |
| Progress Display | ASCII progress bars | Not applicable | CLI-Progress |
| Error Reporting | Structured logs | Not applicable | Winston/Pino |

---

## 5. Files at Risk of Regression

| File | Risk | Mitigation |
|------|------|------------|
| `src/lib/types.ts` | Type changes break all modules | Version interfaces, migration scripts |
| `src/plan/createPlan.ts` | Plan format changes | Migration utility for existing plans |
| `src/upload/executeUpload.ts` | Sanity schema changes | Schema validation before upload |
| `package.json` | Dependency updates | Lock file, semantic versioning |

---

## 6. Robustness Requirements

### Error Handling Strategy
```typescript
// Retry pattern with exponential backoff
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

// Comprehensive error types
type ScrapeError = 
  | { type: 'network_error'; url: string; status?: number }
  | { type: 'selector_error'; selector: string; context: string }
  | { type: 'rate_limit'; retryAfter: number }
  | { type: 'parse_error'; field: string; value: string };
```

### Data Integrity Checks
```typescript
// Validation pipeline
interface ValidationRule {
  field: string;
  required: boolean;
  type: 'string' | 'number' | 'url' | 'email';
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
}

// Integrity constraints
interface IntegrityConstraints {
  skuMustBeUnique: boolean;
  brandMustExist: boolean;
  imageMustDownload: boolean;
  priceMustBePositive: boolean;
}
```

### Rate Limiting Strategy
```typescript
// Adaptive rate limiting
interface RateLimiter {
  currentDelay: number;
  successCount: number;
  errorCount: number;
  lastRequestTime: number;
  
  adjustDelay(success: boolean): void;
  canMakeRequest(): boolean;
  waitForSlot(): Promise<void>;
}
```

---

## 7. Critical Architecture Decisions

### Decision 1: Workspace Separation
**Choice:** Separate `sang-logium-data/` workspace
**Rationale:** Isolation from main codebase, independent dependencies
**Risk:** Duplicate code (catalogue types)
**Mitigation:** Shared type definitions package

### Decision 2: Human-in-the-Loop Design
**Choice:** Manual validation step required
**Rationale:** Data quality critical for production
**Risk:** Bottleneck in pipeline
**Mitigation:** Batch review, bulk operations

### Decision 3: Playwright for Scraping
**Choice:** Headless browser automation
**Rationale:** Handles JavaScript-heavy sites
**Risk:** Resource intensive
**Mitigation:** Concurrent limits, memory monitoring

### Decision 4: Sanity Asset Upload
**Choice:** Direct Sanity asset creation
**Rationale:** Integrated with existing CMS
**Risk:** API rate limits, large files
**Mitigation:** Batch uploads, size validation

---

## 8. Security Considerations

### Input Validation
- **Plan Files:** Schema validation with Zod
- **URLs:** Protocol validation, allowlist
- **Selectors:** CSS injection prevention
- **File Paths:** Path traversal prevention

### API Security
- **Sanity Tokens:** Environment variables, rotation
- **Rate Limits:** Request throttling
- **Data Sanitization:** Input cleaning before upload

### File System Security
- **Directory Isolation:** Scoped to workspace
- **Upload Validation**: File type, size limits
- **Permission Checks**: Read/write access control

---

## 9. Performance Requirements

### Scraping Performance
- **Concurrent Requests:** Max 3 parallel browsers
- **Memory Usage:** < 512MB per browser instance
- **Timeout Limits:** 30s per page, 10s per selector
- **Success Rate:** > 95% for known-good sites

### Data Processing Performance
- **Batch Size:** 100 products per batch
- **Memory Usage:** < 256MB for transformation
- **Upload Speed:** < 2s per product + images
- **Validation Speed:** < 100ms per product

---

## 10. Monitoring & Observability

### Logging Strategy
```typescript
// Structured logging levels
interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  component: string;
  operation: string;
  message: string;
  metadata?: Record<string, any>;
}
```

### Metrics Collection
- **Scraping Success Rate**: Percentage of successful scrapes
- **Processing Time**: Time per operation phase
- **Error Rates**: Types and frequencies of errors
- **Resource Usage**: Memory, CPU, network

### Health Checks
- **Plan Validation**: Verify plan files are valid
- **Connectivity**: Test Sanity API access
- **Disk Space**: Monitor workspace storage
- **Browser Health**: Playwright instance checks

---

## 11. Testing Strategy

### Unit Tests
- **Type Validation**: Verify schema validation
- **Transform Logic**: Test data transformation rules
- **Brand Resolution**: Mock brand matching
- **Error Handling**: Simulate error conditions

### Integration Tests
- **End-to-End Flow**: Plan → Upload pipeline
- **Sanity Integration**: Test real API calls
- **File Operations**: Verify file handling
- **Rate Limiting**: Test throttling behavior

### E2E Tests
- **Real Websites**: Scrape actual product pages
- **Error Recovery**: Test failure scenarios
- **Performance**: Benchmark large datasets
- **User Workflow**: Manual review process

---

## 12. Deployment & Operations

### Environment Setup
```bash
# Required environment variables
SANITY_PROJECT_ID=your_project_id
SANITY_DATASET=production
SANITY_API_TOKEN=your_api_token
NODE_ENV=production
LOG_LEVEL=info
```

### Configuration Management
- **Default Selectors**: Built-in selector library
- **Site Profiles**: Pre-configured site settings
- **Rate Limits**: Configurable throttling
- **Retry Policies**: Adjustable retry strategies

### Backup & Recovery
- **Plan Files**: Version control storage
- **Scraped Data**: Local backup before upload
- **Upload Reports**: Audit trail preservation
- **Rollback Scripts**: Undo failed uploads

---

## 13. Verification Commands

### Development Testing
```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# Type checking
npm run type-check

# Linting
npm run lint
```

### Pipeline Testing
```bash
# Create test plan
npm run plan:create "Test Source" "https://example.com" "open-back"

# Execute scrape
npm run scrape test-plan-2026-04-02

# Transform data
npm run transform test-plan-2026-04-02-001

# Validate data
npm run validate test-plan-2026-04-02-001

# Dry run upload
npm run upload test-plan-2026-04-02-001 --dry-run
```

### Production Validation
```bash
# Full pipeline test
npm run test:e2e

# Performance benchmark
npm run test:performance

# Security audit
npm run audit:security

# Dependency check
npm run audit:dependencies
```

---

## 14. Success Criteria

| Criteria | Target | Measurement |
|----------|--------|-------------|
| **Pipeline Success** | > 95% completion rate | Success/failure logs |
| **Data Quality** | < 1% field errors | Validation reports |
| **Performance** | < 5s per product | Timing metrics |
| **Error Recovery** | 100% retry success | Retry logs |
| **User Experience** | < 2min review per batch | Time tracking |
| **Upload Accuracy** | 100% data integrity | Sanity verification |

---

## 15. Risk Mitigation

### High Risk Items
1. **Website Changes**: Sites update breaking selectors
   - **Mitigation**: Multiple selector strategies, fallback patterns
2. **API Rate Limits**: Sanity throttling
   - **Mitigation**: Batch uploads, exponential backoff
3. **Data Quality**: Poor scraped data
   - **Mitigation**: Validation rules, manual review

### Medium Risk Items
1. **Resource Exhaustion**: Memory/CPU limits
   - **Mitigation**: Resource monitoring, auto-scaling
2. **Network Failures**: Connectivity issues
   - **Mitigation**: Retry logic, offline mode
3. **Human Error**: Review mistakes
   - **Mitigation**: Confirmation prompts, audit trails

---

## 16. Final Audit Results

### Overall Audit Score: B+ (Good Foundation, Needs Robustness)

| Area | Score | Status |
|------|-------|--------|
| Architecture | A- | Solid design, good separation |
| Error Handling | C+ | Basic coverage, needs expansion |
| Data Integrity | B | Good validation, missing checks |
| Performance | B+ | Efficient design, needs limits |
| Security | B+ | Good practices, needs hardening |
| Testing | C+ | Basic coverage, needs expansion |
| Operations | B | Good structure, needs monitoring |

### Summary
The pipeline architecture is **well-designed** with clear separation of concerns and good modularity. The main areas for improvement are **error handling robustness** and **comprehensive testing**. The human-in-the-loop approach is appropriate for data quality requirements.

### Recommendations
1. **Immediate**: Implement comprehensive error handling with retry logic
2. **Short-term**: Add extensive test coverage for all components
3. **Medium-term**: Implement monitoring and observability
4. **Long-term**: Add automation for common site patterns

**Ready for implementation with robustness improvements.**

---

## Audit Timestamp
**Audited:** 2026-04-02
**Auditor:** Architecture Audit System
**Status:** APPROVED with robustness improvements required
