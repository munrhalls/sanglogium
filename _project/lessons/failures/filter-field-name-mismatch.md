# Failures: Filter Field Name Mismatch

**Date:** 2026-04-02
**Source:** Price Slider Disconnection Debug
**Severity:** High
**Frequency:** Systemic (occurs with any new filter implementation)

## The Problem
Price slider generated `priceRange:min:179` filter but backend only handled `price:min:179`, causing complete filter failure with 0 results returned.

## Root Cause
Frontend (`useFilterNuqs.ts`) and backend (`getProductsByVfsKeys.ts`) use inconsistent field naming conventions:
- Frontend: `priceRange:min:179`, `stockMin:5`
- Backend: `price:min:179`, `stock:5`

## The Fix
Added field mapping handlers in GROQ construction:
```typescript
} else if (field === 'priceRange') {
  // Map frontend priceRange to backend displayPrice filtering
  const priceConditions = values.map(value => {
    if (value.startsWith('min:')) {
      return `displayPrice >= ${value.split(':')[1]}`;
    }
    // ... handle max
  }).join(' && ');
} else if (field === 'stockMin') {
  // Map frontend stockMin to backend stock filtering
  return `stock >= ${value}`;
```

## Prevention
**MANDATORY:** When implementing new filters, verify field name consistency across:
1. Frontend filter generation (`useFilterNuqs.ts`)
2. Backend GROQ construction (`getProductsByVfsKeys.ts`)
3. URL parameter format
4. Test data expectations

**Field Consistency Checklist:**
- [ ] Frontend generates: `field:subfield:value`
- [ ] Backend handles: `field` and `field:subfield` formats
- [ ] Tests cover both naming conventions
- [ ] Documentation updated with field mapping

## Applicability
**When to apply:**
- Any new filter implementation
- Filter UI component changes
- GROQ query modifications
- Filter-related bug investigations

**Keywords:** ["field-mismatch", "filter-consistency", "frontend-backend-sync", "groq-field-mapping"]
