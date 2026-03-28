# Curriculum: Sanity CMS 3.x + GROQ Mastery

## Overview
**Duration:** 10 days
**Examination:** L1-05-sanity-cms.md
**Prerequisites:** JSON, TypeScript

---

## Module 1: Sanity Fundamentals (Days 1-3)

### Day 1: Headless CMS Concepts
**Core:** Content vs presentation, structured content, Portable Text

**Study:**
- Read: sanity.io/introduction
- Read: sanity.io/docs/content-model

**Practice:**
- Explain headless vs traditional CMS
- Design content model for product
- Understand reference patterns

### Day 2: Schema Design
**Topics:** Document types, fields, validation, previews

**Practice:**
- Create product schema
- Add field validation
- Configure document preview

**Challenge:**
```typescript
// Complete product schema:
export const productType = defineType({
  name: 'product',
  // Add: all fields from your codebase
  // Include: validation rules
  // Include: preview configuration
});
```

### Day 3: References & Relationships
**Topics:** References, arrays, inline objects

**Practice:**
- Create category reference
- Design brand as reference (not string)
- Build nested specifications

---

## Module 2: GROQ Query Language (Days 4-7)

### Day 4: GROQ Basics
**Topics:** Projection, filtering, ordering

**Practice:**
- Write basic product query
- Filter by stock > 0
- Order by price

**Challenge:**
```groq
// Query: All in-stock products
// Return: name, price, slug
// Order: price ascending
// Limit: 10
```

### Day 5: Reference Expansion
**Topics:** -> operator, dereferencing, conditional expansion

**Practice:**
- Expand category references
- Get image asset metadata
- Handle missing references

**Challenge:**
```groq
// Query: Products with category details
// Include: category name and slug
// Include: main image URL + dimensions
// Handle: missing categories gracefully
```

### Day 6: Advanced GROQ
**Topics:** Coalesce, select, slice, counts

**Practice:**
- Use coalesce for fallbacks
- Implement conditional selections
- Count references

**Challenge:**
```groq
// Query: Products with calculated fields
// Add: "available" boolean (stock > 0)
// Add: price category (budget/premium based on threshold)
// Include: related products count
```

### Day 7: VFS Pattern (Your Codebase)
**Topics:** Catalogue structure, path queries, VFS integration

**Practice:**
- Understand VFS index structure
- Write subtree queries
- Map path to product keys

**Analysis:**
```
VFS structure in your codebase:
- slugToIdMap: _______
- slotMetadataMap: _______
- unrollDescendantKeys: _______

Query pattern used:
```

---

## Module 3: Integration (Days 8-9)

### Day 8: TypeGen Integration
**Topics:** Type generation, query typing, safety

**Practice:**
- Run sanity typegen
- Use generated types
- Write type-safe queries

**Challenge:**
```typescript
// Create typed query helper:
function fetchProducts(query: string): Promise<PRODUCTS_QUERYResult>

// Must use: generated types
// Must handle: errors with type safety
```

### Day 9: Next.js Integration
**Topics:** Server Components, caching, previews

**Practice:**
- Fetch in Server Component
- Implement draft mode
- Handle preview data

**Challenge:**
Build product page:
- Server Component fetches from Sanity
- Renders Portable Text description
- Handles draft/published
- Type-safe throughout

---

## Module 4: Studio Customization (Day 10)

### Day 10: Structure & Workflows
**Topics:** Desk structure, initial values, validation

**Practice:**
- Customize desk structure
- Add initial value templates
- Set up validation workflows

**Final Challenge:**
Design complete content workflow:
- Draft → Review → Published
- Custom document actions
- Validation on publish

---

## Assessment

| Day | Checkpoint |
|-----|------------|
| 3 | Design complete schema |
| 7 | Write complex VFS query |
| 9 | Type-safe integration |
| 10 | Custom studio structure |

---

## Resources
- sanity.io/docs/groq
- sanity.io/docs/schema-types
- sanity.io/docs/sanity-typegen
- Your sanity.types.ts

*Version: 1.0*
