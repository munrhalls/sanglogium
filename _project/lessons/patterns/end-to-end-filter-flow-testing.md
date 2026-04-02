# Raw Learning Capture

**Work Unit:** Price Slider End-to-End Flow Fix  
**Date:** 2026-04-02  
**Duration:** 22 minutes (4 min diagnosis + 1 min fix + 17 min stock implementation)

### What Was the Error/Surprise?
Price slider UI generated `priceRange:min:179` filter but GROQ query construction only handled `price:min:179` format, causing 0 results.

### Root Cause
Field naming inconsistency between frontend (`priceRange`) and backend (`price`) filter handlers in GROQ construction.

### Time Bottlenecks
- **Investigation:** 3 minutes - Excellent flow tracing identified exact disconnection point
- **Friction:** None - Minimal code changes required
- **Wait time:** None - Immediate test feedback

### Prompt Quality
- **Strength:** "trace flow end-to-end, english only" - Clear, focused request
- **Weakness:** None - Prompt was well-structured
- **Missing:** None - Had all context needed

### Test Coverage Gap
End-to-end integration test for price slider flow was missing. Unit tests existed but didn't cover UI → URL → GROQ → Results pipeline.

### Fix Applied
```typescript
} else if (field === 'priceRange') {
  // Price range filtering: handle min/max values from slider
  const priceConditions = values.map(value => {
    if (value.startsWith('min:')) {
      const minPrice = value.split(':')[1];
      return `displayPrice >= ${minPrice}`;
    } else if (value.startsWith('max:')) {
      const maxPrice = value.split(':')[1];
      return `displayPrice <= ${maxPrice}`;
    }
    return `displayPrice == ${value}`;
  }).join(' && ');
  const clause = `&& (${priceConditions})`;
  return clause;
```

---

# Patterns: End-to-End Filter Flow Testing

**Date:** 2026-04-02
**Source:** Price Slider Disconnection Debug
**Severity:** Medium
**Frequency:** Recurring (any new filter type)

## The Problem
Filter UI components generate field names that don't match backend GROQ handlers, causing silent failures (0 results).

## Root Cause
Frontend (`useFilterNuqs`) and backend (`getProductsByVfsKeys`) use different field naming conventions for the same filter type.

## The Fix
Add field mapping in GROQ construction to handle both frontend and backend field names:
```typescript
} else if (field === 'priceRange') {
  // Handle priceRange from frontend sliders
  const priceConditions = values.map(value => {
    if (value.startsWith('min:')) {
      return `displayPrice >= ${value.split(':')[1]}`;
    } else if (value.startsWith('max:')) {
      return `displayPrice <= ${value.split(':')[1]}`;
    }
  }).join(' && ');
```

## Prevention
**Field Consistency Rule:** When implementing new filters, grep for all field name references across codebase:
```bash
grep -r "fieldName" --include="*.ts" --include="*.tsx"
```

**Integration Test Template:** Create end-to-end flow test for each filter type:
1. Entry state (all products)
2. User action (filter generation)
3. URL value collection
4. GROQ construction
5. Results verification

## Applicability
**When to apply:**
- New filter implementation
- Filter UI changes
- GROQ query modifications
- Any filter-related bug reports

**Keywords:** ["filter-flow", "field-consistency", "integration-testing", "groq-mapping"]
