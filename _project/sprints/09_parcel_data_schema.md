# Sprint 09: Product Parcel Data Schema

## PHASE 0: Source-Level Verification

### Root Cause (Verified)
```
[DEBUG] Shippo API error: {"parcels":[{"mass_unit":["This field is required."]}]}
```
- `app/api/shipping/rates/route.ts` line 45-46 sends `distanceUnit` and `massUnit` (camelCase)
- Shippo API requires `distance_unit` and `mass_unit` (snake_case)
- Source: Shippo docs `https://docs.goshippo.com/docs/carriers/integration_guides/colissimo/create_shipment` shows `"distance_unit": "cm", "mass_unit": "kg"`

### Current Product Schema
- `sanity-cms/schemaTypes/productType.ts` - 188 lines
- Fields: name, slug, brand, price_data, stock, reservedStock, sku, image, gallery, catalogueLocationKeys, overviewFields, specifications
- **No parcel data fields exist**

### Shippo Parcel Object Requirements (Verified)
```json
{
  "length": 10,
  "width": 10,
  "height": 5,
  "weight": 500,
  "distance_unit": "cm",
  "mass_unit": "g"
}
```
All 6 fields required. `distance_unit` values: cm, in. `mass_unit` values: g, oz, lb, kg.

---

## PHASE 1: UX Flows

1. **Admin adds product**: Admin fills parcel dimensions + weight in Sanity Studio → data saved on product document
2. **User checks out**: User reaches shipping page → system reads parcel data from basket products → sends to Shippo → rates displayed
3. **Admin bulk updates**: Admin runs migration script → all 567 products get default parcel data → can refine per product later

---

## PHASE 2: End-State Overview

Every product in Sanity CMS has a `parcel` object field containing length, width, height, weight, distance_unit, and mass_unit. The shipping rates endpoint reads parcel data from basket products instead of hardcoded constants. A migration script populates all existing 567 products with sensible defaults.

---

## PHASE 3: Architecture Contract

### Event → State → Side Effect Flow
```
Shipping page loads → GET /api/shipping/rates → fetch reservation → fetch basket products → extract parcel data per product → call Shippo API → return rates
```

### Schema Contract
```typescript
// New field on productType
parcel: {
  length: number,      // cm
  width: number,       // cm
  height: number,      // cm
  weight: number,      // grams
  distance_unit: 'cm', // fixed
  mass_unit: 'g',      // fixed
}
```

### API Contract
- `app/api/shipping/rates/route.ts` reads `parcel` from basket products
- Falls back to hardcoded PARCEL_DATA if product has no parcel field
- Field names MUST be snake_case for Shippo API

---

## PHASE 4: Scope Contracts

### Scope 1: Fix Immediate Shippo API Error (5 min)

**UX Impact**: Shipping rates start working with hardcoded parcel data

**What**: Fix field names in PARCEL_DATA from camelCase to snake_case

**Files**:
- `app/api/shipping/rates/route.ts` lines 40-47

**Change**:
```typescript
const PARCEL_DATA = {
  length: 10,
  width: 10,
  height: 5,
  weight: 500,
  distance_unit: 'cm',  // was distanceUnit
  mass_unit: 'g',       // was massUnit
};
```

**Verification**:
- [ ] Visit `/checkout/shipping` with a reservation that has shippingAddress
- [ ] Shipping rates display (no more "Failed to fetch" error)

---

### Scope 2: Add Parcel Field to Product Schema (10 min)

**UX Impact**: Admin can enter parcel dimensions per product in Sanity Studio

**What**: Add `parcel` object field to productType schema

**File**: `sanity-cms/schemaTypes/productType.ts`

**New field** (add after `stock` field, line 69):
```typescript
defineField({
  name: "parcel",
  title: "Parcel Data",
  type: "object",
  description: "Shipping dimensions and weight for Shippo API",
  fields: [
    defineField({
      name: "length",
      title: "Length (cm)",
      type: "number",
      initialValue: 10,
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "width",
      title: "Width (cm)",
      type: "number",
      initialValue: 10,
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "height",
      title: "Height (cm)",
      type: "number",
      initialValue: 5,
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "weight",
      title: "Weight (g)",
      type: "number",
      initialValue: 500,
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "distance_unit",
      title: "Distance Unit",
      type: "string",
      initialValue: "cm",
      readOnly: true,
    }),
    defineField({
      name: "mass_unit",
      title: "Mass Unit",
      type: "string",
      initialValue: "g",
      readOnly: true,
    }),
  ],
}),
```

**Verification**:
- [ ] Sanity Studio shows "Parcel Data" section on product editor
- [ ] Fields have correct default values
- [ ] Schema deploys without errors

---

### Scope 3: Update Shipping Rates Endpoint (15 min)

**UX Impact**: Shipping rates use actual product dimensions instead of hardcoded values

**What**: Modify `GET /api/shipping/rates` to read parcel data from basket products

**File**: `app/api/shipping/rates/route.ts`

**Changes**:
1. Fetch basket items from reservation (add to GROQ query)
2. Extract parcel data per product
3. Send product-specific parcels to Shippo
4. Fall back to PARCEL_DATA if product has no parcel field

**Verification**:
- [ ] Shipping page loads with rates using product parcel data
- [ ] Falls back to defaults for products without parcel data

---

### Scope 4: Migration Script for 567 Products (20 min)

**UX Impact**: All existing products get default parcel data automatically

**What**: Script that patches every product with default parcel object

**File**: `scripts/migrations/addParcelData.mjs`

**Script logic**:
1. Fetch all products from Sanity
2. For each product without `parcel` field, patch with defaults
3. Log progress every 50 products
4. Report summary at end

**Verification**:
- [ ] Run `node scripts/migrations/addParcelData.mjs`
- [ ] All 567 products have parcel data
- [ ] No products lost or corrupted

---

### Scope 5: Type Generation Update (5 min)

**UX Impact**: TypeScript types reflect new parcel field

**What**: Regenerate Sanity types after schema change

**Command**: `npx sanity schema extract && npx sanity typegen generate`

**Verification**:
- [ ] `sanity.types.ts` contains parcel field on product type
- [ ] No TypeScript errors in shipping rates endpoint

---

## PHASE 5: Verification Checkpoints

| Scope | Check | Pass |
|-------|-------|------|
| 1 | Shipping rates display on page | ☐ |
| 2 | Parcel fields visible in Sanity Studio | ☐ |
| 3 | Rates use product parcel data | ☐ |
| 4 | All 567 products have parcel data | ☐ |
| 5 | TypeScript compiles clean | ☐ |

---

## PHASE 6: Simplicity Guardrails

- **No new abstractions** - parcel data is a plain object on product
- **No new API endpoints** - reuse existing `/api/shipping/rates`
- **Single migration script** - one file, one run
- **Snake_case only** - match Shippo API exactly, no mapping layer
- **Default values** - 10x10x5cm, 500g as sensible audio gear defaults
