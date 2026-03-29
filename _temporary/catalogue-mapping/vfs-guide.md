# VFS (Virtual File System) Guide

**Simple explanation of how catalogue slots connect to products.**

---

## Core Concept

**Products don't live in categories. They subscribe to category IDs.**

Think of it like a mailing list:
- A catalogue slot (like "Open-Back Headphones") has an ID
- Products that are open-back headphones have that ID in their `catalogueLocationKeys` array
- When user clicks "Open-Back Headphones", system finds all products with that ID

---

## The Pathway: User Click → Products

**Step 1: URL Path → Slug**
```
User clicks: /products/headphones/open-back
Extract slug: "open-back"
```

**Step 2: Slug → Slot ID**
```javascript
resolveSlugToId("open-back") 
// Returns: "o7c6baiuobsr7ni2y2vf22sh"
```

**Step 3: Slot ID → All Descendant IDs**
```javascript
unrollDescendantKeys("o7c6baiuobsr7ni2y2vf22sh")
// Returns: ["o7c6baiuobsr7ni2y2vf22sh"] (leaf node = just itself)
```

For parent categories (like "Headphones"):
```javascript
unrollDescendantKeys("ugyeto8653n495dpf89nzoar") // Headphones header
// Returns: ["o7c6baiuobsr7ni2y2vf22sh", "yq3p9s798zszjkzm5btnebjh", ...all headphone slots]
```

**Step 4: IDs → GROQ Query → Products**
```groq
*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0]
```
Translation: "Get all products where at least one of their catalogueLocationKeys matches any of the slot IDs."

---

## Data Flow Diagram

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│  User clicks    │────▶│  Slug → ID   │────▶│  Unroll tree │
│  /open-back     │     │  resolveSlug │     │  descendants │
└─────────────────┘     └──────────────┘     └──────┬────────┘
                                                    │
┌─────────────────┐     ┌──────────────┐          │
│  Display        │◀────│  GROQ query  │◀─────────┘
│  products       │     │  intersection│
└─────────────────┘     └──────────────┘
                            │
                    ┌───────┴───────┐
                    ▼               ▼
            ┌─────────────┐   ┌──────────────┐
            │ Product has │   │ Product has  │
            │ keys: [A,B] │   │ keys: [C,D]  │
            │ Match: A    │   │ Match: none  │
            │ ► RETURNED  │   │ ► SKIPPED    │
            └─────────────┘   └──────────────┘
```

---

## Key Files

| File | Purpose |
|------|---------|
| `data/catalogue-index.json` | Pre-built VFS with all slot IDs and tree structure |
| `data/catalogue.ts` | `unrollDescendantKeys()`, `resolveSlugToId()` functions |
| `product.catalogueLocationKeys` | Array of slot IDs on each product in Sanity |

---

## Product Schema (Sanity)

```javascript
{
  _type: "product",
  name: "Sennheiser HD 800 S",
  catalogueLocationKeys: [
    "o7c6baiuobsr7ni2y2vf22sh",  // Open-Back
    "j751evwbn8n9aac4elrekqi4"   // Dynamic (if also dynamic driver)
  ]
}
```

A product can be in **multiple slots** if it matches multiple categories.

---

## Common Issues

**Issue 1: Product in wrong slot**
```javascript
// Product is "closed-back" but has open-back slot ID
{
  name: "ATH-M50x (Closed-Back)",
  catalogueLocationKeys: ["o7c6baiuobsr7ni2y2vf22sh"] // WRONG - this is open-back slot
}
```
Fix: Remove wrong ID, add correct ID.

**Issue 2: Orphaned product (no slots)**
```javascript
{
  name: "New Headphone",
  catalogueLocationKeys: [] // Empty - won't appear anywhere
}
```
Fix: Add correct slot IDs based on product type.

**Issue 3: Missing multi-category assignment**
```javascript
// Planar magnetic open-back headphone should have BOTH:
{
  name: "HIFIMAN Sundara",
  catalogueLocationKeys: ["o7c6baiuobsr7ni2y2vf22sh"] 
  // Missing: "yd9641q8fiuh9rgoupauw2zl" (Planar Magnetic slot)
}
```
Fix: Add all applicable slot IDs.

---

## Verification

**Check if slot has products:**
1. Get slot ID from `catalogue-structure.md`
2. In Sanity Studio GROQ playground:
```groq
*[_type == "product" && "SLOT_ID_HERE" in catalogueLocationKeys]{name, brand}
```

**Check product's slots:**
```groq
*[_type == "product" && name match "HD 800*"]{name, catalogueLocationKeys}
```

---

## Summary

1. **Slots** = catalogue categories (Open-Back, Closed-Back, etc.)
2. **Each slot has an ID** (like `o7c6baiuobsr7ni2y2vf22sh`)
3. **Products subscribe to slot IDs** via `catalogueLocationKeys` array
4. **Query uses intersection** - find products where any key matches any slot ID
5. **Subtree works automatically** - parent slots include all descendant products
