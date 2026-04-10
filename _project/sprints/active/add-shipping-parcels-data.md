# Sprint: Add Shipping Parcels Data for All Products

## Goal
Add realistic parcel dimensions and weight to all products for Shippo rate calculation.

## Approach
Category-based default mapping with optional manual override.

## Data Mapping

| Category | Weight (lb) | Dimensions L×W×H (in) |
|----------|-------------|----------------------|
| IEMs / Earbuds | 0.3 | 6×4×2 |
| On-ear Headphones | 1.2 | 10×8×4 |
| Over-ear Headphones | 2.5 | 12×10×6 |
| Portable DAC/Amps | 0.8 | 6×4×2 |
| Desktop DAC/Amps | 3.0 | 10×8×4 |
| Cables / Accessories | 0.5 | 8×6×2 |

## Schema Fields to Add (Product Type)

```typescript
// Required for Shippo API
weight: number
weightUnit: "lb" | "kg" (default: "lb")
length: number
width: number  
height: number
dimensionUnit: "in" | "cm" (default: "in")
```

## Implementation Steps

1. Add parcel fields to Sanity product schema
2. Create category-to-parcel mapping utility
3. Run migration script to populate all existing products
4. Add default values to product creation flow

## Manual Override

Content editors can manually edit parcel data in Sanity Studio for showcase products.

## Verification

- Shippo API returns rates when testing with sample addresses
- All products have non-zero weight and dimensions
